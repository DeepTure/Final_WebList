const router = require("express").Router();
const model = require('../models/studentCrudModel.js');

router.post('/addStudent',model.addStudent);
router.post('/getStudets',model.getStudets);
router.post('/home/student/getGroups', model.getGroups);
router.post('/home/student/verifyCode', model.verifyCode);
router.post('/home/student/sendWaiting',model.sendWaiting);
router.post('/home/student/verifyCodeSent', model.verifyCodeSent);

module.exports = router;