const { fetchJobFromUrl } = require('../utils/scraper');

(async () => {
  try {
    const url = process.argv[2] || 'https://example.com';
    console.log('Testing fetchJobFromUrl with', url);
    const job = await fetchJobFromUrl(url);
    console.log('Result:');
    console.log(JSON.stringify(job, null, 2));
  } catch (err) {
    console.error('Test failed:', err.message || err);
    process.exit(1);
  }
})();
