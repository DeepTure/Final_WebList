const router = require("express").Router();

const models = require("../models/crudUsers");

router.post(
    "/addProfesor",
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send("ERROR");
    },
    models.addProfesor
);

router.post(
    "/addStudent",
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send("ERROR");
    },
    models.addStudent
);

router.post(
    "/getProfesor",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send(null);
    },
    models.getProfesor
);

router.post(
    "/getStudent",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send(null);
    },
    models.getStudents
);

router.post(
    "/getGroups",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send(null);
    },
    models.getGroups
);

router.post(
    "/upGroup",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send("ERROR");
    },
    models.upGroup
);

router.post(
    "/getUpGroups",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send(null);
    },
    models.getUpGroups
);

router.post(
    "/deleteProfessorById",
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send("ERROR");
    },
    models.deleteProfessorById
);

router.post(
    "/deleteStudentById",
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send("ERROR");
    },
    models.deleteStudentById
);

router.post(
    "/homeModify",
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.redirect("/");
    },
    models.goToModify
);

router.post(
    "/modifyProfesor",
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.redirect("/");
    },
    models.modifyProfesor
);

router.post(
    "/modifyStudent",
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.redirect("/");
    },
    models.modifyStudent
);

module.exports = router;
