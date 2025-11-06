const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Simple scraper helper to fetch a job posting and extract basic fields.
 * This is intentionally small and resilient: it returns best-effort fields.
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

  // Try common patterns
  job.title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || $('title').text().trim() || job.title;
  job.company = $('.company').first().text().trim() || $('.company-name').first().text().trim() || $('meta[property="og:site_name"]').attr('content') || job.company;
  job.location = $('.location').first().text().trim() || $('[itemprop="jobLocation"]').text().trim() || job.location;
  job.datePosted = $('time').first().attr('datetime') || $('time').first().text().trim() || job.datePosted;

  const descCandidates = ['.listing-container', '.listing-content', '.description', '#job-listing', '[data-job-description]', '[itemprop="description"]'];
  for (const sel of descCandidates) {
    const block = $(sel).first();
    if (block && block.length && block.text().trim().length > 50) {
      job.description = block.text().trim();
      break;
    }
  }

  // Fallback: meta description or body
  if (!job.description) job.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || null;
  if (!job.description) {
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    job.description = bodyText ? bodyText.substring(0, 45000) : null;
  }

  if (job.description && job.description.length > 50000) job.description = job.description.substring(0, 50000);

  return job;
}

module.exports = { fetchJobFromUrl };
