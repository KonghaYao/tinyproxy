import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("https://juejin.cn/post/7222996459833622565");
const c = await page.content();
console.log(c);
await browser.close();
