const model = {};
const db = require("../database/connection");

model.addStudent = (req, res)=>{
    const data = req.body;
    let idUser = '';
    db.query('SELECT COUNT(*) AS sizeTable FROM cusuario', (err, size)=>{
        if(err)return res.json(err);
        idUser = userIdAlgorithm(size[0].sizeTable, 'AL');
        console.log(idUser);
        db.query('INSERT INTO CUsuario VALUES(?,?,?,?,"email@email.com","b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79")', [idUser,data.name,data.lastf,data.lastm],(err, iUser)=>{
            if(err)return res.json(err);
            console.log(iUser);
            db.query('INSERT INTO EAlumno VALUES(?,?)',[data.id, idUser], (err, response)=>{
                if(err)return res.json(err);
                console.log(response);
                res.send({success:true});
            });
        });
    });
}

//funcion para generar el id de cada usuario
function userIdAlgorithm(sizeTable, typeUser){
    let idUser = ''+typeUser;
    if(sizeTable<9){
        idUser += '000'+(sizeTable+1);
    }else if(sizeTable>=9 && sizeTable<99){
        idUser += '00'+(sizeTable+1);
    }else if(sizeTable>=99 && sizeTable<999){
        idUser += '0'+(sizeTable+1);
    }else{
        idUser += (sizeTable+1);
    }
    return idUser;
}

module.exports = model;