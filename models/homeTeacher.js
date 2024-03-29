//@ts-check
const model = {};
const jwt = require("jsonwebtoken");
const db = require("../database/connection");

model.deleteAttendance = (req, res) => {
    let { id_inasistencia } = req.body;
    try {
        db.query(
            "DELETE FROM MInasistencia WHERE (id_inasistencia = ?)",
            [id_inasistencia],
            (err, rows) => {
                if (err) {
                    console.log(err);
                    return res.send(
                        "Algo salio mal, intentelo de nuevo mas tarde"
                    );
                }
                return res.send("Se a eliminado el usuario exitosamente");
            }
        );
    } catch (ex) {
        console.log(ex);
        return res.send("A fatal error has ocurred. Please try again later");
    }
};

//problemas con el modo asincrono SELECT id_grupo FROM egeneracion WHERE id_generacion=?
model.getGroups = (req, res) => {
    const data = req.body;
    //obtenemos los programas de los profes y sus materias en cada generacion
    db.query(
        "SELECT MPrograma.*, CMateria.materia, CMateria.area FROM MPrograma INNER JOIN CMateria ON CMateria.id_materia=MPrograma.id_materia WHERE MPrograma.id_empleado=?",
        [data.id],
        (err, programas) => {
            if (err) return res.json(err);
            let querys = getSyringGroupsByPrograms(programas);
            db.query(querys, (err, grupos) => {
                if (err) return res.json(err);
                console.log(grupos);
                return res.send({ grupos, programas });
            });
        }
    );
};

model.addToken = (req, res) => {
    const data = req.body;
    const time = new Date();
    const code = generateCode(6);
    const token = jwt.sign(
        { idPrograma: data.program, idGeneracion: data.generation },
        code
    );
    db.query(
        "INSERT INTO ETokenLista VALUES(?,?,?,?)",
        [token, processDuration(data.duration), time, data.program],
        (err, responseT) => {
            if (err) return res.json(err);
            const idSala = generateIdRoom(data.program, data.idEmpleado);
            db.query(
                "INSERT INTO ESala VALUES(?,?)",
                [idSala, data.program],
                (err, responseS) => {
                    if (err) return res.json(err);
                    const expire = timeToExpire(parseInt(data.duration), time);
                    putGenerationAbsent(data.generation, data.program, time);
                    return res.json({
                        responseT,
                        responseS,
                        code,
                        room: idSala,
                        expire,
                        idToken: token,
                        program: data.program,
                    });
                }
            );
        }
    );
};

model.verifyToken = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT id_programa FROM MPrograma WHERE id_empleado = ?",
        [data.id],
        (err, programas) => {
            if (err) return res.json(err);
            const querys = getStringQueryTokensByPrograms(programas);
            //las coincidencias son los registros donde haya un token
            db.query(querys, (err, coincidencias) => {
                if (err) return res.json(err);
                if (coincidencias.length == 1) {
                    //Verificamos que el token aun esté activo
                    const isActive = tokenIsActive(coincidencias);
                    if (isActive) {
                        const minutesRemaining = timeToExpire(
                            parseInt(coincidencias[0].duracion),
                            coincidencias[0].creacion
                        );
                        db.query(
                            "SELECT id_sala FROM ESala WHERE id_programa=?",
                            [coincidencias[0].id_programa],
                            (err, room) => {
                                if (err) return res.json(err);
                                return res.send({
                                    minutesRemaining,
                                    idToken: coincidencias[0].id_token,
                                    room: room[0].id_sala,
                                    program: coincidencias[0].id_programa,
                                });
                            }
                        );
                    } else {
                        //hay que eliminar el token y su sala
                        db.query(
                            "SELECT id_sala FROM ESala WHERE id_programa=?",
                            [coincidencias[0].id_programa],
                            (err, room) => {
                                db.query(
                                    "DELETE FROM ETokenLista WHERE id_programa=?",
                                    [coincidencias[0].id_programa],
                                    (err, response) => {
                                        if (err) return res.json(err);
                                        db.query(
                                            "DELETE FROM ESala WHERE id_programa=?",
                                            [coincidencias[0].id_programa],
                                            (err, response) => {
                                                if (err) return res.json(err);
                                                return res.send({
                                                    isNotActive: true,
                                                    idToken:
                                                        coincidencias[0]
                                                            .id_token,
                                                    program:
                                                        coincidencias[0]
                                                            .id_programa,
                                                    room: room[0].id_sala,
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                } else if (coincidencias.length > 1) {
                    let confirmed = [];
                    coincidencias.forEach((coincidencia, i) => {
                        if (coincidencia.length > 0) {
                            confirmed.push({
                                isActive: tokenIsActive(coincidencia),
                                index: i,
                            });
                        }
                    });
                    if (confirmed.length == 1) {
                        let index = confirmed[0].index;
                        if (confirmed[0].isActive) {
                            const minutesRemaining = timeToExpire(
                                parseInt(coincidencias[index][0].duracion),
                                coincidencias[index][0].creacion
                            );
                            db.query(
                                "SELECT id_sala FROM ESala WHERE id_programa=?",
                                [coincidencias[index][0].id_programa],
                                (err, room) => {
                                    if (err) return res.json(err);
                                    return res.send({
                                        minutesRemaining,
                                        idToken:
                                            coincidencias[index][0].id_token,
                                        room: room[0].id_sala,
                                        program:
                                            coincidencias[index][0].id_programa,
                                    });
                                }
                            );
                        } else {
                            //hay que eliminar el token y su sala
                            console.log(coincidencias[index][0]);
                            db.query(
                                "SELECT id_sala FROM ESala WHERE id_programa=?",
                                [coincidencias[index][0].id_programa],
                                (err, room) => {
                                    console.log(room);
                                    db.query(
                                        "DELETE FROM ETokenLista WHERE id_programa=?",
                                        [coincidencias[index][0].id_programa],
                                        (err, response) => {
                                            if (err) return res.json(err);
                                            db.query(
                                                "DELETE FROM ESala WHERE id_programa=?",
                                                [
                                                    coincidencias[index][0]
                                                        .id_programa,
                                                ],
                                                (err, response) => {
                                                    if (err)
                                                        return res.json(err);
                                                    return res.send({
                                                        isNotActive: true,
                                                        idToken:
                                                            coincidencias[
                                                                index
                                                            ][0].id_token,
                                                        program:
                                                            coincidencias[
                                                                index
                                                            ][0].id_programa,
                                                        room: room[0].id_sala,
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    } else if (confirmed.length > 1) {
                        return res.send({
                            noToken: true,
                            long: confirmed.length,
                        });
                    } else {
                        res.send({ noToken: true, long: confirmed.length });
                    }
                } else {
                    return res.send({
                        noToken: true,
                        long: coincidencias.length,
                    });
                }
            });
        }
    );
};

model.reject = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT id_inscripcion FROM MInscripcion WHERE boleta=? AND id_generacion =?",
        [data.boleta, data.id_generacion],
        (err, idi) => {
            if (err) return res.json(err);
            db.query(
                "SELECT creacion FROM ETokenLista WHERE id_token=?",
                [data.idToken],
                (err, timeToken) => {
                    if (err) return res.json(err);
                    const timeCreation = db
                        .escape(new Date(timeToken[0].creacion))
                        .replace(".000", "");

                    db.query(
                        "UPDATE MInasistencia SET esperando=0 WHERE fecha=" +
                            timeCreation +
                            " AND id_inscripcion=? AND id_programa=?",
                        [idi[0].id_inscripcion, data.program],
                        (err, updated) => {
                            if (err) return res.json(err);
                            return res.send(updated);
                        }
                    );
                }
            );
        }
    );
};

model.accept = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT id_inscripcion FROM MInscripcion WHERE boleta=? AND id_generacion=?",
        [data.boleta, data.id_generacion],
        (err, idi) => {
            if (err) return res.json(err);
            db.query(
                "SELECT creacion FROM ETokenLista WHERE id_token=?",
                [data.idToken],
                (err, timeToken) => {
                    if (err) return res.json(err);
                    const timeCreation = db
                        .escape(new Date(timeToken[0].creacion))
                        .replace(".000", "");

                    db.query(
                        "DELETE FROM MInasistencia WHERE fecha=" +
                            timeCreation +
                            " AND id_inscripcion=? AND id_programa=?",
                        [idi[0].id_inscripcion, data.program],
                        (err, deleted) => {
                            if (err) return res.json(err);
                            return res.send(deleted);
                        }
                    );
                }
            );
        }
    );
};

model.acceptAll = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT creacion FROM ETokenLista WHERE id_token=?",
        [data.idToken],
        (err, timeToken) => {
            if (err) return res.json(err);
            const timeCreation = db
                .escape(new Date(timeToken[0].creacion))
                .replace(".000", "");

            db.query(
                "SELECT id_inscripcion FROM MInasistencia WHERE fecha=" +
                    timeCreation +
                    " AND id_programa=? AND esperando=1",
                [data.program],
                (err, students) => {
                    if (err) return res.json(err);
                    const querys = getBoletasByInscripcion(students);
                    console.log(querys, students, timeCreation);
                    db.query(querys, (err, boletas) => {
                        if (err) return res.json(err);
                        db.query(
                            "DELETE FROM MInasistencia WHERE fecha=" +
                                timeCreation +
                                " AND id_programa=? AND esperando=1",
                            [data.program],
                            (err, deleted) => {
                                if (err) return res.json(err);
                                return res.send({ deleted, boletas });
                            }
                        );
                    });
                }
            );
        }
    );
};

model.rejectAll = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT creacion FROM ETokenLista WHERE id_token=?",
        [data.idToken],
        (err, timeToken) => {
            if (err) return res.json(err);
            const timeCreation = db
                .escape(new Date(timeToken[0].creacion))
                .replace(".000", "");

            db.query(
                "SELECT id_inscripcion FROM MInasistencia WHERE fecha=" +
                    timeCreation +
                    " AND id_programa=? AND esperando=1",
                [data.program],
                (err, students) => {
                    if (err) return res.json(err);
                    const querys = getBoletasByInscripcion(students);
                    db.query(querys, (err, boletas) => {
                        if (err) return res.json(err);
                        db.query(
                            "UPDATE MInasistencia SET esperando=0 WHERE fecha=" +
                                timeCreation +
                                " AND id_programa=?",
                            [data.program],
                            (err, updated) => {
                                if (err) return res.json(err);
                                return res.send({ updated, boletas });
                            }
                        );
                    });
                }
            );
        }
    );
};

model.deleteToken = (req, res) => {
    const data = req.body;
    db.query(
        "DELETE FROM ETokenLista WHERE id_token=?",
        [data.idToken],
        (err, deletedT) => {
            if (err) return res.json(err);
            db.query(
                "DELETE FROM ESala WHERE id_programa=?",
                [data.program],
                (err, deletedS) => {
                    if (err) return res.json(err);
                    return res.send({ deletedS, deletedT });
                }
            );
        }
    );
};

model.studentsWaiting = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT creacion FROM ETokenLista WHERE id_token=?",
        [data.idToken],
        (err, timeToken) => {
            console.log("studentsWaiting: ", timeToken[0].creacion);
            if (err) return res.json(err);
            const timeCreation = db
                .escape(new Date(timeToken[0].creacion))
                .replace(".000", "");
            console.log(
                "studentsWaiting: ",
                timeToken[0].creacion,
                timeCreation
            );
            db.query(
                "SELECT id_inscripcion FROM MInasistencia WHERE fecha=" +
                    timeCreation +
                    " AND id_programa=? AND esperando=1",
                [data.program],
                (err, idi) => {
                    if (err) return res.json(err);
                    console.log(idi);
                    if (idi.length != 0) {
                        let querys = getBoletasByInscripcion(idi);
                        db.query(querys, (err, boletas) => {
                            if (err) return res.json(err);
                            querys = getStringQueryUseIdByBoletas(boletas);
                            db.query(querys, (err, idu) => {
                                if (err) return res.json(err);
                                querys = getStringQueryNameByIdu(idu);
                                db.query(querys, (err, names) => {
                                    if (err) return res.json(err);
                                    res.send({ names, boletas, waiting: true });
                                });
                            });
                        });
                    } else {
                        res.send({ waiting: false });
                    }
                }
            );
        }
    );
};

function getStringQueryNameByIdu(ids) {
    let querys = "";
    ids.forEach((id) => {
        querys +=
            'SELECT nombre, app FROM CUsuario WHERE id_usuario="' +
            (id[0] === undefined ? id.id_usuario : id[0].id_usuario) +
            '";';
    });
    return querys;
}

function getStringQueryUseIdByBoletas(ids) {
    let querys = "";
    ids.forEach((id) => {
        querys +=
            'SELECT id_usuario FROM EAlumno WHERE boleta="' +
            (id[0] === undefined ? id.boleta : id[0].boleta) +
            '";';
    });
    return querys;
}

function getBoletasByInscripcion(ids) {
    let querys = "";
    ids.forEach((id) => {
        querys +=
            'SELECT boleta FROM MInscripcion WHERE id_inscripcion="' +
            (id[0] === undefined ? id.id_inscripcion : id[0].id_inscripcion) +
            '";';
    });
    return querys;
}

//Funciones para el modelo
function getSyringGroupsByPrograms(programas) {
    let querys = "";
    programas.forEach((programa) => {
        let aux =
            'SELECT id_grupo, id_generacion FROM EGeneracion WHERE id_generacion="' +
            programa.id_generacion +
            '";';
        querys += aux;
    });
    return querys;
}

/**
 * Construye un string con todas las consultas para los tokens que pueda tener el usuario
 * @param {array} programas todos los programas del usuario
 * @returns {String}
 */
function getStringQueryTokensByPrograms(programas) {
    let querys = "";
    programas.forEach((programa) => {
        let aux =
            'SELECT * FROM ETokenLista WHERE id_programa = "' +
            programa.id_programa +
            '";';
        querys += aux;
    });
    return querys;
}

function generateCode(n) {
    let code = "";
    for (var i = 0; i <= n; i++) {
        code += Math.floor(Math.random() * (9 - 0)) + 0;
    }
    return code;
}

function processDuration(duration) {
    let aux = duration.split(" ");
    return aux[0];
}

function generateIdRoom(program, idEmpleado) {
    let id = idEmpleado;
    const letters = program.split("");
    letters.forEach((letter, i) => {
        if (i <= 5) {
            id += letter;
        }
    });
    console.log(id);
    return id;
}

/**
 * esta funcion se encarga de verificar que el token aun este activo
 * @param {object} token todos los datos de un token en la bd
 * @returns {boolean} returna si el tiempo actual es menor al tiempo de caducidad
 */
function tokenIsActive(token) {
    const time = new Date();
    const duration = token[0].duracion;
    const creation = new Date(token[0].creacion);
    let difference =
        creation.setMinutes(creation.getMinutes() + duration) - time.getTime();
    return difference > 0;
}

/**
 * Se encarga de calcular el tiempo faltante para que expire
 * @param {number} duration es la duracion del token
 * @param {Date} creation es la fecha en que fue creado
 * @returns {Date}
 */
function timeToExpire(duration, creation) {
    creation = new Date(creation);
    const nowTime = new Date();

    const expireTime = creation.setMinutes(creation.getMinutes() + duration);
    const missingTime = expireTime - nowTime.getTime();

    if (missingTime > 0) {
        return new Date(missingTime);
    } else {
        //nunca debería retornar esto
        console.log("ha caducado");
        return new Date(0);
    }
}

/**
 * Esta funcion le pone inasistencia a todos en un programa y geberacion
 * @param {String} generation id de la generacion a la que se va a poner inasistencia
 * @param {Date} nowTime Es la fecha actual del registro
 * @param {String} program Es el programa en el que se esta pasando asistencia
 */
function putGenerationAbsent(generation, program, nowTime) {
    const stringTime = nowTime;
    //obtenemos todas las inscripciones de esta generacion
    db.query(
        "SELECT * FROM MInscripcion WHERE id_generacion = ?",
        [generation],
        (err, idi) => {
            if (err) console.log(err);
            const querys = processQuerysInasistenciaByInscripcion(
                idi,
                program,
                stringTime
            );
            db.query(querys, (err, res) => {
                if (err) console.log(err);
                console.log("todos con falta alv");
            });
        }
    );
}

/*- Reglas para id de MInasistencia

Se crea como llave compuesta a partir de fecha (en formato '1000-01-01 00:00:00'), id_inscripcion e id_programa respectivamente.

En total son 55 caracteres.*/
function processQuerysInasistenciaByInscripcion(ids, program, nowTime) {
    let querys = "";
    ids.forEach((id) => {
        let idi =
            db.escape(nowTime).replace("'", "").slice(0, 19) +
            id.id_inscripcion +
            program;
        querys +=
            'INSERT INTO MInasistencia VALUES("' +
            idi +
            '","' +
            db.escape(nowTime).replace("'", "").slice(0, 23) +
            '","' +
            id.id_inscripcion +
            '","' +
            program +
            '",false);';
    });
    return querys;
}

module.exports = model;
