//This File Crawl the Data Using Puppeteer Module
//Actions - 1. Request Each URL given in a list

import { PuppeteerCrawler } from 'crawlee';

const crawler = new PuppeteerCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
        const title = await page.title();
        log.info(`Title of ${request.url}: ${title}`);

        // await enqueueLinks({
        //     globs: ['http?(s)://www.iana.org/**'],
        // });
    },
    maxRequestsPerCrawl: 10,
});

await crawler.addRequests(['https://quotes.toscrape.com/', 'https://www.amazon.in/', 'https://www.amazon.com.au/', 'https://www.amazon.com.be/', 'https://www.amazon.com.br/', 'https://www.amazon.ca/', 'https://www.amazon.cn/', 'https://www.amazon.eg/', 'https://www.amazon.fr/', 'https://www.amazon.de/']);

await crawler.run();