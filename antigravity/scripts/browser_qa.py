import asyncio,subprocess,time,os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
async def main():
 proc=subprocess.Popen(['python3','-m','http.server','8178','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
   for width in [360,390,1280]:
    page=await browser.new_page(viewport={'width':width,'height':850},accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    await page.set_content((ROOT/'index.html').read_text('utf-8'),wait_until='load')
    await page.wait_for_selector('#chapter-area-not-used') if False else None
    assert await page.title()
    assert await page.locator('section.chapter').count()==15,await page.locator('section.chapter').count()
    assert await page.locator('.lesson').count()==50
    assert await page.locator('.prompt-card').count()==20
    await page.wait_for_timeout(200)
    overflow=await page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
    print('viewport',width,'overflow',overflow,'errors',errors)
    assert not overflow and not errors
    await page.screenshot(path=str(ROOT/'assets'/f'qa-{width}.png'),full_page=False)
    # interactivity
    await page.locator('#site-search').fill('GitHub Pages')
    n=await page.locator('section.chapter:not(.hidden)').count()
    assert 0<n<15,n
    await page.locator('#clear-search').click()
    assert await page.locator('section.chapter:not(.hidden)').count()==15
    await page.locator('.lesson input[type="checkbox"]').first.check(force=True)
    assert '1 / 50' in await page.locator('.progress-num').first.inner_text()
    assert await page.locator('.lesson input[type="checkbox"]').first.is_checked()
    if width < 720: await page.locator('.mobile-details summary').click()
    page.once('dialog',lambda d: asyncio.create_task(d.accept()))
    await page.locator('#reset-progress-mobile' if width < 720 else '#reset-progress').click()
    assert '0 / 50' in await page.locator('.progress-num').first.inner_text()
    await page.locator('#project-name').fill('星觉科技官网')
    assert '星觉科技官网' in await page.locator('#generated-prompt').inner_text()
    await page.locator('#prompt-filter').select_option('安全与分析')
    assert await page.locator('.prompt-card').count()==2
    async with page.expect_download() as d:
      await page.locator('#download-starter').click()
    dl=await d.value
    assert dl.suggested_filename=='index.html'
    await page.close()
   await browser.close()
 finally:proc.terminate();proc.wait()
asyncio.run(main())