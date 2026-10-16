import { chromium } from 'playwright';

const target = process.argv[2];
const screenshotPath = process.argv[3] || 'learning-cabin-check.png';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
const errors = [];

page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});

await page.goto(target, { waitUntil: 'networkidle' });

const styles = await page.evaluate(() => {
  const body = getComputedStyle(document.body);
  const app = document.querySelector('#root > div');
  return {
    rootChildren: document.querySelector('#root')?.children.length || 0,
    bodyBg: body.backgroundColor,
    appBg: app ? getComputedStyle(app).backgroundColor : null
  };
});

const mainText = await page.locator('body').innerText();
await page.screenshot({ path: screenshotPath, fullPage: false });
await browser.close();

const result = {
  styles,
  hasPodcast: /Podcast|播客|speech/i.test(mainText),
  hasNotebook: /Jupyter|Notebook|ipynb/i.test(mainText),
  hasSlides: /Slide|投影片|幻燈片/i.test(mainText),
  errors
};

console.log(JSON.stringify(result, null, 2));

if (styles.rootChildren !== 1 || errors.length > 0) {
  process.exit(1);
}
