const $ = s => document.querySelector(s);
const bgm = $('#bgm'), stage = $('#stage');
const sd = new Date(CONFIG.startDate);
let runId = 0;

/* ---------- jeda (pause) ---------- */
let paused = false, wantPause = false, inWipe = false, bgmWas = false, pgCur = null, quietUntil = 0;
const timers = new Set();
const rsleep = ms => new Promise(r => setTimeout(r, ms));   // tidak ikut pause (dipakai untuk transisi wipe)
const sleep = ms => new Promise(r => {                       // ikut pause: waktu yang tersisa dibekukan
  const t = { left: ms, id: 0, t0: 0 };
  t.arm = () => { t.t0 = performance.now(); t.id = setTimeout(() => { timers.delete(t); r(); }, t.left); };
  t.freeze = () => { clearTimeout(t.id); t.left -= performance.now() - t.t0; };
  timers.add(t); if (!paused) t.arm();
});

/* ---------- isi teks ---------- */
document.querySelectorAll('.me').forEach(e => e.textContent = CONFIG.me);
document.querySelectorAll('.her').forEach(e => e.textContent = CONFIG.her);
$('#since').textContent = sd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
stage.style.setProperty('--nm', Math.min(17, 78 / (CONFIG.her.length * .6)));
stage.style.setProperty('--fs', Math.min(1, Math.sqrt(300 / CONFIG.letter.length)));
document.querySelectorAll('.tp').forEach(t => t.innerHTML = Array(10).fill(`Happy 1st Anniversary ✦ ${CONFIG.me} + ${CONFIG.her} ❤ `).join(''));
$('#tlv').innerHTML = CONFIG.timeline.map((t, i) =>
  `<article class="tc pop" style="--d:${(.7 + i * .9).toFixed(1)}s"><span class="n">${i + 1}</span><small>${t.when}</small><h3>${t.title}</h3><p>${t.text}</p></article>`).join('');

/* ---------- format layar ---------- */
function setFormat(f) {
  document.body.classList.remove('vert', 'wide'); document.body.classList.add(f);
  $('#fV').classList.toggle('on', f === 'vert'); $('#fW').classList.toggle('on', f === 'wide');
}
$('#fV').onclick = () => setFormat('vert');
$('#fW').onclick = () => setFormat('wide');
setFormat(innerHeight > innerWidth ? 'vert' : 'wide');

/* ---------- musik & media dari layar awal ---------- */
/* Deteksi otomatis: cari file di folder yang sama dengan halaman ini */
const IMG = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'], VID = ['mp4', 'mov', 'webm', 'MP4', 'MOV'], AUD = ['mp3', 'm4a', 'wav', 'ogg', 'aac', 'MP3'];
const tryLoad = (kind, src) => new Promise(res => {
  let el;
  if (kind === 'image') { el = new Image(); el.onload = () => res(true); }
  else { el = document.createElement(kind); el.preload = 'metadata'; el.onloadedmetadata = () => res(true); }
  el.onerror = () => res(false); el.src = src;
  setTimeout(() => res(false), 1800);   // beberapa browser tidak memberi sinyal apa pun, jangan sampai menggantung
});
const any = ps => new Promise(res => { let n = ps.length; ps.forEach(p => p.then(v => v ? res(v) : (--n === 0 && res(null)))); });   // selesai begitu ada yang ketemu
async function detectMusic() {
  for (const b of ['lagu', 'musik', 'music', 'song', 'audio', 'bgm']) {
    const hit = await any(AUD.map(e => tryLoad('audio', `${b}.${e}`).then(ok => ok ? `${b}.${e}` : null)));
    if (hit) return hit;
  }
  return '';
}
async function detectMedia() {   // foto1.jpg, foto2.png, foto3.mp4, video1.mp4, atau 1.jpg, 2.jpg ... (boleh campur)
  const out = []; let miss = 0;
  for (let i = 1; i <= 40 && miss < 3; i++) {
    const c = [];
    for (const b of ['foto', '']) IMG.forEach(e => c.push(['image', `${b}${i}.${e}`]));
    for (const b of ['foto', 'video', '']) VID.forEach(e => c.push(['video', `${b}${i}.${e}`]));
    const hit = await any(c.map(([k, s]) => tryLoad(k, s).then(ok => ok ? { type: k, src: s, caption: '' } : null)));
    if (hit) { out.push(hit); miss = 0; } else miss++;
  }
  return out;
}
const enableStart = () => { if ($('#startBtn').textContent !== 'Menyiapkan…') return; $('#startBtn').disabled = false; $('#startBtn').textContent = '▶ Start'; };
(async () => {
  $('#startBtn').disabled = true; $('#startBtn').textContent = 'Menyiapkan…';
  setTimeout(enableStart, 9000);   // batas maksimal menunggu: Start pasti bisa diklik
  await Promise.all([
    (async () => { if (!CONFIG.music) CONFIG.music = await detectMusic(); if (CONFIG.music) bgm.src = CONFIG.music; })(),
    (async () => { if (!CONFIG.media.length) { CONFIG.media = await detectMedia(); CONFIG.media.forEach((m, i) => m.caption = (CONFIG.captions || [])[i] || ''); } })()
  ]);
  enableStart();
})();
let fadeT;
function playMusic() {
  clearInterval(fadeT);
  if (!bgm.getAttribute('src')) return;
  bgm.currentTime = 0; bgm.volume = 0;
  bgm.play().then(() => { let v = 0; fadeT = setInterval(() => { v = Math.min(.8, v + .05); bgm.volume = v; if (v >= .8) clearInterval(fadeT); }, 150); }).catch(() => {});
}
function fadeOut(ms) {
  clearInterval(fadeT); const step = bgm.volume / (ms / 100);
  fadeT = setInterval(() => { bgm.volume = Math.max(0, bgm.volume - step); if (bgm.volume <= 0) { clearInterval(fadeT); bgm.pause(); } }, 100);
}

/* ---------- S2: counter ---------- */
const fmt = n => Math.round(n).toLocaleString('id-ID');
function totals() {
  const s = Math.max(0, Math.floor((Date.now() - sd.getTime()) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600), m: Math.floor(s / 60), s };
}
function setStats(T, e) { $('#cd').textContent = fmt(T.d * e); $('#ch').textContent = fmt(T.h * e); $('#cm').textContent = fmt(T.m * e); $('#cs').textContent = fmt(T.s * e); }
function runCount(alive) {
  let el = 0, last = performance.now(); setStats(totals(), 0);
  (function f(now) {
    if (!alive()) return;
    if (!paused) el += now - last; last = now;
    const p = Math.min(1, el / 2400);
    setStats(totals(), 1 - Math.pow(1 - p, 3));
    if (p < 1) requestAnimationFrame(f);
    else { const iv = setInterval(() => { if (!alive()) clearInterval(iv); else setStats(totals(), 1); }, 1000); }
  })(last);
}

/* ---------- S3: galeri ---------- */
function mediaTag(m, per) {
  if (m.type === 'video') return `<video src="${m.src}" muted loop playsinline autoplay style="--per:${per}ms"></video>`;
  if (m.type === 'image') return `<img src="${m.src}" alt="" style="--per:${per}ms">`;
  return `<div class="ph"><i>＋</i><span>foto &amp; video kalian</span></div>`;
}
const reelList = () => {
  const l = CONFIG.media;
  return l.length ? l : [{ type: 'ph', caption: 'taruh fotomu di sini' }, { type: 'ph', caption: 'atau video' }, { type: 'ph', caption: 'dan kenangan lainnya' }];
};
async function runReel(alive) {
  const L = reelList(), per = CONFIG.perPhoto;
  for (let i = 0; i < L.length; i++) {
    if (!alive()) return;
    const m = L[i], fx = i % 2 ? '-50cqw' : '50cqw', r = i % 2 ? '3deg' : '-3deg';
    $('#reel').innerHTML = `<div class="rcard" style="--r:${r};--fx:${fx}"><div class="rm">${mediaTag(m, per)}</div></div>`;
    $('#rc').textContent = String(i + 1).padStart(2, '0') + '/' + String(L.length).padStart(2, '0');
    $('#rcap').textContent = m.caption || '';
    await sleep(per - 350); if (!alive()) return;
    const c = $('#reel').firstChild; if (c) c.classList.add('out');
    await sleep(350);
  }
}

/* ---------- S5: alasan ---------- */
async function runReasons(alive) {
  const R = CONFIG.reasons, n = $('#rn'), t = $('#rt');
  t.textContent = ''; n.textContent = '#1';
  await sleep(900);
  for (let i = 0; i < R.length; i++) {
    if (!alive()) return;
    n.textContent = '#' + (i + 1); t.textContent = R[i];
    [n, t].forEach(e => { e.classList.remove('swap'); void e.offsetWidth; e.classList.add('swap'); });
    await sleep(CONFIG.perReason);
  }
}

/* ---------- S6: surat ---------- */
function setTyped(i) {
  $('#txt .on').textContent = CONFIG.letter.slice(0, i);
  $('#txt .off').textContent = CONFIG.letter.slice(i);   // sisa teks disembunyikan tapi tetap makan tempat, jadi layout tidak loncat
}
setTyped(0);
async function runLetter(alive) {
  setTyped(0); $('#txt').classList.remove('done');
  await sleep(1100);
  for (let i = 1; i <= CONFIG.letter.length; i++) { if (!alive()) return; setTyped(i); await sleep(38); }
  $('#txt').classList.add('done');
}

/* ---------- S7: kembang api ---------- */
const fw = $('#fw'), fx = fw.getContext('2d'); let parts = [], fwOn = false, fwRun = false;
function fwSize() { const r = stage.getBoundingClientRect(), d = window.devicePixelRatio || 1; fw.width = r.width * d; fw.height = r.height * d; fx.setTransform(d, 0, 0, d, 0, 0); }
function boom() {
  const r = stage.getBoundingClientRect(), x = r.width * (.15 + Math.random() * .7), y = r.height * (.2 + Math.random() * .4);
  const cols = ['#c9f23a', '#cdb8ff', '#ffffff', '#14121c', '#ff8fb1'];
  for (let i = 0; i < 48; i++) { const a = Math.random() * 6.283, s = 2 + Math.random() * 6; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, l: 1, c: cols[i % 5], z: 5 + Math.random() * 7, h: i % 5 === 0 }); }
}
function fwLoop() {
  if (!fwOn && !parts.length) { fwRun = false; fx.clearRect(0, 0, fw.width, fw.height); return; }
  if (paused) { requestAnimationFrame(fwLoop); return; }
  const r = stage.getBoundingClientRect(); fx.clearRect(0, 0, r.width, r.height);
  parts = parts.filter(p => p.l > 0);
  parts.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += .12; p.vx *= .99; p.l -= .011;
    fx.globalAlpha = Math.max(0, p.l); fx.fillStyle = p.c;
    if (p.h) { fx.font = (p.z * 2) + 'px serif'; fx.fillText('❤', p.x, p.y); } else fx.fillRect(p.x, p.y, p.z, p.z * .6);
  });
  requestAnimationFrame(fwLoop);
}
async function runFinale(alive) {
  fwSize(); fwOn = true; if (!fwRun) { fwRun = true; fwLoop(); }
  (async () => { await sleep(Math.max(0, CONFIG.endHold - 3200)); if (alive()) fadeOut(2500); })();
  await sleep(1800);
  for (let k = 0; k < 14 && alive(); k++) { boom(); await sleep(650); }
}

/* ---------- urutan adegan ---------- */
const SC = [
  { id: 's1', dur: () => 6500 },
  { id: 's2', dur: () => 8500, on: runCount },
  { id: 's3', dur: () => reelList().length * CONFIG.perPhoto + 900, on: runReel, dark: true },
  { id: 's4', dur: () => Math.max(7500, 3000 + CONFIG.timeline.reduce((n, t) => n + (t.title + ' ' + t.text).split(/\s+/).length, 0) * (CONFIG.readMs || 170)) },   // makin panjang teks timeline, makin lama (opsional: readMs di config.js)
  { id: 's5', dur: () => CONFIG.reasons.length * CONFIG.perReason + 2200, on: runReasons },
  { id: 's6', dur: () => 1100 + CONFIG.letter.length * 45 + 3800, on: runLetter },
  { id: 's7', dur: () => CONFIG.endHold, on: runFinale }
];
$('#pg').innerHTML = SC.map(() => '<i><b></b></i>').join('');
function pgSet(i, ms, dark) {
  const pg = $('#pg'); pg.classList.toggle('dark', !!dark);
  [...pg.children].forEach((e, k) => { const b = e.firstChild; b.style.transition = 'none'; b.style.width = k < i ? '100%' : '0'; });
  const b = pg.children[i].firstChild; void b.offsetWidth;
  b.style.transition = `width ${ms}ms linear`; b.style.width = '100%';
  pgCur = { b, ms, f: 0 };
}
function syncBtn() { $('#pbtn').textContent = (paused || wantPause) ? '▶' : '❚❚'; }
function doPause() {
  if (paused) return; paused = true; wantPause = false;
  document.body.classList.add('paused');
  timers.forEach(t => t.freeze());
  bgmWas = !!bgm.getAttribute('src') && !bgm.paused; if (bgmWas) bgm.pause();
  document.querySelectorAll('#reel video').forEach(v => v.pause());
  if (pgCur) {   // bekukan progress bar di posisinya sekarang
    const b = pgCur.b; pgCur.f = b.getBoundingClientRect().width / b.parentElement.getBoundingClientRect().width;
    b.style.transition = 'none'; b.style.width = (pgCur.f * 100) + '%';
  }
  syncBtn();
}
function doResume() {
  if (!paused) return; paused = false; wantPause = false;
  document.body.classList.remove('paused');
  timers.forEach(t => t.arm());
  if (bgmWas) bgm.play().catch(() => {});
  document.querySelectorAll('#reel video').forEach(v => v.play().catch(() => {}));
  if (pgCur) { void pgCur.b.offsetWidth; pgCur.b.style.transition = `width ${pgCur.ms * (1 - pgCur.f)}ms linear`; pgCur.b.style.width = '100%'; }
  syncBtn();
}
function togglePause() {
  if (cur < 0 || !document.body.classList.contains('playing')) return;
  if (inWipe) { wantPause = !wantPause; syncBtn(); return; }   // saat transisi wipe, jeda baru berlaku setelah wipe selesai
  paused ? doResume() : doPause();
}
async function wipe(mid, after, alive) {
  const w = $('#wipe'); inWipe = true;
  w.className = 'cover'; await rsleep(700); if (!alive()) return;
  mid(); w.className = 'out'; await rsleep(250); if (!alive()) return;
  after(); await rsleep(450); if (!alive()) return;
  w.className = ''; inWipe = false; if (wantPause) doPause();
}
let cur = -1;   // adegan yang sedang tampil (-1 = belum mulai)
async function play(from = 0) {
  wantPause = false; if (paused) doResume();
  const my = ++runId, alive = () => my === runId;
  fwOn = false; parts = [];
  document.body.classList.add('playing', 'started'); $('#replay').classList.remove('show'); syncBtn();
  for (let i = from; i < SC.length; i++) {
    const sc = SC[i], dur = sc.dur(), el = $('#' + sc.id);
    let extra = 0;   // tambahan waktu kalau isi adegan lebih tinggi dari layar (di-scroll otomatis)
    cur = i;
    await wipe(
      () => { document.querySelectorAll('.scene').forEach(e => { e.classList.remove('show', 'on'); e.scrollTop = 0; }); el.classList.add('show'); },
      () => {
        el.classList.add('on');
        $('#pg').style.setProperty('--bgc', getComputedStyle(el).backgroundColor);
        const over = el.scrollHeight - el.clientHeight;
        if (over > 8) extra = Math.round(over * 14 + 1500);
        pgSet(i, dur + extra + 450, sc.dark); if (sc.on) sc.on(alive);
        if (extra) autoScroll(el, alive, over, dur, extra - 1500);
      },
      alive
    );
    if (!alive()) return;
    await sleep(dur + extra);
    if (!alive()) return;
  }
  fwOn = false; document.body.classList.remove('playing'); $('#replay').classList.add('show');
}

/* Scroll otomatis untuk adegan yang lebih tinggi dari layar: tunggu `hold` ms (waktu baca bagian atas), lalu geser pelan ke bawah.
   Ikut berhenti saat dijeda, dan berhenti sendiri kalau pengguna scroll manual. */
function autoScroll(el, alive, over, hold, ms) {
  let stop = false, t = 0, last = performance.now();
  ['wheel', 'touchstart', 'pointerdown'].forEach(ev => el.addEventListener(ev, () => { stop = true; }, { once: true, passive: true }));
  const kd = e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') stop = true; };
  addEventListener('keydown', kd);
  (function f(now) {
    if (!alive() || stop) { removeEventListener('keydown', kd); return; }
    if (!paused) t += now - last; last = now;
    el.scrollTop = over * Math.min(1, Math.max(0, (t - hold) / ms));
    if (t < hold + ms) requestAnimationFrame(f); else removeEventListener('keydown', kd);
  })(last);
}

/* ---------- kontrol: mundur / jeda / maju ---------- */
function go(d) {
  if (cur < 0) return;
  const to = Math.min(SC.length - 1, Math.max(0, cur + d));
  if (paused) doResume();
  if (bgm.getAttribute('src') && bgm.paused) playMusic();   // kalau musik sudah memudar di akhir, nyalakan lagi
  play(to);
}
$('#bprev').onclick = () => go(-1);
$('#bnext').onclick = () => go(1);
$('#pbtn').onclick = togglePause;
document.querySelectorAll('#ctl button').forEach(b => b.onmousedown = e => e.preventDefault());   // supaya tombol tidak "menahan" fokus keyboard

// Kontrol hanya muncul saat mouse digerakkan / layar disentuh, lalu hilang sendiri (rekaman layar tetap bersih)
let uiT;
function showUI() {
  if (performance.now() < quietUntil) return;
  document.body.classList.add('ui'); clearTimeout(uiT);
  uiT = setTimeout(() => document.body.classList.remove('ui'), 2500);
}
['mousemove', 'pointerdown', 'touchstart'].forEach(ev => addEventListener(ev, showUI, { passive: true }));
addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { const s = document.querySelector('.scene.on'); if (s) s.scrollBy({ top: e.key === 'ArrowDown' ? 160 : -160, behavior: 'smooth' }); e.preventDefault(); }
  else if (e.key === ' ') { e.preventDefault(); togglePause(); }
  else return;
  showUI();
});

$('#startBtn').onclick = () => { $('#startBtn').disabled = true; $('#startBtn').textContent = '▶ Start'; quietUntil = performance.now() + 3500; document.body.classList.remove('ui'); clearTimeout(uiT); playMusic(); play(); };
$('#replay').onclick = () => {
  setTyped(0); $('#txt').classList.remove('done'); parts = [];
  playMusic(); play();
};