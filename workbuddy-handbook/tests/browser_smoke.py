#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
from pathlib import Path
import subprocess,time,sys
R=Path(__file__).resolve().parents[1]
server=subprocess.Popen(['python','-m','http.server','8765','-d',str(R/'docs')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
errors=[]
try:
 time.sleep(.6)
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for w,h in [(1440,900),(390,844),(360,780),(1280,720)]:
   page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
   page.on('pageerror',lambda e:errors.append(f'{w} pageerror {e}'))
   page.set_content((R/'docs/index.html').read_text(encoding='utf-8'),wait_until='domcontentloaded')
   page.add_style_tag(content=(R/'docs/assets/style.css').read_text(encoding='utf-8'))
   page.add_script_tag(content=(R/'docs/assets/app.js').read_text(encoding='utf-8'))
   if page.title()=='':errors.append(f'{w} empty title')
   overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
   if overflow:errors.append(f'{w} horizontal overflow: {page.evaluate("document.documentElement.scrollWidth")}')
   if w==1440:
    page.screenshot(path=str(R/'site/site-desktop.png'),full_page=False)
   if w==390:
    page.screenshot(path=str(R/'site/site-mobile.png'),full_page=False)
    page.locator('#category').select_option('求职')
    ct=page.locator('#prompt-count').inner_text()
    if ct!='3 个模板':errors.append(f'filter wrong count {ct}')
    page.locator('#prompt-search').fill('简历')
    ct=page.locator('#prompt-count').inner_text()
    if ct!='1 个模板':errors.append(f'search wrong count {ct}')
    page.locator('#category').select_option('all');page.locator('#prompt-search').fill('')
    page.locator('#frequency').fill('10');page.locator('#manual').fill('60');page.locator('#agent').fill('30');page.locator('#hourly').fill('100');page.locator('#cost').fill('50')
    v=page.locator('#net-value').inner_text()
    if v!='450':errors.append(f'calculator wrong {v}')
   if w==1280:
    page.locator('.copy-prompt').first.click();page.wait_for_timeout(200)
    if not page.locator('#toast').inner_text().strip():errors.append('copy toast not visible')
   if page.locator('h1').count()!=1:errors.append(f'{w} h1 count {page.locator("h1").count()}')
   page.close()
  b.close()
 print({'errors':errors,'screenshots':['site/site-desktop.png','site/site-mobile.png']})
finally:server.terminate()
sys.exit(1 if errors else 0)
