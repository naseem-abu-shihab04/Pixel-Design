// Render post.html to a 1600x1200 PNG: node render.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
  await p.goto('file://' + __dirname + '/post.html', { waitUntil: 'load', timeout: 120000 });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: __dirname + '/clasico-post.png' });
  await b.close();
})();
