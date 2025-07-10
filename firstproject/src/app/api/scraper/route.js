import puppeteer from 'puppeteer';

export async function POST(request){
    let browser;
    try{
        const {url} = await request.json();

        // Default URL falls keine URL mitgegeben wird
        const targetUrl = url || 'https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-1199130034-S';
    
        // Puppeteer mit Cloud-optimierten Einstellungen
        browser = await puppeteer.launch({ 
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--window-size=1920x1080'
            ]
        });
        
        const page = await browser.newPage();

        await page.goto(targetUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        await page.waitForTimeout(3000);

        // Alle relevanten Tags extrahieren
        const paragraphs = await page.evaluate(() => {
            const nodes = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span, li');
            return Array.from(nodes)
                .map(n => n.innerText.trim())
                .filter(text => text.length > 0);
        });

        // Vollständigen Text als String zusammenfügen
        const extractedText = paragraphs.join('\n');

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
          error: err.message
        }, { status: 500 });
    }
    finally {
        if (browser) {
            await browser.close();
        }
    }
}