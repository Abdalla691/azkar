/**
 * ADHKAR APP — script.js
 *
 * CHANGE FROM PREVIOUS VERSION:
 *   Data is no longer embedded in this file.
 *   It is now loaded from adhkar.json via fetch().
 *
 * ⚠️  IMPORTANT — fetch() requires a real server:
 *   Works:  VS Code Live Server, python -m http.server, any web host
 *   Fails:  Opening index.html by double-clicking (file:// URL)
 *   Reason: Browsers block fetch() on file:// for security reasons.
 *
 * All other logic (counters, tap, reset, stats, SVG ring) is unchanged.
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   DATA — loaded from adhkar.json at boot.
   This variable starts empty and is filled by fetchData().
   Everything else in the file reads from this variable exactly
   the same way as before — no other code needed to change.
   ═══════════════════════════════════════════════════════════════ */
let ADHKAR_DATA = {};   // ← was a big const object; now starts empty

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */

let currentTab    = 'morning';
let counters      = {};
const STORAGE_KEY = 'adhkar_v4';
const RING_CIRC   = 2 * Math.PI * 34;

/* ═══════════════════════════════════════════════════════════════
   BOOT — fetch the JSON first, then start the app.

   BEFORE (embedded data):
     document.addEventListener('DOMContentLoaded', function () {
       loadCounters();   // data already available
       render();
       attachListeners();
     });

   AFTER (external JSON):
     DOMContentLoaded → fetchData() → [on success] loadCounters()
                                                    render()
                                                    attachListeners()

   The rest of the app doesn't care where the data came from.
   It only reads ADHKAR_DATA[], which fetchData() fills in.
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  fetchData();          // ← replaces the direct loadCounters/render calls
});

/* ═══════════════════════════════════════════════════════════════
   FETCH DATA — load adhkar.json, store it in ADHKAR_DATA, boot.

   Path 'adhkar.json' means: same folder as index.html.
   Change it if your JSON file is in a sub-folder, e.g. 'data/adhkar.json'.

   Error handling:
   - Network/CORS error  → shows message in the card feed
   - HTTP error (404 etc.) → same
   - Invalid JSON         → same
   ═══════════════════════════════════════════════════════════════ */

function fetchData() {
  // Show a loading indicator while the file loads
  var feed = document.getElementById('cardsFeed');
  if (feed) {
    feed.innerHTML =
      '<div class="empty-state">' +
        '<span class="es-icon">⏳</span>' +
        '<p>جارٍ تحميل الأذكار…</p>' +
      '</div>';
  }

  fetch('adhkar.json')                              // 1. request the file
    .then(function (response) {
      if (!response.ok) {                           // 2. check HTTP status
        throw new Error('HTTP ' + response.status + ' — تعذّر تحميل الملف');
      }
      return response.json();                       // 3. parse JSON text → object
    })
    .then(function (data) {
      ADHKAR_DATA = data;                           // 4. store in the global variable

      // 5. Now boot exactly like the old version did
      loadCounters();
      render();
      attachListeners();
    })
    .catch(function (err) {
      // Show a friendly Arabic error in the feed
      console.error('fetchData error:', err);
      if (feed) {
        feed.innerHTML =
          '<div class="empty-state">' +
            '<span class="es-icon">❌</span>' +
            '<p>تعذّر تحميل الأذكار.<br>' +
            'تأكد من تشغيل الصفحة عبر خادم محلي (Live Server)،<br>' +
            'وأن ملف adhkar.json موجود في نفس المجلد.</p>' +
            '<small style="opacity:.6;font-size:.75rem;">' + err.message + '</small>' +
          '</div>';
      }
    });
}

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE
   ═══════════════════════════════════════════════════════════════ */

function loadCounters() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    counters = raw ? JSON.parse(raw) : {};
  } catch (_) {
    counters = {};
  }
}

function saveCounters() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counters)); }
  catch (_) {}
}

function key(tab, id)         { return tab + '_' + id; }
function getCount(tab, id)    { return counters[key(tab, id)] || 0; }
function setCount(tab, id, v) { counters[key(tab, id)] = Math.max(0, v); saveCounters(); }

/* ═══════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════ */

function render() {
  var feed = document.getElementById('cardsFeed');
  feed.innerHTML = '';

  var list = ADHKAR_DATA[currentTab];

  if (!list || list.length === 0) {
    feed.innerHTML =
      '<div class="empty-state">' +
        '<span class="es-icon">🌙</span>' +
        '<p>أذكار المساء ستُضاف قريباً إن شاء الله</p>' +
      '</div>';
    updateStats([], currentTab);
    return;
  }

  var frag = document.createDocumentFragment();
  list.forEach(function (dhikr, idx) {
    var card = buildCard(dhikr, idx);
    card.style.animationDelay = (idx * 0.04) + 's';
    frag.appendChild(card);
  });
  feed.appendChild(frag);

  updateStats(list, currentTab);
}

/* ═══════════════════════════════════════════════════════════════
   BUILD ONE CARD
   ═══════════════════════════════════════════════════════════════ */

function buildCard(dhikr, idx) {
  var current = getCount(currentTab, dhikr.id);
  var total   = dhikr.count;
  var done    = current >= total;
  var pct     = total > 0 ? Math.min(Math.round(current / total * 100), 100) : 0;

  var card = document.createElement('article');
  card.className = 'dhikr-card' + (done ? ' done' : '');

  card.dataset.id    = dhikr.id;
  card.dataset.total = total;
  card.dataset.busy  = '0';

  card.innerHTML =
    '<div class="card-header">' +
      '<span class="card-index">' + (idx + 1) + '</span>' +
      '<span class="card-title-tag">' + esc(dhikr.title) + '</span>' +
      '<span class="card-done-badge">✓ مكتمل</span>' +
    '</div>' +
    '<div class="card-body">' +
      '<p class="card-arabic">' + esc(dhikr.text) + '</p>' +
      (dhikr.source ? '<span class="card-source">📖 ' + esc(dhikr.source) + '</span>' : '') +
    '</div>' +
    (dhikr.benefit ? '<div class="card-benefit">💡 ' + esc(dhikr.benefit) + '</div>' : '') +
    '<div class="card-progress-wrap">' +
      '<div class="card-progress-header">' +
        '<span class="progress-fraction">' + current + ' / ' + total + '</span>' +
        '<span class="progress-label-text">' + (done ? 'مكتمل ✓' : 'تكرار') + '</span>' +
      '</div>' +
      '<div class="progress-track">' +
        '<div class="progress-fill" style="width:' + pct + '%"></div>' +
      '</div>' +
    '</div>' +
    '<div class="card-footer">' +
      '<button class="tap-btn' + (done ? ' completed-btn' : '') + '" ' +
              'data-action="tap"' +
              (done ? ' disabled' : '') + '>' +
        '<span class="tap-btn-icon">' + (done ? '✓' : '☝') + '</span>' +
        '<span class="tap-btn-label">' + (done ? 'تم' : 'عدّ') + '</span>' +
      '</button>' +
      '<button class="reset-one-btn" data-action="reset-one">' +
        '<span>↺</span>' +
        '<span class="reset-one-label">إعادة</span>' +
      '</button>' +
    '</div>';

  return card;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════════════════
   ATTACH LISTENERS — called ONCE on boot (after fetch succeeds)
   ═══════════════════════════════════════════════════════════════ */

function attachListeners() {
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
  });

  var resetAllBtn = document.getElementById('resetAllBtn');
  if (resetAllBtn) resetAllBtn.addEventListener('click', resetAll);

  document.getElementById('cardsFeed').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    var card = btn.closest('.dhikr-card');
    if (!card) return;

    var id    = parseInt(card.dataset.id,    10);
    var total = parseInt(card.dataset.total, 10);
    if (isNaN(id) || isNaN(total)) return;

    if (btn.dataset.action === 'tap')       tap(btn, card, id, total);
    if (btn.dataset.action === 'reset-one') resetOne(card, id);
  });
}

/* ═══════════════════════════════════════════════════════════════
   TAP
   ═══════════════════════════════════════════════════════════════ */

function tap(btn, card, id, total) {
  if (card.dataset.busy === '1') return;
  if (btn.disabled || btn.classList.contains('completed-btn')) return;

  var current = getCount(currentTab, id);
  if (current >= total) return;

  card.dataset.busy = '1';
  setTimeout(function () { card.dataset.busy = '0'; }, 80);

  var next   = current + 1;
  setCount(currentTab, id, next);
  var isDone = next >= total;

  var fractionEl = card.querySelector('.progress-fraction');
  if (fractionEl) fractionEl.textContent = next + ' / ' + total;

  var fillEl = card.querySelector('.progress-fill');
  if (fillEl) fillEl.style.width = Math.min(Math.round(next / total * 100), 100) + '%';

  var labelEl = card.querySelector('.progress-label-text');
  if (labelEl && isDone) labelEl.textContent = 'مكتمل ✓';

  btn.classList.remove('pulsing');
  void btn.offsetWidth;
  btn.classList.add('pulsing');

  if (isDone) {
    card.classList.add('done');
    btn.classList.add('completed-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="tap-btn-icon">✓</span><span class="tap-btn-label">تم</span>';
  }

  updateStats(ADHKAR_DATA[currentTab], currentTab);

  if (isAllDone()) {
    setTimeout(function () { showToast('ما شاء الله! أتممت جميع الأذكار 🌟'); }, 400);
  }
}

/* ═══════════════════════════════════════════════════════════════
   RESET ONE
   ═══════════════════════════════════════════════════════════════ */

function resetOne(card, id) {
  setCount(currentTab, id, 0);

  var total = parseInt(card.dataset.total, 10);

  var fractionEl = card.querySelector('.progress-fraction');
  if (fractionEl) fractionEl.textContent = '0 / ' + total;

  var fillEl = card.querySelector('.progress-fill');
  if (fillEl) fillEl.style.width = '0%';

  var labelEl = card.querySelector('.progress-label-text');
  if (labelEl) labelEl.textContent = 'تكرار';

  card.classList.remove('done');
  card.dataset.busy = '0';

  var tapBtn = card.querySelector('.tap-btn');
  if (tapBtn) {
    tapBtn.classList.remove('completed-btn', 'pulsing');
    tapBtn.disabled = false;
    tapBtn.innerHTML = '<span class="tap-btn-icon">☝</span><span class="tap-btn-label">عدّ</span>';
  }

  updateStats(ADHKAR_DATA[currentTab], currentTab);
}

/* ═══════════════════════════════════════════════════════════════
   RESET ALL
   ═══════════════════════════════════════════════════════════════ */

function resetAll() {
  var label = currentTab === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  if (!confirm('هل تريد إعادة تعيين جميع ' + label + '؟')) return;
  var list = ADHKAR_DATA[currentTab] || [];
  list.forEach(function (d) { setCount(currentTab, d.id, 0); });
  render();
}

/* ═══════════════════════════════════════════════════════════════
   TAB SWITCH
   ═══════════════════════════════════════════════════════════════ */

function switchTab(tab) {
  if (tab === currentTab) return;
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  var titleEl = document.getElementById('headerTitle');
  if (titleEl) titleEl.textContent = tab === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';
  render();
}

/* ═══════════════════════════════════════════════════════════════
   HEADER STATS + SVG RING
   ═══════════════════════════════════════════════════════════════ */

function updateStats(list, tab) {
  var safeList = list || [];
  var total    = safeList.length;
  var done     = 0;

  safeList.forEach(function (d) {
    if (getCount(tab, d.id) >= d.count) done++;
  });

  var remain = total - done;
  var pct    = total > 0 ? Math.round(done / total * 100) : 0;

  var elDone   = document.getElementById('statDone');
  var elRemain = document.getElementById('statRemain');
  var elPct    = document.getElementById('masterPct');
  var elRing   = document.getElementById('masterRingFill');

  if (elDone)   elDone.textContent   = done;
  if (elRemain) elRemain.textContent = remain;
  if (elPct)    elPct.textContent    = pct + '%';

  if (elRing) {
    var offset = RING_CIRC * (1 - pct / 100);
    elRing.setAttribute('stroke-dasharray',  RING_CIRC);
    elRing.setAttribute('stroke-dashoffset', offset);
  }
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function isAllDone() {
  var list = ADHKAR_DATA[currentTab];
  if (!list || !list.length) return false;
  return list.every(function (d) { return getCount(currentTab, d.id) >= d.count; });
}

var toastTimer = null;
function showToast(msg) {
  var el = document.getElementById('completionToast');
  var m  = document.getElementById('toastMsg');
  if (!el || !m) return;
  m.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3500);
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
let prayerTimes;
let nextPrayer;

function formatTime(t){

let [h,m]=t.split(":");

h=parseInt(h);

let period="ص";

if(h>=12){

period="م";

if(h>12)h-=12;

}

if(h===0)h=12;

return h+":"+m+" "+period;

}

async function loadPrayerTimes(){

const res=await fetch("https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5");

const data=await res.json();

prayerTimes=data.data.timings;

calculateNextPrayer();

renderAllPrayers();

setInterval(updateCountdown,1000);

}

function calculateNextPrayer(){

const prayers=[

["الفجر",prayerTimes.Fajr],
["الشروق",prayerTimes.Sunrise],
["الظهر",prayerTimes.Dhuhr],
["العصر",prayerTimes.Asr],
["المغرب",prayerTimes.Maghrib],
["العشاء",prayerTimes.Isha]

];

const now=new Date();

for(let p of prayers){

const [h,m]=p[1].split(":");

const d=new Date();

d.setHours(h);
d.setMinutes(m);
d.setSeconds(0);

if(d>now){

nextPrayer={name:p[0],time:p[1],date:d};

break;

}

}

document.getElementById("nextPrayer").innerText=
nextPrayer.name+" "+formatTime(nextPrayer.time);

}

function updateCountdown(){

if(!nextPrayer)return;

const diff=nextPrayer.date-new Date();

if(diff<=0){

showPrayerAlert(nextPrayer.name);

calculateNextPrayer();

return;

}

const hours=Math.floor(diff/3600000);
const minutes=Math.floor((diff%3600000)/60000);

document.getElementById("countdown").innerText=
hours+"س "+minutes+"د";

}

function renderAllPrayers(){

const box=document.getElementById("allPrayers");

box.innerHTML=

"الفجر "+formatTime(prayerTimes.Fajr)+"<br>"+
"الشروق "+formatTime(prayerTimes.Sunrise)+"<br>"+
"الظهر "+formatTime(prayerTimes.Dhuhr)+"<br>"+
"العصر "+formatTime(prayerTimes.Asr)+"<br>"+
"المغرب "+formatTime(prayerTimes.Maghrib)+"<br>"+
"العشاء "+formatTime(prayerTimes.Isha);

}

document.getElementById("prayerBox").onclick=function(){

const box=document.getElementById("allPrayers");

box.style.display=
box.style.display==="block"?"none":"block";

}

function showPrayerAlert(name){

const alert=document.getElementById("prayerAlert");

alert.innerText=name+" - حي على الصلاة حي على الفلاح";

alert.style.display="block";

setTimeout(()=>{

alert.style.display="none";

},7000);

}

loadPrayerTimes();