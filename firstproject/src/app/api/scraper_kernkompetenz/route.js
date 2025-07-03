const { chromium } = require('playwright');

export async function POST(request){
    try{
        const {search_term} = await request.json();

        const company_name = search_term || 'BMW';
    
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        //Google-Suche nach Unternehmen
        const search_query = `${company_name} offizielle Webseite`;
        const google_search_url = `https://www.google.com/search?q=${encodeURIComponent(search_query)}`;

        await page.goto(google_search_url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        //erste organische Suchergebnis_URL extrahieren
        const firstResult = await page.$eval('h3', el =>{
            const link = el.closest('a');
            return link ? link.href : null;
        })
        .catch(() => null);

        //zu Unternehmenswebsite navigieren
        await page.goto(firstResult, {waitUntil: "domcontentloaded"});
        await page.waitForTimeout(3000);

        //relevanten Inhalte extrahieren
        const extracted_data = await page.evaluate(() =>{
            //verschiedene Selektoren für verschiedene Inhaltstypen
            const selectors = {
                headings: 'h1, h2, h3, h4, h5, h6',
                paragraphs: 'p',
                listItems: 'li',
                aboutSections: '[class*="about"], [id*="about"], [class*="company"], [id*="company"]',
                servicesSections: '[class*="service"], [id*="service"], [class*="product"], [id*="product"]',
                navigation: 'nav a, .nav a, .menu a'
            };

            const data = {};

            //Titel der Seite
            data.title = document.title;

            //URL der Seite
            data.url = window.location.href;

            // Hauptüberschriften
            data.headings = Array.from(document.querySelectorAll(selectors.headings))
            .map(el => ({
                level: el.tagName.toLowerCase(),
                text: el.innerText.trim()
            }))
            .filter(h => h.text.length > 0);

           // Haupttext-Absätze
           data.paragraphs = Array.from(document.querySelectorAll(selectors.paragraphs))
               .map(el => el.innerText.trim())
               .filter(text => text.length > 20); // Nur längere Absätze

           // Navigation/Menü-Elemente (können Hinweise auf Kernkompetenzen geben)
           data.navigation = Array.from(document.querySelectorAll(selectors.navigation))
               .map(el => el.innerText.trim())
               .filter(text => text.length > 0 && text.length < 100);

           // Spezielle "Über uns" oder "Services" Bereiche
           data.aboutSections = Array.from(document.querySelectorAll(selectors.aboutSections))
               .map(el => el.innerText.trim())
               .filter(text => text.length > 0);

           data.servicesSections = Array.from(document.querySelectorAll(selectors.servicesSections))
               .map(el => el.innerText.trim())
               .filter(text => text.length > 0);

           return data;
        });

        await browser.close();

        //Daten für Gemini vorbereiten
        const structured_content = {
            company_name: company_name,
            website_url: extracted_data.url,
            page_title: extracted_data.title,
            
            // Kombinierter Text für Gemini-Analyse
            full_text: [
                ...extracted_data.headings.map(h => h.text),
                ...extracted_data.paragraphs,
                ...extracted_data.aboutSections,
                ...extracted_data.servicesSections
            ].join('\n\n'),
            
            // Strukturierte Daten für detailliertere Analyse
            structured_data: {
                headings: extracted_data.headings,
                navigation_items: extracted_data.navigation,
                about_sections: extracted_data.aboutSections,
                services_sections: extracted_data.servicesSections,
                main_paragraphs: extracted_data.paragraphs.slice(0, 10) // Erste 10 Absätze
            }
        };

        return Response.json({
            success: true,
            data: structured_content,
            message: `Successfully extracted content from ${company_name}'s website`
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
