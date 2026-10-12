import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');let errors=[];let pages=[];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else if(e.name.endsWith('.html'))pages.push(f);}}
await walk(root);
for(const f of pages){const html=await readFile(f,'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)errors.push(`${f}: duplicate IDs`);for(const m of html.matchAll(/(?:href|src|poster)="([^"#]+)"/g)){const s=m[1];if(!s.startsWith('/'))continue;const [p,hash]=s.split('#');const target=path.join(root,p);try{const t=await stat(target);if(t.isDirectory())await stat(path.join(target,'index.html'));if(hash&&p==='/'){const home=await readFile(path.join(root,'index.html'),'utf8');if(!home.includes(`id="${hash}"`))errors.push(`Invalid homepage anchor: ${s}`);}}catch{errors.push(`Missing file: ${s} in ${f}`);}}if(!html.includes('<h1>'))errors.push(`${f}: missing H1`);if(!html.includes('name="description"'))errors.push(`${f}: missing description`);}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`Checked ${pages.length} HTML pages: links, local assets, unique IDs, headings, and metadata.`);
