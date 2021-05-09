const model = {};
const db = require("../database/connection");

model.addStudent = (req, res)=>{
    const data = req.body;
    db.query('SELECT COUNT(*) FROM cusuario', (err, size)=>{
        if(err)return res.json(err);
        res.send(size);
    });
}

//funciones para los modelos
function userIdAlgorithm(){

}

module.exports = model;