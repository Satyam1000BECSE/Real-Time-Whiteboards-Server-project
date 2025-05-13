// ================= session.js  ==================
const express = require('express');
const router = express.Router();
const { createSession } = require('../utils/session');

router.post('/create', (req, res) => {
  const sessionId = createSession();
  const sessionLink = `http://localhost:5173/join/${sessionId}`;
  res.json({ sessionId, link: sessionLink });
});

module.exports = router;