import { chromium } from 'playwright'; // ES6 Import statt require

export async function POST(request){
    let browser;
    try{
        const {url} = await request.json();

        // Default URL falls keine URL mitgegeben wird
        const targetUrl = url || 'https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-1199130034-S';
    
        // Browser mit Cloud-optimierten Einstellungen
        browser = await chromium.launch({ 
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ]
        });
        
        const page = await browser.newPage();

        await page.goto(targetUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 // 30 Sekunden Timeout
        });
        
        await page.waitForTimeout(3000);

        // Alle <p>-Tags extrahieren
        const paragraphs = await page.$$eval('p, h1, h2, h3, h4, h5, h6, div, span, li', nodes => 
            nodes.map(n => n.innerText.trim()).filter(text => text.length > 0)
        );

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
          error: err.message // FIX: err.message statt error.message
        }, { status: 500 });
    }
    finally {
        // Browser immer schließen, auch bei Fehlern
        if (browser) {
            await browser.close();
        }
    }
}