const cheerio = require('cheerio');

async function scrapeWeWorkRemotely() {
  try {
    const url = 'https://weworkremotely.com/categories/remote-programming-jobs';
    
    console.log('Fetching jobs from We Work Remotely...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(html)
    const $ = cheerio.load(html);
    
    // DEBUG: Check if we find the job containers
    const jobContainers = $('li.new-listing-container');
    console.log(`Found ${jobContainers.length} job containers`);
    
    // DEBUG: Let's look at the first job's HTML
    if (jobContainers.length > 0) {
      console.log('\nFirst job HTML:');
      console.log($(jobContainers[0]).html().substring(0, 500));
    }
    
    const jobs = [];
    
    $('li.new-listing-container').each((index, element) => {
      const jobElement = $(element);
      
      // DEBUG: Check what we're finding
      const title = jobElement.find('.new-listing__header__title').text().trim();
      console.log(`\nJob ${index + 1} title:`, title);
      
      const categories = [];
      jobElement.find('.new-listing__categories__category').each((i, el) => {
        categories.push($(el).text().trim());
      });
      
      const relativeUrl = jobElement.find('.listing-link--unlocked').attr('href');
      const fullUrl = relativeUrl ? 'https://weworkremotely.com' + relativeUrl : '';
      
      const job = {
        title: title,
        company: jobElement.find('.new-listing__company-name').text().trim(),
        location: jobElement.find('.new-listing__company-headquarters').text().trim(),
        url: fullUrl,
        postedDate: jobElement.find('.new-listing__header__icons__date').text().trim(),
        categories: categories,
        source: 'weworkremotely',
        scrapedAt: new Date()
      };
      
      jobs.push(job);
    });
    
    console.log(`\nFound ${jobs.length} total jobs`);
    return jobs;
    
  } catch (error) {
    console.error('Error scraping We Work Remotely:', error.message);
    throw error;
  }
}

// Test the scraper
scrapeWeWorkRemotely()
  .then(jobs => {
    console.log('\n=== First 3 jobs ===');
    console.log(JSON.stringify(jobs.slice(0, 3), null, 2));
  })
  .catch(err => console.error(err));
