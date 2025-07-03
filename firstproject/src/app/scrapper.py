from flask import Flask
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import os

app = Flask(__name__)

def scrape_job_details(url):
    """Funktion zum Scrapen der Jobdetails"""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url)
            
            # Warten bis die Seite geladen ist
            page.wait_for_timeout(3000)
            
            # Den vollständigen Text holen
            html = page.content()
            browser.close()
            
            # BeautifulSoup verwenden
            soup = BeautifulSoup(html, "html.parser")
            paragraphs = soup.find_all("p")
            text = "\n".join(p.get_text(strip=True) for p in paragraphs)
            
            return text
    except Exception as e:
        return f"Fehler beim Scrapen: {str(e)}"

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/scrape')
def scrape_job():
    """Route zum Scrapen des Jobs"""
    url = "https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-1199130034-S"
    scraped_text = scrape_job_details(url)
    return f"<pre>{scraped_text}</pre>"

if __name__ == '__main__':
    # Playwright Browser installieren (wichtig für Render)
    os.system('playwright install chromium')
    
    # Flask App starten
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
