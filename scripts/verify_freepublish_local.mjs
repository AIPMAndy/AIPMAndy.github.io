import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const ORIGIN='http://127.0.0.1:8765/FreePublish/';
try {
  for (const width of [360,390,1280]) {
    const context=await browser.newContext({viewport:{width,height:844},colorScheme:'light',serviceWorkers:'block'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(ORIGIN,{waitUntil:'domcontentloaded'});
    await page.locator('h1.page-title').waitFor();
    // High-frequency navigation: updates must not permanently displace content or overflow.
    await page.locator('button[data-view="about"]').click();
    await page.locator('h1.page-title').getByText('安全原则与使用说明').waitFor();
    await page.locator('button[data-view="dashboard"]').click();
    await page.locator('button[data-action="new"]').first().click();
    await page.locator('#post-title').fill('本地 UX 回归样稿');
    await page.locator('#post-source').fill('这是授权自制的图文示例。流程先审查后人工发布。');
    await page.locator('#post-kind').selectOption('image');
    await page.locator('#post-rights').selectOption('owned');
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1600"><rect width="900" height="1600" fill="#ced7e2"/></svg>';
    await page.locator('#media-files').setInputFiles({name:'own.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
    await page.locator('.media-meta').waitFor();
    await page.locator('button[data-action="generate-all"]').click();
    await page.locator('#variant-body').fill('原创图文，人工审核并在官方平台发布。');
    await page.locator('#variant-account').fill('@test');
    await page.locator('button[data-action="go-review"]').click();
    await page.locator('button[data-action="approve"]').click();
    const receipt='https://www.xiaohongshu.com/explore/freepublish-ux-local-smoke';
    await page.locator('#receipt-url').fill(receipt);
    for (const name of ['account','media','disclosures','visibility']) {
      const checkbox=page.locator('input[data-scope="publish-check"][data-field="'+name+'"]');
      await checkbox.check();
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.field),name,'focus retained after '+name);
      assert.equal(await page.locator('#receipt-url').inputValue(),receipt,'unsubmitted receipt must survive '+name);
    }
    assert.ok(await page.locator('button[data-action="open-platform"]').isEnabled());
    assert.ok((await page.evaluate(() => document.documentElement.scrollWidth-window.innerWidth))<=2,'horizontal overflow');
    assert.deepEqual(errors,[],'runtime errors');
    await page.screenshot({path:'/tmp/freepublish-local-light-'+width+'.png',fullPage:false});
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();
  await page.goto(ORIGIN,{waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),'rgb(13, 21, 32)','dark appearance');
  await page.locator('button[data-view="library"]').click();
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'reduced motion forbids view animation');
  await page.screenshot({path:'/tmp/freepublish-local-dark-reduced-390.png',fullPage:false});
  console.log('PASS: 360/390/1280 workflow, focus, receipt retention, no overflow; dark/reduced motion');
  await context.close();
} finally {
  await browser.close();
}
