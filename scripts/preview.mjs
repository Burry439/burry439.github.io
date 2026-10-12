import {createServer} from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.mp4':'video/mp4','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain'};
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let info=await stat(file);if(info.isDirectory()){file=path.join(file,'index.html');info=await stat(file);}
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);let start=0,end=info.size-1,status=200;
  if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
  headers['Content-Length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(Number(process.env.PORT)||4174,'127.0.0.1',()=>console.log(`Portfolio preview: http://127.0.0.1:${process.env.PORT||4174}`));
