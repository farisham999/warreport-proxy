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
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        const data = await page.evaluate(() => ({
            title: document.title,
            htmlLength: document.documentElement.outerHTML.length,
            textPreview: document.body.innerText.substring(0, 2000)
        }));

        await browser.close();

        res.json({ success: true, tag, data });

    } catch (e) {
        if (browser) await browser.close().catch(() => {});
        res.status(500).json({ success: false, error: e.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
