const { chromium } = require('playwright');

export async function POST(request){
    try{
        const {url} = await request.json();

        // Default URL falls keine URL mitgegeben wird
        const targetUrl = url || 'https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-1199130034-S';
    
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        // Alle <p>-Tags extrahieren
        const paragraphs = await page.$$eval('p', nodes => 
            nodes.map(n => n.innerText.trim()).filter(text => text.length > 0)
        );

        // Vollständigen Text als String zusammenfügen
        const extractedText = paragraphs.join('\n');

        await browser.close();

        return Response.json({
            success: true,
            extractedText: extractedText,
            url: targetUrl
        });
    }
    catch(err){
        console.error('Scraping error:', err);
    
        return Response.json({
          success: false,
          error: error.message
        }, { status: 500 });
    }
}
