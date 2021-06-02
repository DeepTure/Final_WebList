const router = require("express").Router();

const models = require("../models/sign");

const passport = require("passport");
const path = require("path");
const multer = require("multer");
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../temp/"));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    },
});
var upload = multer({ storage: storage });

router.post(
    "/genSign",
    async (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect("/");
    },
    models.GenSig
);

router.post("/verSign", upload.single("sign"), models.VerSign);

router.post(
    "/signLog",
    passport.authenticate("sign-auth", {
        failureRedirect: "/",
        failureFlash: true,
        badRequestMessage: "No ha introducido los datos correspondientes",
    }),
    (req, res) => {
        req.session.save((err) => {
            if (err) {
                return res.json(err);
            }
            res.redirect("/home");
        });
    }
);

module.exports = router;
