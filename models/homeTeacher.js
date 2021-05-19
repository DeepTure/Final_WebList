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
            return res.json({responseT,responseS,code});
        });
    });
};

model.verifyToken = (req, res)=>{
    const data = req.body;
    db.query('SELECT id_programa FROM mprograma WHERE id_empleado = ?', [data.id], (err, programas)=>{
        if(err)return res.json(err)
        const querys = getStringQueryTokensByPrograms(programas);
        db.query(querys, (err, coincidencias)=>{
            if(err)return res.json(err);
            res.send(coincidencias);
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

function getStringQueryTokensByPrograms(programas){
    let querys = '';
    programas.forEach((programa)=>{
        let aux = 'SELECT id_token, duracion FROM etokenlista WHERE id_programa = "'+programa.id_programa+'";';
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

module.exports = model;