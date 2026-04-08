'use strict';

/**
 * Yi Jing (易经) Oracle API endpoint.
 *
 * GET  /api/v1/yijing/cast   — Cast a random hexagram
 * GET  /api/v1/yijing/:number — Look up a specific hexagram by number (1–64)
 */

const express = require('express');
const { castHexagram, getHexagramByNumber } = require('../utils/yijing');

const router = express.Router();

router.get('/cast', (_req, res) => {
  const { hexagram, lines, hasChangingLines } = castHexagram();
  return res.json({
    hexagram,
    lines,
    hasChangingLines,
    meta: {
      platform: 'TianJi Global | 天机全球',
      version: '1.0.0',
    },
  });
});

router.get('/:number', (req, res) => {
  const number = parseInt(req.params.number, 10);
  if (isNaN(number) || number < 1 || number > 64) {
    return res.status(400).json({ error: 'Hexagram number must be between 1 and 64.' });
  }

  const hexagram = getHexagramByNumber(number);
  if (!hexagram) {
    return res.status(404).json({ error: `Hexagram ${number} not found in the database.` });
  }

  return res.json({
    hexagram,
    meta: {
      platform: 'TianJi Global | 天机全球',
      version: '1.0.0',
    },
  });
});

module.exports = router;
