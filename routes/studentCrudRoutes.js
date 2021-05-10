const router = require("express").Router();
const model = require('../models/studentCrudModel.js');

router.post('/addStudent',model.addStudent);
router.post('/getStudets',model.getStudets);

module.exports = router;