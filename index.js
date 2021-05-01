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

//routers
const main = require("./routes/main");
const login = require("./routes/logic.login");
const perfil = require("./routes/profile");
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
            const crypto = require("crypto");
            const hash = crypto.createHash("sha256");
            hash.update(password);
            var asegurado = hash.digest("hex");
            //Depende del tipo de usuario busca dentro de la tabla usuario correspondiente su id y de la tabla master usuarios para ubicar su contraseña para así poder dar el login
            //Una vez encontrado se guardan los ids para uso próximo por todo el sistema
            if (req.body.rol == "Administrador"){
                db.query("select * from EAdministrador admin JOIN CUsuario user on admin.idMUsuario = user.idMUsuario where  (admin.id_administrador = ? and user.contrasena = ?);"
                ,[username,asegurado]
                ,(err,administrador) =>{
                    if(err){
                        console.log(err);
                        return done(null,false,{
                            message:
                                "Hubo un fallo en el proceso"
                        });
                    }
                    var ids=[administrador[0].idMUsuario, administrador[0].id_administrador];
                    if (administrador.length > 0){
                        return done(null, {
                            rol: "administrador",
                            id: ids,
                        });
                    }else{
                        return done(null, false, {
                            message:
                                "Usuario y/o contraseña incorrectos, Intentelo nuevamente",
                        });
                    }
                });
            }else if(req.body.rol == "Profesor"){
                db.query("select * from EProfesor profe JOIN CUsuario user on profe.idMUsuarios = user.idMUsuario where  (profe.id_empleado = ? and user.contrasena = ?);"
                ,[username,asegurado]
                ,(err,profesor) =>{
                    if(err){
                        console.log(err);
                        return done(null,false,{
                            message:
                                "Hubo un fallo en el proceso"
                        });
                    }
                    if (profesor.length > 0){
                        var ids=[profesor[0].idMUsuario, profesor[0].id_empleado];
                        return done(null, {
                            rol: "profesor",
                            id: ids,
                        });
                    }else{
                        return done(null, false, {
                            message:
                                "Usuario y/o contraseña incorrectos, Intentelo nuevamente",
                        });
                    }
                });
            }else if(req.body.rol == "Alumno"){
                db.query("select * from EAlumno alumn JOIN CUsuario user on alumn.idMUsuario = user.idMUsuario where  (alumn.Boleta = ? and user.contrasena = ?);"
                ,[username,asegurado]
                ,(err,alumno) =>{
                    if(err){
                        console.log(err);
                        return done(null,false,{
                            message:
                                "Hubo un fallo en el proceso"
                        });
                    }
                    if (alumno.length > 0){
                        var ids=[alumno[0].idMUsuario, alumno[0].Boleta];
                        return done(null, {
                            rol: "alumno",
                            id: ids,
                        });
                    }else{
                        return done(null, false, {
                            message:
                                "Usuario y/o contraseña incorrectos, Intentelo nuevamente",
                        });
                    }
                });
            }else{
                return done(null, false,{
                    message:
                        "Debe de seleccionar un usuario"
                })
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
//usamos el body parser
app.use(Parser);

//rutas
app.use(main);
app.use(login);
app.use(perfil);


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

app.listen(app.get("host"), (req, res) => {
    console.log("Servidor en puerto: " + app.get("host"));
});