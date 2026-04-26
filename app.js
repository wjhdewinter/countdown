const STORAGE_KEY="countdown-v7";
const $=id=>document.getElementById(id);
const list=$("countdownList"),dialog=$("countdownDialog"),form=$("countdownForm");
const titleInput=$("titleInput"),dateInput=$("dateInput"),timeInput=$("timeInput");
let editingId=null,activeDetailId=null,deferredPrompt=null;
let countdowns=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||[
{id:crypto.randomUUID(),title:"vakantie",target:"2026-05-13T16:00:00"},
{id:crypto.randomUUID(),title:"verjaardag",target:"2026-09-11T16:00:00"}];

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(countdowns))}
function pad(n){return String(Math.max(0,n)).padStart(2,"0")}
function fmt(t){return new Intl.DateTimeFormat("nl-NL",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(t)).replace(".","")}
function calc(t){let d=Math.max(0,new Date(t)-Date.now());let days=Math.floor(d/864e5);d%=864e5;let h=Math.floor(d/36e5);d%=36e5;let m=Math.floor(d/6e4);d%=6e4;let s=Math.floor(d/1e3);return{days,h,m,s}}
function unit(l,v){let x=l==="DAGEN"?String(v).padStart(3,"0"):pad(v);return`<div class="unit"><div class="label">${l}</div><div class="digits">${x}</div></div>`}
function render(){list.innerHTML="";[...countdowns].sort((a,b)=>new Date(a.target)-new Date(b.target)).forEach(item=>{let t=calc(item.target),card=document.createElement("article");card.className="card";card.dataset.id=item.id;card.innerHTML=`<section class="display"><div class="card-head"><div class="card-title">${item.title}</div><div class="card-icons">⏰↩⌃</div></div><div class="timer">${unit("DAGEN",t.days)}${unit("UUR",t.h)}${unit("MIN",t.m)}${unit("SEC",t.s)}</div></section><footer class="card-foot"><span>${fmt(item.target)}</span><div class="actions"><button class="action-btn" data-edit="${item.id}">✎</button><button class="action-btn" data-del="${item.id}">🗑</button></div></footer>`;list.appendChild(card)})}
function openForm(item=null){editingId=item?.id||null;titleInput.value=item?.title||"";if(item){let d=new Date(item.target);dateInput.value=d.toISOString().slice(0,10);timeInput.value=d.toTimeString().slice(0,5)}else{let d=new Date(Date.now()+864e5);dateInput.value=d.toISOString().slice(0,10);timeInput.value="16:00"}dialog.showModal()}
$("addBtn").onclick=()=>openForm();$("cancelBtn").onclick=()=>dialog.close();
form.onsubmit=e=>{e.preventDefault();let data={id:editingId||crypto.randomUUID(),title:titleInput.value,target:`${dateInput.value}T${timeInput.value}:00`};countdowns=editingId?countdowns.map(i=>i.id===editingId?data:i):[...countdowns,data];save();dialog.close();render()};
function comma(v){return v.toFixed(1).replace(".",",")}
function workdays(s,e){let c=0,d=new Date(s),end=new Date(e);d.setHours(0,0,0,0);end.setHours(0,0,0,0);while(d<end){let day=d.getDay();if(day&&day!==6)c++;d.setDate(d.getDate()+1)}return c}
function detail(id){activeDetailId=id;let item=countdowns.find(x=>x.id===id),t=calc(item.target),diff=Math.max(0,new Date(item.target)-Date.now()),days=diff/864e5; $("detailContent").innerHTML=`<article class="detail-count-card"><div class="card-head"><div class="card-title">${item.title}</div><div class="card-icons">⏰↩⌃</div></div><div class="timer">${unit("DAGEN",t.days)}${unit("UUR",t.h)}${unit("MIN",t.m)}${unit("SEC",t.s)}</div></article><div class="detail-date">${fmt(item.target)}</div><section class="stats">${[["JAREN",comma(days/365.2425)],["MAANDEN",comma(days/30.436875)],["WEKEN",comma(days/7)],["DAGEN",comma(days)],["Werkdagen",comma(workdays(new Date(),new Date(item.target)))],["UREN",Math.floor(diff/36e5)],["MINUTEN",Math.floor(diff/6e4)],["SECONDEN",Math.floor(diff/1e3)],["MILLISECONDS",diff]].map((r,i)=>`<div class="stat-row ${i>5?"stat-strip":""}"><span class="stat-label">${r[0]}</span><span class="stat-value">${r[1]}</span></div>`).join("")}</section>`;$("detailDialog").showModal()}
list.onclick=e=>{if(e.target.dataset.edit){openForm(countdowns.find(x=>x.id===e.target.dataset.edit));return}if(e.target.dataset.del){countdowns=countdowns.filter(x=>x.id!==e.target.dataset.del);save();render();return}let c=e.target.closest(".card");if(c)detail(c.dataset.id)}
$("backDetailBtn").onclick=()=>$("detailDialog").close();$("detailEditBtn").onclick=()=>{let item=countdowns.find(x=>x.id===activeDetailId);$("detailDialog").close();openForm(item)};$("detailShareBtn").onclick=()=>navigator.share?.({title:"Final Countdown",text:"Countdown"}) ;
$("menuBtn").onclick=()=>alert("Gebruik Chrome-menu ⋮ → App installeren als de knop niet verschijnt.");
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false;$("installStatus").textContent="Klaar om te installeren."});
$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true}};
if("serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js",{scope:"./"}).then(()=>{$("installStatus").textContent="Installatie klaar. Gebruik knop of Chrome-menu ⋮."}).catch(e=>{$("installStatus").textContent="Installatie fout: "+e.message})}
render();setInterval(render,1000);setInterval(()=>{if(activeDetailId&&$("detailDialog").open)detail(activeDetailId)},1000);
