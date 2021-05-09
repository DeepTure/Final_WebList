const router = require("express").Router();
const model = require('../models/studentCrudModel.js');

router.post('/addStudent',model.addStudent);

module.exports = router;