const model = {};
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

//esta funcion ya queda obsoleta
model.getSubjects = (req,res)=>{
    const data = req.body;
    db.query('SELECT * FROM mprograma WHERE id_empleado = ?',[data.id], (err, programas)=>{
        if(err) return res.json(err);
        return res.send(programas);
    });
};

//Funciones para el modelo
function getSyringGroupsByPrograms(programas){
    let querys = '';
    programas.forEach((programa)=>{
        let aux = 'SELECT id_grupo FROM egeneracion WHERE id_generacion="'+programa.id_generacion+'";';
        querys += aux;
    });
    return querys;
}

module.exports = model;