const VERSION = '2.1-share-fixed';
const STORAGE_KEY = 'finalCountdown.items.v2';
const $ = (id) => document.getElementById(id);
let items = [];
let editId = null;

function uid(){
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}
function defaultItems(){
  const local = '2026-05-16T10:50';
  return [{ id: uid(), title:'vakantie', place:'Hurghada', hotel:'Moreno Horizon', targetLocal: local, targetMs: localToMs(local) }];
}
function localToMs(localValue){ return new Date(localValue).getTime(); }
function getTargetMs(item){
  if (Number.isFinite(item.targetMs)) return item.targetMs;
  if (item.targetDate) return new Date(item.targetDate).getTime();
  if (item.targetLocal) return new Date(item.targetLocal).getTime();
  return Date.now();
}
function load(){
  const shared = readSharedFromUrl();
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  items = Array.isArray(saved) && saved.length ? saved : defaultItems();
  items = items.map(normalizeItem);
  if (shared) {
    items.unshift({ id: uid(), ...shared });
    save(false);
    history.replaceState(null, '', location.pathname);
    toast('Gedeelde countdown geopend. De timer loopt nu live door.');
  }
}
function normalizeItem(item){
  const targetMs = getTargetMs(item);
  return {
    id: item.id || uid(),
    title: item.title || 'Countdown',
    place: item.place || '',
    hotel: item.hotel || '',
    targetLocal: item.targetLocal || toDatetimeLocal(targetMs),
    targetMs
  };
}
function save(renderNow=true){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(normalizeItem)));
  if(renderNow) render();
}
function toDatetimeLocal(ms){
  const d = new Date(ms);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0,16);
}
function diffParts(targetMs){
  const diff = targetMs - Date.now();
  const safe = Math.max(0, diff);
  return {
    days: Math.floor(safe / 86400000),
    hours: Math.floor(safe / 3600000) % 24,
    minutes: Math.floor(safe / 60000) % 60,
    seconds: Math.floor(safe / 1000) % 60,
    done: diff <= 0
  };
}
function pad(n, len=2){ return String(n).padStart(len, '0'); }
function escapeHtml(v){
  return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function formatDate(ms){
  const d = new Date(ms);
  return d.toLocaleDateString('nl-NL', {day:'numeric', month:'long', year:'numeric'}) + ',<br>' +
         d.toLocaleTimeString('nl-NL', {hour:'2-digit', minute:'2-digit'});
}
function render(){
  const list = $('list');
  if(!items.length){
    list.innerHTML = '<section class="countCard empty">Geen countdowns. Druk op + om er één te maken.</section>';
    return;
  }
  list.innerHTML = items.map(item => {
    const targetMs = getTargetMs(item);
    const d = diffParts(targetMs);
    return `<section class="countCard" data-id="${item.id}">
      <div class="display">
        <div class="displayTop">
          <div class="displayTitle">✈️ ${escapeHtml(item.title)}</div>
          <div class="displayIcons">⏰ ↩ ^</div>
        </div>
        <div class="meta">📍 ${escapeHtml(item.place || '-') }<br>🏨 ${escapeHtml(item.hotel || '-')}</div>
        <div class="timer">
          <div class="part"><label>DAGEN</label><div class="num">${pad(d.days,3)}</div></div>
          <div class="part"><label>UUR</label><div class="num">${pad(d.hours)}</div></div>
          <div class="part"><label>MIN</label><div class="num">${pad(d.minutes)}</div></div>
          <div class="part"><label>SEC</label><div class="num">${pad(d.seconds)}</div></div>
        </div>
      </div>
      <div class="bottom">
        <div class="dateText">${formatDate(targetMs)}</div>
        <div class="btnGrid">
          <button class="smallBtn" onclick="shareItem('${item.id}')" title="Delen">📲<span>Delen</span></button>
          <button class="smallBtn" onclick="editItem('${item.id}')" title="Datum wijzigen">📅<span>Datum</span></button>
          <button class="smallBtn" onclick="editItem('${item.id}')" title="Bewerken">✎<span>Edit</span></button>
          <button class="smallBtn trash" onclick="deleteItem('${item.id}')" title="Verwijderen">🗑️<span>Wis</span></button>
        </div>
      </div>
    </section>`;
  }).join('');
}
function shareData(item){
  return {
    v: 2,
    title: item.title,
    place: item.place,
    hotel: item.hotel,
    targetMs: getTargetMs(item),
    targetLocal: item.targetLocal
  };
}
function encodeShare(data){
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodeShare(s){
  s = s.replace(/-/g,'+').replace(/_/g,'/');
  while(s.length % 4) s += '=';
  return JSON.parse(decodeURIComponent(escape(atob(s))));
}
function shareUrl(item){ return `${location.origin}${location.pathname}?c=${encodeShare(shareData(item))}`; }
function readSharedFromUrl(){
  const c = new URLSearchParams(location.search).get('c');
  if(!c) return null;
  try { return normalizeItem(decodeShare(c)); } catch(e) { return null; }
}
async function shareItem(id){
  const item = items.find(x => x.id === id);
  if(!item) return;
  const url = shareUrl(item);
  const text = `✈️ ${item.title}\n📍 ${item.place || '-'}\n🏨 ${item.hotel || '-'}\nVertrek: ${new Date(getTargetMs(item)).toLocaleString('nl-NL')}\n\nOpen live countdown:\n${url}`;
  try{
    if(navigator.share){
      await navigator.share({ title: `Countdown: ${item.title}`, text, url });
    } else if(navigator.clipboard){
      await navigator.clipboard.writeText(text);
      toast('Deeltekst gekopieerd. Plak hem in WhatsApp.');
    } else {
      prompt('Kopieer deze link:', url);
    }
  } catch(e) {}
}
function openEditor(item={}){
  editId = item.id || null;
  $('titleInput').value = item.title || '';
  $('placeInput').value = item.place || '';
  $('hotelInput').value = item.hotel || '';
  $('dateInput').value = item.targetLocal || toDatetimeLocal(getTargetMs(item));
  $('editor').showModal();
}
function editItem(id){ openEditor(items.find(x => x.id === id)); }
function deleteItem(id){
  if(confirm('Countdown verwijderen?')){
    items = items.filter(x => x.id !== id);
    save();
  }
}
function toast(message){
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2800);
}
$('addBtn').addEventListener('click', () => openEditor({ targetLocal: toDatetimeLocal(Date.now() + 86400000), targetMs: Date.now() + 86400000 }));
$('editorForm').addEventListener('submit', (e) => {
  if(e.submitter?.value === 'cancel') return;
  e.preventDefault();
  const local = $('dateInput').value;
  if(!local){ toast('Kies eerst datum en tijd.'); return; }
  const data = {
    title: $('titleInput').value.trim() || 'Countdown',
    place: $('placeInput').value.trim(),
    hotel: $('hotelInput').value.trim(),
    targetLocal: local,
    targetMs: localToMs(local)
  };
  if(editId) items = items.map(x => x.id === editId ? { ...x, ...data } : x);
  else items.unshift({ id: uid(), ...data });
  save();
  $('editor').close();
});
load();
render();
setInterval(render, 1000);
