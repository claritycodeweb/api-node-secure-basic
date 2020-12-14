const express = require('express');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const fs = require('fs');
const path = require('path');

const rataLimiter = rateLimit({
  windowMs: 30 * 1000, // 30sec,
  max: 10// limit each ip to 10 request per window
});

const speedLimiter = slowDown({
  windowMs: 30 * 1000, // 30 sec
  delayAfter: 10, // allow 1 requests per 30 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 10:
  // request # 11 is delayed by  500ms
  // request # 12 is delayed by 1000ms
  // request # 13 is delayed by 1500ms
  // etc.
});

const apiKeys = new Map();
apiKeys.set('12345', true);

const apiKeyLimiter = (req, res, next) => {
  const apiKey = req.get('X-API-KEY');

  if (apiKeys.has(apiKey)) {
    next();
  } else {
    const error = new Error('Invalid API key');
    res.statusCode = 403;
    next(error);
  }
};

const router = express.Router();

let inMemoryCachedData;
let inMemoryCachedTime;

// 1. check api key send by X-API-KEY header
// 3. limit each IP to 10 requests per every 30 sec
// 3. allow 10 requests per 30 minutes, theen begin adding 500ms per request above 10
// 4. get data form cache if previous request occure less than 30s ago
router.get('/', apiKeyLimiter, rataLimiter, speedLimiter, async (req, res, next) => {
  if (inMemoryCachedData && inMemoryCachedTime > Date.now() - 30 * 1000) {
    return res.json({ data: inMemoryCachedData, cachedTime: inMemoryCachedTime });
  }

  try {
    fs.readFile(`${path.join(__dirname, '../data')}/users.json`, 'utf8', (err, text) => {
      if (err) {
        next(err);
        return;
      }

      const { data } = JSON.parse(text);
      inMemoryCachedData = data;
      inMemoryCachedTime = Date.now();

      res.send({ data, cachedTime: inMemoryCachedTime });
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
