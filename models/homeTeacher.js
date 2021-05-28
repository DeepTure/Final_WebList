//@ts-check
const model = {};
const jwt = require("jsonwebtoken");
const db = require("../database/connection");

//problemas con el modo asincrono SELECT id_grupo FROM egeneracion WHERE id_generacion=?
model.getGroups = (req, res)=>{
    const data = req.body;
    //obtenemos los programas de los profes y sus materias en cada generacion
    db.query('SELECT mprograma.*, cmateria.materia, cmateria.area FROM mprograma INNER JOIN cmateria ON cmateria.id_materia=mprograma.id_materia WHERE mprograma.id_empleado=?',[data.id],(err, programas)=>{
        if(err) return res.json(err);
        let querys = getSyringGroupsByPrograms(programas);
        db.query(querys,(err, grupos)=>{
            if(err)return res.json(err);
            console.log(grupos);
            return res.send({grupos, programas});
        });
    });
};

model.addToken = (req, res)=>{
    const data = req.body;
    const time = new Date();
    const code = generateCode(6);
    const token = jwt.sign({ idPrograma:data.program}, code);
    db.query("INSERT INTO etokenlista VALUES(?,?,?,?)",[token, processDuration(data.duration), time, data.program], (err, responseT)=>{
        if(err)return res.json(err);
        const idSala = generateIdRoom(data.program, data.idEmpleado);
        db.query('INSERT INTO esala VALUES(?,?)',[idSala, data.program],(err, responseS)=>{
            if(err)return res.json(err);
            const expire = timeToExpire(parseInt(data.duration), time);
            putGenerationAbsent(data.generation, data.program, data.nowTime);
            return res.json({responseT,responseS,code, room:idSala, expire});
        });
    });
};

model.verifyToken = (req, res)=>{
    const data = req.body;
    db.query('SELECT id_programa FROM mprograma WHERE id_empleado = ?', [data.id], (err, programas)=>{
        if(err)return res.json(err)
        const querys = getStringQueryTokensByPrograms(programas);
        //las coincidencias son los registros donde haya un token
        db.query(querys, (err, coincidencias)=>{
            if(err)return res.json(err);
            if(coincidencias.length == 1){
                //Verificamos que el token aun esté activo
                const isActive = tokenIsActive(coincidencias);
                if(isActive){
                    const minutesRemaining = timeToExpire(parseInt(coincidencias[0].duracion), coincidencias[0].creacion);
                    console.log('Minutos: '+minutesRemaining.getMinutes()+':'+minutesRemaining.getSeconds());                    
                    res.send({minutesRemaining});
                }else{
                    //hay que eliminar el token y su sala
                    db.query('DELETE FROM etokenlista WHERE id_programa=?',[coincidencias[0].id_programa],(err, response)=>{
                        if(err)return res.json(err);
                        db.query('DELETE FROM esala WHERE id_programa=?',[coincidencias[0].id_programa],(err, response)=>{
                            if(err)return res.json(err);
                            return res.send({isNotActive:true});
                        }); 
                    });
                }
            }else{
                res.send({noToken:true, long:coincidencias.length});
            }
        });
    });
};

//Funciones para el modelo
function getSyringGroupsByPrograms(programas){
    let querys = '';
    programas.forEach((programa)=>{
        let aux = 'SELECT id_grupo, id_generacion FROM egeneracion WHERE id_generacion="'+programa.id_generacion+'";';
        querys += aux;
    });
    return querys;
}

/**
 * Construye un string con todas las consultas para los tokens que pueda tener el usuario
 * @param {array} programas todos los programas del usuario
 * @returns {String}
 */
function getStringQueryTokensByPrograms(programas){
    let querys = '';
    programas.forEach((programa)=>{
        let aux = 'SELECT * FROM etokenlista WHERE id_programa = "'+programa.id_programa+'";';
        querys += aux;
    });
    return querys;
}

function generateCode(n) {
    let code = "";
    for (var i = 0; i <= n; i++) {
        code += Math.floor(Math.random() * (9 - 0)) + 0;
    }
    return code;
}

function processDuration(duration){
    let aux = duration.split(' ');
    return aux[0];
}

function generateIdRoom(program, idEmpleado){
    let id = idEmpleado;
    const letters = program.split('');
    letters.forEach((letter, i)=>{
        if(i<=5){
            id+=letter;
        }
    });
    console.log(id);
    return id;
}

/**
 * esta funcion se encarga de verificar que el token aun este activo
 * @param {object} token todos los datos de un token en la bd
 * @returns {boolean} returna si el tiempo actual es menor al tiempo de caducidad
 */
function tokenIsActive(token){
    const time = new Date();
    const duration = token[0].duracion;
    const creation = new Date(token[0].creacion);
    
    let minutes = creation.getMinutes();
    minutes += duration;
    const expiration = creation;
    expiration.setMinutes(minutes);

    return (time < expiration);
}

/**
 * Se encarga de calcular el tiempo faltante para que expire
 * @param {number} duration es la duracion del token
 * @param {Date} creation es la fecha en que fue creado
 * @returns {Date}  
 */
function timeToExpire(duration, creation){
    creation = new Date(creation);
    const nowTime = new Date();

    const expireTime = (creation.setMinutes(creation.getMinutes()+duration));
    const missingTime = expireTime-nowTime.getTime();

    if(missingTime>0){
        return new Date(missingTime);
    }else{
        //nunca debería retornar esto
        console.log('ha caducado');
        return new Date(0);
    }
}

/**
 * Esta funcion le pone inasistencia a todos en un programa y geberacion
 * @param {String} generation id de la generacion a la que se va a poner inasistencia
 * @param {String} nowTime Es la fecha actual del registro
 * @param {String} program Es el programa en el que se esta pasando asistencia
 */
function putGenerationAbsent(generation, program, nowTime){
    //obtenemos todas las inscripciones de esta generacion
    db.query('SELECT * FROM minscripcion WHERE id_generacion = ?',[generation],(err,idi)=>{
        if(err)console.log(err);
        const querys = processQuerysInasistenciaByInscripcion(idi, program, nowTime);
        db.query(querys,(err,res)=>{
            if(err)console.log(err);
            console.log('todos con falta alv');
        });
    });
}

/*- Reglas para id de MInasistencia

Se crea como llave compuesta a partir de fecha (en formato '1000-01-01 00:00:00'), id_inscripcion e id_programa respectivamente.

En total son 55 caracteres.*/
function processQuerysInasistenciaByInscripcion(ids, program, nowTime){
    let querys = '';
    const time = new Date();
    const date = time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()+':'+time.getSeconds();
    ids.forEach((id)=>{
        let idi = date+id.id_inscripcion+program;
        querys += 'INSERT INTO minasistencia VALUES("'+idi+'","'+nowTime+'","'+id.id_inscripcion+'","'+program+'",false);';
    });
    return querys;
}

module.exports = model;