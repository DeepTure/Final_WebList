const router = require("express").Router();

const models = require("../models/crudUsers");

const multer = require("multer");
const path = require("path");
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../temp/"));
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id[1]}-${Date.now()}-${file.originalname}`);
    },
});
var upload = multer({ storage: storage });

router.post(
    "/addUsersByCSV",
    upload.single("table"),
    async (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        return res.status(404).send("ERROR");
    },
    models.addUsersByCSV
);

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
    "/getAbsences",
    (req, res, next) => {
        if (
            req.isAuthenticated() &&
            (req.user.rol == "administrador" || req.user.rol == "profesor")
        )
            return next();
        res.send(null);
    },
    models.getAbsences
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
    "/getAllRegGroups",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send(null);
    },
    models.getAllRegGroups
);

router.post(
    "/getProfessorRegGroups",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        res.send(null);
    },
    models.getProfessorRegGroups
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
