const router = require("express").Router();
//const db = require("../database/connection");
const crypto = require("crypto");

const model = require('../models/recovery.js');

//Rutas
router.get('/recovery',model.recovery);
router.post('/recovery/comprobateEmail',model.comprobateEmail);
router.post('/recovery/comprobateEmail/sendEmail',model.sendEmail);

module.exports = router;