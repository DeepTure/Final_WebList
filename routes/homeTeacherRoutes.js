const router = require("express").Router();
const model = require('../models/homeTeacher.js');

router.post('/home/getGroups',model.getGroups);
router.post('/home/getSubjects',model.getSubjects);

module.exports = router;