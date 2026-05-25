import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = resolve('docs/img');

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'pt-BR',
});
const page = await context.newPage();

async function shot(name) {
  const path = resolve(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`✓ ${name}.png`);
}

console.log('1/4 — Seletor de assuntos');
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.subject-grid');
await page.waitForTimeout(500);
await shot('01-seletor-assuntos');

console.log('2/4 — Modo perguntas personalizadas (uploader)');
await page.getByRole('button', { name: /Perguntas Personalizadas/i }).click();
await page.waitForSelector('.subject-modal h2:has-text("Perguntas Personalizadas")');
await page.waitForTimeout(500);
await shot('02-upload-personalizado');

console.log('3/4 — Tabuleiro (após escolher assunto Geografia)');
await page.getByRole('button', { name: /Voltar aos assuntos/i }).click();
await page.waitForSelector('.subject-grid');
await page.getByRole('button', { name: /Geografia/i }).click();
await page.getByRole('button', { name: /Começar Jogo/i }).click();
await page.waitForSelector('.game-container');
await page.waitForTimeout(1200);
await shot('03-tabuleiro');

console.log('4/4 — Quiz overlay com pergunta');
await page.locator('button.dice').click({ force: true });
// Dice has a ~1600ms roll animation before "Ver Pergunta" appears
await page.waitForSelector('.show-question-button', { timeout: 10000 });
await page.getByRole('button', { name: /Ver Pergunta/i }).click();
await page.waitForSelector('.quiz-overlay .quiz', { timeout: 5000 });
await page.waitForTimeout(400);
await shot('04-quiz');

await browser.close();
console.log('\nDone. Screenshots em docs/img/');
