const mysql = require("mysql");

//se le da paramentros a la conexion
const mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "3h)VJ>.>!x(63BkwVc",
    database: "weblistv2",
    multipleStatements: true,
});

//se inicia la conexion
mysqlConnection.connect((err) => {
    //revisa si no ocurrio algun error
    if (err) {
        console.log("BD: conexión fallida: " + err);
    } else {
        console.log("BD: conexión exitosa");
    }
});

module.exports = mysqlConnection; 
