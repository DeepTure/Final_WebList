const router = require("express").Router();
const db = require("../database/connection");
const crypto = require("crypto");

//Redireccionamiento al perfil
router.get("/recovery", (req, res) => {
    return res.render("recover");
});

module.exports = router;