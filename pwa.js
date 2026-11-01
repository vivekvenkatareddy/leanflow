(()=>{
'use strict';
const badge=document.getElementById('offline-badge'),message=document.getElementById('offline-status'),download=document.getElementById('download-offline'),progress=document.getElementById('offline-progress'),install=document.getElementById('install-app'),help=document.getElementById('install-help');
let registration=null,installPrompt=null,busy=false;
// Load only cards near the viewport; every GIF remains available in the offline catalog.
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const img=entry.target;if(img.dataset.src&&!img.hasAttribute('src'))img.src=img.dataset.src}},{rootMargin:'250px'});
document.querySelectorAll('.exercise-gif-panel img').forEach(img=>observer.observe(img));
function send(type){return new Promise((resolve,reject)=>{const controller=navigator.serviceWorker.controller||registration?.active;if(!controller){reject(Error('App setup is still finishing. Please try again.'));return}const channel=new MessageChannel();const timer=setTimeout(()=>reject(Error('Download took too long. Keep this page open and try again.')),type==='CACHE_ALL'?600000:15000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data)};controller.postMessage({type},[channel.port2])})}
function render(data){
 if(!data.ok){message.textContent='Offline setup is incomplete. Stay online and try saving the demos again.';download.disabled=false;return}
 progress.max=data.total;progress.value=data.completed;progress.hidden=data.completed===0||data.ready;
 if(data.ready){badge.textContent='Ready offline ✓';message.textContent='All 45 demonstrations are saved on this device. You can now work out offline.';download.textContent='All demos saved ✓';download.disabled=true}
 else{badge.textContent='Install & offline setup';message.textContent=`${data.completed} of ${data.total} demonstrations saved. Full offline download is about 50 MB. Keep this page open while saving.`;download.textContent='Save all 45 demos offline';download.disabled=busy}
}
async function check(){if(!registration||busy)return;try{render(await send('OFFLINE_STATUS'))}catch{message.textContent='Finishing app setup. Keep this page open for a moment.'}}
if('serviceWorker' in navigator&&window.isSecureContext){
 navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='OFFLINE_PROGRESS'){progress.hidden=false;progress.max=event.data.total;progress.value=event.data.completed;message.textContent=`Saving demonstrations: ${event.data.completed} of ${event.data.total}. Keep this page open.`}if(event.data?.type==='OFFLINE_ERROR'){message.textContent='Download paused. Your saved demos are safe; reconnect and try again.';download.disabled=false}});
 navigator.serviceWorker.addEventListener('controllerchange',()=>check());
 navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(async reg=>{registration=reg;await navigator.serviceWorker.ready;await check()}).catch(()=>{message.textContent='Offline setup could not start. Check your connection and reload.';download.disabled=true});
}else{message.textContent='Open the hosted HTTPS link to install LeanFlow and save it offline.';download.disabled=true}
download.addEventListener('click',async()=>{
 if(busy)return;busy=true;download.disabled=true;message.textContent='Starting offline download…';progress.hidden=false;
 try{if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});const data=await send('CACHE_ALL');busy=false;render(data)}
 catch(error){busy=false;download.disabled=false;message.textContent=error.message+' Previously saved demos are kept.'}
});
window.addEventListener('online',()=>check());window.addEventListener('focus',()=>check());
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;install.textContent='Install LeanFlow'});
install.addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}else help.hidden=!help.hidden});
function installed(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
if(installed()){install.textContent='Installed ✓';install.disabled=true}
window.addEventListener('appinstalled',()=>{installPrompt=null;install.textContent='Installed ✓';install.disabled=true});
const input=document.getElementById('choices-file');document.getElementById('import-choices').addEventListener('click',()=>input.click());
input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;try{const text=await file.text();let data;if(text.trim().startsWith('{'))data=JSON.parse(text);else{const match=text.match(/<script\b[^>]*\bid=["']leanflow-defaults["'][^>]*>([\s\S]*?)<\/script>/i);if(!match)throw Error('No saved LeanFlow choices found');data=JSON.parse(match[1])}window.dispatchEvent(new CustomEvent('leanflow-import',{detail:data}))}catch{document.querySelectorAll('.save-status').forEach(e=>e.textContent='Could not read this file. Choose a LeanFlow choices JSON or a saved-defaults HTML file.')}finally{input.value=''}});
})();
