const model = {};
const passport = require("passport");
const fs = require("fs").promises;
const fsConstants = require("fs");
const path = require("path");
const db = require("../database/connection");
const { spawn } = require("child_process");

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

model.GenSig = async (req, res) => {
    try {
        let rol = req.user.rol;
        let id = req.user.id[1];
        let datos = await checkSign(rol, id);
        if (datos.length > 0) {
            let data = "";
            let id_llave = idGeneratorLlaves(datos[0].id_usuario);
            let fileNm =
                datos[0].ruta === null
                    ? id_llave
                    : datos[0].ruta.slice(
                          datos[0].ruta.length - 12,
                          datos[0].ruta.length - 4
                      );
            if (rol == "administrador") {
                data = `id: ${datos[0].id_administrador} name: ${datos[0].nombre} ${datos[0].app} ${datos[0].apm} correo: ${datos[0].email}`;
            } else if (rol == "profesor") {
                data = `id: ${datos[0].id_empleado} name: ${datos[0].nombre} ${datos[0].app} ${datos[0].apm} correo: ${datos[0].email}`;
            } else if (rol == "alumno") {
                data = `id: ${datos[0].boleta} name: ${datos[0].nombre} ${datos[0].app} ${datos[0].apm} correo: ${datos[0].email}`;
            }
            await fs.writeFile(
                path.join(__dirname, "../temp/" + fileNm + ".txt"),
                data
            );
            let child = spawn("java", [
                "-jar",
                path.join(__dirname, "../utils/GenSig.jar"),
                path.join(__dirname, "../temp/" + fileNm + ".txt"),
                path.join(__dirname, "../temp/" + fileNm),
            ]);

            child.on("error", async (error) => {
                console.log(error);
                await quitFileTxt(fileNm);
                return res.status(500).send(error);
            });

            child.on("close", async (code) => {
                console.log(code);
                await quitPubKey(rol, id);
                db.query(
                    "INSERT INTO ELlave SET ?",
                    [
                        {
                            id_llave: id_llave,
                            ruta: path.join(
                                __dirname,
                                "../temp/" + fileNm + ".key"
                            ),
                            id_usuario: datos[0].id_usuario,
                        },
                    ],
                    async (err) => {
                        if (err) {
                            console.log(err);
                            await quitFileTxt(fileNm);
                            return res.status(500).send(error);
                        }
                        let sign = await fs.readFile(
                            path.join(__dirname, "../temp/" + fileNm + ".dat")
                        );
                        await quitFileTxt(fileNm);
                        return res.json({
                            sign: sign.toJSON(),
                            usr: fileNm,
                        });
                    }
                );
            });
        } else {
            return res.status(500).send(new Error("No such user"));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

model.VerSign = async (req, res) => {
    try {
        let { user, rol } = req.body;
        let ruta = await getData(rol, user);
        console.log(ruta);
        if (ruta.length > 0) {
            let check = false;
            let child = spawn("java", [
                "-jar",
                path.join(__dirname, "../utils/VerSig.jar"),
                ruta[0].ruta,
                path.join(__dirname, "../temp/" + user + ".dat"),
            ]);

            child.stdout.on("data", (data) => {
                console.log(data);
                if (`${data}`.startsWith("true")) {
                    check = true;
                }
            });

            child.stderr.on("data", (data) => {
                console.log(data);
            });

            child.on("error", async (error) => {
                console.log(error);
                await quitFileDat(user);
                return res.send(error);
            });

            child.on("close", async (code) => {
                console.log(code, check);
                if (check == true) {
                    await quitFileDat(user);
                    let query = "";
                    if (rol == "Profesor") {
                        query =
                            "SELECT id_empleado AS id,contrasena AS pid FROM EProfesor INNER JOIN CUsuario USING (id_usuario) WHERE (id_empleado=?)";
                    } else if (rol == "Administrador") {
                        query =
                            "SELECT id_administrador AS id,contrasena AS pid FROM EAdministrador INNER JOIN CUsuario USING (id_usuario) WHERE (id_administrador=?)";
                    } else if (rol == "Alumno") {
                        query =
                            "SELECT boleta AS id,contrasena AS pid FROM EAlumno INNER JOIN CUsuario USING (id_usuario) WHERE (boleta=?)";
                    }
                    db.query(query, [user], (err, data) => {
                        if (err) {
                            console.log(err);
                            return res.json({ check: false });
                        }
                        return res.json({
                            rol: rol,
                            data: data[0],
                            check: true,
                        });
                    });
                } else {
                    await quitFileDat(user);
                    return res.json({ check: false });
                }
            });
        } else {
            return res.json({ check: false });
        }
    } catch (err) {
        console.log(err);
        return res.json({
            data: false,
        });
    }
};

async function quitFileTxt(usr) {
    fsConstants.access(
        path.join(__dirname, "../temp/" + usr + ".txt"),
        fsConstants.constants.F_OK,
        async (err) => {
            if (!err) {
                await fs.unlink(
                    path.join(__dirname, "../temp/" + usr + ".txt")
                );
            }
        }
    );
}

async function quitFileDat(usr) {
    fsConstants.access(
        path.join(__dirname, "../temp/" + usr + ".dat"),
        fsConstants.constants.F_OK,
        async (err) => {
            if (!err) {
                await fs.unlink(
                    path.join(__dirname, "../temp/" + usr + ".dat")
                );
            }
        }
    );
}

//promesa para eliminar la vieja llave del usuario
function quitPubKey(rol, user) {
    return new Promise((resolve, reject) => {
        if (rol == "administrador") {
            db.query(
                "DELETE ELlave FROM ELlave INNER JOIN EAdministrador using (id_usuario) WHERE (id_administrador = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else if (rol == "profesor") {
            db.query(
                "DELETE ELlave FROM ELlave INNER JOIN EProfesor using (id_usuario) WHERE (id_empleado = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else if (rol == "alumno") {
            db.query(
                "DELETE ELlave FROM ELlave INNER JOIN EAlumno using (id_usuario) WHERE (boleta = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else {
            resolve([]);
        }
    });
}

//promesa para traer las llaves publicas
function checkSign(rol, user) {
    return new Promise((resolve, reject) => {
        if (rol == "administrador") {
            db.query(
                "SELECT ruta, id_usuario, id_administrador, nombre, app, apm, email FROM CUsuario LEFT JOIN ELlave using (id_usuario) INNER JOIN EAdministrador using (id_usuario) WHERE (id_administrador = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else if (rol == "profesor") {
            db.query(
                "SELECT ruta, id_usuario, id_empleado, nombre, app, apm, email FROM CUsuario LEFT JOIN ELlave using (id_usuario) INNER JOIN EProfesor using (id_usuario) WHERE (id_empleado = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else if (rol == "alumno") {
            db.query(
                "SELECT ruta, id_usuario, boleta, nombre, app, apm, email FROM CUsuario LEFT JOIN ELlave using (id_usuario) INNER JOIN EAlumno using (id_usuario) WHERE (boleta = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else {
            resolve([]);
        }
    });
}

//promesa para traer datos para la firma
function getData(rol, user) {
    return new Promise((resolve, reject) => {
        if (rol == "Administrador") {
            db.query(
                "SELECT ruta FROM ELlave INNER JOIN CUsuario using (id_usuario) INNER JOIN EAdministrador using (id_usuario) WHERE (id_administrador = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else if (rol == "Profesor") {
            db.query(
                "SELECT ruta FROM ELlave INNER JOIN CUsuario using (id_usuario) INNER JOIN EProfesor using (id_usuario) WHERE (id_empleado = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else if (rol == "Alumno") {
            db.query(
                "SELECT ruta FROM ELlave INNER JOIN CUsuario using (id_usuario) INNER JOIN EAlumno using (id_usuario) WHERE (boleta = ?)",
                [user],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        } else {
            resolve([]);
        }
    });
}

//Generador de ids para llaves
function idGeneratorLlaves(id_usuario) {
    let id = id_usuario;

    id +=
        wordsForUse[Math.floor(Math.random() * wordsForUse.length - 1 + 1)] +
        wordsForUse[Math.floor(Math.random() * wordsForUse.length - 1 + 1)];

    return id;
}

module.exports = model;
