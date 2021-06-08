const model = {};
const db = require("../database/connection");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "jafetkevin575@gmail.com",
        pass: "clhjhxejirvnjfth",
    },
});

model.recovery = (req, res) => {
    //Redireccionamiento al perfil
    return res.render("recover");
};

//Comprobar correo electrónico en la base de datos
model.comprobateEmail = (req, res) => {
    try {
        const data = req.body;
        //comprobamos que rol tiene
        if (data.rol === "Administrador") {
            db.query(
                "SELECT id_usuario FROM EAdministrador WHERE id_administrador = ?",
                [data.username],
                (err, id_usuario) => {
                    if (err) return res.json(err);
                    console.log(id_usuario);
                    if (id_usuario.length != 0) {
                        //comprobamos que el correo sea el mismo
                        db.query(
                            "SELECT email FROM CUsuario WHERE id_usuario = ?",
                            [id_usuario[0].id_usuario],
                            (err, emailDb) => {
                                if (err) return res.json(err);
                                console.log(
                                    "id: " +
                                        id_usuario[0].id_usuario +
                                        " ? emaildb: " +
                                        emailDb[0].email +
                                        " ? email: ",
                                    data.email
                                );
                                if (data.email == emailDb[0].email) {
                                    return res.send({
                                        success: true,
                                        idUser: id_usuario[0].id_usuario,
                                    });
                                } else {
                                    return res.send({
                                        success: false,
                                        idUser: id_usuario[0].id_usuario,
                                    });
                                }
                            }
                        );
                    } else {
                        return res.send({ success: false, idUser: null });
                    }
                }
            );
        } else if (data.rol === "Profesor") {
            db.query(
                "SELECT id_usuario FROM EProfesor WHERE id_empleado = ?",
                [data.username],
                (err, id_usuario) => {
                    if (err) {
                        console.log(err);
                        return res.json(err);
                    }
                    console.log(id_usuario);
                    if (id_usuario.length != 0) {
                        db.query(
                            "SELECT email FROM CUsuario WHERE id_usuario = ?",
                            [id_usuario[0].id_usuario],
                            (err, emailDb) => {
                                if (err) return res.json(err);
                                if (emailDb.length != 0) {
                                    console.log(
                                        "id: " +
                                            id_usuario[0].id_usuario +
                                            " ? emaildb: " +
                                            emailDb[0].email +
                                            " ? email: ",
                                        data.email
                                    );
                                    if (data.email == emailDb[0].email) {
                                        return res.send({
                                            success: true,
                                            idUser: id_usuario[0].id_usuario,
                                        });
                                    } else {
                                        return res.send({
                                            success: false,
                                            idUser: id_usuario[0].id_usuario,
                                        });
                                    }
                                } else {
                                    return res.send({
                                        success: false,
                                        idUser: id_usuario[0].id_usuario,
                                    });
                                }
                            }
                        );
                    } else {
                        return res.send({ success: false, idUser: null });
                    }
                }
            );
        } else {
            db.query(
                "SELECT id_usuario FROM EAlumno WHERE boleta = ?",
                [data.username],
                (err, id_usuario) => {
                    if (err) return res.json(err);
                    if (id_usuario.length != 0) {
                        db.query(
                            "SELECT email FROM CUsuario WHERE id_usuario = ?",
                            [id_usuario[0].id_usuario],
                            (err, emailDb) => {
                                if (err) return res.json(err);
                                console.log(
                                    "id: " +
                                        id_usuario[0].id_usuario +
                                        " ? emaildb: " +
                                        emailDb[0].email +
                                        " ? email: ",
                                    data.email
                                );
                                if (data.email == emailDb[0].email) {
                                    return res.send({
                                        success: true,
                                        idUser: id_usuario[0].id_usuario,
                                    });
                                } else {
                                    return res.send({
                                        success: false,
                                        idUser: id_usuario[0].id_usuario,
                                    });
                                }
                            }
                        );
                    } else {
                        return res.send({ success: false, idUser: null });
                    }
                }
            );
        }
    } catch (ex) {
        console.log(ex);
        return res.send({
            success: false,
            idUser: null,
        });
    }
};

model.sendEmail = (req, res) => {
    try {
        const data = req.body;
        const code = generateCode();
        const username = data.idUser;
        const email = data.email;
        const rol = data.rol;
        const token = jwt.sign({ email, username, rol }, code);

        //primero revisamos si el usuario ya tiene un token guardado
        db.query(
            "SELECT id_token FROM EToken WHERE id_usuario = ?",
            [username],
            (err, idToken) => {
                if (err) return res.send(err);
                if (idToken.length == 0) {
                    try {
                        sendEmailCode(email, code);
                        //si el correo se envia satisfactoriamente hay que guardar el token en la bd
                        db.query(
                            "INSERT INTO EToken VALUES (?, current_time(), ?)",
                            [token, username],
                            (err, response) => {
                                if (err) {
                                    console.log(err);
                                    return res.json(err);
                                }
                                console.log(response);
                                return res.send(response);
                            }
                        );
                    } catch (err) {
                        return res.send(err);
                    }
                } else {
                    //ya existe un token de este usuario // eliminamos el token que ya tenía para crear otro
                    console.log("Ya tiene un token activo");
                    db.query(
                        "DELETE FROM EToken WHERE id_usuario=?",
                        [username],
                        (err, response) => {
                            if (err) return res.send(err);
                            try {
                                sendEmailCode(email, code);
                                //si el correo se envia satisfactoriamente hay que guardar el token en la bd
                                db.query(
                                    "INSERT INTO EToken VALUES (?, current_time(), ?)",
                                    [token, username],
                                    (err, response) => {
                                        if (err) return res.json(err);
                                        console.log(response);
                                        return res.send(response);
                                    }
                                );
                            } catch (err) {
                                return res.send(err);
                            }
                        }
                    );
                }
            }
        );
    } catch (ex) {
        console.log(ex);
        return res.send(ex);
    }
};

function sendEmailCode(email, code) {
    const mailOptions = {
        from: "System",
        to: email,
        subject: "Recuperar contraseña WebList",
        text:
            "Buen día, se ha hecho una solicitud para recuperar la contraseña de su cuenta, su codigo es: " +
            code,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        try {
            if (err) {
                console.log("Error: " + err);
            } else {
                console.log("Email enviado");
            }
        } catch (error) {
            console.log("Error inesperado al enviar correo: " + error);
            console.log(error.message);
        }
    });
}

function generateCode() {
    let code = "";
    for (var i = 0; i < 5; i++) {
        code += Math.floor(Math.random() * (9 - 0)) + 0;
    }
    return code;
}

module.exports = model;
