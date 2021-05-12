const model = {};
const db = require("../database/connection");

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

module.exports = model;
