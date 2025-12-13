// app_server/routes/travelers.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/travelerController');

router.get('/', ctrl.listTrips);
router.get('/:code', ctrl.tripDetail);

module.exports = router;
