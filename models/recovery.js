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
                        return res.send(true);
                    }else{
                        return res.send(false);
                    }
                });
            }else{
                return res.send(false);
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
                            return res.send(true);
                        }else{
                            return res.send(false);
                        }
                    }else{
                        return res.send(false);
                    }
                });
            }else{
                return res.send(false);
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
                            return res.send(true);
                        }else{
                            return res.send(false);
                        }
                });
            }else{
                return res.send(false);
            }
        });
    }
};

model.sendEmail = (req, res)=>{
    const data = req.body;
    const code = generateCode();
    const username = data.username;
    const email = data.email;

    const token = jwt.sign({email, username},code);

    try{
        sendEmailCode(email,code);
        return res.send('Correo enviado');
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

module.exports = model;