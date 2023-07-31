//This File Crawl the Data Using CheerIO Module
//Actions - 1. Fetch Data From MYSQL, 2. Request Each URL, 3. Save Page in Given HTML Path

import {RequestQueue, CheerioCrawler} from 'crawlee';
import mysql from 'mysql2/promise'; // Assuming you have installed 'mysql2' package
import fs from 'fs';

const connection = await mysql.createConnection({
  host: '192.168.1.249',
  user: 'root',
  password: 'xbyte',
  database: 'test_main',
});

// Function to fetch URLs from the MySQL database
async function fetchUrlsFromDatabase() {
  const [rows] = await connection.query('SELECT id, url FROM input_sku_cheerio');
  return rows;
}

async function crawlAndSave() {
  const urls = await fetchUrlsFromDatabase();
  const requestQueue = await RequestQueue.open();

  for (const urlData of urls) {
    const { id, url } = urlData;
    await requestQueue.addRequest({ url });

    const crawler = new CheerioCrawler({
      requestQueue,
      // The `$` argument is the Cheerio object
      // which contains parsed HTML of the website.
      async requestHandler({ $, request }) {
        const title = $('title').text();
        const htmlPath = `D:\\Daily Scheduler\\0. HTMLs\\using_cheerio_${id}.html`;

        // Save the response to a file
        fs.writeFileSync(htmlPath, $.html());
        console.log(`HTML content saved to: ${htmlPath}`);

        // Update the path in the database for this URL
        await connection.execute('UPDATE input_sku_cheerio SET html_path = ? WHERE id = ?', [htmlPath, id]);
        await connection.execute('UPDATE input_sku_cheerio SET Status = ? WHERE id = ?', ['Done', id]);
      },
    });

    // Start the crawler and wait for it to finish
    await crawler.run();
  }

  // Close the database connection
  await connection.end();
}

// Call the function to start crawling and saving data
crawlAndSave();
