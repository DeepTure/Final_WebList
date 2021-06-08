const router = require("express").Router();
const model = require("../models/helpActionsModel");

//Redireccionamiento al perfil
router.get(
    "/home/help",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        return res.redirect("/");
    },
    (req, res) => {
        let rol = req.user.rol;
        let direccion = "/home";
        return res.render("help", { direccion, rol });
    }
);

router.get(
    "/home/historial/help",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        return res.redirect("/");
    },
    (req, res) => {
        let direccion = "/home/historial";
        let rol = req.user.rol;
        return res.render("help", { direccion, rol });
    }
);

router.get(
    "/home/modify/help",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        return res.redirect("/");
    },
    (req, res) => {
        let direccion = "/home";
        let rol = req.user.rol;
        return res.render("help", { direccion, rol });
    }
);

router.get("/help", (req, res) => {
    let direccion = "/";
    let rol = "";
    return res.render("help", { direccion, rol });
});

//Renderizado de preguntas de help inicial
router.get("/ingresar", (req, res) => {
    return res.render("helps/ingreso");
});

router.get("/consultar", (req, res) => {
    return res.render("helps/soporte");
});

router.get("/recupero", (req, res) => {
    return res.render("helps/recuperar");
});

//Renderizado de preguntas de help con cuenta iniciada para todo los roles
router.get("/contrasena", (req, res) => {
    return res.render("helps/cambio_contraseña");
});

router.get("/correo", (req, res) => {
    return res.render("helps/cambio_correo");
});

//Renderizado de preguntas help de administrador
router.get("/registroalumn", (req, res) => {
    return res.render("helps/registro_alumno");
});

router.get("/registroprof", (req, res) => {
    return res.render("helps/registro_profesor");
});

router.get("/altagrupo", (req, res) => {
    return res.render("helps/alta_grupo");
});

router.get("/consultarinaadmin", (req, res) => {
    return res.render("helps/consultar_inasistencia_admin");
});

//Renderizado de preguntas help de profesor
router.get("/proccesoasis", (req, res) => {
    return res.render("helps/proceso_asistencia");
});

router.get("/consultarinaprof", (req, res) => {
    return res.render("helps/consultar_inasistencia_profesor");
});

//Renderizado de preguntas help de alumno
router.get("/registrarasis", (req, res) => {
    return res.render("helps/registrar_asistencia");
});

router.get("/funciograficas", (req, res) => {
    return res.render("helps/funcionamiento_grafica");
});

router.get("/bot", (req, res) => {
    return res.render("helps/bot");
});

//Enviar email a soporte técnico
router.post("/help/sendEmail", model.sendEmail);

module.exports = router;
