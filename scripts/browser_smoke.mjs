import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
let results = [];
try {
  for (const width of [360, 390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 840 }, acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://127.0.0.1:8123/', {waitUntil:'domcontentloaded'});
    const rows = page.locator('#sites > ul > li');
    const original = await rows.count();
    assert.ok(original >= 44, 'portal should retain all original directory items');
    await page.locator('#catalog-count').getByText(`${original} / ${original}`).waitFor();
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const entities = blocks.flatMap(block => { const data = JSON.parse(block); return data['@graph'] || [data]; });
    const entries = entities.find(x => x['@type'] === 'ItemList').itemListElement;
    assert.equal(entries.length, original);
    assert.deepEqual(entries.map(x => x.url), await page.locator('#sites > ul > li > a').evaluateAll(links => links.map(a => a.href)));
    await page.locator('#catalog-search').fill('FreeGIF');
    await page.locator('#catalog-count').getByText(`1 / ${original}`).waitFor();
    assert.equal(await rows.filter({ visible:true }).count(), 1);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#catalog-export').click();
    const download = await downloadPromise;
    const txt = await fs.readFile(await download.path(), 'utf8');
    assert.match(txt, /FreeGIF/);
    assert.match(txt, /AIPMAndy/);
    assert.match(txt, /metaver\.vip/);
    assert.match(txt, /a6no1\.cn/);
    await page.locator('#catalog-search').fill('unmatched____random____');
    await page.locator('#catalog-count').getByText(`0 / ${original}`).waitFor();
    assert.equal(await page.locator('#catalog-empty').isVisible(), true);
    assert.equal(await page.locator('#catalog-export').isDisabled(), true);
    await page.locator('#catalog-reset').click();
    await page.locator('#catalog-count').getByText(`${original} / ${original}`).waitFor();
    await page.locator('#catalog-category').selectOption('career');
    const visibleCareer = await rows.filter({ visible:true }).count();
    assert.ok(visibleCareer > 0 && visibleCareer < original, 'category filter must be meaningful');
    await page.locator('#catalog-reset').click();
    const pdf = await page.request.get('http://127.0.0.1:8123/pdf/andy-open-source-catalog.pdf');
    assert.equal(pdf.status(),200, 'catalog PDF path must actually exist');
    assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://aipmandy.github.io/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 2, 'unexpected horizontal overflow at ' + width + 'px: ' + overflow);
    assert.deepEqual(errors, []);
    results.push({viewport:width,catalogItems:original,categoryMatches:visibleCareer,pdfStatus:200});
    await page.screenshot({path:'/tmp/portal-' + width + '.png',fullPage:false});
    await context.close();
  }
  console.log('PASS ' + JSON.stringify(results));
} finally {
  await browser.close();
}
