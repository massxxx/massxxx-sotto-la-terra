// Sotto la terra — gioco
(() => {
'use strict';
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const DPR = Math.min(window.devicePixelRatio || 1, 2.5);
const CHIAVE = 'sotto-la-terra-v1';
const SITO = Object.fromEntries(SITI.map(s => [s.id, s]));
const REP = {}; SITI.forEach(s => s.reperti.forEach(f => { f.sito = s.id; REP[f.id] = f; }));
const CAPIENZA = 24;

// ---------- salvataggio ----------
let S;
function nuovoStato() { return {v: 1, pg: null, siti: {}, lab: {}, ordineLab: [], cat: {}, museo: {}, finale: false, visti: {}, opz: {musica: .5, effetti: .8}, stat: {rotti: 0, letti: 0, setacciate: 0}}; }
function carica() { try { const t = localStorage.getItem(CHIAVE); if (t) { const s = JSON.parse(t); if (s && s.v === 1) return Object.assign(nuovoStato(), s); } } catch (e) {} return nuovoStato(); }
let tSalva = null;
function salva(subito) { clearTimeout(tSalva); const f = () => { try { localStorage.setItem(CHIAVE, JSON.stringify(S)); } catch (e) {} }; if (subito) f(); else tSalva = setTimeout(f, 400); }
S = carica();
Audio.vol.musica = S.opz.musica; Audio.vol.effetti = S.opz.effetti;
window.addEventListener('pagehide', () => salva(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) salva(true); });

// ---------- utilità ----------
function canvas(w, h) { const c = el('canvas'); c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); c.style.width = w + 'px'; c.style.height = h + 'px'; const x = c.getContext('2d'); x.scale(DPR, DPR); return [c, x]; }
function offscreen(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function mescola(a, rnd) { a = a.slice(); rnd = rnd || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
let tToast = null;
function toast(msg, ms) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('on'); clearTimeout(tToast); tToast = setTimeout(() => t.classList.remove('on'), ms || 2600); }
function modale(html, bottoni, opz) {
  const m = $('#modal'), box = $('#modalBox'); box.innerHTML = ''; box.className = 'modalBox' + (opz && opz.largo ? ' largo' : '');
  if (typeof html === 'string') box.innerHTML = html; else box.appendChild(html);
  const riga = el('div', 'btnRow');
  (bottoni || [{t: 'Chiudi'}]).forEach(b => { const x = el('button', b.cls || (b.primario ? 'btn primario' : 'btn'), b.t); x.onclick = () => { Audio.sfx.tocco(); if (!b.resta) chiudiModale(); b.f && b.f(); }; riga.appendChild(x); });
  box.appendChild(riga); m.classList.add('on'); return box;
}
function chiudiModale() { $('#modal').classList.remove('on'); }
function miniatura(f, maxW, maxH) {
  const [w, h] = D.dimensioni(f), k = Math.min(maxW / w, maxH / h), W = Math.round(w * k), H = Math.round(h * k);
  const [c, x] = canvas(W, H); D.reperto(x, f, 0, 0, W, H); return c;
}
function rendiReperto(f, base) { // canvas offscreen ad alta risoluzione
  const [w, h] = D.dimensioni(f), k = base / Math.max(w, h), W = Math.round(w * k), H = Math.round(h * k);
  const [c, x] = offscreen(W, H); D.reperto(x, f, 0, 0, W, H); return c;
}
function statoSito(id) {
  if (!S.siti[id]) { const s = SITO[id]; let g = ''; let r = 0; s.strati.forEach((st, i) => { for (let k = 0; k < st.r; k++) { g += String.fromCharCode(65 + i).repeat(COLS); r++; } }); S.siti[id] = {g, rep: {}, sec: 0, secRep: [], strati: []}; }
  return S.siti[id];
}
function repTrovati(id) { const st = S.siti[id]; if (!st) return 0; return SITO[id].reperti.filter(f => st.rep[f.id] && st.rep[f.id].estratto).length; }

// posizioni dei reperti (deterministiche per sito)
const POS = {};
function posizioni(sito) {
  if (POS[sito.id]) return POS[sito.id];
  const rnd = D.seeded(D.hash(sito.id) % 99991 + 7), occ = new Set(), out = {};
  const inizio = []; let r = 0; sito.strati.forEach(st => { inizio.push(r); r += st.r; });
  const ordinati = sito.reperti.filter(f => f.t !== 's').sort((a, b) => b.w * b.h - a.w * a.h);
  for (const f of ordinati) {
    const st = sito.strati[f.s]; let ok = false;
    for (let tent = 0; tent < 400 && !ok; tent++) {
      const r0 = inizio[f.s] + Math.floor(rnd() * Math.max(1, st.r - Math.min(f.h, st.r) + 1));
      const c0 = Math.floor(rnd() * (COLS - f.w + 1));
      if (r0 < 1 || r0 + f.h > ROWS) continue;
      let libero = true; for (let y = r0 - (tent < 300 ? 1 : 0); y < r0 + f.h + (tent < 300 ? 1 : 0) && libero; y++) for (let x = c0 - (tent < 300 ? 1 : 0); x < c0 + f.w + (tent < 300 ? 1 : 0); x++) if (occ.has(y * COLS + x)) { libero = false; break; }
      if (!libero) continue;
      for (let y = r0; y < r0 + f.h; y++) for (let x = c0; x < c0 + f.w; x++) occ.add(y * COLS + x);
      out[f.id] = {r: r0, c: c0, w: f.w, h: f.h}; ok = true;
    }
  }
  for (const f of sito.reperti.filter(f => f.t === 's')) {
    const st = sito.strati[f.s];
    for (let tent = 0; tent < 400; tent++) { const r0 = inizio[f.s] + Math.floor(rnd() * st.r), c0 = Math.floor(rnd() * COLS); if (occ.has(r0 * COLS + c0)) continue; occ.add(r0 * COLS + c0); out[f.id] = {r: r0, c: c0, w: 1, h: 1, s: true}; break; }
  }
  // mappa cella -> reperto
  const cella = {}; for (const id in out) { const p = out[id]; for (let y = p.r; y < p.r + p.h; y++) for (let x = p.c; x < p.c + p.w; x++) cella[y * COLS + x] = id; }
  return POS[sito.id] = {p: out, cella, inizio};
}

// ---------- navigazione ----------
let schermata = null, pila = [];
const NAV = [['mappa', 'Mappa', '🗺️'], ['lab', 'Laboratorio', '🧪'], ['diario', 'Diario', '📖'], ['museo', 'Museo', '🏛️']];
function vai(nome, arg, nonImpila) {
  if (attivo && attivo.esci) attivo.esci();
  attivo = null;
  if (!nonImpila && schermata) pila.push(schermata);
  if (['mappa', 'lab', 'diario', 'museo'].includes(nome)) pila = [];
  schermata = {nome, arg};
  const main = $('#main'); main.innerHTML = ''; main.scrollTop = 0;
  document.body.dataset.s = nome;
  $('#nav').style.display = ['mappa', 'lab', 'diario', 'museo'].includes(nome) ? '' : 'none';
  $('#nav').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.n === nome));
  aggiornaBadge();
  SCHERMATE[nome](main, arg);
}
function indietro() {
  if ($('#modal').classList.contains('on')) { chiudiModale(); return true; }
  if (attivo && attivo.indietro && attivo.indietro()) return true;
  if (pila.length) { const p = pila.pop(); vai(p.nome, p.arg, true); return true; }
  if (schermata && schermata.nome !== 'mappa' && S.pg) { vai('mappa'); return true; }
  return false;
}
let attivo = null; // controller della schermata con loop o stato
function testata(titolo, conIndietro, destra) {
  const t = el('div', 'testata');
  if (conIndietro) { const b = el('button', 'icona', '←'); b.setAttribute('aria-label', 'Indietro'); b.onclick = () => { Audio.sfx.tocco(); indietro(); }; t.appendChild(b); }
  t.appendChild(el('h1', null, titolo));
  if (destra) t.appendChild(destra);
  return t;
}
function aggiornaBadge() {
  const n = S.ordineLab.filter(id => S.lab[id] && S.lab[id].fase !== 'fatto').length;
  const b = $('#nav [data-n="lab"] .badge'); if (b) { b.textContent = n; b.style.display = n ? '' : 'none'; }
}

// ---------- schermate ----------
const SCHERMATE = {};

SCHERMATE.avvio = main => {
  Audio.suona('menu');
  const box = el('div', 'avvio');
  const [c, x] = canvas(Math.min(360, innerWidth - 32), 240); box.appendChild(c);
  disegnaCopertina(x, Math.min(360, innerWidth - 32), 240);
  box.appendChild(el('h1', 'titoloGioco', 'Sotto la terra'));
  box.appendChild(el('p', 'sotto', 'Dodici scavi nel mondo, un museo da riempire.'));
  if (S.pg) { const b = el('button', 'btn primario grande', `Continua con ${escapeHtml(S.pg.nome)}`); b.onclick = () => { Audio.avvia(); Audio.sfx.tocco(); vai('mappa'); }; box.appendChild(b); }
  const n = el('button', 'btn grande' + (S.pg ? '' : ' primario'), S.pg ? 'Nuova partita' : 'Inizia');
  n.onclick = () => { Audio.avvia(); Audio.sfx.tocco(); if (S.pg) modale('<h2>Nuova partita?</h2><p>Scavi, laboratorio, diario e museo ripartono da zero.</p>', [{t: 'Annulla'}, {t: 'Ricomincia', primario: true, f: () => { const o = S.opz; S = nuovoStato(); S.opz = o; salva(true); vai('personaggio', {nuovo: true}); }}]); else vai('personaggio', {nuovo: true}); };
  box.appendChild(n);
  main.appendChild(box);
};
function disegnaCopertina(x, W, H) {
  const strati = ['#6b4a2f', '#a07e5e', '#d8d0bd', '#9b9790', '#b0533c', '#5c4a3d'];
  x.fillStyle = D.lin(x, 0, 0, 0, H * .35, [[0, '#9fc6e8'], [1, '#f3dcc0']]); x.fillRect(0, 0, W, H * .35);
  let y = H * .35; strati.forEach((c, i) => { const h = H * (.65 / strati.length); x.fillStyle = c; x.beginPath(); x.moveTo(0, y); for (let k = 0; k <= 10; k++) x.lineTo(W * k / 10, y + Math.sin(k * 1.3 + i) * 3); x.lineTo(W, y + h + 2); x.lineTo(0, y + h + 2); x.fill(); y += h; });
  D.reperto(x, REP['pom-anfora'], W * .14, H * .45, W * .1, H * .3);
  D.reperto(x, REP['egi-canopo'], W * .44, H * .62, W * .14, H * .3);
  D.reperto(x, REP['old-amigdala'], W * .76, H * .5, W * .1, H * .2);
  D.personaggio(x, W * .28, H * .35, H * .3, S.pg || {sesso: 'f', pelle: 1, capelli: 2, maglia: 0, cappello: 1}, .5);
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])); }

SCHERMATE.personaggio = (main, arg) => {
  const pg = Object.assign({nome: '', sesso: 'f', pelle: 0, capelli: 0, maglia: 0, cappello: true}, S.pg || {});
  main.appendChild(testata(arg && arg.nuovo ? 'La tua archeologa' : 'Personaggio', !(arg && arg.nuovo)));
  const box = el('div', 'pagina');
  const [c, x] = canvas(150, 170); c.className = 'anteprima'; box.appendChild(c);
  const ridisegna = () => { x.clearRect(0, 0, 150, 170); x.fillStyle = '#e8dcc5'; x.fillRect(0, 140, 150, 30); D.personaggio(x, 75, 150, 120, pg, .4); $('.testata h1').textContent = pg.sesso === 'f' ? (arg && arg.nuovo ? 'La tua archeologa' : 'Personaggio') : (arg && arg.nuovo ? 'Il tuo archeologo' : 'Personaggio'); };
  const campo = el('label', 'campo', 'Nome'); const inp = el('input'); inp.maxLength = 16; inp.value = pg.nome; inp.placeholder = 'Scrivi un nome'; inp.oninput = () => pg.nome = inp.value; campo.appendChild(inp); box.appendChild(campo);
  const scelta = (titolo, opzioni, get, set) => { const r = el('div', 'scelta'); r.appendChild(el('span', null, titolo)); const g = el('div', 'gruppo'); opzioni.forEach((o, i) => { const b = el('button', 'pill' + (get() === o.v ? ' on' : ''), o.t || ''); if (o.c) { b.style.background = o.c; b.classList.add('colore'); b.setAttribute('aria-label', titolo + ' ' + (i + 1)); } b.onclick = () => { Audio.sfx.tocco(); set(o.v); g.querySelectorAll('button').forEach(z => z.classList.remove('on')); b.classList.add('on'); ridisegna(); }; g.appendChild(b); }); r.appendChild(g); box.appendChild(r); };
  scelta('Chi sei', [{t: 'Ragazza', v: 'f'}, {t: 'Ragazzo', v: 'm'}], () => pg.sesso, v => pg.sesso = v);
  scelta('Pelle', D.PELLE.map((c, i) => ({c, v: i})), () => pg.pelle, v => pg.pelle = v);
  scelta('Capelli', D.CAPELLI.map((c, i) => ({c, v: i})), () => pg.capelli, v => pg.capelli = v);
  scelta('Maglia', D.MAGLIA.map((c, i) => ({c, v: i})), () => pg.maglia, v => pg.maglia = v);
  scelta('Cappello', [{t: 'Sì', v: true}, {t: 'No', v: false}], () => pg.cappello, v => pg.cappello = v);
  const ok = el('button', 'btn primario grande', arg && arg.nuovo ? 'Si parte!' : 'Salva');
  ok.onclick = () => {
    pg.nome = (pg.nome || '').trim(); if (!pg.nome) { inp.focus(); toast('Scrivi un nome'); Audio.sfx.errore(); return; }
    S.pg = pg; salva(true); Audio.sfx.trovato();
    if (arg && arg.nuovo) { vai('mappa'); setTimeout(() => modale(`<h2>Benvenut${pg.sesso === 'f' ? 'a' : 'o'}, ${escapeHtml(pg.nome)}!</h2><p>Hai dodici scavi in giro per il mondo, tutti aperti. Scava con calma, porta i reperti in laboratorio e allestisci il tuo museo.</p><p>Quando in ogni sala ci sarà il reperto più importante del suo sito, il museo aprirà al pubblico.</p>`, [{t: 'Andiamo', primario: true}]), 300); }
    else indietro();
  };
  box.appendChild(ok); main.appendChild(box); ridisegna();
};

// ---------- mappa del mondo ----------
SCHERMATE.mappa = main => {
  Audio.suona('menu');
  const gear = el('button', 'icona', '⚙️'); gear.setAttribute('aria-label', 'Impostazioni'); gear.onclick = () => { Audio.sfx.tocco(); impostazioni(); };
  main.appendChild(testata(`Ciao, ${escapeHtml(S.pg.nome)}`, false, gear));
  const pag = el('div', 'pagina');
  const W = Math.min(innerWidth - 24, 640), H = Math.round(W * .52);
  const [c, x] = canvas(W, H); c.className = 'mappaMondo'; pag.appendChild(c);
  const proj = (lon, lat) => [(lon + 170) / 340 * W, (78 - lat) / 136 * H];
  x.fillStyle = '#bcd6e2'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#e8dcbc'; x.strokeStyle = '#c9b88f'; x.lineWidth = .7;
  for (const poly of TERRE) { x.beginPath(); for (let i = 0; i < poly.length; i += 2) { const [px, py] = proj(poly[i], poly[i + 1]); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.closePath(); x.fill(); x.stroke(); }
  const pins = SITI.map((s, i) => { const [px, py] = proj(s.lon, s.lat); return {s, px, py, i}; });
  // separa i pin troppo vicini (Mediterraneo)
  const pos = pins.map(p => ({x: p.px, y: p.py}));
  for (let it = 0; it < 40; it++) for (let a = 0; a < pos.length; a++) for (let b = a + 1; b < pos.length; b++) { const dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y, d = Math.hypot(dx, dy) || 1; if (d < 20) { const k = (20 - d) / 2 / d; pos[a].x -= dx * k; pos[a].y -= dy * k; pos[b].x += dx * k; pos[b].y += dy * k; } }
  pins.forEach((p, i) => {
    const q = pos[i], fatto = repTrovati(p.s.id) === p.s.reperti.length;
    x.strokeStyle = '#5a4630'; x.lineWidth = 1; x.beginPath(); x.moveTo(p.px, p.py); x.lineTo(q.x, q.y); x.stroke();
    x.fillStyle = fatto ? '#3f7d46' : '#c4573a'; D.ell(x, q.x, q.y, 9, 9); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.stroke();
    x.fillStyle = '#fff'; x.font = 'bold 10px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(fatto ? '✓' : String(i + 1), q.x, q.y + .5);
  });
  c.onclick = e => { const r = c.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; let best = null, bd = 18; pos.forEach((q, i) => { const d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; best = i; } }); if (best != null) { Audio.sfx.tocco(); vai('scavo', SITI[best].id); } };
  const tot = SITI.reduce((a, s) => a + repTrovati(s.id), 0), totR = SITI.reduce((a, s) => a + s.reperti.length, 0);
  pag.appendChild(el('p', 'nota', `Reperti trovati: <b>${tot}</b> su ${totR}. Tocca un sito per scavare.`));
  const lista = el('div', 'listaSiti');
  SITI.forEach((s, i) => {
    const n = repTrovati(s.id), card = el('button', 'cardSito');
    const pct = n / s.reperti.length * 100;
    card.innerHTML = `<span class="num ${n === s.reperti.length ? 'ok' : ''}">${n === s.reperti.length ? '✓' : i + 1}</span><span class="info"><b>${s.nome}</b><small>${s.paese}</small><span class="barra"><i style="width:${pct}%"></i></span></span><span class="conta">${n}/${s.reperti.length}</span>`;
    card.onclick = () => { Audio.sfx.tocco(); vai('scavo', s.id); };
    lista.appendChild(card);
  });
  pag.appendChild(lista); main.appendChild(pag);
};

// ---------- scavo ----------
const ATTREZZI = [
  {id: 'piccone', n: 'Piccone', ico: '⛏️', i: 'Toglie 4 quadretti alla volta, anche la roccia. Ma se colpisce un reperto lo rompe.'},
  {id: 'cazzuola', n: 'Cazzuola', ico: '🔺', i: 'Toglie un quadretto. La terra compatta va colpita due volte. Può incrinare i reperti.'},
  {id: 'pennello', n: 'Pennello', ico: '🖌️', i: 'Lento ma delicato: non rompe niente. Funziona sulla terra sciolta e attorno ai reperti.'}
];
SCHERMATE.scavo = (main, id) => {
  const sito = SITO[id], st = statoSito(id), P = posizioni(sito);
  Audio.suona(sito.musica);
  const prog = el('span', 'progresso');
  main.appendChild(testata(sito.nome, true, prog));
  const area = el('div', 'areaScavo'); main.appendChild(area);
  const info = el('div', 'infoStrato'); main.appendChild(info);
  const barra = el('div', 'attrezzi'); main.appendChild(barra);
  let attrezzo = st.att || 'cazzuola';
  ATTREZZI.forEach(a => { const b = el('button', 'attr', `<span>${a.ico}</span><small>${a.n}</small>`); b.dataset.a = a.id; b.onclick = () => { Audio.sfx.tocco(); attrezzo = a.id; st.att = a.id; aggiornaBarra(); toast(a.i, 2200); }; barra.appendChild(b); });
  const bSec = el('button', 'attr secchio', '<span>🪣</span><small>Setaccio</small><i class="liv"></i>'); bSec.onclick = () => { Audio.sfx.tocco(); setaccio(); }; barra.appendChild(bSec);
  const bStrati = el('button', 'attr', '<span>📏</span><small>Strati</small>'); bStrati.onclick = () => { Audio.sfx.tocco(); mostraStrati(); }; barra.appendChild(bStrati);
  function aggiornaBarra() {
    barra.querySelectorAll('[data-a]').forEach(b => b.classList.toggle('on', b.dataset.a === attrezzo));
    bSec.querySelector('.liv').style.height = (st.sec / CAPIENZA * 100) + '%'; bSec.classList.toggle('pieno', st.sec >= CAPIENZA);
    prog.textContent = `${repTrovati(id)}/${sito.reperti.length}`;
  }
  // dimensioni
  const rect = area.getBoundingClientRect();
  const W = Math.floor(rect.width), Hv = Math.max(240, Math.floor(rect.height));
  const BAR = 22, cell = Math.floor((W - BAR) / COLS), GX = Math.floor((W - BAR - cell * COLS) / 2), CIELO = cell * 3, TOT = CIELO + ROWS * cell;
  const [cv, cx] = canvas(W, Hv); area.appendChild(cv);
  let scrollY = st.scroll || 0; const maxScroll = Math.max(0, TOT - Hv);
  // terra pre-disegnata
  const [terra, tx] = offscreen(COLS * cell * DPR, ROWS * cell * DPR); tx.scale(DPR, DPR);
  { let r = 0; sito.strati.forEach((s, i) => { const rnd = D.seeded(i * 97 + 13); for (let k = 0; k < s.r; k++, r++) for (let c = 0; c < COLS; c++) { const x0 = c * cell, y0 = r * cell; tx.fillStyle = D.shade(s.c, (rnd() - .5) * .08); tx.fillRect(x0, y0, cell, cell); for (let q = 0; q < 6; q++) { tx.fillStyle = rnd() < .5 ? D.shade(s.c, -.18) : D.shade(s.c, .14); const sz = s.h === 3 ? cell * .18 : cell * .07; tx.fillRect(x0 + rnd() * cell, y0 + rnd() * cell, sz, sz * (s.h === 3 ? .6 : 1)); } if (s.h === 3) { tx.strokeStyle = D.shade(s.c, -.3); tx.lineWidth = 1; tx.beginPath(); tx.moveTo(x0 + rnd() * cell, y0); tx.lineTo(x0 + rnd() * cell, y0 + cell); tx.stroke(); } tx.fillStyle = 'rgba(0,0,0,.06)'; tx.fillRect(x0, y0 + cell - 1, cell, 1); tx.fillRect(x0 + cell - 1, y0, 1, cell); } }); }
  const [cielo, kx] = offscreen(COLS * cell * DPR, CIELO * DPR); kx.scale(DPR, DPR); D.sfondo(kx, sito, COLS * cell, CIELO);
  // immagini dei reperti nella sezione
  const img = {}; for (const fid in P.p) { const p = P.p[fid]; img[fid] = rendiReperto(REP[fid], Math.max(p.w, p.h) * cell * DPR); }
  const colpi = {}; let parts = [], pgX = GX + cell * 1.5, pgT = pgX, posa = 0, posaV = 0, sporco = true, raf = 0;
  const strato = r => { let i = 0; while (i < sito.strati.length - 1 && r >= P.inizio[i + 1]) i++; return i; };
  const solido = i => st.g[i] !== '.';
  const esposto = i => { const r = Math.floor(i / COLS), c = i % COLS; if (r === 0) return true; return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([y, x]) => y >= 0 && y < ROWS && x >= 0 && x < COLS && !solido(y * COLS + x)); };
  function togli(i, danno) {
    const g = st.g.split(''); const lettera = g[i]; g[i] = '.'; st.g = g.join('');
    const si = lettera.charCodeAt(0) - 65; if (!st.strati.includes(si)) { st.strati.push(si); const s = sito.strati[si]; info.innerHTML = `<b>${s.n}</b> · ${s.e}<br><small>${s.i}</small>`; info.classList.add('nuovo'); setTimeout(() => info.classList.remove('nuovo'), 900); }
    st.sec = Math.min(CAPIENZA, st.sec + 1);
    const fid = P.cella[i];
    if (fid) { const f = REP[fid], rs = st.rep[fid] || (st.rep[fid] = {danni: 0}); if (danno) { rs.danni = (rs.danni || 0) + danno; } if (f.t === 's') { if (!rs.estratto && !st.secRep.includes(fid)) st.secRep.push(fid); } }
    const r = Math.floor(i / COLS), c = i % COLS, col = sito.strati[si].c;
    for (let k = 0; k < 7; k++) parts.push({x: GX + c * cell + Math.random() * cell, y: CIELO + r * cell + Math.random() * cell, vx: (Math.random() - .5) * 2, vy: -Math.random() * 2, c: col, v: 40});
  }
  function completoReperto(fid) { const p = P.p[fid]; for (let y = p.r; y < p.r + p.h; y++) for (let x = p.c; x < p.c + p.w; x++) if (solido(y * COLS + x)) return false; return true; }
  function controllaReperti() {
    for (const fid in P.p) { const p = P.p[fid]; if (p.s) continue; const rs = st.rep[fid] || (st.rep[fid] = {danni: 0}); if (!rs.estratto && !rs.visto && completoReperto(fid)) { rs.visto = true; scoperto(fid); return; } }
  }
  function scoperto(fid) {
    const f = REP[fid], rs = st.rep[fid]; Audio.sfx.trovato(); salva();
    const box = el('div', 'trovato'); box.appendChild(el('h2', null, 'Trovato!')); box.appendChild(miniatura(f, 200, 150)); box.appendChild(el('p', 'nomeRep', f.n));
    if (rs.danni) box.appendChild(el('p', 'avviso', `Si è rotto: andrà ricomposto in ${pezziDi(fid, rs.danni)} pezzi. Vicino ai reperti usa il pennello.`));
    estrai(fid, true);
    if ($('#modal').classList.contains('on')) { toast(`Trovato: <b>${f.n}</b>`); return; }
    modale(box, [{t: 'Nella cassetta', primario: true, f: () => { if (repTrovati(id) === sito.reperti.length) setTimeout(fine, 300); }}]);
  }
  function estrai(fid, rimanda) {
    const rs = st.rep[fid]; if (rs.estratto) return; rs.estratto = true; if (rs.danni) S.stat.rotti++;
    S.lab[fid] = {fase: 'pulire', danni: rs.danni || 0}; S.ordineLab.push(fid);
    sporco = true; aggiornaBarra(); aggiornaBadge(); salva();
    if (!rimanda && repTrovati(id) === sito.reperti.length) setTimeout(fine, 900);
  }
  function fine() { Audio.sfx.fanfara(); modale(`<h2>Scavo finito!</h2><p>Hai trovato tutti gli 8 reperti di ${sito.nome}. Puliscili e studiali in laboratorio, poi mettili nella sala del museo.</p>`, [{t: 'Resta qui'}, {t: 'Al laboratorio', primario: true, f: () => vai('lab')}]); }
  // tocco
  let giu = false, ultima = -1, tUltimo = 0, trascinaBar = false;
  function cellaDa(e) { const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top + scrollY - CIELO; if (mx < GX || mx >= GX + COLS * cell || my < 0) return -1; const c = Math.floor((mx - GX) / cell), rr = Math.floor(my / cell); if (rr >= ROWS) return -1; return rr * COLS + c; }
  function colpisci(i, primo) {
    if (i < 0) return; if (!solido(i)) return;
    if (st.sec >= CAPIENZA) { if (primo) { toast('Il secchio è pieno: setaccia la terra 🪣'); Audio.sfx.errore(); bSec.classList.add('scuoti'); setTimeout(() => bSec.classList.remove('scuoti'), 500); } return; }
    if (!esposto(i)) { if (primo) toast('Scava dall\'alto o di fianco a una buca'); return; }
    const r = Math.floor(i / COLS), c = i % COLS, s = sito.strati[strato(r)], suReperto = !!P.cella[i] && !P.p[P.cella[i]].s;
    pgT = GX + c * cell + cell / 2; posaV = 1;
    if (attrezzo === 'piccone') {
      if (!primo) return; Audio.sfx.piccone(); navigator.vibrate && navigator.vibrate(15);
      const blocco = [i, c + 1 < COLS ? i + 1 : -1, r + 1 < ROWS ? i + COLS : -1, (c + 1 < COLS && r + 1 < ROWS) ? i + COLS + 1 : -1].filter(k => k >= 0 && solido(k));
      const rotti = new Set();
      blocco.forEach(k => { const fid = P.cella[k]; let d = 0; if (fid && !rotti.has(fid)) { rotti.add(fid); d = P.p[fid].s ? 1 : 2; } togli(k, d); });
      if ([...rotti].some(f => !P.p[f].s)) { Audio.sfx.crack(); toast('Crack! Hai colpito un reperto. Vicino ai reperti usa il pennello.'); }
    } else if (attrezzo === 'cazzuola') {
      const durezza = suReperto ? 1 : s.h; if (durezza >= 3) { if (primo) { Audio.sfx.roccia(); toast('Troppo duro: serve il piccone'); } return; }
      colpi[i] = (colpi[i] || 0) + 1; Audio.sfx.cazzuola();
      if (colpi[i] >= durezza) { const fid = P.cella[i]; togli(i, fid ? 1 : 0); if (suReperto) { Audio.sfx.crack(); toast('La cazzuola ha incrinato il reperto: meglio il pennello.'); } }
    } else {
      if (!suReperto && s.h >= 2) { if (primo) { Audio.sfx.roccia(); toast('Terra troppo compatta per il pennello: usa la cazzuola'); } return; }
      colpi[i] = (colpi[i] || 0) + 1; Audio.sfx.pennello();
      if (colpi[i] >= 2) togli(i, 0);
    }
    if (r * cell + CIELO - scrollY > Hv - cell * 2.5) scrollTo(scrollY + cell * 2);
    sporco = true; aggiornaBarra(); controllaReperti(); salva();
  }
  function scrollTo(y) { scrollY = Math.max(0, Math.min(maxScroll, y)); st.scroll = scrollY; sporco = true; }
  cv.addEventListener('pointerdown', e => {
    Audio.avvia(); const r = cv.getBoundingClientRect();
    if (e.clientX - r.left > W - BAR - 2) { trascinaBar = true; cv.setPointerCapture(e.pointerId); barScroll(e); return; }
    giu = true; cv.setPointerCapture(e.pointerId); const i = cellaDa(e); ultima = i; tUltimo = performance.now(); colpisci(i, true);
  });
  cv.addEventListener('pointermove', e => {
    if (trascinaBar) { barScroll(e); return; }
    if (!giu || attrezzo === 'piccone') return; const i = cellaDa(e), t = performance.now();
    if (i !== ultima || t - tUltimo > 160) { ultima = i; tUltimo = t; colpisci(i, false); }
  });
  const su = () => { giu = false; trascinaBar = false; };
  cv.addEventListener('pointerup', su); cv.addEventListener('pointercancel', su);
  cv.addEventListener('wheel', e => { scrollTo(scrollY + e.deltaY); e.preventDefault(); }, {passive: false});
  function barScroll(e) { const r = cv.getBoundingClientRect(), y = (e.clientY - r.top) / Hv; scrollTo(y * maxScroll); }
  // disegno
  function disegna() {
    const c = cx; c.clearRect(0, 0, W, Hv); c.save(); c.translate(0, -scrollY);
    c.fillStyle = '#1e1813'; c.fillRect(0, 0, W, TOT);
    c.drawImage(cielo, GX, 0, COLS * cell, CIELO);
    // pareti scavate
    for (let i = 0; i < COLS * ROWS; i++) {
      const r = Math.floor(i / COLS), col = i % COLS, y = CIELO + r * cell, x = GX + col * cell;
      if (y + cell < scrollY || y > scrollY + Hv) continue;
      if (!solido(i)) { c.fillStyle = D.shade(sito.strati[strato(r)].c, -.55); c.fillRect(x, y, cell, cell); }
    }
    // reperti (visibili dove la terra è tolta)
    for (const fid in P.p) {
      const p = P.p[fid], rs = st.rep[fid]; if (p.s || (rs && rs.estratto)) continue;
      c.save(); c.beginPath(); let vis = false;
      for (let y = p.r; y < p.r + p.h; y++) for (let x = p.c; x < p.c + p.w; x++) if (!solido(y * COLS + x)) { c.rect(GX + x * cell, CIELO + y * cell, cell, cell); vis = true; }
      if (vis) { c.clip(); c.drawImage(img[fid], GX + p.c * cell, CIELO + p.r * cell, p.w * cell, p.h * cell); if (rs && rs.danni) { c.strokeStyle = 'rgba(20,10,5,.8)'; c.lineWidth = 1.5; const rnd = D.seeded(D.hash(fid)); for (let k = 0; k < rs.danni * 2; k++) { c.beginPath(); let xx = GX + (p.c + rnd() * p.w) * cell, yy = CIELO + (p.r + rnd() * p.h) * cell; c.moveTo(xx, yy); for (let q = 0; q < 4; q++) { xx += (rnd() - .5) * cell; yy += (rnd() - .5) * cell; c.lineTo(xx, yy); } c.stroke(); } } }
      c.restore();
    }
    // terra
    for (let i = 0; i < COLS * ROWS; i++) {
      if (!solido(i)) continue; const r = Math.floor(i / COLS), col = i % COLS, y = CIELO + r * cell, x = GX + col * cell;
      if (y + cell < scrollY || y > scrollY + Hv) continue;
      c.drawImage(terra, col * cell * DPR, r * cell * DPR, cell * DPR, cell * DPR, x, y, cell, cell);
      if (colpi[i]) { c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x + 2, y + 2, cell - 4, cell - 4); }
      const fid = P.cella[i];
      if (fid && !P.p[fid].s && esposto(i)) { const t = performance.now() / 600 + i; c.fillStyle = `rgba(255,236,170,${.18 + .14 * Math.sin(t)})`; c.fillRect(x + cell * .3, y + cell * .3, cell * .4, cell * .4); }
    }
    // linea del terreno e personaggio
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(GX, CIELO - 2, COLS * cell, 2);
    pgX += (pgT - pgX) * .15; posa += posaV * .5; posaV *= .9;
    D.personaggio(c, pgX, CIELO, cell * 2.6, S.pg, Math.sin(posa) * posaV * 2);
    // particelle
    parts = parts.filter(p => (p.v -= 1) > 0); parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .3; c.fillStyle = p.c; c.fillRect(p.x, p.y, 3, 3); });
    c.restore();
    // barra di scorrimento
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(W - BAR, 0, BAR, Hv);
    const th = Math.max(30, Hv * Hv / TOT), ty = maxScroll ? scrollY / maxScroll * (Hv - th) : 0;
    c.fillStyle = 'rgba(255,255,255,.75)'; D.rr(c, W - BAR + 5, ty + 2, BAR - 10, th - 4, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.font = '10px system-ui'; c.textAlign = 'center'; c.fillText('↕', W - BAR / 2, ty + th / 2 + 4);
    // profondità
    const prof = Math.max(0, (scrollY + Hv - CIELO) / cell) * .25; c.fillStyle = 'rgba(0,0,0,.45)'; D.rr(c, 6, Hv - 26, 74, 20, 6); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = '11px system-ui'; c.fillText(`↓ ${Math.min(prof, ROWS * .25).toFixed(1)} m`, 12, Hv - 12);
  }
  function loop() { raf = requestAnimationFrame(loop); if (!sporco && !parts.length && posaV < .01 && Math.abs(pgT - pgX) < .5) return; disegna(); sporco = false; }
  // il bagliore dei reperti richiede ridisegni periodici
  const intBagliore = setInterval(() => sporco = true, 120);
  // setaccio
  function setaccio() {
    if (!st.sec && !st.secRep.length) { toast('Il secchio è vuoto: prima scava un po\''); return; }
    const box = el('div', 'setaccio'); box.appendChild(el('h2', null, 'Setaccio'));
    box.appendChild(el('p', 'nota', 'Scuoti il setaccio a destra e a sinistra con il dito.'));
    const S2 = Math.min(300, innerWidth - 60); const [sc, sx] = canvas(S2, S2); box.appendChild(sc);
    const granelli = []; const rnd = Math.random, colori = st.strati.length ? st.strati.map(i => sito.strati[i].c) : ['#7b5b3c'];
    const quanti = Math.max(4, st.sec) * 14; for (let k = 0; k < quanti; k++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * S2 * .38; granelli.push({x: S2 / 2 + Math.cos(a) * d, y: S2 / 2 + Math.sin(a) * d, r: 2 + rnd() * 4, c: colori[Math.floor(rnd() * colori.length)]}); }
    const trovati = st.secRep.slice(), oggetti = trovati.map((fid, k) => ({fid, x: S2 / 2 + Math.cos(k * 2.4) * S2 * .18, y: S2 / 2 + Math.sin(k * 2.4) * S2 * .18, img: rendiReperto(REP[fid], 46 * DPR), preso: false}));
    let off = 0, ultimoX = null, finito = false;
    const draw = () => {
      sx.clearRect(0, 0, S2, S2); sx.save(); sx.translate(off, 0);
      sx.fillStyle = '#8a6a44'; D.ell(sx, S2 / 2, S2 / 2, S2 * .47, S2 * .47); sx.fill(); sx.fillStyle = '#d9cba8'; D.ell(sx, S2 / 2, S2 / 2, S2 * .42, S2 * .42); sx.fill();
      sx.save(); D.ell(sx, S2 / 2, S2 / 2, S2 * .42, S2 * .42); sx.clip(); sx.strokeStyle = 'rgba(90,70,40,.35)'; sx.lineWidth = 1; for (let k = -S2; k < S2; k += 7) { sx.beginPath(); sx.moveTo(k, 0); sx.lineTo(k + S2, S2); sx.moveTo(k + S2, 0); sx.lineTo(k, S2); sx.stroke(); } sx.restore();
      oggetti.forEach(o => { if (!o.preso) sx.drawImage(o.img, o.x - 23, o.y - 23, 46, 46); });
      granelli.forEach(g => { sx.fillStyle = g.c; D.ell(sx, g.x, g.y, g.r, g.r); sx.fill(); });
      sx.restore();
    };
    draw();
    const scuoti = dx => { if (finito) return; off = Math.max(-14, Math.min(14, off + dx * .4)); for (let k = granelli.length - 1; k >= 0; k--) { const g = granelli[k]; g.x += (Math.random() - .5) * Math.abs(dx) * .6; g.y += (Math.random() - .5) * Math.abs(dx) * .6; if (Math.random() < Math.abs(dx) * .004 * (6 / g.r)) granelli.splice(k, 1); } if (Math.random() < .3) Audio.sfx.setaccio(); if (granelli.length < quanti * .12) { granelli.length = 0; finito = true; chiudi(); } draw(); };
    sc.addEventListener('pointerdown', e => { ultimoX = e.clientX; sc.setPointerCapture(e.pointerId); const r = sc.getBoundingClientRect(); if (finito) prendi(e.clientX - r.left, e.clientY - r.top); });
    sc.addEventListener('pointermove', e => { if (ultimoX == null) return; scuoti(e.clientX - ultimoX); ultimoX = e.clientX; });
    sc.addEventListener('pointerup', () => { ultimoX = null; off = 0; draw(); });
    const esito = el('p', 'esito', ''); box.appendChild(esito);
    function chiudi() {
      S.stat.setacciate++; st.sec = 0; off = 0; draw(); aggiornaBarra();
      if (!oggetti.length) { esito.textContent = 'Solo terra e sassolini. Anche questo fa parte del lavoro!'; }
      else { esito.textContent = 'C\'è qualcosa! Tocca i reperti per raccoglierli.'; Audio.sfx.scintilla(); }
      salva();
    }
    function prendi(mx, my) { oggetti.forEach(o => { if (!o.preso && Math.hypot(o.x - mx, o.y - my) < 30) { o.preso = true; st.secRep = st.secRep.filter(z => z !== o.fid); st.rep[o.fid] = st.rep[o.fid] || {danni: 0}; st.rep[o.fid].visto = true; Audio.sfx.trovato(); estrai(o.fid); toast(`Trovato: <b>${REP[o.fid].n}</b>${st.rep[o.fid].danni ? ' (rotto)' : ''}`); draw(); } }); if (oggetti.every(o => o.preso) && oggetti.length) esito.textContent = 'Tutto raccolto: è nella cassetta del laboratorio.'; }
    modale(box, [{t: 'Fatto', primario: true, f: () => { if (!finito) { st.sec = 0; aggiornaBarra(); salva(); } else oggetti.forEach(o => { if (!o.preso) { o.preso = true; st.secRep = st.secRep.filter(z => z !== o.fid); st.rep[o.fid] = st.rep[o.fid] || {danni: 0}; estrai(o.fid); } }); }}]);
  }
  function mostraStrati() {
    const box = el('div'); box.appendChild(el('h2', null, 'Gli strati'));
    box.appendChild(el('p', 'nota', 'Più si scende, più si va indietro nel tempo.'));
    sito.strati.forEach((s, i) => { const vis = st.strati.includes(i); const r = el('div', 'rigaStrato'); r.innerHTML = `<span class="camp" style="background:${s.c};height:${s.r * 9}px"></span><span><b>${vis ? s.n : '???'}</b><br><small>${vis ? s.e + ' — ' + s.i : 'Non ancora raggiunto'}</small></span>`; box.appendChild(r); });
    modale(box);
  }
  info.innerHTML = st.strati.length ? `<b>${sito.nome}</b> · ${sito.paese}<br><small>${sito.intro}</small>` : `<b>${sito.nome}</b> · ${sito.paese}<br><small>${sito.intro}</small>`;
  aggiornaBarra(); scrollTo(scrollY); loop();
  attivo = {esci() { cancelAnimationFrame(raf); clearInterval(intBagliore); salva(); }};
  window.__scavo = {cell, GX, CIELO, P, colpisci, scroll: () => scrollY, scrollTo, att: a => { attrezzo = a; aggiornaBarra(); }, setaccio};
  if (!S.visti.scavo) { S.visti.scavo = true; salva(); setTimeout(() => modale(`<h2>Come si scava</h2><p>Tocca la terra in alto per toglierla, poi scendi quadretto dopo quadretto.</p><ul class="lista"><li>⛏️ <b>Piccone</b>: veloce, anche sulla roccia, ma rompe i reperti.</li><li>🔺 <b>Cazzuola</b>: un quadretto alla volta; con la cazzuola e il pennello puoi trascinare il dito.</li><li>🖌️ <b>Pennello</b>: lento e delicato, perfetto quando vedi brillare un reperto.</li><li>🪣 <b>Setaccio</b>: la terra tolta finisce nel secchio; setacciala per trovare gli oggetti piccoli.</li></ul><p>Trascina la barra a destra per scorrere in basso.</p>`, [{t: 'Ho capito', primario: true}]), 250); }
  else if (!st.visitato) { setTimeout(() => modale(`<h2>${sito.nome}</h2><p>${sito.intro}</p>`, [{t: 'Scaviamo', primario: true}]), 200); }
  st.visitato = true;
};

// ---------- laboratorio ----------
function pezziDi(fid, danni) { const f = REP[fid]; let n = (f.pz || 0) + 2 * (danni || 0); if (n === 1) n = 2; return Math.min(16, n); }
function fasiDi(fid) { const f = REP[fid], l = S.lab[fid], a = ['pulire']; if (pezziDi(fid, l ? l.danni : 0) >= 2) a.push('ricomporre'); if (f.x) a.push('decifrare'); a.push('catalogare'); return a; }
const NOMI_FASE = {pulire: 'Pulire', ricomporre: 'Ricomporre', decifrare: 'Decifrare', catalogare: 'Catalogare', fatto: 'Nel diario'};
SCHERMATE.lab = main => {
  Audio.suona('museo');
  main.appendChild(testata('Laboratorio'));
  const pag = el('div', 'pagina');
  const da = S.ordineLab.filter(fid => S.lab[fid] && S.lab[fid].fase !== 'fatto');
  if (!da.length) { pag.appendChild(el('div', 'vuoto', '<p>🧪</p><p>Il tavolo è vuoto. I reperti che trovi negli scavi arrivano qui per essere puliti, ricomposti e studiati.</p>')); main.appendChild(pag); return; }
  pag.appendChild(el('p', 'nota', 'Tocca un reperto per continuare il lavoro.'));
  const lista = el('div', 'griglia');
  da.forEach(fid => {
    const f = REP[fid], l = S.lab[fid], fasi = fasiDi(fid), k = fasi.indexOf(l.fase);
    const b = el('button', 'cardRep'); b.appendChild(miniatura(f, 92, 70));
    b.appendChild(el('b', null, f.n)); b.appendChild(el('small', null, `${SITO[f.sito].nome} · ${NOMI_FASE[l.fase]}`));
    const passi = el('span', 'passi'); fasi.forEach((z, j) => passi.appendChild(el('i', j < k ? 'ok' : j === k ? 'ora' : ''))); b.appendChild(passi);
    b.onclick = () => { Audio.sfx.tocco(); vai('tavolo', fid); };
    lista.appendChild(b);
  });
  pag.appendChild(lista); main.appendChild(pag);
};
function avanza(fid) { const l = S.lab[fid], fasi = fasiDi(fid), k = fasi.indexOf(l.fase); l.fase = k + 1 < fasi.length ? fasi[k + 1] : 'fatto'; if (l.fase === 'fatto') S.cat[fid] = Date.now(); salva(); aggiornaBadge(); }
SCHERMATE.tavolo = (main, fid) => {
  const f = REP[fid], l = S.lab[fid];
  if (!l || l.fase === 'fatto') { vai('lab', null, true); return; }
  main.appendChild(testata(`${NOMI_FASE[l.fase]}: ${f.n}`, true));
  const pag = el('div', 'pagina tavolo'); main.appendChild(pag);
  const fasi = fasiDi(fid), passi = el('div', 'passiGrandi'); fasi.forEach(z => passi.appendChild(el('span', z === l.fase ? 'ora' : fasi.indexOf(z) < fasi.indexOf(l.fase) ? 'ok' : '', NOMI_FASE[z]))); pag.appendChild(passi);
  const fine = () => { Audio.sfx.scintilla(); avanza(fid); setTimeout(() => vai('tavolo', fid, true), 700); };
  if (l.fase === 'pulire') pulire(pag, f, fine);
  else if (l.fase === 'ricomporre') ricomporre(pag, f, pezziDi(fid, l.danni), fine);
  else if (l.fase === 'decifrare') decifrare(pag, f, () => { S.stat.letti++; fine(); });
  else catalogare(pag, f, () => { avanza(fid); Audio.sfx.trovato(); schedaReperto(fid, true); });
};
function pulire(pag, f, fine) {
  pag.appendChild(el('p', 'nota', 'Passa il pennellino sul reperto per togliere la terra incrostata.'));
  const [w, h] = D.dimensioni(f), Wc = Math.min(innerWidth - 32, 360), Hc = Math.round(Math.min(Wc * h / w, innerHeight * .5)), Wf = Math.round(Math.min(Wc, Hc * w / h));
  const [c, x] = canvas(Wf, Hc); c.className = 'tela'; pag.appendChild(c);
  const base = rendiReperto(f, Math.max(Wf, Hc) * DPR);
  const [sp, spx] = offscreen(Wf * DPR, Hc * DPR); spx.drawImage(base, 0, 0, Wf * DPR, Hc * DPR); spx.globalCompositeOperation = 'source-in';
  const rnd = D.seeded(D.hash(f.id)); spx.fillStyle = '#7b5d40'; spx.fillRect(0, 0, Wf * DPR, Hc * DPR); for (let k = 0; k < 300; k++) { spx.fillStyle = rnd() < .5 ? '#5e452f' : '#a0805a'; D.ell(spx, rnd() * Wf * DPR, rnd() * Hc * DPR, rnd() * 9 * DPR, rnd() * 9 * DPR); spx.fill(); }
  spx.globalCompositeOperation = 'source-over';
  // punti campione per misurare la pulizia
  const dati = base.getContext('2d').getImageData(0, 0, base.width, base.height).data, campioni = [];
  for (let k = 0; k < 4000 && campioni.length < 900; k++) { const px = Math.floor(rnd() * base.width), py = Math.floor(rnd() * base.height); if (dati[(py * base.width + px) * 4 + 3] > 200) campioni.push([px * Wf * DPR / base.width | 0, py * Hc * DPR / base.height | 0]); }
  const bar = el('div', 'barraPulizia', '<i></i>'); pag.appendChild(bar);
  const disegna = () => { x.clearRect(0, 0, Wf, Hc); x.drawImage(base, 0, 0, Wf, Hc); x.drawImage(sp, 0, 0, Wf, Hc); };
  disegna();
  let giu = false, mosse = 0, chiuso = false;
  const pennella = e => { const r = c.getBoundingClientRect(), mx = (e.clientX - r.left) * DPR, my = (e.clientY - r.top) * DPR; spx.globalCompositeOperation = 'destination-out'; const g = spx.createRadialGradient(mx, my, 1, mx, my, 22 * DPR); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); spx.fillStyle = g; spx.beginPath(); spx.arc(mx, my, 22 * DPR, 0, Math.PI * 2); spx.fill(); spx.globalCompositeOperation = 'source-over'; disegna(); if (++mosse % 6 === 0) { Audio.sfx.pennello(); misura(); } };
  const misura = () => { if (chiuso) return; const d = spx.getImageData(0, 0, Wf * DPR, Hc * DPR).data; let pul = 0; campioni.forEach(([px, py]) => { if (d[(py * Wf * DPR + px) * 4 + 3] < 60) pul++; }); const p = campioni.length ? pul / campioni.length : 1; bar.firstChild.style.width = Math.min(100, p / .85 * 100) + '%'; if (p >= .85) { chiuso = true; spx.clearRect(0, 0, Wf * DPR, Hc * DPR); disegna(); toast('Pulito!'); fine(); } };
  c.addEventListener('pointerdown', e => { giu = true; c.setPointerCapture(e.pointerId); pennella(e); });
  c.addEventListener('pointermove', e => { if (giu) pennella(e); });
  c.addEventListener('pointerup', () => { giu = false; misura(); });
  if (!campioni.length) setTimeout(fine, 300);
}
function ricomporre(pag, f, n, fine) {
  pag.appendChild(el('p', 'nota', `Trascina i ${n} pezzi nella sagoma. Tocca un pezzo per girarlo.`));
  const Wb = Math.min(innerWidth - 24, 420), [w, h] = D.dimensioni(f);
  const tgtH = Math.min(Wb * .55, innerHeight * .3), tgtW = Math.min(Wb * .66, tgtH * w / h), tH = tgtW * h / w;
  const vassoio = Math.max(170, tH * 1.5, innerHeight * .4), Hb = tH + 30 + vassoio;
  const [c, x] = canvas(Wb, Hb); c.className = 'tela'; pag.appendChild(c);
  const base = rendiReperto(f, Math.max(tgtW, tH) * DPR), BW = base.width, BH = base.height, k = tgtW / BW * 1; const ox = (Wb - tgtW) / 2, oy = 14;
  const dati = base.getContext('2d').getImageData(0, 0, BW, BH);
  const rnd = D.seeded(D.hash(f.id) + n);
  const semi = []; for (let t = 0; t < 20000 && semi.length < n; t++) { const px = Math.floor(rnd() * BW), py = Math.floor(rnd() * BH); if (dati.data[(py * BW + px) * 4 + 3] > 200 && semi.every(s => Math.hypot(s[0] - px, s[1] - py) > Math.min(BW, BH) / (Math.sqrt(n) * 2.2))) semi.push([px, py]); }
  while (semi.length < 2) semi.push([BW * (semi.length ? .75 : .25), BH / 2]);
  const prop = new Int16Array(BW * BH).fill(-1);
  for (let py = 0; py < BH; py++) for (let px = 0; px < BW; px++) { const a = dati.data[(py * BW + px) * 4 + 3]; if (a < 10) continue; let b = 0, bd = 1e12; const jx = px + Math.sin(py * .09) * 6, jy = py + Math.sin(px * .08) * 6; for (let s = 0; s < semi.length; s++) { const dx = semi[s][0] - jx, dy = semi[s][1] - jy, d = dx * dx + dy * dy; if (d < bd) { bd = d; b = s; } } prop[py * BW + px] = b; }
  const pezzi = semi.map((s, i) => { let x0 = BW, y0 = BH, x1 = 0, y1 = 0; for (let py = 0; py < BH; py++) for (let px = 0; px < BW; px++) if (prop[py * BW + px] === i) { if (px < x0) x0 = px; if (py < y0) y0 = py; if (px > x1) x1 = px; if (py > y1) y1 = py; } if (x1 < x0) return null; const pw = x1 - x0 + 1, ph = y1 - y0 + 1; const [pc, pcx] = offscreen(pw, ph); const id = pcx.createImageData(pw, ph); for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) if (prop[py * BW + px] === i) { const o = (py * BW + px) * 4, d = ((py - y0) * pw + (px - x0)) * 4; for (let q = 0; q < 4; q++) id.data[d + q] = dati.data[o + q]; } pcx.putImageData(id, 0, 0); pcx.strokeStyle = 'rgba(60,40,25,.6)'; return {img: pc, w: pw * k, h: ph * k, tx: ox + x0 * k, ty: oy + y0 * k, x: 0, y: 0, rot: 0, ok: false}; }).filter(Boolean);
  pezzi.forEach((p, i) => { p.x = Math.max(0, 6 + rnd() * (Wb - p.w - 12)); p.y = tH + 30 + Math.max(0, rnd() * (vassoio - p.h - 6)); p.rot = n > 3 ? Math.floor(rnd() * 4) : 0; });
  const sagoma = (() => { const [s, sx] = offscreen(BW, BH); sx.drawImage(base, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = 'rgba(80,60,40,.22)'; sx.fillRect(0, 0, BW, BH); return s; })();
  let pres = null, dx = 0, dy = 0, mosso = false, sx0 = 0, sy0 = 0, chiuso = false;
  const disegna = () => {
    x.clearRect(0, 0, Wb, Hb); x.fillStyle = '#efe5d3'; x.fillRect(0, 0, Wb, tH + 26); x.fillStyle = '#d8c8ac'; x.fillRect(0, tH + 26, Wb, Hb);
    x.drawImage(sagoma, ox, oy, tgtW, tH);
    const ord = pezzi.slice().sort((a, b) => (b.ok - a.ok) || (a === pres) - (b === pres));
    ord.forEach(p => { x.save(); x.translate(p.x + p.w / 2, p.y + p.h / 2); x.rotate(p.rot * Math.PI / 2); if (!p.ok) { x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 6; x.shadowOffsetY = 2; } x.drawImage(p.img, -p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
  };
  const trova = (mx, my) => { for (let i = pezzi.length - 1; i >= 0; i--) { const p = pezzi[i]; if (p.ok) continue; const r = Math.max(p.w, p.h) / 2 + 6; if (Math.abs(mx - (p.x + p.w / 2)) < r && Math.abs(my - (p.y + p.h / 2)) < r) return p; } return null; };
  c.addEventListener('pointerdown', e => { const r = c.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; pres = trova(mx, my); if (!pres) return; c.setPointerCapture(e.pointerId); dx = mx - pres.x; dy = my - pres.y; sx0 = mx; sy0 = my; mosso = false; pezzi.splice(pezzi.indexOf(pres), 1); pezzi.push(pres); disegna(); });
  c.addEventListener('pointermove', e => { if (!pres) return; const r = c.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; if (Math.hypot(mx - sx0, my - sy0) > 6) mosso = true; pres.x = Math.max(-pres.w / 2, Math.min(Wb - pres.w / 2, mx - dx)); pres.y = Math.max(-pres.h / 2, Math.min(Hb - pres.h / 2, my - dy)); disegna(); });
  c.addEventListener('pointerup', () => {
    if (!pres) return; const p = pres; pres = null;
    if (!mosso) { p.rot = (p.rot + 1) % 4; Audio.sfx.tocco(); }
    if (p.rot === 0 && Math.hypot(p.x - p.tx, p.y - p.ty) < Math.max(16, Math.min(p.w, p.h) * .35)) { p.x = p.tx; p.y = p.ty; p.ok = true; Audio.sfx.incastro(); navigator.vibrate && navigator.vibrate(10); }
    else if (mosso && p.rot !== 0 && Math.hypot(p.x - p.tx, p.y - p.ty) < 30) toast('Quasi: prima giralo dal verso giusto');
    disegna();
    if (!chiuso && pezzi.every(z => z.ok)) { chiuso = true; toast('Ricomposto!'); fine(); }
  });
  disegna();
  window.__ric = {pezzi, c};
}
function decifrare(pag, f, fine) {
  const X = ISCRIZIONI[f.x]; pag.appendChild(el('h3', null, X.titolo));
  if (X.aiuto) pag.appendChild(el('p', 'nota', X.aiuto));
  const ris = el('div', 'lettura');
  const finale = () => { ris.innerHTML = `<p>${X.lettura}</p>`; Audio.sfx.trovato(); const b = el('button', 'btn primario grande', 'Avanti'); b.onclick = () => { Audio.sfx.tocco(); fine(); }; ris.appendChild(b); ris.scrollIntoView({behavior: 'smooth', block: 'center'}); };
  if (X.k === 'parole') {
    pag.appendChild(miniatura(f, Math.min(innerWidth - 40, 340), 160));
    let fatte = 0; X.righe.forEach(rg => { const r = el('div', 'rigaParola'); r.appendChild(el('span', 'parolaLat', rg.w)); const g = el('div', 'gruppo'); mescola([rg.ok, ...rg.alt]).forEach(o => { const b = el('button', 'pill', o); b.onclick = () => { if (r.dataset.ok) return; if (o === rg.ok) { b.classList.add('giusto'); r.dataset.ok = 1; Audio.sfx.incastro(); if (++fatte === X.righe.length) finale(); } else { b.classList.add('sbagliato'); Audio.sfx.errore(); setTimeout(() => b.classList.remove('sbagliato'), 500); } }; g.appendChild(b); }); r.appendChild(g); pag.appendChild(r); });
  } else if (X.k === 'segni') {
    const fam = {eg: 'SLTeg', ru: 'SLTru', lb: 'SLTlb'}[X.font];
    let sel = null, totale = 0, fatte = 0; const parole = el('div', 'parole');
    X.parole.forEach(p => { const r = el('div', 'parolaSegni'); const segni = el('div', 'segni'); p.g.forEach(g => { totale++; const s = el('button', 'segno'); s.innerHTML = `<span style="font-family:${fam},serif">${g}</span><i>?</i>`; s.dataset.g = g; s.onclick = () => { if (s.dataset.ok) return; Audio.sfx.tocco(); parole.querySelectorAll('.segno').forEach(z => z.classList.remove('sel')); s.classList.add('sel'); sel = s; }; segni.appendChild(s); }); r.appendChild(segni); const sig = el('div', 'significato', '…'); r.appendChild(sig); p._sig = sig; p._segni = segni; parole.appendChild(r); });
    pag.appendChild(parole);
    pag.appendChild(el('p', 'nota', 'Tocca un segno qui sopra, poi il suo suono nella tabella.'));
    const tab = el('div', 'tabella');
    mescola(X.tab).forEach(([g, v]) => { const b = el('button', 'voce', `<span style="font-family:${fam},serif">${g}</span><b>${v}</b>`); b.onclick = () => { if (!sel) { toast('Prima tocca un segno della scritta'); return; } if (sel.dataset.g === g) { sel.dataset.ok = 1; sel.classList.remove('sel'); sel.classList.add('ok'); sel.querySelector('i').textContent = v; Audio.sfx.incastro(); fatte++; X.parole.forEach(p => { if ([...p._segni.children].every(z => z.dataset.ok)) p._sig.innerHTML = `<b>${p.let}</b> = ${p.sig}`; }); const prossimo = parole.querySelector('.segno:not([data-ok])'); sel = prossimo; if (prossimo) prossimo.classList.add('sel'); if (fatte === totale) finale(); } else { Audio.sfx.errore(); b.classList.add('sbagliato'); setTimeout(() => b.classList.remove('sbagliato'), 500); } }; tab.appendChild(b); });
    pag.appendChild(tab);
    const primo = parole.querySelector('.segno'); if (primo) { primo.classList.add('sel'); sel = primo; }
  } else if (X.k === 'maya' || X.k === 'khipu') {
    const vals = X.k === 'maya' ? X.numeri : X.corde; let fatte = 0;
    const g = el('div', 'numeri');
    vals.forEach((v, i) => {
      const box = el('div', 'numero'); const [c, x] = canvas(X.k === 'maya' ? 70 : 76, 130);
      if (X.k === 'maya') { x.fillStyle = '#d7cfbd'; x.fillRect(0, 0, 70, 130); D.numeroMaya(x, 8, 8, 54, 114, v, '#3b3428'); }
      else disegnaCorda(x, v, i === vals.length - 1);
      box.appendChild(c);
      const ctr = el('div', 'contatore'); let n = 0; const val = el('input', 'valNum'); val.type = 'number'; val.inputMode = 'numeric'; val.value = ''; val.placeholder = '?';
      const meno = el('button', 'pill', '−'), piu = el('button', 'pill', '+');
      const prova = () => { if (box.dataset.ok) return; n = parseInt(val.value, 10); if (n === v) { box.dataset.ok = 1; box.classList.add('ok'); val.disabled = true; Audio.sfx.incastro(); if (++fatte === vals.length) finale(); } };
      meno.onclick = () => { n = Math.max(0, (parseInt(val.value, 10) || 0) - 1); val.value = n; Audio.sfx.tocco(); prova(); };
      piu.onclick = () => { n = (parseInt(val.value, 10) || 0) + 1; val.value = n; Audio.sfx.tocco(); prova(); };
      val.oninput = prova;
      ctr.append(meno, val, piu); box.appendChild(ctr); g.appendChild(box);
    });
    pag.appendChild(g);
  } else if (X.k === 'indo') {
    pag.appendChild(miniatura(f, 200, 200));
    pag.appendChild(el('p', null, 'Che cosa c\'è scritto in cima al sigillo?'));
    const g = el('div', 'gruppo colonna'); ['Il nome di un mercante', 'Una preghiera', 'Il prezzo della merce'].forEach(o => { const b = el('button', 'btn', o); b.onclick = () => { if (g.dataset.ok) return; g.dataset.ok = 1; b.classList.add('giusto'); finale(); }; g.appendChild(b); }); pag.appendChild(g);
  }
  pag.appendChild(ris);
}
function disegnaCorda(x, v, somma) {
  x.fillStyle = '#efe6d2'; x.fillRect(0, 0, 76, 130); x.strokeStyle = '#8a6a44'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 8); x.lineTo(76, 8); x.stroke();
  x.strokeStyle = somma ? '#7c5a3a' : '#c9a372'; x.lineWidth = 5; x.beginPath(); x.moveTo(38, 8); x.quadraticCurveTo(42, 70, 36, 128); x.stroke();
  const cifre = [Math.floor(v / 100), Math.floor(v / 10) % 10, v % 10], ys = [30, 66, 100];
  x.fillStyle = '#4a3420'; cifre.forEach((d, i) => { for (let k = 0; k < d; k++) { D.ell(x, 38 + (i === 2 ? 0 : 0), ys[i] + (k - (d - 1) / 2) * 6, 5, 3); x.fill(); } });
  x.fillStyle = 'rgba(0,0,0,.35)'; x.font = '9px system-ui'; ['100', '10', '1'].forEach((t, i) => x.fillText(t, 2, ys[i] + 3));
  if (somma) { x.fillStyle = '#7c5a3a'; x.font = 'bold 9px system-ui'; x.fillText('somma', 44, 125); }
}
function catalogare(pag, f, fine) {
  const sito = SITO[f.sito]; pag.appendChild(el('h3', null, 'Da che epoca viene?'));
  pag.appendChild(el('p', 'nota', `L'hai trovato nello strato con la freccia. Gli strati sopra sono più recenti, quelli sotto più antichi.`));
  const col = el('div', 'colonnaStrati'); sito.strati.forEach((s, i) => { const r = el('div', 'rigaStrato' + (i === f.s ? ' qui' : '')); r.innerHTML = `<span class="camp" style="background:${s.c};height:${s.r * 7}px"></span><span><b>${s.n}</b>${i === f.s ? ' <em>← trovato qui</em><br><small>Epoca: ?</small>' : `<br><small>${s.e}</small>`}</span>`; col.appendChild(r); }); pag.appendChild(col);
  const giusta = sito.strati[f.s].e; const altre = mescola(sito.strati.filter((s, i) => i !== f.s && s.e !== giusta).map(s => s.e)).slice(0, 2);
  const g = el('div', 'gruppo colonna'); mescola([giusta, ...altre]).forEach(o => { const b = el('button', 'btn', o); b.onclick = () => { if (g.dataset.ok) return; if (o === giusta) { g.dataset.ok = 1; b.classList.add('giusto'); Audio.sfx.incastro(); setTimeout(fine, 400); } else { b.classList.add('sbagliato'); Audio.sfx.errore(); toast('Non è quello lo strato: guarda la freccia'); setTimeout(() => b.classList.remove('sbagliato'), 600); } }; g.appendChild(b); }); pag.appendChild(g);
}
function schedaReperto(fid, nuovo) {
  const f = REP[fid], s = SITO[f.sito], box = el('div', 'scheda');
  if (nuovo) box.appendChild(el('p', 'etichetta', 'Nuovo nel diario'));
  box.appendChild(el('h2', null, f.n)); box.appendChild(miniatura(f, Math.min(innerWidth - 80, 260), 200));
  box.appendChild(el('p', 'dove', `${s.nome} (${s.paese}) · ${s.strati[f.s].n}, ${s.strati[f.s].e}`));
  box.appendChild(el('p', null, f.i));
  if (f.p) box.appendChild(el('p', 'stella', '★ Reperto principale della sala'));
  modale(box, nuovo ? [{t: 'Laboratorio', f: () => vai('lab', null, true)}, {t: 'Al museo', primario: true, f: () => vai('sala', f.sito)}] : [{t: 'Chiudi', primario: true}], {largo: true});
}

// ---------- diario ----------
SCHERMATE.diario = main => {
  Audio.suona('museo');
  main.appendChild(testata('Diario di scavo'));
  const pag = el('div', 'pagina'); const tot = Object.keys(S.cat).length;
  pag.appendChild(el('p', 'nota', `Reperti studiati: <b>${tot}</b> su ${Object.keys(REP).length}. Iscrizioni lette: ${S.stat.letti}. Reperti rotti e ricomposti: ${S.stat.rotti}.`));
  SITI.forEach(s => { pag.appendChild(el('h3', 'titoloSez', `${s.nome} <small>${s.reperti.filter(f => S.cat[f.id]).length}/${s.reperti.length}</small>`)); const g = el('div', 'griglia piccola'); s.reperti.forEach(f => { const b = el('button', 'cardRep mini' + (S.cat[f.id] ? '' : ' vuota')); if (S.cat[f.id]) { b.appendChild(miniatura(f, 60, 50)); b.appendChild(el('small', null, f.n)); b.onclick = () => { Audio.sfx.tocco(); schedaReperto(f.id); }; } else { b.appendChild(el('span', 'q', '?')); b.disabled = true; } g.appendChild(b); }); pag.appendChild(g); });
  main.appendChild(pag);
};

// ---------- museo ----------
const PARETI = ['#7a2f2a', '#2f4a5f', '#3f5a3a', '#5a4a6a', '#c9b48f'];
function sala(id) { if (!S.museo[id]) S.museo[id] = {col: SITI.findIndex(s => s.id === id) % PARETI.length, v: Array(8).fill(null)}; return S.museo[id]; }
function esposti() { let n = 0; SITI.forEach(s => { if (S.museo[s.id]) n += S.museo[s.id].v.filter(Boolean).length; }); return n; }
function principaliEsposti() { return SITI.filter(s => S.museo[s.id] && S.museo[s.id].v.some(fid => fid && REP[fid].p)).length; }
SCHERMATE.museo = main => {
  Audio.suona('museo');
  main.appendChild(testata(`Museo di ${escapeHtml(S.pg.nome)}`));
  const pag = el('div', 'pagina');
  const n = esposti(), pr = principaliEsposti();
  pag.appendChild(el('p', 'nota', S.finale ? `Il museo è aperto: <b>${(n * 35 + 120).toLocaleString('it-IT')}</b> visitatori al giorno. Reperti esposti: ${n}/96.` : `Reperti principali esposti: <b>${pr}/12</b>. Quando ci saranno tutti, il museo aprirà al pubblico. Reperti esposti: ${n}/96.`));
  const lista = el('div', 'listaSiti');
  SITI.forEach(s => { const sl = S.museo[s.id], m = sl ? sl.v.filter(Boolean).length : 0, haP = sl && sl.v.some(fid => fid && REP[fid].p), pronti = s.reperti.filter(f => S.cat[f.id]).length; const b = el('button', 'cardSito'); b.innerHTML = `<span class="num" style="background:${PARETI[sl ? sl.col : 0]}">${haP ? '★' : '·'}</span><span class="info"><b>Sala ${s.nome}</b><small>${m} in vetrina · ${pronti} studiati</small><span class="barra"><i style="width:${m / 8 * 100}%"></i></span></span><span class="conta">${m}/8</span>`; b.onclick = () => { Audio.sfx.tocco(); vai('sala', s.id); }; lista.appendChild(b); });
  pag.appendChild(lista);
  if (S.finale) { const b = el('button', 'btn grande', 'Rivedi l\'inaugurazione'); b.onclick = () => vai('finale'); pag.appendChild(b); }
  main.appendChild(pag);
};
SCHERMATE.sala = (main, id) => {
  Audio.suona('museo');
  const s = SITO[id], sl = sala(id);
  main.appendChild(testata(`Sala ${s.nome}`, true));
  const pag = el('div', 'pagina');
  const W = Math.min(innerWidth - 24, 520), H = Math.round(W * 1.05);
  const [c, x] = canvas(W, H); c.className = 'tela'; pag.appendChild(c);
  const vet = []; for (let i = 0; i < 8; i++) { const col = i % 2, row = Math.floor(i / 2); vet.push({x: W * (.08 + col * .46), y: H * (.14 + row * .205), w: W * .38, h: H * .18}); }
  const disegna = () => {
    x.fillStyle = PARETI[sl.col]; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < W; i += 24) x.fillRect(i, 0, 2, H * .92);
    x.fillStyle = '#6b4e33'; x.fillRect(0, H * .93, W, H * .07); x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(0, H * .92, W, 4);
    x.fillStyle = '#f2e9d6'; x.font = `bold ${W * .05}px Georgia, serif`; x.textAlign = 'center'; x.fillText(s.nome.toUpperCase(), W / 2, H * .07); x.font = `${W * .03}px system-ui`; x.fillStyle = 'rgba(242,233,214,.8)'; x.fillText(s.paese, W / 2, H * .105);
    vet.forEach((v, i) => {
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(v.x + 4, v.y + 6, v.w, v.h);
      x.fillStyle = '#efe7d6'; x.fillRect(v.x, v.y, v.w, v.h); x.fillStyle = 'rgba(180,210,230,.25)'; x.fillRect(v.x, v.y, v.w, v.h * .2);
      x.strokeStyle = '#3b2c1d'; x.lineWidth = 3; x.strokeRect(v.x, v.y, v.w, v.h);
      const fid = sl.v[i];
      if (fid) { const f = REP[fid], [fw, fh] = D.dimensioni(f), k = Math.min(v.w * .8 / fw, v.h * .7 / fh); D.reperto(x, f, v.x + (v.w - fw * k) / 2, v.y + v.h * .06 + (v.h * .7 - fh * k) / 2, fw * k, fh * k); x.fillStyle = '#3b2c1d'; x.font = `${Math.max(9, W * .022)}px system-ui`; x.fillText((f.p ? '★ ' : '') + f.n, v.x + v.w / 2, v.y + v.h * .93, v.w * .95); }
      else { x.fillStyle = 'rgba(59,44,29,.35)'; x.font = `${W * .06}px system-ui`; x.fillText('+', v.x + v.w / 2, v.y + v.h * .6); }
    });
    if (S.finale) { D.personaggio(x, W * .5, H * .99, H * .14, S.pg, 0); }
  };
  disegna();
  c.onclick = e => { const r = c.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; const i = vet.findIndex(v => mx >= v.x && mx <= v.x + v.w && my >= v.y && my <= v.y + v.h); if (i < 0) return; Audio.sfx.tocco(); scegli(i); };
  function scegli(i) {
    const fid = sl.v[i];
    if (fid) { const f = REP[fid]; const box = el('div', 'scheda'); box.appendChild(el('h2', null, f.n)); box.appendChild(miniatura(f, 200, 160)); box.appendChild(el('p', null, f.i)); modale(box, [{t: 'Togli dalla vetrina', f: () => { sl.v[i] = null; salva(); disegna(); }}, {t: 'Chiudi', primario: true}]); return; }
    const liberi = s.reperti.filter(f => S.cat[f.id] && !sl.v.includes(f.id));
    if (!liberi.length) { modale(`<h2>Niente da esporre</h2><p>${s.reperti.some(f => S.cat[f.id]) ? 'Tutti i reperti studiati di questo sito sono già in vetrina.' : 'Prima trova i reperti a ' + s.nome + ' e studiali in laboratorio.'}</p>`); return; }
    const box = el('div'); box.appendChild(el('h2', null, 'Che cosa metti in vetrina?')); const g = el('div', 'griglia');
    liberi.forEach(f => { const b = el('button', 'cardRep'); b.appendChild(miniatura(f, 80, 60)); b.appendChild(el('small', null, (f.p ? '★ ' : '') + f.n)); b.onclick = () => { sl.v[i] = f.id; salva(); Audio.sfx.incastro(); chiudiModale(); disegna(); controllaFinale(); }; g.appendChild(b); });
    box.appendChild(g); modale(box, [{t: 'Annulla'}], {largo: true});
  }
  const pal = el('div', 'scelta'); pal.appendChild(el('span', null, 'Colore delle pareti')); const g = el('div', 'gruppo'); PARETI.forEach((col, i) => { const b = el('button', 'pill colore' + (sl.col === i ? ' on' : '')); b.style.background = col; b.setAttribute('aria-label', 'Colore ' + (i + 1)); b.onclick = () => { sl.col = i; salva(); g.querySelectorAll('button').forEach(z => z.classList.remove('on')); b.classList.add('on'); disegna(); }; g.appendChild(b); }); pal.appendChild(g); pag.appendChild(pal);
  const auto = el('button', 'btn', 'Riempi le vetrine vuote'); auto.onclick = () => { const liberi = s.reperti.filter(f => S.cat[f.id] && !sl.v.includes(f.id)).sort((a, b) => b.p - a.p); let k = 0; for (let i = 0; i < 8 && k < liberi.length; i++) if (!sl.v[i]) sl.v[i] = liberi[k++].id; if (!k) toast('Nessun reperto studiato da aggiungere'); else { Audio.sfx.incastro(); salva(); disegna(); controllaFinale(); } }; pag.appendChild(auto);
  main.appendChild(pag);
};
function controllaFinale() { if (!S.finale && principaliEsposti() === 12) { S.finale = true; salva(true); setTimeout(() => vai('finale'), 600); } }

SCHERMATE.finale = main => {
  Audio.suona('museo'); Audio.sfx.fanfara();
  const W = innerWidth, H = innerHeight; const [c, x] = canvas(W, H); c.className = 'finale'; main.appendChild(c);
  const folla = []; for (let i = 0; i < 70; i++) folla.push({x: Math.random() * W, y: H * (.74 + Math.random() * .2), v: (Math.random() - .5) * .6, col: D.MAGLIA[i % 5], s: 30 + Math.random() * 18});
  const coriandoli = []; for (let i = 0; i < 120; i++) coriandoli.push({x: Math.random() * W, y: -Math.random() * H, v: 1 + Math.random() * 2, c: ['#e8b33a', '#c4573a', '#2f6f8f', '#3f7d46', '#fff'][i % 5]});
  const tot = Object.keys(S.cat).length;
  const righe = [`Il Museo di ${S.pg.nome}`, 'apre le porte!', '', `${tot} reperti studiati`, `${esposti()} in vetrina in 12 sale`, `${S.stat.letti} iscrizioni lette`, `${S.stat.rotti} reperti rotti e ricomposti`, `${S.stat.setacciate} secchi setacciati`, '', 'Grazie per aver scavato con calma.', 'Gli scavi restano aperti: puoi continuare.'];
  let t0 = performance.now(), raf;
  const disegna = () => {
    raf = requestAnimationFrame(disegna); const t = (performance.now() - t0) / 1000;
    x.fillStyle = D.lin(x, 0, 0, 0, H, [[0, '#f3c98b'], [.6, '#f7e6c4'], [1, '#d9c39a']]); x.fillRect(0, 0, W, H);
    const fx = W / 2, fw = Math.min(W * .9, 420), fy = H * .44;
    x.fillStyle = '#efe5cf'; x.beginPath(); x.moveTo(fx - fw / 2, fy); x.lineTo(fx, fy - fw * .18); x.lineTo(fx + fw / 2, fy); x.fill();
    x.fillRect(fx - fw / 2, fy, fw, H * .32); x.fillStyle = '#d8cbb0'; for (let i = 0; i < 6; i++) x.fillRect(fx - fw / 2 + fw * (.06 + i * .17), fy + 10, fw * .07, H * .32 - 10);
    x.fillStyle = '#5a4630'; x.fillRect(fx - fw * .1, fy + H * .12, fw * .2, H * .2);
    x.fillStyle = '#c4573a'; x.fillRect(fx - fw * .2, fy + H * .12, fw * .4, 5);
    folla.forEach((p, i) => { p.x += p.v; if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; x.fillStyle = p.col; D.rr(x, p.x - p.s * .2, p.y - p.s * .7, p.s * .4, p.s * .6, 5); x.fill(); x.fillStyle = D.PELLE[i % 4]; D.ell(x, p.x, p.y - p.s * .85, p.s * .16, p.s * .16); x.fill(); });
    D.personaggio(x, fx, H * .78, H * .16, S.pg, Math.sin(t * 3) * .8);
    coriandoli.forEach(k => { k.y += k.v; k.x += Math.sin(k.y * .03); if (k.y > H) k.y = -10; x.fillStyle = k.c; x.fillRect(k.x, k.y, 4, 7); });
    x.fillStyle = 'rgba(40,28,18,.82)'; const bh = Math.min(H * .34, 260); D.rr(x, 16, 16, W - 32, bh, 14); x.fill();
    x.fillStyle = '#fff'; x.textAlign = 'center';
    righe.forEach((r, i) => { const a = Math.max(0, Math.min(1, t * 1.2 - i * .35)); x.globalAlpha = a; x.font = i < 2 ? `bold ${Math.min(26, W * .065)}px Georgia, serif` : `${Math.min(16, W * .04)}px system-ui`; x.fillText(r, W / 2, 46 + i * (bh - 40) / righe.length); }); x.globalAlpha = 1;
  };
  disegna();
  const b = el('button', 'btn primario grande fineBtn', 'Continua'); b.onclick = () => { cancelAnimationFrame(raf); vai('museo'); }; main.appendChild(b);
  attivo = {esci() { cancelAnimationFrame(raf); }};
};

function impostazioni() {
  const box = el('div'); box.appendChild(el('h2', null, 'Impostazioni'));
  const cursore = (t, k) => { const l = el('label', 'campo', t); const r = el('input'); r.type = 'range'; r.min = 0; r.max = 1; r.step = .05; r.value = S.opz[k]; r.oninput = () => { S.opz[k] = +r.value; Audio.vol[k] = +r.value; Audio.aggiornaVolumi(); salva(); }; l.appendChild(r); box.appendChild(l); };
  cursore('Musica', 'musica'); cursore('Effetti', 'effetti');
  const p = el('button', 'btn', 'Cambia personaggio'); p.onclick = () => { chiudiModale(); vai('personaggio'); }; box.appendChild(p);
  const z = el('button', 'btn', 'Ricomincia da capo'); z.onclick = () => { chiudiModale(); setTimeout(() => modale('<h2>Ricominciare?</h2><p>Si cancellano scavi, laboratorio, diario e museo.</p>', [{t: 'No'}, {t: 'Sì, cancella', primario: true, f: () => { const o = S.opz; S = nuovoStato(); S.opz = o; salva(true); pila = []; schermata = null; vai('avvio'); }}]), 50); }; box.appendChild(z);
  box.appendChild(el('p', 'nota', 'Sotto la terra · i siti e i reperti sono veri, gli scavi del gioco sono semplificati.'));
  modale(box);
}

// ---------- avvio ----------
function costruisci() {
  document.body.innerHTML = '<div id="main"></div><nav id="nav"></nav><div id="toast"></div><div id="modal"><div id="modalBox" class="modalBox"></div></div>';
  NAV.forEach(([n, t, ico]) => { const b = el('button', null, `<span>${ico}</span><small>${t}</small>${n === 'lab' ? '<i class="badge"></i>' : ''}`); b.dataset.n = n; b.onclick = () => { Audio.avvia(); Audio.sfx.tocco(); vai(n); }; $('#nav').appendChild(b); });
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') chiudiModale(); });
  document.addEventListener('pointerdown', () => Audio.avvia(), {once: true});
  document.addEventListener('keydown', e => { if (e.key === 'Escape') indietro(); });
  // tasto Indietro di Android
  try {
    const Cap = window.Capacitor; const App = Cap && (Cap.Plugins && Cap.Plugins.App || (Cap.registerPlugin && Cap.registerPlugin('App')));
    if (App && App.addListener) App.addListener('backButton', () => { if (!indietro()) { if (schermata && schermata.nome === 'mappa' && App.minimizeApp) App.minimizeApp(); else if (App.exitApp) App.exitApp(); } });
  } catch (e) {}
  let ridim = null; window.addEventListener('resize', () => { clearTimeout(ridim); ridim = setTimeout(() => { if (schermata && ['scavo', 'mappa', 'sala'].includes(schermata.nome)) vai(schermata.nome, schermata.arg, true); }, 300); });
  vai('avvio');
}
const caricaFont = () => Promise.all(['SLTeg', 'SLTru', 'SLTlb'].map(f => document.fonts && document.fonts.load(`20px ${f}`).catch(() => null)));
Promise.race([caricaFont(), new Promise(r => setTimeout(r, 1500))]).then(costruisci);
window.__S = () => S; // per le prove
window.__vai = vai;
})();
