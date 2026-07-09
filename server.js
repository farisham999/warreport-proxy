const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/battle/:tag', async (req, res) => {
    const tag = req.params.tag.toUpperCase().replace('#', '');
    const url = `https://warreport.app/players/${tag}/battle`;

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        const data = await page.evaluate(() => {
            return {
                title: document.title,
                html: document.documentElement.outerHTML.substring(0, 5000), // preview
                text: document.body.innerText.substring(0, 3000)
            };
        });

        await browser.close();

        res.json({ success: true, tag, url, data });

    } catch (e) {
        if (browser) await browser.close();
        res.status(500).json({ success: false, error: e.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
