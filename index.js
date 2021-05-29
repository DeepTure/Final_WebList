//constante para generar la aplicacion
const express = require("express");
const app = express();

//para poder utilizar rutas de archivos en cualquier sistema
const path = require("path");

//middelware para obtener logs detallados
const morgan = require("morgan");

//middelware para obtener los datos de los forms
const Parser = require("body-parser").urlencoded({ extended: false });

//cosas del passport
const db = require("./database/connection");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Passportlocal = require("passport-local").Strategy;
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");

//routers
const main = require("./routes/main");
const login = require("./routes/logic.login");
const perfil = require("./routes/profile");
const historial = require("./routes/history");
const recuperar = require("./routes/recover");
const studentCrud = require("./routes/studentCrudRoutes");
const help = require("./routes/help");
const crud_admin = require("./routes/crud_admin");
const homeTeacher = require('./routes/homeTeacherRoutes');
const verifyCodeStudent = require('./models/verifyCodeStudentModel');
const validacion = require('./models/validacion');
//variables

/*
el process.env.PORT se usa para obtener el puerto por defecto
de nuestro servicio de hosting o en su defecto usar el puerto 8080
*/
app.set("host", process.env.PORT || 3000);
//para poder utilizar el render con ejs
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
//para utilizar solo el nombre del html y no toda direccion
app.set("views", path.join(__dirname, "views"));

//middlewares
app.use(morgan("dev"));
app.use(cookieParser("6$uRCRC1UAKyBCbCYb7%^90!NHwd9@OJWBHOe7AqyBB9zj^OZN"));
app.use(
    session({
        secret: "6$uRCRC1UAKyBCbCYb7%^90!NHwd9@OJWBHOe7AqyBB9zj^OZN",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());

//passport local
passport.use(
    "local",
    new Passportlocal(
        {
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true,
        },
        (req, username, password, done) => {
            console.log(req.body);

            if(username.length != 0 && password.length != 0){
                if (validacion.idrol(username)) {
                    
                
                    const crypto = require("crypto");
                    const hash = crypto.createHash("sha256");
                    hash.update(password);
                    var asegurado = hash.digest("hex");
                    //Depende del tipo de usuario busca dentro de la tabla usuario correspondiente su id y de la tabla master usuarios para ubicar su contraseña para así poder dar el login
                    //Una vez encontrado se guardan los ids para uso próximo por todo el sistema
                    if (req.body.rol == "Administrador") {
                        db.query(
                            "select * from EAdministrador admin JOIN CUsuario user on admin.id_usuario = user.id_usuario where  (admin.id_administrador = ? and user.contrasena = ?);",
                            [username, asegurado],
                            (err, administrador) => {
                                if (err) {
                                    console.log(err);
                                    return done(null, false, {
                                        message: "Hubo un fallo en el proceso",
                                    });
                                }
                                var ids = [
                                    administrador[0].id_usuario,
                                    administrador[0].id_administrador,
                                ];
                                if (administrador.length > 0) {
                                    return done(null, {
                                        rol: "administrador",
                                        id: ids,
                                    });
                                } else {
                                    return done(null, false, {
                                        message:
                                            "Usuario y/o contraseña incorrectos, Intentelo nuevamente",
                                    });
                                }
                            }
                        );
                    } else if (req.body.rol == "Profesor") {
                        db.query(
                            "select * from EProfesor profe JOIN CUsuario user on profe.id_usuario = user.id_usuario where  (profe.id_empleado = ? and user.contrasena = ?);",
                            [username, asegurado],
                            (err, profesor) => {
                                if (err) {
                                    console.log(err);
                                    return done(null, false, {
                                        message: "Hubo un fallo en el proceso",
                                    });
                                }
                                if (profesor.length > 0) {
                                    var ids = [
                                        profesor[0].id_usuario,
                                        profesor[0].id_empleado,
                                    ];
                                    return done(null, {
                                        rol: "profesor",
                                        id: ids,
                                    });
                                } else {
                                    return done(null, false, {
                                        message:
                                            "Usuario y/o contraseña incorrectos, Intentelo nuevamente",
                                    });
                                }
                            }
                        );
                    } else if (req.body.rol == "Alumno") {
                        db.query(
                            "select * from EAlumno alumn JOIN CUsuario user on alumn.id_usuario = user.id_usuario where  (alumn.boleta = ? and user.contrasena = ?);",
                            [username, asegurado],
                            (err, alumno) => {
                                if (err) {
                                    console.log(err);
                                    return done(null, false, {
                                        message: "Hubo un fallo en el proceso",
                                    });
                                }
                                if (alumno.length > 0) {
                                    var ids = [alumno[0].id_usuario, alumno[0].boleta];
                                    return done(null, {
                                        rol: "alumno",
                                        id: ids,
                                    });
                                } else {
                                    return done(null, false, {
                                        message:
                                            "Usuario y/o contraseña incorrectos, Intentelo nuevamente",
                                    });
                                }
                            }
                        );
                    } else {
                        return done(null, false, {
                            message: "Debe de seleccionar un usuario",
                        });
                    }
                }else{
                    return done(null, false, {
                        message: "El id no tiene un formato correcto",
                    });
                }
            }else{
                return done(null, false,{
                    message:"Debe de introducir datos",
                });
            }
        }
    )
);

passport.use(
    "recover-count",
    new Passportlocal(
        {
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true,
        },
        (req,username,password, done) =>{
            console.log(req.body);
            let token = 0;
            try{
                db.query(
                    "SELECT id_token FROM EToken WHERE id_usuario = ?",
                    [username],
                    (err, tokenDb) => {
                        if (err) return done(null, false, {message: "Hubo un fallo en el proceso",});
                        //verificamos si tiene un token activo
                        if (tokenDb.length != 0) {
                            token = tokenDb[0].id_token;
                            console.log(token);
                            //compriobamos que sea el token
                            jwt.verify(token, password, (err, userData) => {
                                if (err) {
                                    console.log(err)
                                    return done(null, false, {
                                        message: "Hubo un fallo en el proceso",
                                    });
                                } else {
                                    //si entra es porque el codigo es correcto*/
                                    db.query(
                                        "DELETE FROM EToken WHERE id_usuario=?",
                                        [username],
                                        (err, response) => {
                                            console.log("Token eliminado")
                                            if (err) return res.json(err);
                                            //Busqueda del id del rol de usuario
                                            if (req.body.rolsave == "Alumno") {
                                                db.query("select * from EAlumno alumn JOIN CUsuario user on alumn.id_usuario = user.id_usuario where  (alumn.id_usuario = ?);",
                                                [username],
                                                (err,alumno) => {
                                                    ids=[username,alumno[0].boleta]
                                                    return done(null, {
                                                        rol: "alumno",
                                                        id: ids
                                                    });
                                                });
                                            } else if(req.body.rolsave == "Profesor") {
                                                db.query("select * from EProfesor profe JOIN CUsuario user on profe.id_usuario = user.id_usuario where  (profe.id_usuario = ?);",
                                                [username],
                                                (err,profesor) =>{
                                                    ids=[username,profesor[0].id_empleado]
                                                    return done(null,{
                                                        rol:"profesor",
                                                        id: ids
                                                    });
                                                });
                                            } else if(req.body.rolsave == "Administrador"){
                                                db.query("select * from EAdministrador admin JOIN CUsuario user on admin.id_usuario = user.id_usuario where  (admin.id_usuario = ?);",
                                                [username],
                                                (err, administrador) =>{
                                                    ids=[username,administrador[0].id_administrador]
                                                    return done(null,{
                                                        rol: "administrador",
                                                        id: ids
                                                    });
                                                })
                                            }else{
                                                return done(null, false, {
                                                    message: "No hay rol guardado",
                                                });
                                            }
                                            
                                        }
                                    );
                                }
                            });
                        } else {
                            //por ningun motivo debería llegar a esta condición
                            return done(null, false, {
                                message: "Token no encontrado",
                            });
                        }
                    }
                );
            }catch(ex){
                console.log(ex)
                return done(null, false, {
                    message: "Hubo un fallo en el proceso",
                });
            }
        }
    )
);

passport.use(
    "sign-auth",
    new Passportlocal(
        {
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true,
        },
        (req, username, password, done) => {
            try {
                let query = "";
                if (req.body.usrRol == "profesor") {
                    query =
                        "select numEmpleado AS id from profesor where (numEmpleado= ? AND contraseña= ?)";
                } else if (req.body.usrRol == "administrador") {
                    query =
                        "select idAdmin AS id from administrador where (idAdmin= ? AND contraseña= ?)";
                } else if (req.body.usrRol == "alumno") {
                    query =
                        "select boleta AS id from alumno where (boleta= ? AND contraseña= ?)";
                }
                db.query(query, [username, password], (err, rows) => {
                    if (err) {
                        console.log(err);
                        return done(null, false, {
                            message: "Hubo un fallo en el proceso",
                        });
                    }
                    if (rows.length > 0) {
                        return done(null, {
                            rol: req.body.usrRol,
                            id: rows[0].id.toString(),
                        });
                    } else {
                        return done(null, {
                            rol: req.body.usrRol,
                            id: username,
                        });
                    }
                });
            } catch (ex) {
                console.log(ex);
                return done(null, false, {
                    message: "Hubo un fallo en el proceso",
                });
            }
        }
    )
);

passport.serializeUser(function (user, done) {
    done(null, [user.rol, user.id]);
});

passport.deserializeUser(function (user, done) {
    done(null, {
        rol: user[0],
        id: user[1],
    });
});

//para acceder a archivos estaticos
app.use("/public", express.static("public"));
app.use("/home/public", express.static("public"));
//usamos el body parser
app.use(Parser);

//rutas
app.use(main);
app.use(login);
app.use(perfil);
app.use(historial);
app.use(recuperar);
app.use(crud_admin);
app.use(help);
app.use(studentCrud);
app.use(homeTeacher);

//rutas de emergencia cuando ocurre
app.use((req, res) => {
    res.status(404);
    //se necesita crear la pagina
    res.render("error", {
        error: 404,
        message: "No hemos podido encontrar su pagina",
    });
});

app.use((req, res) => {
    /*la petición es correcta pero el servidor se niega a ofrecerte el recurso o página web. Es posible que necesites una cuenta en el servicio e iniciar sesión 
    antes de poder acceder.*/
    res.status(403);
    res.render("error", { error: 403, message: "Ha Ocurrido un error" });
});

app.use((req, res) => {
    //no se permite el uso de ese método.
    res.status(405);
    res.render("error", {
        error: 405,
        message: "Ha ocurrido un error de negación",
    });
});

app.use((req, res) => {
    //el servidor aun no ha implementado el método que se ha pedido, aunque es probable que se añada en un futuro.
    res.status(501);
    res.render("error", { error: 501, message: "Ha ocurrido un error" });
});

app.use((error, req, res, next) => {
    res.status(500);
    //se necesita crear la pagina
    res.render("error", { error: 500, message: error });
});

//montando el servidor

const server = app.listen(app.get("host"), (req, res) => {
    console.log("Servidor en puerto: " + app.get("host"));
});

/**
 * Esta parte del index corresponde a los sockets utilizados para comunicar las interfaces
 * profesor-servidor-alumno
 */

 const SocketIO = require('socket.io');
 const io = SocketIO(server);

io.on('connection', (socket)=>{
    console.log('new connection ',socket.id);
    
    //La verificacion del codigo se va a llevar a cabo mediante ajax y segun la respiuesta ya lo mandamos con socket
    socket.on('assistences:send',(data)=>{
        console.log('Servidor recive asistencia');
        console.log(data);
        io.sockets.in(data.room).emit('assistence:recive',data);
    });

    socket.on('assistence:time',(room)=>{
        io.sockets.in(room).emit('assistence:getTime',room);
    });

    /**
     * Comenzamos con la programacion de peticiones que provienen del profesor
     */
    socket.on('room:join',(room)=>{
        socket.join(room.room);
        console.log('new room ',room.room);
    });

    //recive la sala y el tiempo
    socket.on('assistence:setTime',(data)=>{
        io.sockets.in(data.room).emit('assistence:student:tokenTime',data.tokenTime);
    });

    socket.on('assistence:teacher:reject',(data)=>{
        io.sockets.in(data.room).emit('assistence:student:reject',data);
    });

    socket.on('assistence:teacher:accept',(data)=>{
        io.sockets.in(data.room).emit('assistence:student:accept',data);
    });

    socket.on('assistence:teacher:acceptAll',(data)=>{
        io.sockets.in(data.room).emit('assistence:student:acceptAll',data);
    });
});
