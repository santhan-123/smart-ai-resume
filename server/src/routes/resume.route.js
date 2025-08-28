const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller')

router.post('/', resumeController.handleMessage); // chat / generate endpoint

module.exports = router;