'use strict';

/**
 * Zi Wei Dou Shu (紫微斗数) API endpoint.
 *
 * POST /api/v1/ziwei
 * Body: { birthDate, birthTime, gender, language }
 */

const express = require('express');

const router = express.Router();

// The 12 Palaces of a Zi Wei chart
const PALACES = [
  'Life (命宫)',
  'Siblings (兄弟宫)',
  'Spouse (夫妻宫)',
  'Children (子女宫)',
  'Wealth (财帛宫)',
  'Health (疾厄宫)',
  'Travel (迁移宫)',
  'Friends (交友宫)',
  'Career (官禄宫)',
  'Property (田宅宫)',
  'Karma (福德宫)',
  'Parents (父母宫)',
];

router.post('/', (req, res) => {
  const { birthDate, birthTime, gender, language = 'en' } = req.body;

  if (!birthDate || !birthTime || !gender) {
    return res.status(400).json({ error: 'birthDate, birthTime, and gender are required.' });
  }

  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour] = birthTime.split(':').map(Number);

  if (!year || !month || !day || isNaN(hour)) {
    return res.status(400).json({ error: 'Invalid birthDate or birthTime format.' });
  }

  // Simplified palace assignment (production would use full Zi Wei algorithm)
  const lifePalaceIndex = ((month + hour) % 12 + 12) % 12;
  const chart = PALACES.map((name, idx) => ({
    palace: name,
    isLifePalace: idx === lifePalaceIndex,
    stars: [], // In production: populated by the full Zi Wei star placement algorithm
  }));

  return res.json({
    chart,
    gender,
    language,
    interpretation: language === 'zh'
      ? `您的命宫位于${PALACES[lifePalaceIndex]}，主一生命运的核心特质。`
      : `Your Life Palace is located in the ${PALACES[lifePalaceIndex]}, governing the core qualities of your destiny.`,
    meta: {
      platform: 'TianJi Global | 天机全球',
      version: '1.0.0',
    },
  });
});

module.exports = router;
