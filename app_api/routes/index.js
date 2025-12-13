// app_api/routes/index.js
const express = require('express');
const router = express.Router();

// mount the trips routes under /trips
router.use('/trips', require('./trips'));

// unknown API route (keeps responses clean)
router.use((req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.path });
});

module.exports = router;
