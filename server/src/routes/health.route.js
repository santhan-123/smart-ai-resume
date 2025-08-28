const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({  message: 'Ok', uptime: process.uptime() });
});

module.exports = router;