#!/usr/bin/env python3
"""Real Chromium smoke across desktop and mobile, zero network required."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
raw=(ROOT/'index.html').read_text(encoding='utf-8')
# Some hosted environments block localhost/file navigation. Load the exact static HTML,
# CSS and JS into Chromium in-memory to test layout and behavior without networking.
raw=re.sub(r'<link rel="stylesheet"[^>]*>', '',raw)
raw=re.sub(r'<script src="assets/app.js" defer></script>', '',raw)
css=(ROOT/'assets/style.css').read_text(encoding='utf-8')
js=(ROOT/'assets/app.js').read_text(encoding='utf-8')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for w,h,device in [(1440,900,'desktop'),(390,844,'mobile'),(360,740,'small-mobile')]:
   context=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
   page=context.new_page();page.set_content(raw,wait_until='domcontentloaded');page.add_style_tag(content=css);page.add_script_tag(content=js);page.wait_for_timeout(150)
   assert page.title().startswith('豆包工作保姆级'),page.title()
   assert page.locator('.prompt-card').count()==32
   assert page.locator('.chapter').count()==23
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),f'overflow on {device}'
   page.locator('#prompt-search').fill('会议')
   assert page.locator('.prompt-card:not(.hide)').count()>=1
   page.locator('#prompt-search').fill('')
   page.locator('button[data-cat="创业经营"]').click()
   assert page.locator('.prompt-card:not(.hide)').count()==3
   page.locator('button[data-cat="全部"]').click()
   page.locator('#goal').fill('起草一份授权范围明确的产品验收方案')
   assert '产品验收方案' in page.locator('#task-preview').inner_text()
   page.locator('#manual').fill('10');page.locator('#setup').fill('20')
   assert 'negative' in (page.locator('#calc-result').get_attribute('class') or '')
   page.locator('#setup').fill('5')
   if w<700:
    page.locator('#menu-toggle').click();assert 'open' in (page.locator('#site-nav').get_attribute('class') or '')
    page.locator('#site-nav a[href="#chapters"]').click()
   shots=ROOT/'site-screenshots';shots.mkdir(exist_ok=True)
   page.screenshot(path=str(shots/(device+'.png')),full_page=False)
   print('PASS browser',device,'width',w,'cards',page.locator('.prompt-card').count())
   context.close()
  browser.close()
finally: pass
