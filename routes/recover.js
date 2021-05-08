const router = require("express").Router();
//const db = require("../database/connection");
const crypto = require("crypto");

const model = require('../models/recovery.js');

//Rutas
router.get('/recovery',model.recovery);

module.exports = router;