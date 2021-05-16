const router = require("express").Router();
const model = require('../models/homeTeacher.js');

router.post('/home/getGroups',model.getGroups);
router.post('/home/addToken',model.addToken);
router.post('/home/verifyToken', model.verifyToken);

module.exports = router;