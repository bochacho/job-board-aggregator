const xml2js = require('xml2js');

async function scrapeWeWorkRemotely() {
  try {
    const url = 'https://weworkremotely.com/categories/remote-programming-jobs.rss';
    
    console.log('Fetching RSS feed from We Work Remotely...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xml = await response.text();
    
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    
    const items = result.rss.channel[0].item || [];
    
    console.log(`Found ${items.length} jobs in RSS feed`);
    
    const jobs = items.map(item => {
      const categories = item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : [];
      
      const region = item.region ? item.region[0] : '';
      
      const fullTitle = item.title ? item.title[0] : '';
      const titleParts = fullTitle.split(':');
      const company = titleParts[0]?.trim() || '';
      const jobTitle = titleParts.slice(1).join(':').trim() || fullTitle;
      
      return {
        title: jobTitle,
        company: company,
        location: region,
        url: item.link ? item.link[0] : '',
        postedDate: item.pubDate ? new Date(item.pubDate[0]) : null,
        categories: categories,
        description: item.description ? item.description[0] : '',
        source: 'weworkremotely',
        scrapedAt: new Date()
      };
    });
    
    return jobs;
    
  } catch (error) {
    console.error('Error scraping We Work Remotely:', error.message);
    throw error;
  }
}

scrapeWeWorkRemotely()
  .then(jobs => {
    console.log('\n=== Sample Jobs ===');
    console.log(`Total: ${jobs.length} jobs\n`);
    
    jobs.slice(0, 3).forEach((job, index) => {
      console.log(`\n--- Job ${index + 1} ---`);
      console.log(`Title: ${job.title}`);
      console.log(`Company: ${job.company}`);
      console.log(`Location: ${job.location}`);
      console.log(`URL: ${job.url}`);
      console.log(`Categories: ${job.categories.join(', ')}`);
      console.log(`Posted: ${job.postedDate}`);
    });
  })
  .catch(err => console.error(err));

module.exports = { scrapeWeWorkRemotely };