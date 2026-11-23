import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.env.GEMINI_TEST_BASE || 'http://127.0.0.1:8123/gemini-handbook/';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const screenshots = 'gemini-handbook/qa';
await mkdir(screenshots, { recursive: true });
let checks = 0;
function assert(ok, msg) { checks += 1; if (!ok) throw new Error('QA FAILED: ' + msg); }
async function run(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('JS ' + error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push('Console ' + message.text()); });
  const r = await page.goto(base, { waitUntil: 'networkidle' });
  assert(r?.status() === 200, `home page HTTP 200 at ${width}`);
  assert((await page.title()).includes('Gemini'), 'SEO title');
  assert(await page.locator('.lesson').count() === 18, '18 modules are rendered');
  assert(await page.locator('.prompt-card').count() === 32, '32 prompt cards are rendered');
  assert(await page.locator('.path-card').count() === 5, '5 path cards are rendered');
  assert(await page.locator('.day7').count() === 7, '7 daily checkboxes are rendered');
  assert(await page.locator('[data-role="day30"]').count() === 30, '30-day roadmap is rendered');
  assert(await page.locator('#resource-list a').count() === 12, '12 source links exist');
  await page.screenshot({ path: join(screenshots, 'home-' + width + '.png'), fullPage: true });
  const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  assert(overflow.scroll <= overflow.viewport + 1, `horizontal overflow on ${width}px: ${JSON.stringify(overflow)}`);

  await page.locator('#lesson-search').fill('Deep Research');
  const lessonCount = await page.locator('.lesson').count();
  assert(lessonCount > 0 && lessonCount < 18, 'lesson keyword search');
  await page.locator('#lesson-search').fill('');
  assert(await page.locator('.lesson').count() === 18, 'lesson search reset');

  await page.locator('[data-role="lesson-filter"][data-group="研究"]').click();
  const filtered = await page.locator('.lesson').count();
  assert(filtered > 0 && filtered < 18, 'lesson category filter');
  await page.locator('[data-role="lesson-filter"][data-group="全部"]').click();

  await page.locator('#prompt-search').fill('求职');
  assert(await page.locator('.prompt-card').count() > 0, 'prompt search');
  await page.locator('#prompt-search').fill('');
  await page.locator('#prompt-category').selectOption('内容');
  assert((await page.locator('.prompt-card').count()) > 0, 'prompt category filter');
  await page.locator('#prompt-category').selectOption('all');
  assert(await page.locator('.prompt-card').count() === 32, 'prompt category reset');

  await page.locator('[data-role="copy-prompt"]').first().click();
  const clip = await page.evaluate(async () => navigator.clipboard.readText());
  assert(clip.includes('【任务目标】') && clip.includes('【验收标准】') && clip.includes('【结果报告】'), 'copy renders complete safe task protocol');

  await page.locator('[data-role="path"][data-path="founder"]').click();
  assert(await page.locator('[data-role="path"][data-path="founder"]').getAttribute('aria-pressed') === 'true', 'founder path activation');
  assert((await page.locator('#path-result').innerText()).includes('创业者'), 'recommended path content');

  await page.locator('.day7 input[data-day="0"]').check();
  assert((await page.locator('#progress-percent').innerText()).trim() === '14%', '7-day checkbox progress');
  await page.reload({waitUntil:'networkidle'});
  assert(await page.locator('.day7 input[data-day="0"]').isChecked(), 'local progress persisted on reload');

  await page.locator('[data-role="day30"][data-day30="30"]').click();
  assert((await page.locator('#day30-detail').innerText()).includes('第30天'), '30-day task detail');
  await page.locator('.lesson').first().locator('summary').click();
  assert(await page.locator('.lesson').first().getAttribute('open') !== null, 'lesson expands');

  const print = await page.request.get(new URL('print.html', base));
  assert(print.status() === 200 && (await print.text()).includes('print-root'), 'print version responds');
  const data = await page.request.get(new URL('data.js', base));
  assert(data.status() === 200 && (await data.text()).includes('window.GEMINI_GUIDE'), 'source content responds');
  const pdfUrl = page.locator('a[download][href$=".pdf"]').first();
  assert(await pdfUrl.count() > 0, 'PDF download link exists');

  assert(errors.length === 0, 'browser errors: ' + errors.slice(0, 5).join('; '));
  await context.close();
}
try {
  await run(390, 844);
  await run(1280, 900);
  await run(360, 760);
  console.log(JSON.stringify({ok:true,checks,viewports:[390,1280,360],screenshots}, null, 2));
} finally { await browser.close(); }
