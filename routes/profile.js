const router = require("express").Router();
const db = require("../database/connection");
const crypto = require("crypto");
const validacion = require("../models/validacion");

//Redireccionamiento al perfil
router.get(
    "/home/perfil",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect("/");
    },
    (req, res) => {
        let rol = req.user.rol;
        let id = req.user.id[1];
        //Realiza una consulta para demostrar sus datos en la vista mediante el id_usuario
        db.query(
            "select * from CUsuario where id_usuario = ?",
            [req.user.id[0]],
            (err, usuario) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("perfil", { id, usuario });
                }
            }
        );
    }
);

//Metodo que modifica los datos
router.post(
    "/home/perfil/change",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect("/");
    },
    (req, res) => {
        console.log(req.body)
        var contrasena = req.body.contrasena;
        var confirm = req.body.confirm;
        var correo = req.body.email;
        //En caso de que haya llenado los espacios de contraseña y correo
        if (contrasena.length != 0 && correo.length != 0) {
            if (contrasena == confirm) {
                if (validacion.contra(contrasena) && validacion.correo(correo)){
                    const hash = crypto.createHash("sha256");
                    hash.update(contrasena);
                    var asegurado = hash.digest("hex");
                    db.query(
                        "update CUsuario set contrasena = ?, email = ? where id_usuario = ?",
                        [asegurado, correo, req.user.id[0]],
                        (err, result) => {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.send({
                                    success:true,
                                });
                            }
                        }
                    );
                }else{
                    console.log("Cambios no hecha por la validación")
                    return res.send({
                        success:false,
                    });
                }
            } else {
                return res.send({
                    success:false,
                });
            }
            //En caso de que sólo haya llenado la contraseña
        } else if (contrasena.length != 0) {
            if (contrasena == confirm) {
                if(validacion.contra(contrasena)){
                    const hash = crypto.createHash("sha256");
                    hash.update(contrasena);
                    var asegurado = hash.digest("hex");
                    db.query(
                        "update CUsuario set contrasena = ? where id_usuario = ?",
                        [asegurado, req.user.id[0]],
                        (err, result) => {
                            if (err) {
                                console.log(err);
                            } else {
                                return res.send({
                                    success:true,
                                });
                            }
                        }
                    );
                }else{
                    console.log("Cambio de contraseña no hecha por la validación")
                    return res.send({
                        success:false,
                    });
                }
            } else {
                return res.send({
                    success:false,
                });
            }

            //En caso de que sólo haya llenado el email
        } else if (correo.length != 0) {
            if (validacion.correo(correo)){
                db.query(
                    "update CUsuario set email = ? where id_usuario = ?",
                    [correo, req.user.id[0]],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            return res.send({
                                success:true,
                            });
                        }
                    }
                );
            }else{
                console.log("Cambio de correo no hecha por la validación")
                return res.send({
                    success:false,
                });
            }
        } else {
            return res.send({
                success:false,
            });
        }
    }
);

module.exports = router;
