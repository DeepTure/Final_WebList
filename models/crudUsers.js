const model = {};
const db = require("../database/connection");
const crypto = require("crypto");
const validar = require("./validacion");
const csv = require("csv-parser");
const fs = require("fs");
const fsConstants = require("fs");

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

//añadir usuarios por csv
model.addUsersByCSV = async (req, res) => {
    try {
        let { cicloE } = req.body;
        let usersP = [];
        let usersA = [];
        let data = await readCSV(req.file.path);
        let lastIDAl = await idGeneratorStandard("AL");
        let idCounterAl = 0;
        let lastIDPr = await idGeneratorStandard("PR");
        let idCounterPr = 0;

        const hash = crypto.createHash("sha256");
        data.forEach((dat) => {
            let chunk = {};
            chunk.nombre = dat.nombre;
            chunk.app = dat.app;
            chunk.apm = dat.apm;
            chunk.cicloE = cicloE;
            chunk.correo = "correo@gmail.com";
            if (dat.tipo_usuario == "alumno") {
                let index = -1;
                usersA.forEach((user, i) => {
                    if (user.boleta == dat.id) {
                        index = i;
                        return;
                    }
                });
                if (index == -1) {
                    chunk.grupos = [{ id_grupo: dat.grupo }];
                    chunk.boleta = dat.id;
                    chunk.id_usuario = idGeneratorStandardAscendant(
                        "AL",
                        lastIDAl,
                        idCounterAl
                    );
                    idCounterAl++;
                    hash.update(chunk.boleta);
                    var asegurado = hash.digest("hex");
                    chunk.contrasena = asegurado;
                    usersA.push(chunk);
                } else {
                    usersA[index].grupos.push({ id_grupo: dat.grupo });
                }
            } else if (dat.tipo_usuario == "profesor") {
                let index = -1;
                usersP.forEach((user, i) => {
                    if (user.id_empleado == dat.id) {
                        index = i;
                        return;
                    }
                });
                if (index == -1) {
                    chunk.materiasID = [
                        { materiaCode: dat.materia, id_grupo: dat.grupo },
                    ];
                    chunk.id_empleado = dat.id;
                    chunk.id_usuario = idGeneratorStandardAscendant(
                        "PR",
                        lastIDPr,
                        idCounterPr
                    );
                    idCounterPr++;
                    hash.update(chunk.id_empleado);
                    var asegurado = hash.digest("hex");
                    chunk.contrasena = asegurado;
                    usersP.push(chunk);
                } else {
                    usersP[index].materiasID.push({
                        materiaCode: dat.materia,
                        id_grupo: dat.grupo,
                    });
                }
            }
        });
        let chunkAl = null;
        let chunkPr = null;
        if (usersA.length > 0) {
            chunkAl = QueryGeneratorChunkAddStudent(usersA);
        }
        if (usersP.length > 0) {
            chunkPr = QueryGeneratorChunkAddProfesor(usersP);
        }
        let finalQueryChunk =
            (chunkAl === null ? "" : chunkAl.query) +
            (chunkPr === null ? "" : chunkPr.query);
        let finalQueryDataChunk = [].concat(
            chunkAl === null ? [] : chunkAl.queryData,
            chunkPr === null ? [] : chunkPr.queryData
        );
        if (finalQueryChunk != "" && finalQueryDataChunk.length != 0) {
            db.query(
                finalQueryChunk,
                finalQueryDataChunk,
                async (err, rows) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("ERROR");
                    }
                    await quitFiles(req.file.path);
                    return res.send(JSON.stringify(rows));
                }
            );
        }
    } catch (ex) {
        console.log(ex);
        return res.status(500).send("ERROR");
    }
};

//ir a modificar profesor y preparacion previa
model.goToModify = async (req, res) => {
    try {
        let { id_empleado, boleta, cicloE } = req.body;
        console.log(id_empleado, boleta, cicloE);
        if (id_empleado === undefined) {
            let studentData = await getStudentById(boleta, cicloE);
            if (studentData.length == 0) {
                let rol = req.user.rol;
                let id = req.user.id[1];
                return res.redirect("/home", {
                    rol,
                    id,
                    msg: "No se encontro al profesor",
                });
            } else {
                let dataToSend = {};
                dataToSend.boleta = boleta;
                dataToSend.cicloE = cicloE;
                dataToSend.nombre = studentData[0].nombre;
                dataToSend.app = studentData[0].app;
                dataToSend.apm = studentData[0].apm;
                dataToSend.id_usuario = studentData[0].id_usuario;
                let grupo = [];
                studentData.forEach((data) => {
                    grupo.push({
                        id_grupo: data.id_grupo,
                    });
                });
                dataToSend.grupos = grupo;
                dataToSend.rol = "Alumno";
                let readyGroups = await getUpGroupsFun(cicloE);
                dataToSend.readyGroups = readyGroups;
                return res.render("modify", { dataToSend });
            }
        } else if (boleta === undefined) {
            let professorData = await getProfesorById(id_empleado, cicloE);
            if (professorData.length == 0) {
                let rol = req.user.rol;
                let id = req.user.id[1];
                return res.redirect("/home", {
                    rol,
                    id,
                    msg: "No se encontro al profesor",
                });
            } else {
                let dataToSend = {};
                dataToSend.id_empleado = id_empleado;
                dataToSend.cicloE = cicloE;
                dataToSend.nombre = professorData[0].nombre;
                dataToSend.app = professorData[0].app;
                dataToSend.apm = professorData[0].apm;
                dataToSend.id_usuario = professorData[0].id_usuario;
                let materiaGrupo = [];
                professorData.forEach((data) => {
                    materiaGrupo.push({
                        materia: data.materia,
                        id_grupo: data.id_grupo,
                    });
                });
                dataToSend.materiaGrupo = materiaGrupo;
                dataToSend.rol = "Profesor";
                let readyGroups = await getUpGroupsFun(cicloE);
                dataToSend.readyGroups = readyGroups;
                return res.render("modify", { dataToSend });
            }
        } else {
            return res.redirect("/home");
        }
    } catch (ex) {
        console.log(ex);
        return res.redirect("/home");
    }
};

// modificar un profesor
model.modifyProfesor = async (req, res) => {
    try {
        let {
            id_empleado,
            id_usuario,
            nombre,
            app,
            apm,
            materiasD,
            materiasA,
            cicloE,
        } = req.body;
        materiasD = JSON.parse(materiasD);
        materiasA = JSON.parse(materiasA);
        console.log({
            id_empleado,
            id_usuario,
            nombre,
            app,
            apm,
            materiasD,
            materiasA,
            cicloE,
        });

        var validacionnum = validar.numEmpleado(id_empleado);
        var validacionnom = validar.Nombres(nombre);
        var validacionapp = validar.ApellidoPM(app);
        var validacionapm = validar.ApellidoPM(apm);
        if (validacionnum) {
            if (validacionnom) {
                if (validacionapp) {
                    if (validacionapm) {
                        let checkA = { check: false, materiasID: [] };
                        let checkD = { check: false, materiasID: [] };
                        let items = 0;
                        if (materiasA.length > 0) {
                            checkA = checadorMaterias(materiasA);
                            items++;
                        }
                        if (materiasD.length > 0) {
                            checkD = checadorMaterias(materiasD);
                            items++;
                        }
                        if (
                            items == 0 ||
                            (items == 1 && (checkA.check || checkD.check)) ||
                            (items == 2 && checkA.check && checkD.check)
                        ) {
                            checkAddProfesor(id_empleado)
                                .then(async (data) => {
                                    if (!data) {
                                        let querys =
                                            QueryGeneratorModifyProfesor({
                                                id_empleado,
                                                id_usuario,
                                                nombre,
                                                app,
                                                apm,
                                                materiasA: checkA.materiasID,
                                                materiasD: checkD.materiasID,
                                                cicloE,
                                            });

                                        db.query(
                                            querys.query,
                                            querys.queryData,
                                            (err, rows) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.json({
                                                        code: 0,
                                                        msg: "Ocurrio un error inesperado",
                                                    });
                                                }
                                                return res.json({
                                                    code: 1,
                                                    msg: "Se a actualizado al profesor exitosamente",
                                                });
                                            }
                                        );
                                    } else {
                                        return res.json({
                                            code: 1,
                                            msg: "No existe ese registro",
                                        });
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                    return res.json({
                                        code: 0,
                                        msg: "Ocurrio un error inesperado",
                                    });
                                });
                        } else {
                            return res.json({
                                code: 0,
                                msg: "Ocurrio un error con los datos de las materias",
                            });
                        }
                    } else {
                        return res.json({
                            code: 0,
                            msg: "El apellido materno es incorrecto",
                        });
                    }
                } else {
                    return res.json({
                        code: 0,
                        msg: "El apellido paterno es incorrecto",
                    });
                }
            } else {
                return res.json({ code: 0, msg: "El nombre es incorrecto" });
            }
        } else {
            return res.json({
                code: 0,
                msg: "El id de empleado es incorrecto",
            });
        }
    } catch (ex) {
        console.log(ex);
        return res.json({
            code: 0,
            msg: "A fatal error has ocurred. Please try again later",
        });
    }
};

// modificar un alumno
model.modifyStudent = async (req, res) => {
    try {
        let { boleta, id_usuario, nombre, app, apm, gruposD, gruposA, cicloE } =
            req.body;
        gruposD = JSON.parse(gruposD);
        gruposA = JSON.parse(gruposA);
        console.log({
            boleta,
            id_usuario,
            nombre,
            app,
            apm,
            gruposD,
            gruposA,
            cicloE,
        });

        var validacionnum = validar.boleta(boleta);
        var validacionnom = validar.Nombres(nombre);
        var validacionapp = validar.ApellidoPM(app);
        var validacionapm = validar.ApellidoPM(apm);
        if (validacionnum) {
            if (validacionnom) {
                if (validacionapp) {
                    if (validacionapm) {
                        let checkA = { check: false, grupos: [] };
                        let checkD = { check: false, grupos: [] };
                        let items = 0;
                        if (gruposA.length > 0) {
                            checkA = await checadorGrupos(gruposA, cicloE);
                            items++;
                        }
                        if (gruposD.length > 0) {
                            checkD = await checadorGrupos(gruposD, cicloE);
                            items++;
                        }
                        if (
                            items == 0 ||
                            (items == 1 && (checkA.check || checkD.check)) ||
                            (items == 2 && checkA.check && checkD.check)
                        ) {
                            checkAddStudent(boleta)
                                .then(async (data) => {
                                    if (!data) {
                                        let querys =
                                            QueryGeneratorModifyStudent({
                                                boleta,
                                                id_usuario,
                                                nombre,
                                                app,
                                                apm,
                                                gruposA: checkA.grupos,
                                                gruposD: checkD.grupos,
                                                cicloE,
                                            });

                                        db.query(
                                            querys.query,
                                            querys.queryData,
                                            (err, rows) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.json({
                                                        code: 0,
                                                        msg: "Ocurrio un error inesperado",
                                                    });
                                                }
                                                return res.json({
                                                    code: 1,
                                                    msg: "Se a actualizado al alumno exitosamente",
                                                });
                                            }
                                        );
                                    } else {
                                        return res.json({
                                            code: 1,
                                            msg: "No existe ese registro",
                                        });
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                    return res.json({
                                        code: 0,
                                        msg: "Ocurrio un error inesperado",
                                    });
                                });
                        } else {
                            return res.json({
                                code: 0,
                                msg: "Ocurrio un error con los datos de las materias",
                            });
                        }
                    } else {
                        return res.json({
                            code: 0,
                            msg: "El apellido materno es incorrecto",
                        });
                    }
                } else {
                    return res.json({
                        code: 0,
                        msg: "El apellido paterno es incorrecto",
                    });
                }
            } else {
                return res.json({ code: 0, msg: "El nombre es incorrecto" });
            }
        } else {
            return res.json({
                code: 0,
                msg: "El id de empleado es incorrecto",
            });
        }
    } catch (ex) {
        console.log(ex);
        return res.json({
            code: 0,
            msg: "A fatal error has ocurred. Please try again later",
        });
    }
};

// añadir un alumno
model.addStudent = async (req, res) => {
    try {
        let { boleta, nombre, app, apm, grupos, cicloE } = req.body;
        grupos = JSON.parse(grupos);
        console.log({ boleta, nombre, app, apm, grupos, cicloE });

        var validacionnum = validar.boleta(boleta);
        var validacionnom = validar.Nombres(nombre);
        var validacionapp = validar.ApellidoPM(app);
        var validacionapm = validar.ApellidoPM(apm);
        if (validacionnum) {
            if (validacionnom) {
                if (validacionapp) {
                    if (validacionapm) {
                        let check = await checadorGrupos(grupos, cicloE);

                        if (check.check) {
                            const hash = crypto.createHash("sha256");
                            hash.update(boleta);
                            var asegurado = hash.digest("hex");

                            checkAddStudent(boleta)
                                .then(async (data) => {
                                    if (data) {
                                        let id_usuario =
                                            await idGeneratorStandard("AL");
                                        let querys = QueryGeneratorAddStudent({
                                            boleta,
                                            nombre,
                                            app,
                                            apm,
                                            grupos: check.grupos,
                                            id_usuario,
                                            correo: "correo@gmail.com",
                                            contrasena: asegurado,
                                            cicloE,
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
                                                    "Se a registrado al alumno exitosamente"
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

//obtener alumnos
model.getStudents = (req, res) => {
    try {
        db.query(
            "SELECT boleta, nombre, app, apm, cicloE, id_grupo FROM EAlumno INNER JOIN CUsuario USING (id_usuario) INNER JOIN MInscripcion USING (boleta) INNER JOIN EGeneracion USING (id_generacion) ORDER BY boleta;",
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

//Borrar un alumno
model.deleteStudentById = async (req, res) => {
    let { boleta } = req.body;
    try {
        checkAddStudent(boleta)
            .then(async (data) => {
                if (!data) {
                    let id_usuario = await findIdByStudent(boleta);
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

//obtener datos de inasistencias
model.getAbsences = (req, res) => {
    try {
        let { id_grupo, cicloE } = req.body;
        console.log(id_grupo, cicloE);
        db.query(
            "SELECT fecha, boleta, CONCAT_WS(' ',nombre,app,apm) AS fullname, id_grupo, materia, cicloE FROM MInasistencia INNER JOIN MInscripcion USING (id_inscripcion) INNER JOIN MPrograma USING (id_programa) INNER JOIN EGeneracion ON EGeneracion.id_generacion = MInscripcion.id_generacion INNER JOIN EAlumno USING (boleta) INNER JOIN CUsuario USING (id_usuario) INNER JOIN CMateria USING (id_materia) WHERE (id_grupo = ? AND cicloE = ?)",
            [id_grupo, cicloE],
            (err, rows) => {
                if (err) {
                    console.error(err);
                    return res.send(null);
                }
                return res.send(rows);
            }
        );
    } catch (ex) {
        console.error(ex);
        return res.send(null);
    }
};

//obtener grupos que ya se han dado de alta en dicho ciclo escolar
model.getUpGroups = (req, res) => {
    try {
        getUpGroupsFun(req.body.cicloE)
            .then((data) => {
                return res.send(data);
            })
            .catch((err) => {
                console.log(err);
                return res.send(null);
            });
    } catch (ex) {
        console.log(ex);
        return res.send(null);
    }
};

//obtener todos los grupos y ciclos escolares con un registro existente
model.getAllRegGroups = (req, res) => {
    db.query(
        "SELECT DISTINCT id_grupo, cicloE FROM EGeneracion",
        (err, rows) => {
            if (err) {
                console.log(err);
                return res.send([]);
            }
            return res.send(rows);
        }
    );
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

//leer un archivo csv
function readCSV(path) {
    return new Promise((resolve, reject) => {
        let data = [];
        fs.createReadStream(path)
            .pipe(csv())
            .on("data", (row) => {
                data.push(row);
            })
            .on("end", () => {
                resolve(data);
            })
            .on("error", (ex) => {
                console.log(ex);
                reject(ex);
            });
    });
}

//Obtener un profesor por id
function getProfesorById(id_empleado, cicloE) {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                "SELECT id_usuario, nombre, app, apm, materia, id_grupo FROM EProfesor INNER JOIN CUsuario USING (id_usuario) INNER JOIN MPrograma USING (id_empleado) INNER JOIN CMateria USING (id_materia) INNER JOIN EGeneracion USING (id_generacion) WHERE (id_empleado = ? AND cicloE = ?) ORDER BY id_empleado",
                [id_empleado, cicloE],
                (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                    return;
                }
            );
        } catch (ex) {
            reject(ex);
            return;
        }
    });
}

//Obtener un alumno por id
function getStudentById(boleta, cicloE) {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                "SELECT id_usuario, nombre, app, apm, id_grupo FROM EAlumno INNER JOIN CUsuario USING (id_usuario) INNER JOIN MInscripcion USING (boleta) INNER JOIN EGeneracion USING (id_generacion) WHERE (boleta = ? AND cicloE = ?) ORDER BY boleta",
                [boleta, cicloE],
                (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                    return;
                }
            );
        } catch (ex) {
            reject(ex);
            return;
        }
    });
}

//obtiene todos los grupos que ya se han dado de alta en dicho semestre
function getUpGroupsFun(cicloE) {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                "select id_grupo from EGeneracion where cicloE = ?",
                [cicloE],
                (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                    return;
                }
            );
        } catch (ex) {
            reject(ex);
            return;
        }
    });
}

//Obtiene el id de usuario apartir del id del profesor
function findIdByProfessor(id_empleado) {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                "SELECT id_usuario FROM CUsuario INNER JOIN EProfesor USING (id_usuario) WHERE id_empleado = ?",
                [id_empleado],
                (err, rows) => {
                    if (err) {
                        reject(err);
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

//Obtiene el id de usuario apartir del id del alumno
function findIdByStudent(boleta) {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                "SELECT id_usuario FROM CUsuario INNER JOIN EAlumno USING (id_usuario) WHERE (boleta = ?)",
                [boleta],
                (err, rows) => {
                    if (err) {
                        reject(err);
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
            } else if (userType == "AL") {
                db.query(
                    "SELECT id_usuario FROM CUsuario WHERE id_usuario LIKE 'AL%'  ORDER BY id_usuario DESC LIMIT 1",
                    (err, rows) => {
                        if (err) {
                            rejects(err);
                            return;
                        }
                        let id_usuario = "";
                        if (rows.length == 0) {
                            id_usuario = "AL0001";
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

//revisa si no existe aun dicho alumno
function checkAddStudent(boleta) {
    return new Promise((resolve, rejects) => {
        try {
            db.query(
                "select boleta from EAlumno where boleta = ?",
                [boleta],
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

function quitFiles(path) {
    return new Promise((resolve, reject) => {
        fsConstants.access(path, fsConstants.constants.F_OK, (err) => {
            if (err) {
                reject(err);
            }
            fs.unlink(path, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });
}

//genera la query para insertar datos de profesor de forma masiva
function QueryGeneratorChunkAddProfesor(data) {
    let queryChunk = "";
    let queryDataChunk = [];

    data.forEach((dat) => {
        let query = "";
        let queryData = [];

        //id_programa
        dat.materiasID.forEach((materiaID) => {
            materiaID.id_programa = idGeneratorProgram(
                dat.cicloE + materiaID.id_grupo,
                materiaID.materiaCode,
                dat.id_empleado
            );
        });

        //CUsuario
        query += "INSERT INTO CUsuario SET ?;";
        queryData.push({
            id_usuario: dat.id_usuario,
            nombre: dat.nombre,
            app: dat.app,
            apm: dat.apm,
            email: dat.correo,
            contrasena: dat.contrasena,
        });

        //EProfesor
        query += "INSERT INTO EProfesor SET ?;";
        queryData.push({
            id_empleado: dat.id_empleado,
            id_usuario: dat.id_usuario,
        });

        //MPrograma
        dat.materiasID.forEach((materiaID) => {
            query += "INSERT INTO MPrograma SET ?;";
            queryData.push({
                id_programa: materiaID.id_programa,
                id_empleado: dat.id_empleado,
                id_materia: materiaID.materiaCode,
                id_generacion: dat.cicloE + materiaID.id_grupo,
            });
        });

        queryChunk += query;
        queryDataChunk = [].concat(queryDataChunk, queryData);
    });

    return { query: queryChunk, queryData: queryDataChunk };
}

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

    //MPrograma
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

//genera la query para insertar datos de alumnos de forma masiva
function QueryGeneratorChunkAddStudent(data) {
    let queryChunk = "";
    let queryDataChunk = [];

    data.forEach((dat) => {
        let query = "";
        let queryData = [];

        //id_inscripcion
        dat.grupos.forEach((grupo) => {
            grupo.id_inscripcion = idGeneratorInscripcion(
                dat.cicloE + grupo.id_grupo,
                dat.boleta
            );
        });

        //CUsuario
        query += "INSERT INTO CUsuario SET ?;";
        queryData.push({
            id_usuario: dat.id_usuario,
            nombre: dat.nombre,
            app: dat.app,
            apm: dat.apm,
            email: dat.correo,
            contrasena: dat.contrasena,
        });

        //EAlumno
        query += "INSERT INTO EAlumno SET ?;";
        queryData.push({ boleta: dat.boleta, id_usuario: dat.id_usuario });

        //MInscripcion
        dat.grupos.forEach((grupo) => {
            query += "INSERT INTO MInscripcion SET ?;";
            queryData.push({
                id_inscripcion: grupo.id_inscripcion,
                boleta: dat.boleta,
                id_generacion: dat.cicloE + grupo.id_grupo,
            });
        });

        queryChunk += query;
        queryDataChunk = [].concat(queryDataChunk, queryData);
    });
    return { query: queryChunk, queryData: queryDataChunk };
}

//genera la query para insertar los datos del alumno
function QueryGeneratorAddStudent(data) {
    let {
        boleta,
        nombre,
        app,
        apm,
        grupos,
        id_usuario,
        correo,
        contrasena,
        cicloE,
    } = data;
    console.log(data);
    let query = "";
    let queryData = [];

    //id_inscripcion
    grupos.forEach((grupo) => {
        grupo.id_inscripcion = idGeneratorInscripcion(
            cicloE + grupo.id_grupo,
            boleta
        );
    });

    //CUsuario
    query += "INSERT INTO CUsuario SET ?;";
    queryData.push({ id_usuario, nombre, app, apm, email: correo, contrasena });

    //EAlumno
    query += "INSERT INTO EAlumno SET ?;";
    queryData.push({ boleta, id_usuario });

    //MInscripcion
    grupos.forEach((grupo) => {
        query += "INSERT INTO MInscripcion SET ?;";
        queryData.push({
            id_inscripcion: grupo.id_inscripcion,
            boleta,
            id_generacion: cicloE + grupo.id_grupo,
        });
    });

    return { query: query, queryData: queryData };
}

//genera la query para modificar los datos del profesor
function QueryGeneratorModifyProfesor(data) {
    let {
        id_empleado,
        id_usuario,
        nombre,
        app,
        apm,
        materiasA,
        materiasD,
        cicloE,
    } = data;
    let query = "";
    let queryData = [];

    //CUsuario
    query += "UPDATE CUsuario SET ? WHERE (id_usuario = ?);";
    queryData.push({ nombre, app, apm }, id_usuario);

    //Nuevos programas
    if (materiasA.length != 0) {
        //id_programa
        materiasA.forEach((materiaA) => {
            materiaA.id_programa = idGeneratorProgram(
                cicloE + materiaA.id_grupo,
                materiaA.materiaCode,
                id_empleado
            );
        });

        //EPrograma
        materiasA.forEach((materiaA) => {
            query += "INSERT INTO MPrograma SET ?;";
            queryData.push({
                id_programa: materiaA.id_programa,
                id_empleado,
                id_materia: materiaA.materiaCode,
                id_generacion: cicloE + materiaA.id_grupo,
            });
        });
    }

    //Eliminar viejos programas
    if (materiasD.length != 0) {
        //EPrograma
        materiasD.forEach((materiaD) => {
            query +=
                "DELETE FROM MPrograma WHERE (id_empleado = ? AND id_materia = ? AND id_generacion = ?);";
            queryData.push(
                id_empleado,
                materiaD.materiaCode,
                cicloE + materiaD.id_grupo
            );
        });
    }

    return { query: query, queryData: queryData };
}

//genera la query para modificar los datos del profesor
function QueryGeneratorModifyStudent(data) {
    let { boleta, id_usuario, nombre, app, apm, gruposA, gruposD, cicloE } =
        data;
    let query = "";
    let queryData = [];

    //CUsuario
    query += "UPDATE CUsuario SET ? WHERE (id_usuario = ?);";
    queryData.push({ nombre, app, apm }, id_usuario);

    //Nuevas inscripciones
    if (gruposA.length != 0) {
        //id_inscripcion
        gruposA.forEach((grupoA) => {
            grupoA.id_inscripcion = idGeneratorInscripcion(
                cicloE + grupoA.id_grupo,
                boleta
            );
        });

        //MInscripcion
        gruposA.forEach((grupoA) => {
            query += "INSERT INTO MInscripcion SET ?;";
            queryData.push({
                id_inscripcion: grupoA.id_inscripcion,
                boleta,
                id_generacion: cicloE + grupoA.id_grupo,
            });
        });
    }

    //Eliminar viejas inscripciones
    if (gruposD.length != 0) {
        //MInscripcion
        gruposD.forEach((grupoD) => {
            query +=
                "DELETE FROM MInscripcion WHERE (boleta = ? AND id_generacion = ?);";
            queryData.push(boleta, cicloE + grupoD.id_grupo);
        });
    }

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
                return;
            }
        });
    });
    if (materiasID.length == 0) {
        check = false;
    }
    return { check: check, materiasID: materiasID };
}

//revisa que los grupos sean correctos
async function checadorGrupos(grupos, cicloE) {
    try {
        let check = true;
        let tempGrupos = [];
        let readyGroups = await getUpGroupsFun(cicloE);
        let groups = [];

        if (readyGroups.length > 0 && grupos.length > 0) {
            readyGroups.forEach((item) => {
                tempGrupos.push(item.id_grupo);
            });

            grupos.forEach((grupo) => {
                if (!tempGrupos.includes(grupo.grupo)) {
                    check = false;
                    return;
                }
                groups.push({ id_grupo: grupo.grupo });
            });
            return { check: check, grupos: groups };
        } else {
            return { check: false };
        }
    } catch (ex) {
        console.log(ex);
        return { check: false };
    }
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

//Generador de ids para inscripciones
function idGeneratorInscripcion(id_generacion, boleta) {
    let id = id_generacion;

    id += boleta.slice(6, 10);

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

//Generador de ids para usuarios
function idGeneratorStandardAscendant(userType, lastID, upValue) {
    let id = userType;

    let lastNumber = parseInt(lastID.slice(2, 6));
    lastNumber += upValue;
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
