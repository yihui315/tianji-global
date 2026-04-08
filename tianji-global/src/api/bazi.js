'use strict';

/**
 * BaZi (八字) API endpoint.
 *
 * POST /api/v1/bazi
 * Body: { birthDate, birthTime, birthPlace, gender, language }
 */

const express = require('express');
const { calculateBaZi } = require('../utils/bazi');

const router = express.Router();

router.post('/', (req, res) => {
  const { birthDate, birthTime, gender, language = 'en' } = req.body;

  if (!birthDate || !birthTime) {
    return res.status(400).json({ error: 'birthDate and birthTime are required.' });
  }

  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  if (
    !year || !month || !day ||
    isNaN(hour) || isNaN(minute) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59
  ) {
    return res.status(400).json({ error: 'Invalid birthDate or birthTime format.' });
  }

  const chart = calculateBaZi({ year, month, day, hour });

  return res.json({
    chart,
    gender: gender || 'unspecified',
    language,
    interpretation: buildInterpretation(chart, language),
    meta: {
      platform: 'TianJi Global | 天机全球',
      version: '1.0.0',
    },
  });
});

/**
 * Builds a localised interpretation stub.
 * In production this would call the OpenAI API.
 *
 * @param {object} chart
 * @param {string} language
 * @returns {string}
 */
function buildInterpretation(chart, language) {
  const element = chart.dayMasterElement;
  const interpretations = {
    en: `Your Day Master is ${chart.day.heavenlyStem} (${element}). This suggests a ${element.toLowerCase()}-type personality with innate strengths in creativity and adaptability.`,
    zh: `您的日主为${chart.day.heavenlyStem}（${element}），性格中天生具有创造力与适应能力。`,
  };
  return interpretations[language] || interpretations.en;
}

module.exports = router;
