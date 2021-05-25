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
            return res.json({responseT,responseS,code, room:idSala});
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
                    const minutesRemaining = timeToExpire(coincidencias);
                    res.send({minutesRemaining});
                }else{
                    //hay que eliminar el token y su sala
                    db.query('DELETE FROM etokenlista WHERE id_programa=?',[coincidencias[0].id_programa],(err, response)=>{
                        if(err)return res.json(err);
                        db.query('DELETE FROM esala WHERE id_programa=?',[coincidencias[0].id_programa],(err, response)=>{
                            if(err)return res.json(err);
                            res.send({isNotActive:true});
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

    return (time <= expiration);
}

function timeToExpire(token){
    const time = new Date();
    const duration = token[0].duracion;
    const creation = new Date(token[0].creacion);
    
    if(time.getHours()==creation.getHours()){
        let minutesElapsed = time.getMinutes()-creation.getMinutes();
        let minutesRemaining = duration-minutesElapsed;
        return minutesRemaining;
    }else if(time.getHours()>creation.getHours()){
        let minutesLeftForHour = 60-creation.getMinutes();
        let minutesElapsed = time.getMinutes()+minutesLeftForHour;
        let minutesRemaining = duration-minutesElapsed;
        return minutesRemaining;
    }
}

module.exports = model;