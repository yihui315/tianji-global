'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const baziRouter = require('./api/bazi');
const ziweiRouter = require('./api/ziwei');
const yijingRouter = require('./api/yijing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'TianJi Global API', version: '1.0.0' });
});

// API routes
app.use('/api/v1/bazi', baziRouter);
app.use('/api/v1/ziwei', ziweiRouter);
app.use('/api/v1/yijing', yijingRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🔮 TianJi Global API listening on port ${PORT}`);
});

module.exports = app;
