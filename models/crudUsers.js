const model = {};
const db = require("../database/connection");
const crypto = require("crypto");
const validar = require("./validacion");

const materiasCode = [
    { code: "MAP", id: "P606" },
    { code: "SS", id: "P607" },
    { code: "ISB", id: "P608" },
    { code: "LPTIIV", id: "P609" },
    { code: "PI", id: "P610" },
];

const wordsForUse = [
    "q",
    "w",
    "e",
    "r",
    "t",
    "y",
    "u",
    "i",
    "o",
    "p",
    "a",
    "s",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "ñ",
    "z",
    "x",
    "c",
    "v",
    "b",
    "n",
    "m",
];

// añadir un profesor
model.addProfesor = async (req, res) => {
    try {
        let { id_empleado, nombre, app, apm, materias, cicloE } = req.body;
        materias = JSON.parse(materias);
        console.log({ id_empleado, nombre, app, apm, materias, cicloE });

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

                            checkAddProfesor(id_empleado)
                                .then(async (data) => {
                                    if (data) {
                                        let id_usuario =
                                            await idGeneratorStandard("PR");
                                        let querys = QueryGeneratorAddProfesor({
                                            id_empleado,
                                            nombre,
                                            app,
                                            apm,
                                            materiasID: check.materiasID,
                                            id_usuario,
                                            correo: "correo@gmail.com",
                                            contrasena: asegurado,
                                            cicloE,
                                            materias,
                                        });

                                        db.query(
                                            querys.query,
                                            querys.queryData,
                                            (err, rows) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.send(
                                                        "Ocurrio un error inesperado"
                                                    );
                                                }
                                                return res.send(
                                                    "Se a registrado al profesor exitosamente"
                                                );
                                            }
                                        );
                                    } else {
                                        return res.send(
                                            "Ya existe ese registro"
                                        );
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                    return res.send(
                                        "Ocurrio un error inesperado"
                                    );
                                });
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

//obtener profesores
model.getProfesor = (req, res) => {
    try {
        db.query(
            "SELECT id_empleado, nombre, app, apm, materia, cicloE, id_grupo FROM EProfesor INNER JOIN CUsuario USING (id_usuario) INNER JOIN MPrograma USING (id_empleado) INNER JOIN CMateria USING (id_materia) INNER JOIN EGeneracion USING (id_generacion) ORDER BY id_empleado;",
            (err, rows) => {
                if (err) {
                    console.log(err);
                    return res.send(null);
                }
                return res.send(rows);
            }
        );
    } catch (ex) {
        console.log(ex);
        return res.send("A fatal error has ocurred. Please try again later");
    }
};

//Borrar un profesor
model.deleteProfessorById = async (req, res) => {
    let { id_empleado } = req.body;
    try {
        checkAddProfesor(id_empleado)
            .then(async (data) => {
                if (!data) {
                    let id_usuario = await findIdByProfessor(id_empleado);
                    db.query(
                        "DELETE FROM CUsuario WHERE (id_usuario = ?)",
                        [id_usuario],
                        (err, rows) => {
                            if (err) {
                                console.log(err);
                                return res.send(
                                    "Algo salio mal, intentelo de nuevo mas tarde"
                                );
                            }
                            return res.send(
                                "Se a eliminado el usuario exitosamente"
                            );
                        }
                    );
                } else {
                    return res.send(
                        "No existe ese registro, porfavor recarge la pagina"
                    );
                }
            })
            .catch((err) => {
                console.log(err);
                return res.send(
                    "A fatal error has ocurred. Please try again later"
                );
            });
    } catch (ex) {
        console.log(ex);
        return res.send("A fatal error has ocurred. Please try again later");
    }
};

//obtener grupos que no se han dado de alta en dicho ciclo escolar
model.getGroups = (req, res) => {
    try {
        db.query(
            "select id_grupo from CGrupo where id_grupo NOT IN (select distinct id_grupo from EGeneracion where cicloE = ?)",
            [req.body.cicloE],
            (err, rows) => {
                if (err) {
                    console.log(err);
                    return res.send(null);
                }
                return res.send(rows);
            }
        );
    } catch (ex) {
        console.log(ex);
        return res.send("A fatal error has ocurred. Please try again later");
    }
};

//obtener grupos que ya se han dado de alta en dicho ciclo escolar
model.getUpGroups = (req, res) => {
    try {
        db.query(
            "select id_grupo from EGeneracion where cicloE = ?",
            [req.body.cicloE],
            (err, rows) => {
                if (err) {
                    console.log(err);
                    return res.send(null);
                }
                return res.send(rows);
            }
        );
    } catch (ex) {
        console.log(ex);
        return res.send("A fatal error has ocurred. Please try again later");
    }
};

//Dar de alta un grupo en dicho ciclo escolar
model.upGroup = (req, res) => {
    try {
        let { id_grupo, cicloE } = req.body;
        checkUpGroup(id_grupo, cicloE)
            .then((data) => {
                if (data) {
                    db.query(
                        "insert into EGeneracion values(?,?,?)",
                        [cicloE + id_grupo, cicloE, id_grupo],
                        (err, rows) => {
                            if (err) {
                                console.log(err);
                                return res.send(
                                    "Algo salio mal, intentelo de nuevo mas tarde"
                                );
                            }
                            return res.send(
                                "Se a dado de alta al grupo exitosamente"
                            );
                        }
                    );
                } else {
                    return res.send(
                        "Algo salio mal, porfavor recarge la pagina e intentlo de nuevo"
                    );
                }
            })
            .catch((err) => {
                console.log(err);
                return res.send(
                    "A fatal error has ocurred. Please try again later"
                );
            });
    } catch (ex) {
        console.log(ex);
        return res.send("A fatal error has ocurred. Please try again later");
    }
};

//Obtiene el id de usuario apartir del id del profesor
function findIdByProfessor(id_empleado) {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                "SELECT id_usuario FROM CUsuario INNER JOIN EProfesor USING (id_usuario) WHERE id_empleado = ?",
                [id_empleado],
                (err, rows) => {
                    if (err) {
                        rejects(err);
                        return;
                    }
                    resolve(rows[0].id_usuario);
                    return;
                }
            );
        } catch (ex) {
            reject(ex);
            return;
        }
    });
}

//obtiene el ultimo id y genera el siguiente
function idGeneratorStandard(userType) {
    return new Promise((resolve, rejects) => {
        try {
            if (userType == "PR") {
                db.query(
                    "SELECT id_usuario FROM CUsuario WHERE id_usuario LIKE 'PR%'  ORDER BY id_usuario DESC LIMIT 1",
                    (err, rows) => {
                        if (err) {
                            rejects(err);
                            return;
                        }
                        let id_usuario = "";
                        if (rows.length == 0) {
                            id_usuario = "PR0001";
                        } else {
                            id_usuario = idGeneratorStandardFun(
                                userType,
                                rows[0].id_usuario
                            );
                        }
                        resolve(id_usuario);
                        return;
                    }
                );
            } else {
                rejects("No existe dicho usuario");
                return;
            }
        } catch (ex) {
            rejects(ex);
            return;
        }
    });
}

//revisa si no existe aun dicho profesor
function checkAddProfesor(id_empleado) {
    return new Promise((resolve, rejects) => {
        try {
            db.query(
                "select id_empleado from EProfesor where id_empleado = ?",
                [id_empleado],
                (err, rows) => {
                    if (err) {
                        rejects(err);
                        return;
                    }
                    if (rows.length == 0) {
                        resolve(true);
                        return;
                    }
                    resolve(false);
                    return;
                }
            );
        } catch (ex) {
            rejects(err);
            return;
        }
    });
}

//revisa si no existe un grupo ya dado de alta
function checkUpGroup(cicloE, id_grupo) {
    return new Promise((resolve, rejects) => {
        try {
            db.query(
                "select id_generacion from EGeneracion where id_generacion = ? AND cicloE = ? AND id_grupo = ?",
                [cicloE + id_grupo, cicloE, id_grupo],
                (err, rows) => {
                    if (err) {
                        rejects(err);
                        return;
                    }
                    if (rows.length == 0) {
                        resolve(true);
                        return;
                    }
                    resolve(false);
                    return;
                }
            );
        } catch (err) {
            rejects(err);
            return;
        }
    });
}

//obtiene todos los grupos que

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
        cicloE,
    } = data;
    let query = "";
    let queryData = [];

    //id_programa
    materiasID.forEach((materiaID) => {
        materiaID.id_programa = idGeneratorProgram(
            cicloE + materiaID.id_grupo,
            materiaID.materiaCode,
            id_empleado
        );
    });

    //CUsuario
    query += "INSERT INTO CUsuario SET ?;";
    queryData.push({ id_usuario, nombre, app, apm, email: correo, contrasena });

    //EProfesor
    query += "INSERT INTO EProfesor SET ?;";
    queryData.push({ id_empleado, id_usuario });

    //EPrograma
    materiasID.forEach((materiaID) => {
        query += "INSERT INTO MPrograma SET ?;";
        queryData.push({
            id_programa: materiaID.id_programa,
            id_empleado,
            id_materia: materiaID.materiaCode,
            id_generacion: cicloE + materiaID.id_grupo,
        });
    });

    return { query: query, queryData: queryData };
}

//revisa que las materias sean correctas y regresa los ids
function checadorMaterias(materias) {
    let check = true;
    let materiasID = [];
    let tempMaterias = [];

    materiasCode.forEach((materiaCode) => {
        tempMaterias.push(materiaCode.code);
    });

    materias.forEach((materia) => {
        materiasCode.forEach((materiaCode) => {
            if (materiaCode.code == materia.materia) {
                if (!tempMaterias.includes(materia.materia)) {
                    check = false;
                    return;
                }
                materiasID.push({
                    materiaCode: materiaCode.id,
                    id_grupo: materia.grupo,
                });
            }
        });
    });
    if (materiasID.length == 0) {
        check = false;
    }
    return { check: check, materiasID: materiasID };
}

//Generador de ids para programas
function idGeneratorProgram(id_generacion, id_materia, id_empleado) {
    let id = id_generacion + id_materia;

    id += id_empleado.slice(6, 10);

    id +=
        wordsForUse[Math.floor(Math.random() * wordsForUse.length - 1 + 1)] +
        wordsForUse[Math.floor(Math.random() * wordsForUse.length - 1 + 1)];

    return id;
}

//Generador de ids para usuarios
function idGeneratorStandardFun(userType, lastID) {
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
