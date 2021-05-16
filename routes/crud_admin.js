const router = require("express").Router();

const model = require("../models/crudUsers");
const models = require("../models/crudUsers");

router.get(
    "/home/modify",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect("/");
    },
    (req, res) => {
        return res.render("modify");
    }
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
    "/getProfesor",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send("ERROR");
    },
    models.getProfesor
);

router.post(
    "/getGroups",
    (req, res, next) => {
        if (req.isAuthenticated() && req.user.rol == "administrador")
            return next();
        res.send("ERROR");
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
        res.send("ERROR");
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

module.exports = router;
