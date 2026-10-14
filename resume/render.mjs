// Render resume/resume.html to the PDF linked from the site. Needs Playwright:
// PLAYWRIGHT_PACKAGE=<path to a package.json whose node_modules has @playwright/test>.
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{});
const page=await browser.newPage();
await page.goto(pathToFileURL(resolve('resume/resume.html')).href,{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
const output=resolve('public/Baruch_Weinstein_Resume.pdf');
await page.pdf({path:output,format:'A4',preferCSSPageSize:true,printBackground:true});
if(process.argv.includes('--preview')){await page.setViewportSize({width:794,height:1123});await page.emulateMedia({media:'print'});await page.screenshot({path:resolve('qa/resume-preview.png'),fullPage:true});}
await browser.close();
const pages=((await readFile(output,'latin1')).match(/\/Type\s*\/Page[^s]/g)||[]).length;
console.log(`Résumé: ${output} (${pages} page${pages===1?'':'s'})`);
if(pages!==1)process.exit(1);
