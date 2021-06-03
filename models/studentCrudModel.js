const model = {};
const db = require("../database/connection");
const jwt = require("jsonwebtoken");
const { comprobateCode } = require("./recovery");

model.addStudent = (req, res) => {
    const data = req.body;
    let idUser = "";
    db.query("SELECT COUNT(*) AS sizeTable FROM CUsuario", (err, size) => {
        if (err) return res.json(err);
        idUser = userIdAlgorithm(size[0].sizeTable, "AL");
        console.log(idUser);
        db.query(
            'INSERT INTO CUsuario VALUES(?,?,?,?,"email@email.com","b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79")',
            [idUser, data.name, data.lastf, data.lastm],
            (err, iUser) => {
                if (err) return res.json(err);
                console.log(iUser);
                db.query(
                    "INSERT INTO EAlumno VALUES(?,?)",
                    [data.id, idUser],
                    (err, response) => {
                        if (err) return res.json(err);
                        console.log(response);
                        res.send({ success: true });
                    }
                );
            }
        );
    });
};

//funcion para generar el id de cada usuario
//Este algoritmo esta mal porque cuenta todos los registros y toma el ultimo numero por lo que habrá numeros iguales
function userIdAlgorithm(sizeTable, typeUser) {
    let idUser = "" + typeUser;
    if (sizeTable < 9) {
        idUser += "000" + (sizeTable + 1);
    } else if (sizeTable >= 9 && sizeTable < 99) {
        idUser += "00" + (sizeTable + 1);
    } else if (sizeTable >= 99 && sizeTable < 999) {
        idUser += "0" + (sizeTable + 1);
    } else {
        idUser += sizeTable + 1;
    }
    return idUser;
}
//carros.find(carro => carro.color === "rojo");
model.getStudets = (req, res) => {
    let studentsUsers = [];
    db.query("SELECT * FROM EAlumno", (err, students) => {
        if (err) return res.send(err);
        db.query("SELECT * FROM CUsuario", (err, usuarios) => {
            if (err) return res.send(err);
            students.forEach((student, i) => {
                if (
                    usuarios.find(
                        (usuario) => usuario.id_usuario == student.id_usuario
                    ) !== "undefined"
                ) {
                    const usuario = usuarios.find(
                        (usuario) => usuario.id_usuario == student.id_usuario
                    );
                    let studentUser = {
                        id: student.boleta,
                        name: usuario.nombre,
                        lastf: usuario.app,
                        lastm: usuario.apm,
                    };
                    studentsUsers.push(studentUser);
                }
            });
            return res.send(studentsUsers);
        });
    });
};

/**
 * Este modulo es para obtener los grupos del alumno, pertenece el home del alumno
 * NO BORRAR
 */
model.getGroups = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT id_generacion FROM MInscripcion WHERE boleta = ?",
        [data.id],
        (err, idg) => {
            if (err) return res.send(err);
            const querys = processGeneration(idg);
            db.query(querys, (err, grupos) => {
                if (err) return res.json(err);
                return res.send(grupos);
            });
        }
    );
};

function processGeneration(ids) {
    let querys = "";
    ids.forEach((id) => {
        querys +=
            'SELECT id_grupo FROM EGeneracion WHERE id_generacion = "' +
            id.id_generacion +
            '";';
    });
    return querys;
}

//obtenemos el codigo que pueda tener activo el alumno y lo verificamos
model.verifyCode = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT id_generacion FROM MInscripcion WHERE boleta = ?",
        [data.boleta],
        (err, idg) => {
            if (err) return res.json(err);
            //procesamos las querys para buscar todas las generaciones que pueda tener
            const querys = processGenerationQuerysForprogram(idg);
            db.query(querys, (err, idp) => {
                if (err) return res.json(err);
                //buscamos los tokens por los programas
                const querysT = processProgramsForToken(idp);
                db.query(querysT, (err, token) => {
                    if (err) return res.json(err);
                    console.log(querys, querysT, token, "tokens");
                    //no debe tener varios tokens activos
                    if (token.length == 1) {
                        jwt.verify(
                            token[0].id_token,
                            data.code,
                            (err, tokenData) => {
                                if (err) {
                                    return res.json({
                                        success: false,
                                        many: false,
                                    });
                                } else {
                                    /**
                                     * Una vez verificado que el codigo sea correcto nos va a mandar aquí
                                     */
                                    const valid = tokenActive(token);
                                    if (valid) {
                                        db.query(
                                            "SELECT id_Sala FROM ESala WHERE id_programa=?",
                                            [token[0].id_programa],
                                            (err, idSala) => {
                                                if (err) return res.json(err);
                                                db.query(
                                                    "SELECT id_usuario FROM EAlumno WHERE boleta=?",
                                                    [data.boleta],
                                                    (err, idu) => {
                                                        if (err)
                                                            return (
                                                                res, json(err)
                                                            );
                                                        db.query(
                                                            "SELECT nombre, app FROM CUsuario WHERE id_usuario = ?",
                                                            [idu[0].id_usuario],
                                                            (err, userData) => {
                                                                if (err)
                                                                    return res.json(
                                                                        err
                                                                    );
                                                                return res.json(
                                                                    {
                                                                        success: true,
                                                                        tokenData,
                                                                        many: false,
                                                                        sala: idSala[0]
                                                                            .id_Sala,
                                                                        userData:
                                                                            userData[0],
                                                                        creationTime:
                                                                            new Date(
                                                                                token[0].creacion
                                                                            ).getTime(),
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    } else {
                                        return res.json({
                                            success: false,
                                            tokenData,
                                            many: false,
                                        });
                                    }
                                }
                            }
                        );
                    } else if (token.length > 1) {
                        let confirmed = [];
                        token.forEach((tok, i) => {
                            if (tok.length > 0) {
                                confirmed.push({
                                    isActive: tokenActive(tok),
                                    index: i,
                                });
                            }
                        });
                        if (confirmed.length == 1) {
                            let index = confirmed[0].index;
                            jwt.verify(
                                token[index][0].id_token,
                                data.code,
                                (err, tokenData) => {
                                    if (err) {
                                        return res.json({
                                            success: false,
                                            many: false,
                                        });
                                    } else {
                                        /**
                                         * Una vez verificado que el codigo sea correcto nos va a mandar aquí
                                         */
                                        if (confirmed[0].isActive) {
                                            db.query(
                                                "SELECT id_Sala FROM ESala WHERE id_programa=?",
                                                [token[index][0].id_programa],
                                                (err, idSala) => {
                                                    if (err)
                                                        return res.json(err);
                                                    db.query(
                                                        "SELECT id_usuario FROM EAlumno WHERE boleta=?",
                                                        [data.boleta],
                                                        (err, idu) => {
                                                            if (err)
                                                                return (
                                                                    res,
                                                                    json(err)
                                                                );
                                                            db.query(
                                                                "SELECT nombre, app FROM CUsuario WHERE id_usuario = ?",
                                                                [
                                                                    idu[0]
                                                                        .id_usuario,
                                                                ],
                                                                (
                                                                    err,
                                                                    userData
                                                                ) => {
                                                                    if (err)
                                                                        return res.json(
                                                                            err
                                                                        );
                                                                    return res.json(
                                                                        {
                                                                            success: true,
                                                                            tokenData,
                                                                            many: false,
                                                                            sala: idSala[0]
                                                                                .id_Sala,
                                                                            userData:
                                                                                userData[0],
                                                                            creationTime:
                                                                                new Date(
                                                                                    token[
                                                                                        index
                                                                                    ][0].creacion
                                                                                ).getTime(),
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        } else {
                                            return res.json({
                                                success: false,
                                                tokenData,
                                                many: false,
                                            });
                                        }
                                    }
                                }
                            );
                        } else if (confirmed.length > 1) {
                            return res.json({ success: false, many: true });
                        } else {
                            return res.json({ success: false, many: false });
                        }
                    } else {
                        return res.json({ success: false, many: false });
                    }
                });
            });
        }
    );
};

model.sendWaiting = (req, res) => {
    const data = req.body;
    console.log(data);
    const timeCreation = new Date(parseInt(data.creacion));
    const fecha =
        timeCreation.getFullYear() +
        "-" +
        ((timeCreation.getMonth() + 1).toString.length == 1
            ? "0" + (timeCreation.getMonth() + 1)
            : timeCreation.getMonth() + 1) +
        "-" +
        (timeCreation.getDate().toString.length == 1
            ? "0" + timeCreation.getDate()
            : timeCreation.getDate());
    db.query(
        "SELECT id_inscripcion FROM MInscripcion WHERE boleta = ? AND id_generacion =?",
        [data.boleta, data.id_generacion],
        (err, idi) => {
            if (err) return res.json(err);
            console.log(
                "timeCreation: " + timeCreation + " fecha: ",
                fecha,
                "idi: ",
                idi[0].id_inscripcion
            );
            db.query(
                "UPDATE MInasistencia SET esperando=1 WHERE DATE(fecha)=? AND id_inscripcion=?",
                [fecha, idi[0].id_inscripcion],
                (err, update) => {
                    if (err) return res.json(err);
                    return res.send(update);
                }
            );
        }
    );
};

model.verifyCodeSent = (req, res) => {
    const data = req.body;
    db.query(
        "SELECT id_inscripcion FROM MInscripcion WHERE boleta=?",
        [data.boleta],
        (err, idi) => {
            if (err) return res.json(err);
            db.query(
                "SELECT id_inasistencia, id_programa FROM MInasistencia WHERE id_inscripcion=? AND esperando=1",
                [idi[0].id_inscripcion],
                (err, idin) => {
                    if (err) return res.json(err);
                    if (idin.length != 0) {
                        //si tiene una espera buscamos la sala
                        db.query(
                            "SELECT id_sala FROM ESala WHERE id_programa=?",
                            [idin[0].id_programa],
                            (err, room) => {
                                if (err) return res.json(err);
                                if (room.length != 0) {
                                    return res.send({
                                        room: room[0].id_sala,
                                        waiting: true,
                                    });
                                } else {
                                    return res.send({ waiting: false });
                                }
                            }
                        );
                    } else {
                        return res.send({ waiting: false });
                    }
                }
            );
        }
    );
};

model.deleteAssistence = (req, res) => {
    const boleta = req.body.boleta;
    db.query(
        "SELECT id_inscripcion FROM MInscripcion WHERE boleta=?",
        [boleta],
        (err, idi) => {
            if (err) return res.json(err);
            const querys = processInscriptionDeleteByBoleta(idi);
            db.query(querys, (err, deleted) => {
                if (err) return res.json(err);
                return res.send(deleted);
            });
        }
    );
};

function processInscriptionDeleteByBoleta(ids) {
    let querys = "";
    ids.forEach((id) => {
        querys +=
            'UPDATE MInasistencia SET esperando=false WHERE id_inscripcion="' +
            id.id_inscripcion +
            '";';
    });
    return querys;
}

function processGenerationQuerysForprogram(ids) {
    let querys = "";
    ids.forEach((id) => {
        querys +=
            'SELECT id_programa FROM MPrograma WHERE id_generacion="' +
            id.id_generacion +
            '";';
    });
    return querys;
}

function processProgramsForToken(ids) {
    let querys = "";
    if (ids.length > 1) {
        ids.forEach((id) => {
            querys +=
                'SELECT * FROM ETokenLista WHERE id_programa="' +
                id[0].id_programa +
                '";';
        });
    } else {
        ids.forEach((id) => {
            querys +=
                'SELECT * FROM ETokenLista WHERE id_programa="' +
                id.id_programa +
                '";';
        });
    }
    return querys;
}

/**
 * @param {Object} token
 * Se encarga de procesar las fechas para compararlas y saber si el token aun esta activo o ya caduó
 * Es importante resaltar que time y creacion son tipo date y duracion es INT
 */
function tokenActive(token) {
    const time = new Date();
    const duracion = token[0].duracion;
    const creacion = new Date(token[0].creacion);
    let auxMinutes = creacion.getMinutes();
    auxMinutes += parseInt(duracion);
    const caducidad = new Date(token[0].creacion);
    caducidad.setMinutes(auxMinutes);
    return time < caducidad;
}

module.exports = model;
