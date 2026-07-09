const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/battle/:tag', async (req, res) => {
    const tag = req.params.tag.toUpperCase().replace('#', '');
    const url = `https://warreport.app/players/${tag}/battle`;

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        const data = await page.evaluate(() => ({
            title: document.title,
            text: document.body.innerText.substring(0, 3000),
            htmlLength: document.documentElement.outerHTML.length
        }));

        await browser.close();

        res.json({ success: true, tag, url, data });

    } catch (e) {
        if (browser) await browser.close().catch(() => {});
        res.status(500).json({ success: false, error: e.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Running on port ${port}`));
