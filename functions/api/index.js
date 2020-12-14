const express = require('express');

const emojis = require('./emojis');

const example = require('./example');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/emojis', emojis);
router.use('/example', example);

module.exports = router;
