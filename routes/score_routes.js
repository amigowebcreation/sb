const browserPagePool = require('./../bowserPagePool');

const extract = () => {
    return [...document.querySelector('div[data-type=container]').children]
        .filter(x => x.attributes['data-type'])
        .reduce(
            (acc, row) => {
                const type = row.attributes['data-type'].value;
                if (type === 'stg') {
                    const id = row.attributes['data-stg-id'].value;
                    const date = row.attributes['data-id'].value;

                    if (acc.meta.id !== id) {
                        const name = row.children[0].children[0].innerText;
                        acc.meta = Object.assign(acc.meta, { id, name, date });
                    }
                    if (acc.meta.date !== date) {
                        acc.meta.date = date;
                    }
                }
                if (type === 'evt') {
                    const [home, away] = [...row.querySelectorAll('.ply.name')].map(x =>
                        x.innerText.trim()
                    );
                    const idValue = row.attributes['data-id'].value;
                    const id = idValue.replace('soccer-','');

                    const min = row
                        .querySelector('.min')
                        .innerText.trim()
                        .replace('Limited coverage', '');

                    const scoreElement = row.querySelector('.sco');
                    const home_goal = scoreElement.querySelector('span.hom').innerText.trim();
                    const away_goal = scoreElement.querySelector('span.awy').innerText.trim();

                    const score = scoreElement.innerText
                        .split('-')
                        .map(x => x.trim())
                        .join('-');

                    const scoreLink = scoreElement.querySelector('a.scorelink');
                    const href = scoreLink
                        ? window.location.origin + scoreLink.attributes['href'].value
                        : null;
                    const { date, name } = acc.meta;
                    const match = {
                        id,
                        date,
                        name,
                        home,
                        away,
                        min,
                        score,
                        home_goal,
                        away_goal,
                        href
                    };
                    acc.values.push(match);
                }
                return acc;
            },
            { values: [], meta: { id: null, date: null, name: null } }
        );
};


async function run() {

    const page = await browserPagePool.acquire();

    await page.setRequestInterception(true);

    page.on('request', request => {
        const type = request.resourceType();
        if (['images', 'font', 'stylesheet'].some(x => x === type)) request.abort();
        else request.continue();
    });

    await page.goto(`http://livescore.com`, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    const { values } = await page.evaluate(extract);

    await browserPagePool.release(page);

    return values;
}

module.exports = function (app, db) {
    app.get('/api/live-score', async (req, res) => {
        // You'll create your note here.
        var value = await run();
        res.send(value);
    })
}