import flask
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

url = "https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-1199130034-S"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(url)
    
    # Warten bis die Seite geladen ist, optional
    page.wait_for_timeout(3000)
    
    # Den vollständigen Text holen
    html = page.content()
    browser.close()

from bs4 import BeautifulSoup
soup = BeautifulSoup(html, "html.parser")
paragraphs = soup.find_all("p")
text = "\n".join(p.get_text(strip=True) for p in paragraphs)

print("=== Extrahierter Text ===")
print(text)
print(flask.__version__)