const express = require('express');
const router = express.Router();
const { fetchJobFromUrl } = require('../utils/scraper');

// GET /api/jobs/scrape?url=...
router.get('/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, message: 'url query parameter is required' });

  try {
    const job = await fetchJobFromUrl(url);
    res.json({ success: true, data: job });
  } catch (err) {
    console.error('Scrape error:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch job', error: err.message });
  }
});

module.exports = router;
