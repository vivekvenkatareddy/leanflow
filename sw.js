'use strict';
const SHELL='leanflow-shell-d06b209c6460',MEDIA='leanflow-media-v1';
const path=p=>new URL(p,self.registration.scope).href;
const shellFiles=['./index.html','./styles.css','./app.js','./pwa.js','./manifest.webmanifest','./offline-assets.json','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png','./assets/apple-touch-icon.png'];
let downloadTask=null;
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(SHELL);await cache.addAll(shellFiles.map(p=>new Request(path(p),{cache:'reload'})));await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('leanflow-shell-')&&key!==SHELL)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(url.pathname.endsWith('/sw.js'))return;
 event.respondWith((async()=>{
  if(event.request.mode==='navigate'){const shell=await caches.open(SHELL);return await shell.match(path('./index.html'))||fetch(event.request)}
  const isGif=url.pathname.endsWith('.gif'),cache=await caches.open(isGif?MEDIA:SHELL),cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;
  const response=await fetch(event.request);if(response.ok&&isGif){try{await cache.put(event.request,response.clone())}catch{/* The online response stays usable if the device is out of storage. */}}return response;
 })());
});
async function assetUrls(){const cache=await caches.open(SHELL),response=await cache.match(path('./offline-assets.json'));if(!response)throw Error('App setup is not yet cached');return (await response.json()).map(path)}
async function stats(){const urls=await assetUrls(),cache=await caches.open(MEDIA);let completed=0;for(const url of urls)if(await cache.match(url))completed++;return {completed,total:urls.length,ready:completed===urls.length}}
async function broadcast(value){for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))client.postMessage(value)}
async function download(){
 const urls=await assetUrls(),cache=await caches.open(MEDIA);let completed=0,index=0;
 for(const url of urls)if(await cache.match(url))completed++;
 await broadcast({type:'OFFLINE_PROGRESS',completed,total:urls.length});
 const missing=[];for(const url of urls)if(!await cache.match(url))missing.push(url);
 async function worker(){while(index<missing.length){const url=missing[index++],response=await fetch(new Request(url,{cache:'reload'}));if(!response.ok)throw Error('A demonstration could not download');await cache.put(url,response);completed++;await broadcast({type:'OFFLINE_PROGRESS',completed,total:urls.length})}}
 const results=await Promise.allSettled([worker(),worker(),worker()]);const failure=results.find(r=>r.status==='rejected');if(failure)throw failure.reason;
 return stats();
}
self.addEventListener('message',event=>{
 const port=event.ports&&event.ports[0];
 if(event.data?.type==='OFFLINE_STATUS')event.waitUntil(stats().then(data=>port?.postMessage({ok:true,...data})).catch(()=>port?.postMessage({ok:false})));
 if(event.data?.type==='CACHE_ALL')event.waitUntil((async()=>{
  if(!downloadTask)downloadTask=download().finally(()=>{downloadTask=null});
  try{const data=await downloadTask;port?.postMessage({ok:true,...data})}
  catch(error){port?.postMessage({ok:false,error:error.message});await broadcast({type:'OFFLINE_ERROR'})}
 })());
});
