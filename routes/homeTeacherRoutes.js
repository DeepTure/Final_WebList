const router = require("express").Router();
const model = require("../models/homeTeacher.js");

router.post(
    "/home/getGroups",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.getGroups
);
router.post(
    "/home/addToken",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.addToken
);
router.post(
    "/home/verifyToken",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.verifyToken
);
router.post(
    "/home/profesor/asistencia/reject",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.reject
);
router.post(
    "/home/profesor/asistencia/accept",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.accept
);
router.post(
    "/home/profesor/asistencia/acceptAll",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.acceptAll
);
router.post(
    "/home/profesor/token/delete",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.deleteToken
);
router.post(
    "/home/profesor/asistencia/rejectAll",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.rejectAll
);
router.post(
    "/home/profesor/asistencia/studentsWaiting",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.studentsWaiting
);

router.post(
    "/home/profesor/asistencia/deleteAttendance",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "profesor") return next();
        return res.status(404).send("ERROR");
    },
    model.deleteAttendance
);

module.exports = router;
