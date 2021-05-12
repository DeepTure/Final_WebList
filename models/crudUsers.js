const model = {};
const db = require("../database/connection");
const crypto = require("crypto");
const validar = require("./validacion");
const { serialize } = require("v8");

const materiasCode = [
    { code: "MAP", id: "P606" },
    { code: "SS", id: "P607" },
    { code: "ISB", id: "P608" },
    { code: "LPTIIV", id: "P609" },
    { code: "PI", id: "P610" },
];

// añadir un profesor
model.addProfesor = (req, res) => {
    try {
        let { id_empleado, nombre, app, apm, materias } = JSON.parse(
            req.body.datos
        );
        console.log(req.body.datos);

        var validacionnum = validar.numEmpleado(id_empleado);
        var validacionnom = validar.Nombres(nombre);
        var validacionapp = validar.ApellidoPM(app);
        var validacionapm = validar.ApellidoPM(apm);
        if (validacionnum) {
            if (validacionnom) {
                if (validacionapp) {
                    if (validacionapm) {
                        let check = checadorMaterias(materias);

                        if (check.check) {
                            const hash = crypto.createHash("sha256");
                            hash.update(id_empleado);
                            var asegurado = hash.digest("hex");

                            let id_usuario = db.query(
                                "SELECT id_empleado FROM EProfesor WHERE id_empleado = ?",
                                [id_empleado],
                                (err, rows) => {
                                    if (err) {
                                        console.log(err);
                                        return res.send(
                                            "Ocurrio un error inesperado"
                                        );
                                    } else {
                                        if (rows.length == 0) {
                                            db.query(
                                                "SELECT id_usuario FROM CUsuario WHERE id_usuario LIKE 'PR%'  ORDER BY id_usuario DESC LIMIT 1",
                                                (err, rows) => {
                                                    let id_usuario = "";
                                                    if (err) {
                                                        console.log(err);
                                                        return res.send(
                                                            "Ocurrio un error inesperado"
                                                        );
                                                    } else if (
                                                        rows.length == 0
                                                    ) {
                                                        id_usuario = "PR0001";
                                                    } else {
                                                        id_usuario =
                                                            idGeneratorStandard(
                                                                "PR",
                                                                rows[0]
                                                                    .id_usuario
                                                            );
                                                    }
                                                    let querys =
                                                        QueryGeneratorAddProfesor(
                                                            {
                                                                id_empleado,
                                                                nombre,
                                                                app,
                                                                apm,
                                                                materiasID:
                                                                    check.materiasID,
                                                                id_usuario,
                                                                correo: "correo@gmail.com",
                                                                contrasena:
                                                                    asegurado,
                                                            }
                                                        );

                                                    db.query(
                                                        querys.query,
                                                        querys.queryData,
                                                        (err, rows) => {
                                                            if (err) {
                                                                console.log(
                                                                    err
                                                                );
                                                                return res.send(
                                                                    "Ocurrio un error inesperado"
                                                                );
                                                            }
                                                            console.log(rows);
                                                            return res.send(
                                                                "Se a registrado al profesor exitosamente"
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        } else {
                                            return res.send(
                                                "Ya existe ese registro"
                                            );
                                        }
                                    }
                                }
                            );
                        } else {
                            return res.send(
                                "Ocurrio un error con los datos de las materias"
                            );
                        }
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
    } catch (ex) {
        console.log(ex);
        return res.send("A fatal error has ocurred. Please try again later");
    }
};

//genera la query para insertar los datos del profesor
function QueryGeneratorAddProfesor(data) {
    let {
        id_empleado,
        nombre,
        app,
        apm,
        materiasID,
        id_usuario,
        correo,
        contrasena,
    } = data;
    let query = "";
    let queryData = [];

    //CUsuario
    query = query + "INSERT INTO CUsuario SET ?;";
    queryData.push({ id_usuario, nombre, app, apm, email: correo, contrasena });

    //EProfesor
    query = query + "INSERT INTO EProfesor SET ?;";
    queryData.push({ id_empleado, id_usuario });

    //EProfesor_Materia
    materiasID.forEach((materiaID) => {
        query = query + "INSERT INTO EProfesor_Materia SET ?;";
        queryData.push({
            id_profesor_materia: id_empleado + materiaID,
            id_empleado,
            id_materia: materiaID,
        });
    });

    return { query: query, queryData: queryData };
}

//revisa que las materias sean correctas y regresa los ids
function checadorMaterias(materias) {
    let check = true;
    let materiasID = [];

    materias.forEach((materia) => {
        materiasCode.forEach((materiaCode) => {
            if (materiaCode.code == materia) {
                if (materiasID.includes(materiaCode.id)) {
                    check = false;
                    return;
                }
                materiasID.push(materiaCode.id);
            }
        });
    });
    if (materiasID.length == 0) {
        check = false;
    }
    return { check: check, materiasID: materiasID };
}

//Generador de ids para usuarios
function idGeneratorStandard(userType, lastID) {
    let id = userType;

    let lastNumber = parseInt(lastID.slice(2, 6));
    lastNumber++;
    let lastNumberString = String(lastNumber);
    for (
        let index = lastNumberString.length;
        lastNumberString.length < 4;
        index++
    ) {
        lastNumberString = "0" + lastNumberString;
    }
    id = id + lastNumberString;
    return id;
}

module.exports = model;
