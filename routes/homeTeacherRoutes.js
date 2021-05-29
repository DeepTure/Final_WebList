const router = require("express").Router();
const model = require('../models/homeTeacher.js');

router.post('/home/getGroups',model.getGroups);
router.post('/home/addToken',model.addToken);
router.post('/home/verifyToken', model.verifyToken);
router.post('/home/profesor/asistencia/reject',model.reject);
router.post('/home/profesor/asistencia/accept',model.accept);
router.post('/home/profesor/asistencia/acceptAll',model.acceptAll);

module.exports = router;