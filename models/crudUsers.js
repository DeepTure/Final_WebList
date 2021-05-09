const model = {};
const db = require("../database/connection");
const crypto = require("crypto");
const validar = require("./validacion");

model.addProfesor = (req, res) => {
    let { id_empleado, nombre, app, apm, materias } = JSON.parse(
        req.body.datos
    );

    let correo = "correo@gmail.com";

    var validacionnum = validacion.numEmpleado(id_empleado);
    var validacionnom = validacion.Nombres(nombre);
    var validacionapp = validacion.ApellidoPM(app);
    var validacionapm = validacion.ApellidoPM(apm);

    if (validacionnum) {
        if (validacionnom) {
            if (validacionapp) {
                if (validacionapm) {
                    const hash = crypto.createHash("sha256");
                    hash.update(id_empleado);
                    var asegurado = hash.digest("hex");

                    let idMUsuario = db.query(
                        "SELECT * FROM EProfesor WHERE id_empleado = ?",
                        [id_empleado],
                        (err, rows) => {
                            if (err) {
                                console.log(err);
                            } else {
                                if (rows.length == 0) {
                                    db.query(
                                        "select * from CUsuario ORDER BY idMUsuario DESC LIMIT 1",
                                        (err, rows) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                let lastID = rows[0].idMUsuario;
                                                lastID = lastID.replace(
                                                    /^([A-Z]){2}([0]){0,3}/,
                                                    ""
                                                );
                                            }
                                        }
                                    );
                                } else {
                                    return res.send("Ya existe ese registro");
                                }
                            }
                        }
                    );
                } else {
                    return res.send("El apellido materno es incorrecto");
                }
            } else {
                return res.send("El apellido paterno es incorrecto");
            }
        } else {
            return res.send("El nombre es incorrecto");
        }
    } else {
        return res.send("El id de empleado es incorrecto");
    }
};

module.exports = model;
