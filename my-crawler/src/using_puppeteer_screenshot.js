//This File Crawl the Data Using Puppeteer Module
//Actions - 1. Fetch Data From MYSQL, 2. Request Each URL, 3. Save Screenshot in Given Path

import { PuppeteerCrawler, Dataset } from 'crawlee';
import mysql from 'mysql2/promise';
import fs from "fs"; // Import the MySQL package

async function startCrawl() {
    // Connect to your MySQL database
    const connection = await mysql.createConnection({
        host: '192.168.1.249',
        user: 'root',
        password: 'xbyte',
        database: 'test_main',
    });

    try {
        const [rows] = await connection.execute('SELECT id, url FROM input_sku_puppeteer');
        let counter = 1
        // const urlsToScrape = rows.map((row) => row.url);
        const urlsToScrape = rows.map((row) => ({ id: row.id, url: row.url }));
        const urlArray = urlsToScrape.map((item) => item.url);

        const crawler = new PuppeteerCrawler({

            // Use the requestHandler to process each of the crawled pages.
            async requestHandler({ request, page, log }) {

                // const urlsToScrape = rows.map((row) => ({ id: row.id, url: row.url }));
                const { id, url } = request.userData;
                const title = await page.title();
                log.info(`Title of ${request.loadedUrl} is '${title}'`);

                // Save the HTML content to a file
                const htmlPath = `D:\\Daily Scheduler\\0. HTMLs\\using_puppeteer_screenshot_${counter}.jpeg`;
                await page.screenshot({ path: htmlPath, fullPage:true });
                // fs.writeFileSync(htmlPath, await page.content());
                console.log(`Screenshot saved to: ${htmlPath}`);
                counter++;

                // Update the database with the HTML file path
                await connection.execute('UPDATE input_sku_puppeteer SET html_path = ? WHERE url = ?', [htmlPath, request.loadedUrl]);
                await connection.execute('UPDATE input_sku_puppeteer SET Status = ? WHERE url = ?', ['Done', request.loadedUrl]);

            },
            // Uncomment this option to see the browser window.
            // headless: false,
        });

        // Add the URLs to the queue and start the crawl.
        await crawler.run(urlArray);
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        // Close the MySQL connection when done.
        await connection.end();
    }
}

startCrawl();
