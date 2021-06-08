const router = require("express").Router();
const model = require("../models/studentCrudModel.js");

router.post(
    "/getStudets",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "alumno") return next();
        return res.status(404).send("ERROR");
    },
    model.getStudets
);
router.post(
    "/home/student/getGroups",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "alumno") return next();
        return res.status(404).send("ERROR");
    },
    model.getGroups
);
router.post(
    "/home/student/verifyCode",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "alumno") return next();
        return res.status(404).send("ERROR");
    },
    model.verifyCode
);
router.post(
    "/home/student/sendWaiting",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "alumno") return next();
        return res.status(404).send("ERROR");
    },
    model.sendWaiting
);
router.post(
    "/home/student/verifyCodeSent",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "alumno") return next();
        return res.status(404).send("ERROR");
    },
    model.verifyCodeSent
);
router.post(
    "/home/student/assistence/delete",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "alumno") return next();
        return res.status(404).send("ERROR");
    },
    model.deleteAssistence
);

module.exports = router;
