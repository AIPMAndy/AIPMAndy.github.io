import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const SITE = 'https://aipmandy.github.io/FreePublish/';
const browser = await chromium.launch({headless:true});
const results = [];
try {
  for (const width of [390, 1280]) {
    const context = await browser.newContext({
      viewport:{width,height:820},
      acceptDownloads:true,
      serviceWorkers:'block'
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(String(err)));
    await page.goto(SITE, {waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('h1.page-title').getByText('从内容到发布').waitFor();
    assert.equal(await page.locator('.brand-name').textContent(), 'FreePublish');
    await page.locator('button[data-action="new"]').first().click();
    await page.locator('#post-title').fill('FreePublish 发布流程测试');
    await page.locator('#post-source').fill('这是一段原创测试文字。用可验证的方式准备内容、逐平台审核，最后由人负责发布。');
    await page.locator('#post-kind').selectOption('image');
    await page.locator('#post-rights').selectOption('owned');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1600"><rect width="900" height="1600" fill="#d0d6e0"/></svg>';
    await page.locator('#media-files').setInputFiles({
      name:'demo.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg,'utf8')
    });
    await page.locator('.media-meta').getByText('900×1600', {exact:false}).waitFor();
    await page.locator('button[data-action="generate-all"]').click();
    const snapshot = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem('freepublish.v1'));
      return {title:st?.posts?.[0]?.title, source:st?.posts?.[0]?.source,
        platformKeys:Object.keys(st?.posts?.[0]?.variants || {}),
        toast:document.querySelector('#toast')?.textContent,
        viewHeader:document.querySelector('h1.page-title')?.textContent,
        variantTitleExists:!!document.querySelector('#variant-title')};
    });
    console.log('After generate:',JSON.stringify(snapshot));
    await page.screenshot({path:'/tmp/freepublish-after-generate-' + width + '.png',fullPage:false});
    await page.locator('#variant-title').waitFor({timeout:6000});
    await page.locator('#variant-body').fill('在小红书上看这段真实的发布工作流：先编辑，再审核，再人工发布。');
    await page.locator('#variant-account').fill('@test-account');
    assert.equal(await page.locator('.preview-media img').count(),1, 'real local image preview');
    await page.locator('button[data-action="go-review"]').click();
    const approveButton = page.locator('button[data-action="approve"]');
    await approveButton.waitFor();
    assert.equal(await approveButton.isEnabled(),true,'preflight should be approvable');
    await approveButton.click();
    assert.equal(await page.locator('button[data-action="open-platform"]').isDisabled(),true,'final checks gate must block publish handoff');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[data-action="download-package-zip"]').click();
    const downloaded = await downloadPromise;
    const buffer = await fs.readFile(await downloaded.path());
    assert.equal(buffer.subarray(0,2).toString(), 'PK','ZIP file signature');
    assert.ok(buffer.length > 400);
    for (const field of ['account','media','disclosures','visibility']) {
      await page.locator('input[data-scope="publish-check"][data-field="' + field + '"]').check();
    }
    assert.equal(await page.locator('button[data-action="open-platform"]').isEnabled(),true);
    await page.locator('#receipt-url').fill('https://www.xiaohongshu.com/explore/freepublish-smoke-test');
    await page.locator('button[data-action="confirm-published"]').click();
    await page.getByText('已发布·人工登记').first().waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 2,'horizontal overflow at '+width+'px: '+overflow);
    assert.deepEqual(pageErrors,[],'unhandled browser runtime errors');
    await page.screenshot({path:'/tmp/freepublish-' + width + '.png',fullPage:false});
    results.push({width,zipBytes:buffer.length,overflow,registered:true});
    await context.close();
  }
  console.log('PASS ' + JSON.stringify(results));
} finally {
  await browser.close();
}
