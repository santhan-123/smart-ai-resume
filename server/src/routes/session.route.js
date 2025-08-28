const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

router.post('/', sessionController.createSession);

module.exports = router;