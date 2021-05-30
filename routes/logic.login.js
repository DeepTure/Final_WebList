const router = require("express").Router();
const passport = require("passport");
const db = require("../database/connection");

//Preparado para redireccionar a las vistas correspondientes dependiendo el rol
router.post(
    "/InicioSesionController",
    passport.authenticate("local", {
        failureRedirect: "/",
        failureFlash: true,
        badRequestMessage: "No ha introducido los datos correspondientes",
    }),
    function (req, res) {
        req.session.save((err) => {
            if (err) {
                return res.json(err);
            }
            res.redirect("/home");
        });
    }
);

router.get("/logout", (req, res) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return res.json(err);
        }
        return res.redirect("/");
    });
});

router.get(
    "/home",
    (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect("/");
    },
    (req, res) => {
        let rol = req.user.rol;
        let id = req.user.id[1];
        console.log(req.user);
        res.render("home", { rol, id });
    }
);

router.get("/", (req, res) => {
    let { error } = req.flash();
    return res.render("login", {
        err: error === undefined ? "" : error,
    });
});

module.exports = router;
