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
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.send("ERROR");
    },
    models.addProfesor
);

router.post(
    "/getProfesor",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.send("ERROR");
    },
    models.getProfesor
);

module.exports = router;
