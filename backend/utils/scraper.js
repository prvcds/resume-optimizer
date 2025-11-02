const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Simple scraper helper to fetch a job posting and extract basic fields.
 * This is intentionally small and resilient: it returns best-effort fields.
 *
 * Currently supported sites: weworkremotely.com (public listings). For other
 * sites selectors may need to be adjusted.
 */

async function fetchJobFromUrl(url) {
  if (!url || typeof url !== 'string') throw new Error('URL is required');

  // Basic fetch
  const res = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'Resume-Optimizer-Bot/1.0 (+https://example.com)' } });
  const html = res.data;
  const $ = cheerio.load(html);

  // Default empty structure
  const job = {
    url,
    title: null,
    company: null,
    location: null,
    datePosted: null,
    description: null
  };

  // Try WeWorkRemotely patterns
  // Title
  job.title = $('h1').first().text().trim() || job.title;

  // Company - often available in .company or .company-name
  job.company = $('.company').first().text().trim() || $('.company-name').first().text().trim() || job.company;

  // Location - try common selectors
  job.location = $('.location').first().text().trim() || $('[itemprop="jobLocation"]').text().trim() || job.location;

  // Date posted
  job.datePosted = $('time').first().attr('datetime') || $('time').first().text().trim() || job.datePosted;

  // Description - try main content blocks
  const descCandidates = [
    '.listing-container',
    '.listing-content',
    '.description',
    '#job-listing',
    '[data-job-description]'
  ];

  for (const sel of descCandidates) {
    const block = $(sel).first();
    if (block && block.length) {
      // Get text while preserving some line breaks
      job.description = block.text().trim();
      break;
    }
  }

  // Fallback: use the largest <div> by text length
  if (!job.description) {
    let largest = '';
    $('div').each((i, el) => {
      const t = $(el).text().trim();
      if (t.length > largest.length) largest = t;
    });
    job.description = largest.slice(0, 20000) || null;
  }

  return job;
}

module.exports = {
  fetchJobFromUrl
};
