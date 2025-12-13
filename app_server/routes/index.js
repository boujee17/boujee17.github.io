// app_server/routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Travlr',
    message: 'Welcome to Travlr! (MVC + HBS)'
  });
});

module.exports = router;
