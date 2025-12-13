// app_api/routes/trips.js
const express = require('express');
const router = express.Router();
const trips = require('../controllers/trips.controller');
const requireAuth = require('../middleware/requireAuth');

// ---- Public routes ----
router.get('/', trips.tripsList);              // GET /api/trips
router.get('/:tripCode', trips.tripsReadOne);  // GET /api/trips/:tripCode

// ---- Protected routes (require JWT) ----
router.post('/', requireAuth, trips.tripsCreate);             // POST /api/trips
router.put('/:tripCode', requireAuth, trips.tripsUpdateOne);  // PUT /api/trips/:tripCode
router.delete('/:tripCode', requireAuth, trips.tripsDeleteOne); // DELETE /api/trips/:tripCode

module.exports = router;
