import os
from playwright.sync_api import sync_playwright

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        file_path = os.path.abspath("verification/mock_searchbar.html")
        page.goto(f"file://{file_path}")
        page.screenshot(path="verification/screenshot.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    take_screenshot()
