const model = {};
const db = require("../database/connection");

//problemas con el modo asincrono querySync
model.getGroups = (req, res)=>{
    const data = req.body;
    let aux = 'nada';
    const promesa = new Promise((resolve,reject)=>{
        db.query('SELECT * FROM mprograma WHERE id_empleado = ?',[data.id], (err, programas)=>{
            if(err) reject(err);
            resolve(programas);
        });
    });

    promesa.then(programas =>{
        res.send(programas);
    }).catch(err=>{
        res.json(err);
    });
};

module.exports = model;