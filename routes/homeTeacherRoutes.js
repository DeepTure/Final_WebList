const router = require("express").Router();
const model = require('../models/homeTeacher.js');

router.post('/home/getGroups',model.getGroups);

module.exports = router;