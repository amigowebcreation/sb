const genericPool = require('generic-pool');
const puppeteer = require('puppeteer');

const PUPPETEER_BASE_ARGS = {
    headless: false, // headless doesn't support webGL
    args: [
        '--headless',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#tips
    ],
};

const factory = {
    create: async function() {
        const browser = await puppeteer.launch({
            ...PUPPETEER_BASE_ARGS
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 420 });
        return page;
    },
    destroy: function(puppeteer) {
        puppeteer.close();
    },
};

const browserPagePool = genericPool.createPool(factory, {
    max: 10,
    min: 2,
    maxWaitingClients: 50,
});

module.exports = browserPagePool;