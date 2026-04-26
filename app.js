const VERSION="v6";
const resetScreen=document.getElementById("resetScreen");

async function hardResetOldServiceWorkerOnce(){
  const key="final-countdown-reset-v6-done";
  if(localStorage.getItem(key)==="yes") return;
  resetScreen.hidden=false;
  try{
    if("serviceWorker" in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
    if("caches" in window){
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
  }catch(e){}
  localStorage.setItem(key,"yes");
  location.replace(location.pathname+"?fresh=v6");
}

hardResetOldServiceWorkerOnce();

const STORAGE_KEY="final-countdown-pro-v6";
const list=document.getElementById("countdownList");
const emptyState=document.getElementById("emptyState");
const dialog=document.getElementById("countdownDialog");
const form=document.getElementById("countdownForm");
const addBtn=document.getElementById("addBtn");
const cancelBtn=document.getElementById("cancelBtn");
const dialogTitle=document.getElementById("dialogTitle");
const titleInput=document.getElementById("titleInput");
const dateInput=document.getElementById("dateInput");
const timeInput=document.getElementById("timeInput");
const categoryInput=document.getElementById("categoryInput");

let countdowns=loadCountdowns(), editingId=null;

function loadCountdowns(){
  const saved=localStorage.getItem(STORAGE_KEY);
  if(saved) return JSON.parse(saved);
  return [
    {id:crypto.randomUUID(),title:"vakantie",category:"vakantie",target:"2026-05-13T16:00:00"},
    {id:crypto.randomUUID(),title:"verjaardag",category:"verjaardag",target:"2026-09-11T16:00:00"}
  ];
}
function saveCountdowns(){localStorage.setItem(STORAGE_KEY,JSON.stringify(countdowns))}
function pad(n){return String(Math.max(0,n)).padStart(2,"0")}
function formatDateTime(target){
  return new Intl.DateTimeFormat("nl-NL",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(target)).replace(".","");
}
function calculate(target){
  let diff=Math.max(0,new Date(target).getTime()-Date.now());
  const days=Math.floor(diff/86400000); diff%=86400000;
  const hours=Math.floor(diff/3600000); diff%=3600000;
  const minutes=Math.floor(diff/60000); diff%=60000;
  const seconds=Math.floor(diff/1000);
  return {days,hours,minutes,seconds,finished:new Date(target).getTime()<=Date.now()};
}
function timerUnit(label,value){
  const shown=label==="DAGEN"?String(value).padStart(3,"0"):pad(value);
  return `<div class="unit"><div class="label">${label}</div><div class="digits">${shown}</div></div>`;
}
function escapeHtml(t){return t.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function render(){
  list.innerHTML="";
  emptyState.style.display=countdowns.length?"none":"block";
  [...countdowns].sort((a,b)=>new Date(a.target)-new Date(b.target)).forEach(item=>{
    const time=calculate(item.target);
    const card=document.createElement("article");
    card.className=`card ${time.finished?"finished":""}`;
    card.dataset.id=item.id;
    card.innerHTML=`<section class="display"><div class="card-head"><div class="card-title">${escapeHtml(item.title)}</div><div class="card-icons">⏰↩⌃</div></div><div class="timer">${timerUnit("DAGEN",time.days)}${timerUnit("UUR",time.hours)}${timerUnit("MIN",time.minutes)}${timerUnit("SEC",time.seconds)}</div></section><footer class="card-foot"><span>${formatDateTime(item.target)}</span><div class="actions"><button class="action-btn" data-edit="${item.id}">✎</button><button class="action-btn" data-delete="${item.id}">🗑</button></div></footer>`;
    list.appendChild(card);
  });
}
function openDialog(item=null){
  editingId=item?.id??null;
  dialogTitle.textContent=item?"Countdown bewerken":"Nieuwe countdown";
  titleInput.value=item?.title??"";
  categoryInput.value=item?.category??"vakantie";
  if(item){const d=new Date(item.target);dateInput.value=d.toISOString().slice(0,10);timeInput.value=d.toTimeString().slice(0,5)}
  else{const tomorrow=new Date(Date.now()+86400000);dateInput.value=tomorrow.toISOString().slice(0,10);timeInput.value="16:00"}
  dialog.showModal(); titleInput.focus();
}
addBtn.onclick=()=>openDialog();
cancelBtn.onclick=()=>dialog.close();
form.onsubmit=e=>{e.preventDefault();const data={id:editingId??crypto.randomUUID(),title:titleInput.value.trim(),category:categoryInput.value,target:`${dateInput.value}T${timeInput.value}:00`};countdowns=editingId?countdowns.map(i=>i.id===editingId?data:i):[...countdowns,data];saveCountdowns();dialog.close();render()};

const detailDialog=document.getElementById("detailDialog");
const detailContent=document.getElementById("detailContent");
let activeDetailId=null;
function decimalComma(v,d=1){return v.toFixed(d).replace(".",",")}
function workdaysBetween(s,e){let c=0,d=new Date(s),end=new Date(e);d.setHours(0,0,0,0);end.setHours(0,0,0,0);while(d<end){const day=d.getDay();if(day!==0&&day!==6)c++;d.setDate(d.getDate()+1)}return c}
function detailStats(target){const now=new Date(),end=new Date(target),diff=Math.max(0,end-now),days=diff/86400000;return{years:decimalComma(days/365.2425),months:decimalComma(days/30.436875),weeks:decimalComma(days/7),days:decimalComma(days),workdays:decimalComma(workdaysBetween(now,end)),hours:Math.floor(diff/3600000),minutes:Math.floor(diff/60000),seconds:Math.floor(diff/1000),milliseconds:diff}}
function openDetail(id){activeDetailId=id;renderDetail();detailDialog.showModal()}
function renderDetail(){
 if(!activeDetailId||!detailDialog.open)return; const item=countdowns.find(c=>c.id===activeDetailId); if(!item){detailDialog.close();return}
 const time=calculate(item.target),s=detailStats(item.target);
 detailContent.innerHTML=`<article class="detail-count-card ${time.finished?"finished":""}"><div class="card-head"><div class="card-title">${escapeHtml(item.title)}</div><div class="card-icons">⏰↩⌃</div></div><div class="timer">${timerUnit("DAGEN",time.days)}${timerUnit("UUR",time.hours)}${timerUnit("MIN",time.minutes)}${timerUnit("SEC",time.seconds)}</div></article><div class="detail-date">${formatDateTime(item.target)}</div><section class="stats"><div class="stat-row"><span class="stat-label">JAREN</span><span class="stat-value">${s.years}</span></div><div class="stat-row"><span class="stat-label">MAANDEN</span><span class="stat-value">${s.months}</span></div><div class="stat-row"><span class="stat-label">WEKEN</span><span class="stat-value">${s.weeks}</span></div><div class="stat-row"><span class="stat-label">DAGEN</span><span class="stat-value">${s.days}</span></div><div class="stat-row"><span class="stat-label workdays">Werkdagen</span><span class="stat-value">${s.workdays}</span></div><div class="stat-row"><span class="stat-label">UREN</span><span class="stat-value">${s.hours}</span></div><div class="stat-row stat-strip"><span class="stat-label">MINUTEN</span><span class="stat-value">${s.minutes}</span></div><div class="stat-row stat-strip"><span class="stat-label">SECONDEN</span><span class="stat-value">${s.seconds}</span></div><div class="stat-row stat-strip"><span class="stat-label">MILLISECONDS</span><span class="stat-value">${s.milliseconds}</span></div></section>`;
}
list.addEventListener("click",e=>{if(e.target.dataset.edit){openDialog(countdowns.find(c=>c.id===e.target.dataset.edit));return}if(e.target.dataset.delete){countdowns=countdowns.filter(c=>c.id!==e.target.dataset.delete);saveCountdowns();render();return}const card=e.target.closest(".card");if(card)openDetail(card.dataset.id)});
document.getElementById("backDetailBtn").onclick=()=>detailDialog.close();
document.getElementById("detailEditBtn").onclick=()=>{const item=countdowns.find(c=>c.id===activeDetailId);detailDialog.close();if(item)openDialog(item)};
document.getElementById("detailShareBtn").onclick=async()=>{const item=countdowns.find(c=>c.id===activeDetailId);if(!item)return;const text=`${item.title} - countdown tot ${formatDateTime(item.target)}`;if(navigator.share)await navigator.share({title:"Final Countdown",text}).catch(()=>{});else navigator.clipboard.writeText(text)};
document.getElementById("detailPeopleBtn").onclick=()=>alert("Delen met personen kan later aan WhatsApp worden gekoppeld.");
document.getElementById("menuBtn").onclick=()=>alert("Final Countdown PRO v6");

const installBtn=document.getElementById("installBtn");
const installHelpBtn=document.getElementById("installHelpBtn");
const installStatus=document.getElementById("installStatus");
const helpDialog=document.getElementById("helpDialog");
const closeHelp=document.getElementById("closeHelp");
const debugText=document.getElementById("debugText");
let deferredInstallPrompt=null;

function standalone(){return window.matchMedia("(display-mode: standalone)").matches}
function setStatus(t){installStatus.textContent=t;if(debugText)debugText.textContent=t}

window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  installBtn.hidden=false;
  setStatus("Klaar om te installeren.");
});
installBtn.onclick=async()=>{
  if(!deferredInstallPrompt){setStatus("Chrome heeft de installatieprompt nog niet vrijgegeven. Gebruik menu > App installeren.");return}
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice.catch(()=>{});
  deferredInstallPrompt=null;
  installBtn.hidden=true;
};
installHelpBtn.onclick=()=>{debugText.textContent=installStatus.textContent;helpDialog.showModal()};
closeHelp.onclick=()=>helpDialog.close();

window.addEventListener("appinstalled",()=>{installBtn.hidden=true;installHelpBtn.hidden=true;setStatus("App is geïnstalleerd.")});

(async()=>{
  render();
  setInterval(render,1000); setInterval(renderDetail,100);
  if("serviceWorker" in navigator){
    try{
      const reg=await navigator.serviceWorker.register("./sw.js?v=6",{scope:"./"});
      await navigator.serviceWorker.ready;
      setStatus(standalone()?"App draait geïnstalleerd.":"Service worker actief. Wacht kort op installatieknop of gebruik Chrome-menu.");
    }catch(e){setStatus("Service worker fout: "+e.message)}
  }else setStatus("Deze browser ondersteunt geen service worker.");
})();
