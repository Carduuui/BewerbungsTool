import puppeteer from 'puppeteer';

export async function POST(request){
    let company_name = 'leer';
    let browser = null;

    try{
        const {unternehmen_name} = await request.json();
        company_name = unternehmen_name || 'BMW';
    
        browser = await puppeteer.launch({ 
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ]
        });
        
        const page = await browser.newPage();

        // User Agent und Headers setzen
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Cache-Control': 'no-cache'
        });
        
        await page.setViewport({ width: 1920, height: 1080 });

        // Stealth-Techniken hinzufügen
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        console.log(`Starting scrape for: ${company_name}`);

        // Mehrere Suchstrategien versuchen
        const searchStrategies = [
            `${company_name} offizielle Webseite`,
            `${company_name} official website`,
            `${company_name} homepage`,
            `${company_name} unternehmen`,
            company_name
        ];

        let firstResult = null;
        let successfulStrategy = null;

        for (const strategy of searchStrategies) {
            try {
                console.log(`Trying search strategy: ${strategy}`);
                
                const google_search_url = `https://www.google.com/search?q=${encodeURIComponent(strategy)}&hl=de&gl=de`;
                
                await page.goto(google_search_url, {
                    waitUntil: "domcontentloaded",
                    timeout: 30000
                });
                
                // Zufällige Verzögerung für menschlicheres Verhalten
                await page.waitForTimeout(Math.random() * 2000 + 1000);

                // Prüfen ob Google blockiert hat
                const pageTitle = await page.title();
                const isBlocked = pageTitle.includes('unusual traffic') || 
                                pageTitle.includes('Captcha') || 
                                pageTitle.includes('detected unusual traffic');
                
                if (isBlocked) {
                    console.log('Google blocked request, trying next strategy...');
                    continue;
                }

                // Erweiterte Selektoren für Google-Suchergebnisse
                const searchSelectors = [
                    'div.g:first-child a[href^="http"]:not([href*="google.com"]):not([href*="youtube.com"])',
                    'div.tF2Cxc:first-child a[href^="http"]:not([href*="google.com"]):not([href*="youtube.com"])',
                    'div.yuRUbf:first-child a[href^="http"]:not([href*="google.com"]):not([href*="youtube.com"])',
                    'div[data-ved]:first-child a[href^="http"]:not([href*="google.com"]):not([href*="youtube.com"])',
                    'h3 a[href^="http"]:not([href*="google.com"]):not([href*="youtube.com"])',
                    'a[href^="http"]:not([href*="google.com"]):not([href*="youtube.com"]):not([href*="maps.google"]):not([href*="translate.google"])'
                ];

                // Jeden Selektor versuchen
                for (const selector of searchSelectors) {
                    try {
                        await page.waitForSelector(selector, { timeout: 3000 });
                        const linkHandle = await page.$(selector);
                        
                        if (linkHandle) {
                            firstResult = await page.evaluate(el => el.href, linkHandle);
                            
                            if (firstResult && 
                                firstResult.startsWith('http') && 
                                !firstResult.includes('google.com') &&
                                !firstResult.includes('youtube.com') &&
                                !firstResult.includes('maps.google.com') &&
                                !firstResult.includes('translate.google.com') &&
                                !firstResult.includes('webcache.googleusercontent.com')) {
                                
                                console.log(`Found result with selector: ${selector}`);
                                successfulStrategy = strategy;
                                break;
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }

                if (firstResult) break;

                // Alternative Herangehensweise: alle organischen Ergebnisse holen und filtern
                try {
                    const allLinks = await page.evaluate(() => {
                        const links = Array.from(document.querySelectorAll('a[href]'));
                        return links
                            .map(link => ({
                                href: link.href,
                                text: link.innerText?.trim() || '',
                                parent: link.closest('div.g, div.tF2Cxc, div.yuRUbf') ? 'organic' : 'other'
                            }))
                            .filter(link => 
                                link.href.startsWith('http') && 
                                !link.href.includes('google.com') &&
                                !link.href.includes('youtube.com') &&
                                !link.href.includes('maps.google.com') &&
                                !link.href.includes('translate.google.com') &&
                                !link.href.includes('webcache.googleusercontent.com') &&
                                link.parent === 'organic'
                            );
                    });
                    
                    if (allLinks.length > 0) {
                        firstResult = allLinks[0].href;
                        successfulStrategy = strategy;
                        console.log('Found result using alternative approach:', firstResult);
                        break;
                    }
                } catch (evalError) {
                    console.log('Alternative approach failed:', evalError.message);
                }

            } catch (strategyError) {
                console.log(`Strategy "${strategy}" failed:`, strategyError.message);
                continue;
            }
        }

        if (!firstResult) {
            // Finaler Fallback: DuckDuckGo versuchen
            try {
                console.log('Trying DuckDuckGo as fallback...');
                const duckUrl = `https://duckduckgo.com/?q=${encodeURIComponent(company_name + ' official website')}&t=h_&ia=web`;
                
                await page.goto(duckUrl, {
                    waitUntil: "domcontentloaded",
                    timeout: 30000
                });
                
                await page.waitForTimeout(2000);
                
                const duckResults = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a[href^="http"]'));
                    return links
                        .map(link => link.href)
                        .filter(href => 
                            !href.includes('duckduckgo.com') &&
                            !href.includes('google.com') &&
                            !href.includes('youtube.com') &&
                            !href.includes('wikipedia.org')
                        );
                });
                
                if (duckResults.length > 0) {
                    firstResult = duckResults[0];
                    console.log('Found result using DuckDuckGo:', firstResult);
                }
            } catch (duckError) {
                console.log('DuckDuckGo fallback failed:', duckError.message);
            }
        }

        if (!firstResult) {
            // Erweiterte Fehlerdiagnose
            const debugInfo = await page.evaluate(() => ({
                title: document.title,
                url: window.location.href,
                bodyText: document.body?.innerText?.substring(0, 500) || 'No body text',
                allLinksCount: document.querySelectorAll('a[href]').length,
                organicResultsCount: document.querySelectorAll('div.g, div.tF2Cxc, div.yuRUbf').length,
                firstFewLinks: Array.from(document.querySelectorAll('a[href]'))
                    .slice(0, 10)
                    .map(a => ({
                        href: a.href, 
                        text: a.innerText?.trim().substring(0, 100) || ''
                    }))
            }));
            
            console.log('Debug info:', debugInfo);
            
            throw new Error(`Keine organischen Links gefunden für "${company_name}". Alle Suchstrategien fehlgeschlagen. Möglicherweise ist Google/DuckDuckGo blockiert oder der Firmenname ist ungewöhnlich.`);
        }

        console.log(`Successfully found website: ${firstResult}`);
        console.log(`Using strategy: ${successfulStrategy}`);

        // Zur Firmenwebsite navigieren mit erweiterter Retry-Logik
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                await page.goto(firstResult, {
                    waitUntil: "domcontentloaded",
                    timeout: 30000
                });
                
                // Warten bis die Seite vollständig geladen ist
                await page.waitForTimeout(3000);
                
                // Prüfen ob die Seite erfolgreich geladen wurde
                const pageTitle = await page.title();
                if (pageTitle && pageTitle !== 'Error' && pageTitle !== '404') {
                    break;
                }
                
            } catch (navError) {
                retryCount++;
                console.log(`Navigation attempt ${retryCount} failed:`, navError.message);
                
                if (retryCount >= maxRetries) {
                    throw new Error(`Konnte Website nach ${maxRetries} Versuchen nicht laden: ${navError.message}`);
                }
                
                await page.waitForTimeout(2000);
            }
        }

        // Erweiterte Inhaltsextraktion
        const extracted_data = await page.evaluate(() => {
            try {
                const selectors = {
                    headings: 'h1, h2, h3, h4, h5, h6',
                    paragraphs: 'p',
                    listItems: 'li',
                    aboutSections: [
                        '[class*="about"]', '[id*="about"]', 
                        '[class*="company"]', '[id*="company"]', 
                        '[class*="über"]', '[id*="über"]', 
                        '[class*="unternehmen"]', '[id*="unternehmen"]',
                        '[class*="firma"]', '[id*="firma"]',
                        'section[class*="intro"]', 'div[class*="intro"]'
                    ].join(', '),
                    servicesSections: [
                        '[class*="service"]', '[id*="service"]', 
                        '[class*="product"]', '[id*="product"]', 
                        '[class*="leistung"]', '[id*="leistung"]',
                        '[class*="angebot"]', '[id*="angebot"]',
                        '[class*="solution"]', '[id*="solution"]'
                    ].join(', '),
                    navigation: 'nav a, .nav a, .menu a, .navigation a, header a, .header a',
                    metaDescription: 'meta[name="description"]'
                };

                const data = {};

                // Grundlegende Seiteninformationen
                data.title = document.title || 'Kein Titel';
                data.url = window.location.href;
                
                // Meta-Beschreibung
                const metaDesc = document.querySelector(selectors.metaDescription);
                data.metaDescription = metaDesc ? metaDesc.getAttribute('content') : '';

                // Erweiterte Überschriftenextraktion
                data.headings = Array.from(document.querySelectorAll(selectors.headings))
                    .map(el => ({
                        level: el.tagName.toLowerCase(),
                        text: (el.innerText || el.textContent || '').trim(),
                        position: Array.from(document.querySelectorAll(selectors.headings)).indexOf(el)
                    }))
                    .filter(h => h.text.length > 0 && h.text.length < 200)
                    .slice(0, 20); // Auf erste 20 Überschriften begrenzen

                // Erweiterte Absatzextraktion
                data.paragraphs = Array.from(document.querySelectorAll(selectors.paragraphs))
                    .map(el => (el.innerText || el.textContent || '').trim())
                    .filter(text => text.length > 20 && text.length < 1000)
                    .slice(0, 15); // Auf erste 15 Absätze begrenzen

                // Navigationsextraktion
                data.navigation = Array.from(document.querySelectorAll(selectors.navigation))
                    .map(el => (el.innerText || el.textContent || '').trim())
                    .filter(text => text.length > 0 && text.length < 100)
                    .slice(0, 20);

                // Spezielle Bereiche mit besserer Fehlerbehandlung
                try {
                    data.aboutSections = Array.from(document.querySelectorAll(selectors.aboutSections))
                        .map(el => (el.innerText || el.textContent || '').trim())
                        .filter(text => text.length > 0 && text.length < 2000)
                        .slice(0, 5);
                } catch (e) {
                    data.aboutSections = [];
                }

                try {
                    data.servicesSections = Array.from(document.querySelectorAll(selectors.servicesSections))
                        .map(el => (el.innerText || el.textContent || '').trim())
                        .filter(text => text.length > 0 && text.length < 2000)
                        .slice(0, 5);
                } catch (e) {
                    data.servicesSections = [];
                }

                return data;
            } catch (extractError) {
                console.error('Content extraction error:', extractError);
                return {
                    title: 'Fehler beim Extrahieren',
                    url: window.location.href,
                    headings: [],
                    paragraphs: [],
                    navigation: [],
                    aboutSections: [],
                    servicesSections: [],
                    error: extractError.message
                };
            }
        });

        // Strukturierte Inhalte vorbereiten
        const structured_content = {
            company_name: company_name,
            website_url: extracted_data.url,
            page_title: extracted_data.title,
            meta_description: extracted_data.metaDescription,
            
            // Kombinierten Text für Analyse
            full_text: [
                extracted_data.metaDescription,
                ...extracted_data.headings.map(h => h.text),
                ...extracted_data.paragraphs,
                ...extracted_data.aboutSections,
                ...extracted_data.servicesSections
            ].filter(text => text && text.length > 0).join('\n\n'),
            
            // Strukturierte Daten für detaillierte Analyse
            structured_data: {
                headings: extracted_data.headings,
                navigation_items: extracted_data.navigation,
                about_sections: extracted_data.aboutSections,
                services_sections: extracted_data.servicesSections,
                main_paragraphs: extracted_data.paragraphs,
                meta_description: extracted_data.metaDescription
            }
        };

        console.log(`Successfully extracted content for ${company_name}`);
        console.log(`Total content length: ${structured_content.full_text.length} characters`);

        return Response.json({
            success: true,
            data: structured_content,
            message: `Successfully extracted content from ${company_name}'s website`,
            debug_info: {
                search_strategy_used: successfulStrategy,
                website_url: firstResult,
                content_stats: {
                    headings: extracted_data.headings.length,
                    paragraphs: extracted_data.paragraphs.length,
                    total_length: structured_content.full_text.length,
                    has_meta_description: !!extracted_data.metaDescription
                }
            }
        });
    }
    catch(err){
        console.error('Scraping error:', err);
    
        return Response.json({
          success: false,
          error: err.message || 'Unbekannter Scraping-Fehler',
          company_name: company_name,
          timestamp: new Date().toISOString(),
          suggestions: [
            'Versuchen Sie es mit einem anderen Firmennamen oder einer alternativen Schreibweise',
            'Prüfen Sie, ob der Firmenname korrekt geschrieben ist',
            'Möglicherweise ist die Website temporär nicht erreichbar'
          ]
        }, { status: 500 });
    }
    finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
    }
}