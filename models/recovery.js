const model = {};
const db = require("../database/connection");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'jafetkevin575@gmail.com',
        pass: 'clhjhxejirvnjfth'
    }
});

model.recovery = (req, res) =>{
    //Redireccionamiento al perfil
    return res.render("recover");
};

model.comprobateEmail = (req, res) =>{
    const data = req.body;
    //comprobamos que rol tiene
    if(data.rol==='Administrador'){
        db.query('SELECT idMUsuario FROM eadministrador WHERE id_administrador = ?',[data.username], (err, idMUsuario)=>{
            if(err)return res.json(err);
            console.log(idMUsuario);
            if(idMUsuario.length != 0){
                //comprobamos que el correo sea el mismo
                db.query('SELECT email FROM cusuario WHERE idMusuario = ?', [idMUsuario[0].idMUsuario], (err, emailDb)=>{
                    if(err)return res.json(err);
                    console.log('id: '+idMUsuario[0].idMUsuario+' ? emaildb: '+emailDb[0].email+' ? email: ',data.email);
                    if(data.email == emailDb[0].email){
                        return res.send({success: true, idUser: idMUsuario[0].idMUsuario});
                    }else{
                        return res.send({success: false, idUser: idMUsuario[0].idMUsuario});
                    }
                });
            }else{
                return res.send({success: false, idUser: idMUsuario[0].idMUsuario});
            }
        });
    }else if(data.rol==='Profesor'){
        db.query('SELECT idMUsuarios FROM eprofesor WHERE id_empleado = ?',[data.username], (err, idMUsuario)=>{
            if(err)return res.json(err);
            if(idMUsuario.length != 0){
                db.query('SELECT email FROM cusuario WHERE idMUsuario = ?',[idMUsuario[0].idMUsuarios],(err, emailDb)=>{
                    if(err)return res.json(err);
                    if(emailDb.length != 0){
                        console.log('id: '+idMUsuario[0].idMUsuario+' ? emaildb: '+emailDb[0].email+' ? email: ',data.email);
                        if(data.email == emailDb[0].email){
                            return res.send({success: true, idUser: idMUsuario[0].idMUsuarios});
                        }else{
                            return res.send({success: false, idUser: idMUsuario[0].idMUsuarios});
                        }
                    }else{
                        return res.send({success: false, idUser: idMUsuario[0].idMUsuarios});
                    }
                });
            }else{
                return res.send({success: false, idUser: idMUsuario[0].idMUsuarios});
            }
        });
    }else{
        db.query('SELECT idMUsuario FROM ealumno WHERE boleta = ?',[data.username], (err, idMUsuario)=>{
            if(err)return res.json(err);
            if(idMUsuario.length != 0){
                db.query('SELECT email FROM cusuario WHERE idMUsuario = ?',[idMUsuario[0].idMUsuario], (err, emailDb)=>{
                    if(err)return res.json(err);
                    console.log('id: '+idMUsuario[0].idMUsuario+' ? emaildb: '+emailDb[0].email+' ? email: ',data.email);
                        if(data.email == emailDb[0].email){
                            return res.send({success: true, idUser: idMUsuario[0].idMUsuario});
                        }else{
                            return res.send({success: false, idUser: idMUsuario[0].idMUsuario});
                        }
                });
            }else{
                return res.send({success: false, idUser: idMUsuario[0].idMUsuario});
            }
        });
    }
};

model.sendEmail = (req, res)=>{
    const data = req.body;
    const code = generateCode();
    const username = data.idUser;
    const email = data.email;
    const rol = data.rol;

    const token = jwt.sign({email, username, rol},code);

    try{
        sendEmailCode(email,code);
        //si el correo se envia satisfactoriamente hay que guardar el token en la bd
        db.query("INSERT INTO etoken VALUES (?, current_time(), ?)", [token, username], (err, response)=>{
            if(err) return res.json(err);
            console.log(response);
            return res.send(response);
        });
    }catch(err){
        return res.send(err);
    }
};

function sendEmailCode(email, code){
    const mailOptions = {
        from: 'System',
        to: email,
        subject: 'Recuperar contraseña WebList',
        text: 'Buen día, se ha hecho una solicitud para recuperar la contraseña de su cuenta, su codigo es: '+code
    }

    transporter.sendMail(mailOptions, (err, info)=>{
        try{
            if(err){
                console.log('Error: '+err);
            }else{
                console.log('Email enviado');
            }
        }catch(error){
            console.log('Error inesperado al enviar correo: '+error);
            console.log(error.message);
        }
    });
}

function generateCode(){
    let code = "";
    for (var i = 0; i < 5; i++) {
        code += Math.floor(Math.random() * (9 - 0)) + 0;
    }
    return code;
}

model.comprobateCode = (req, res)=>{
    const data = req.body;
    let token = 0;
    console.log(data);
    db.query('SELECT idEToken FROM etoken WHERE idMUsuario = ?',[data.idUser], (err, tokenDb)=>{
        if(err)return res.send(err);
        token = tokenDb[0].idEToken;
        console.log(token);
        //compriobamos que sea el token
        jwt.verify(token, data.code, (err, userData)=>{
            if(err){
                return res.send('nel');
            }else{
                //si entra es porque el codigo es correcto
                db.query("DELETE FROM etoken WHERE idMUsuario=?",[data.idUser], (err, response)=>{
                    if(err)return res.json(err);
                    return res.send(userData);
                })
            }
        });
    });
};

module.exports = model;