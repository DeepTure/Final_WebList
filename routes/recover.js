const router = require("express").Router();
//const db = require("../database/connection");
const crypto = require("crypto");

const model = require('../models/recovery.js');

//Rutas
router.get('/recovery',model.recovery);
router.post('/recovery/comprobateEmail',model.comprobateEmail);
router.post('/recovery/comprobateEmail/sendEmail',model.sendEmail);
router.post(
    '/recovery/comprobateCode', 
    passport.authenticate("recover-count", {
        failureRedirect: "/recovery",
        failureFlash: true,
        badRequestMessage:'No ha introducido los datos correspondientes'
    }),
    function (req, res) {
        req.session.save((err) => {
            if (err) {
                return res.json(err);
            }
            res.redirect('/home/perfil');
        });
    }
);
module.exports = router;