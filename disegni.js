// Sotto la terra — disegni dei reperti, del personaggio e degli sfondi
const D = (() => {
  const TAU = Math.PI * 2;
  function lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(s[0], s[1])); return g; }
  function rad(c, x, y, r0, r1, stops) { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
  function shade(hex, f) { // f>0 schiarisce, f<0 scurisce
    let n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    const t = f < 0 ? 0 : 255, p = Math.abs(f);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, TAU); }
  function seeded(s) { let a = s | 0 || 1; return () => (a = (a * 16807) % 2147483647) / 2147483647; }
  function hash(str) { let h = 7; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h) || 1; }
  function vol(c, col, x0, x1) { return lin(c, x0, 0, x1, 0, [[0, shade(col, -.35)], [.35, shade(col, .18)], [.55, col], [1, shade(col, -.45)]]); }

  // Profilo di vaso generico: b = larghezza pancia, n = larghezza collo, f = piede, a = anse
  function vaso(c, W, H, p) {
    const col = p.c || '#b9744a', cx = W / 2, bw = W * .48 * (p.b || .9), nw = W * .48 * (p.n || .5) * .6, fw = W * .48 * (p.f || .6) * .7;
    c.beginPath();
    c.moveTo(cx - nw * 1.15, H * .04);
    c.lineTo(cx + nw * 1.15, H * .04);
    c.quadraticCurveTo(cx + nw * .9, H * .1, cx + nw, H * .18);
    c.bezierCurveTo(cx + bw * 1.05, H * .28, cx + bw * 1.08, H * .62, cx + fw * 1.1, H * .9);
    c.lineTo(cx + fw, H * .97); c.lineTo(cx - fw, H * .97); c.lineTo(cx - fw * 1.1, H * .9);
    c.bezierCurveTo(cx - bw * 1.08, H * .62, cx - bw * 1.05, H * .28, cx - nw, H * .18);
    c.quadraticCurveTo(cx - nw * .9, H * .1, cx - nw * 1.15, H * .04);
    c.closePath();
    c.fillStyle = vol(c, col, cx - bw, cx + bw); c.fill();
    c.save(); c.clip();
    if (p.dec === 'nero') { c.strokeStyle = '#2a1a14'; c.lineWidth = W * .025; for (let i = 0; i < 5; i++) { ell(c, cx - bw * .6 + i * bw * .3, H * .5, bw * .17, bw * .17); c.stroke(); } c.beginPath(); c.moveTo(0, H * .33); c.lineTo(W, H * .33); c.moveTo(0, H * .68); c.lineTo(W, H * .68); c.stroke(); }
    if (p.dec === 'maya') { c.fillStyle = '#7a2c1d'; c.fillRect(0, H * .2, W, H * .07); c.fillRect(0, H * .8, W, H * .05); c.fillStyle = '#2b1d16'; for (let i = 0; i < 3; i++) { rr(c, cx - bw * .7 + i * bw * .5, H * .38, bw * .38, H * .3, W * .03); c.fill(); } c.fillStyle = '#e8c79a'; for (let i = 0; i < 3; i++) { ell(c, cx - bw * .51 + i * bw * .5, H * .5, bw * .1, bw * .12); c.fill(); } }
    if (p.dec === 'kamares') { c.strokeStyle = '#f0e2c4'; c.lineWidth = W * .04; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(cx - bw * .5 + i * bw * .5, H * .55, bw * .22, 0, Math.PI * 1.6); c.stroke(); } c.fillStyle = '#d2492f'; for (let i = 0; i < 4; i++) { ell(c, cx - bw * .75 + i * bw * .5, H * .35, W * .03, W * .03); c.fill(); } }
    if (p.dec === 'corde') { c.strokeStyle = shade(col, -.3); c.lineWidth = W * .03; for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = 0; x <= W; x += W / 16) c.lineTo(x, H * (.32 + k * .18) + Math.sin(x / W * 30) * H * .015); c.stroke(); } }
    c.restore();
    c.fillStyle = shade(col, -.55); ell(c, cx, H * .045, nw * 1.1, H * .02); c.fill();
    if (p.a) { c.strokeStyle = shade(col, -.15); c.lineWidth = W * .06; c.lineCap = 'round'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * nw * .9, H * .14); c.quadraticCurveTo(cx + s * bw * 1.15, H * .1, cx + s * bw * .9, H * .3); c.stroke(); } }
  }
  const R = {
    vaso,
    anfora(c, W, H, p) {
      const col = p.c, cx = W / 2;
      c.strokeStyle = shade(col, -.2); c.lineWidth = W * .1; c.lineCap = 'round';
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * W * .1, H * .08); c.quadraticCurveTo(cx + s * W * .42, H * .06, cx + s * W * .3, H * .27); c.stroke(); }
      c.beginPath(); c.moveTo(cx - W * .12, H * .02); c.lineTo(cx + W * .12, H * .02); c.lineTo(cx + W * .1, H * .22);
      c.bezierCurveTo(cx + W * .5, H * .3, cx + W * .45, H * .7, cx + W * .06, H * .92); c.lineTo(cx, H); c.lineTo(cx - W * .06, H * .92);
      c.bezierCurveTo(cx - W * .45, H * .7, cx - W * .5, H * .3, cx - W * .1, H * .22); c.closePath();
      c.fillStyle = vol(c, col, cx - W * .45, cx + W * .45); c.fill();
    },
    canopo(c, W, H) {
      const cx = W / 2; vaso(c, W, H, {c: '#e7dcc3', b: .85, n: .9, f: .6});
      c.fillStyle = '#e7dcc3'; c.fillRect(cx - W * .32, H * .02, W * .64, H * .05);
      // testa di sciacallo
      c.fillStyle = lin(c, cx - W * .3, 0, cx + W * .3, 0, [[0, '#1d1a1a'], [.5, '#3b3433'], [1, '#141212']]);
      c.beginPath(); c.moveTo(cx - W * .26, H * .04); c.quadraticCurveTo(cx - W * .3, -H * .1, cx - W * .18, -H * .18); c.lineTo(cx - W * .1, -H * .06); c.lineTo(cx + W * .1, -H * .06); c.lineTo(cx + W * .18, -H * .18); c.quadraticCurveTo(cx + W * .3, -H * .1, cx + W * .26, H * .04); c.closePath();
      c.save(); c.translate(0, H * .19); c.scale(1, .82); c.fill(); c.restore();
      c.beginPath(); c.moveTo(cx - W * .12, H * .14); c.lineTo(cx, H * .22); c.lineTo(cx + W * .12, H * .14); c.fill();
      c.fillStyle = '#d6a23a'; ell(c, cx - W * .09, H * .1, W * .03, H * .012); c.fill(); ell(c, cx + W * .09, H * .1, W * .03, H * .012); c.fill();
      c.fillStyle = '#2f5d9a'; for (let i = 0; i < 4; i++) c.fillRect(cx - W * .3 + i * W * .16, H * .48, W * .1, H * .25);
      c.fillStyle = '#1d1a1a'; c.font = `${W * .07}px serif`; c.fillText('𓂋𓈖', cx - W * .1, H * .64);
    },
    lucerna(c, W, H, p) {
      const col = p.c;
      c.fillStyle = vol(c, col, 0, W); ell(c, W * .42, H * .55, W * .36, H * .38); c.fill();
      c.beginPath(); c.moveTo(W * .6, H * .35); c.lineTo(W * .95, H * .45); c.quadraticCurveTo(W * 1.02, H * .58, W * .92, H * .68); c.lineTo(W * .6, H * .75); c.fill();
      c.fillStyle = shade(col, -.5); ell(c, W * .9, H * .56, W * .035, H * .07); c.fill(); ell(c, W * .42, H * .5, W * .07, H * .08); c.fill();
      c.strokeStyle = shade(col, -.2); c.lineWidth = W * .02; ell(c, W * .42, H * .5, W * .2, H * .22); c.stroke();
      c.strokeStyle = shade(col, -.15); c.lineWidth = W * .05; c.beginPath(); c.arc(W * .08, H * .5, H * .15, Math.PI * .6, Math.PI * 1.4); c.stroke();
    },
    pane(c, W, H) {
      c.fillStyle = rad(c, W * .45, H * .4, W * .05, W * .5, [[0, '#4e3524'], [.7, '#2a1d15'], [1, '#170f0b']]); ell(c, W / 2, H / 2, W * .46, H * .44); c.fill();
      c.strokeStyle = '#120b07'; c.lineWidth = W * .025;
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(W / 2 + Math.cos(a) * W * .06, H / 2 + Math.sin(a) * H * .06); c.lineTo(W / 2 + Math.cos(a) * W * .42, H / 2 + Math.sin(a) * H * .4); c.stroke(); }
      c.beginPath(); c.arc(W / 2, H / 2, W * .3, 0, TAU); c.stroke();
    },
    moneta(c, W, H, p) {
      const r = Math.min(W, H) * .44, cx = W / 2, cy = H / 2;
      c.fillStyle = rad(c, cx - r * .3, cy - r * .3, r * .1, r * 1.2, [[0, shade(p.c, .35)], [.6, p.c], [1, shade(p.c, -.45)]]); ell(c, cx, cy, r, r); c.fill();
      c.strokeStyle = shade(p.c, -.4); c.lineWidth = r * .08; ell(c, cx, cy, r * .82, r * .82); c.stroke();
      if (p.q) { c.fillStyle = '#2b2418'; c.fillRect(cx - r * .2, cy - r * .2, r * .4, r * .4); c.fillStyle = shade(p.c, -.5); c.font = `bold ${r * .42}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.g[0], cx - r * .55, cy); c.fillText(p.g[1], cx + r * .55, cy); return; }
      c.fillStyle = shade(p.c, -.5); c.font = `bold ${r * .5}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.g || '', cx, cy + r * .04);
    },
    dado(c, W, H, p) {
      const col = p.c || '#e9dfc8', s = Math.min(W, H) * .8, x = (W - s) / 2, y = (H - s) / 2;
      c.fillStyle = lin(c, x, y, x + s, y + s, [[0, shade(col, .2)], [1, shade(col, -.3)]]); rr(c, x, y, s, s, s * .18); c.fill();
      c.fillStyle = '#2d241c'; for (const [a, b] of [[.28, .28], [.72, .28], [.5, .5], [.28, .72], [.72, .72]]) { ell(c, x + s * a, y + s * b, s * .08, s * .08); c.fill(); }
    },
    mosaicoCane(c, W, H) {
      const t = W / 30;
      c.fillStyle = '#e8e1d2'; c.fillRect(0, 0, W, H);
      const rnd = seeded(5);
      for (let y = 0; y < H; y += t) for (let x = 0; x < W; x += t) { c.fillStyle = shade('#e8e1d2', (rnd() - .5) * .12); c.fillRect(x + .5, y + .5, t - 1, t - 1); }
      c.fillStyle = '#26211f';
      const dog = (x, y, w, h) => { for (let yy = y; yy < y + h; yy += t) for (let xx = x; xx < x + w; xx += t) c.fillRect(xx + .5, yy + .5, t - 1, t - 1); };
      dog(W * .25, H * .35, W * .45, H * .18); dog(W * .66, H * .22, W * .12, H * .2); dog(W * .74, H * .2, W * .08, H * .08);
      dog(W * .27, H * .52, W * .05, H * .2); dog(W * .38, H * .52, W * .05, H * .2); dog(W * .58, H * .52, W * .05, H * .2); dog(W * .66, H * .52, W * .05, H * .2); dog(W * .16, H * .28, W * .1, H * .08);
      c.fillStyle = '#b5322a'; dog(W * .64, H * .32, W * .1, t);
      c.fillStyle = '#6a6563'; for (let i = 0; i < 9; i++) dog(W * .76 + i * t * .9, H * .12 - i * t * .2, t, t);
      c.fillStyle = '#26211f'; c.font = `bold ${H * .14}px serif`; c.textAlign = 'center'; c.fillText('CAVE CANEM', W / 2, H * .92);
      c.strokeStyle = '#26211f'; c.lineWidth = t; c.strokeRect(t / 2, t / 2, W - t, H - t);
    },
    affresco(c, W, H, p) {
      c.fillStyle = lin(c, 0, 0, W, H, [[0, shade(p.c, .1)], [1, shade(p.c, -.15)]]); c.fillRect(0, 0, W, H);
      c.strokeStyle = shade(p.c, -.4); c.lineWidth = W * .02; c.strokeRect(W * .06, H * .06, W * .88, H * .88);
      if (p.m === 'uccello') {
        c.fillStyle = '#e9d9b4'; c.fillRect(W * .25, H * .2, W * .5, H * .6);
        c.fillStyle = '#3f6b3a'; for (let i = 0; i < 6; i++) { ell(c, W * (.3 + i * .08), H * .7, W * .05, H * .1, .5); c.fill(); }
        c.fillStyle = '#2f5878'; ell(c, W * .5, H * .45, W * .1, H * .07); c.fill(); c.beginPath(); c.moveTo(W * .58, H * .44); c.lineTo(W * .66, H * .41); c.lineTo(W * .6, H * .47); c.fill();
        c.fillStyle = '#c7a03b'; c.beginPath(); c.moveTo(W * .4, H * .45); c.lineTo(W * .3, H * .38); c.lineTo(W * .33, H * .5); c.fill();
      } else {
        c.fillStyle = '#e6eef0'; for (let i = 0; i < 9; i++) { ell(c, W * (.1 + i * .1), H * (.15 + (i % 3) * .3), W * .015, H * .02); c.fill(); }
        const delf = (x, y, s, f) => { c.save(); c.translate(x, y); c.scale(f * s, s); c.fillStyle = '#2f5f8a'; c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-10, -22, 30, -6); c.lineTo(44, -4); c.lineTo(32, 2); c.quadraticCurveTo(0, 14, -40, 0); c.fill(); c.fillStyle = '#e8b33a'; c.beginPath(); c.moveTo(-30, 2); c.quadraticCurveTo(0, 8, 30, 0); c.lineTo(28, 4); c.quadraticCurveTo(0, 12, -30, 4); c.fill(); c.fillStyle = '#2f5f8a'; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-56, -12); c.lineTo(-50, 0); c.lineTo(-56, 12); c.fill(); c.beginPath(); c.moveTo(0, -12); c.lineTo(-8, -26); c.lineTo(10, -14); c.fill(); c.fillStyle = '#111'; ell(c, 26, -6, 2, 2); c.fill(); c.restore(); };
        delf(W * .35, H * .38, W / 260, 1); delf(W * .65, H * .68, W / 300, -1);
      }
    },
    iscrizione(c, W, H, p) {
      c.fillStyle = '#e9dfca'; c.fillRect(0, 0, W, H);
      const rnd = seeded(9); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(120,90,60,${rnd() * .15})`; ell(c, rnd() * W, rnd() * H, rnd() * W * .05, rnd() * H * .2); c.fill(); }
      c.fillStyle = '#a3261d'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const parti = p.t.split('·AED·'), r1 = parti[0].replace(/·/g, ' ');
      c.font = `bold 100px serif`; const k = Math.min(H * .32, 100 * W * .92 / c.measureText(r1).width);
      c.font = `bold ${k}px serif`; c.fillText(r1, W / 2, H * .32); c.fillText('AED · O · V · F', W / 2, H * .72);
    },
    ushabti(c, W, H) {
      const cx = W / 2;
      c.fillStyle = lin(c, cx - W * .4, 0, cx + W * .4, 0, [[0, '#1d6d74'], [.5, '#4ab2b0'], [1, '#155359']]);
      c.beginPath(); c.moveTo(cx - W * .22, H * .12); c.quadraticCurveTo(cx, -H * .02, cx + W * .22, H * .12); c.lineTo(cx + W * .3, H * .3); c.lineTo(cx + W * .24, H * .9); c.lineTo(cx + W * .3, H); c.lineTo(cx - W * .3, H); c.lineTo(cx - W * .24, H * .9); c.lineTo(cx - W * .3, H * .3); c.closePath(); c.fill();
      c.fillStyle = '#123d42'; c.fillRect(cx - W * .14, H * .1, W * .28, H * .02); ell(c, cx - W * .07, H * .16, W * .03, H * .01); c.fill(); ell(c, cx + W * .07, H * .16, W * .03, H * .01); c.fill();
      c.strokeStyle = '#123d42'; c.lineWidth = W * .04; c.beginPath(); c.moveTo(cx - W * .25, H * .34); c.lineTo(cx + W * .25, H * .34); c.stroke();
      c.lineWidth = W * .025; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(cx - W * .18, H * (.45 + i * .09)); c.lineTo(cx + W * .18, H * (.45 + i * .09)); c.stroke(); }
    },
    scarabeo(c, W, H) {
      const cx = W / 2, cy = H / 2;
      c.fillStyle = rad(c, cx - W * .1, cy - H * .15, 1, W * .5, [[0, '#5fd3c8'], [.6, '#1f8e8a'], [1, '#0e4f52']]);
      ell(c, cx, cy + H * .08, W * .36, H * .36); c.fill(); ell(c, cx, cy - H * .3, W * .2, H * .12); c.fill();
      c.strokeStyle = '#0b3a3d'; c.lineWidth = W * .03; c.beginPath(); c.moveTo(cx, cy - H * .2); c.lineTo(cx, cy + H * .42); c.moveTo(cx - W * .34, cy - H * .12); c.lineTo(cx + W * .34, cy - H * .12); c.stroke();
    },
    ostrakon(c, W, H) {
      c.fillStyle = lin(c, 0, 0, W, H, [[0, '#efe6d2'], [1, '#cdbf9f']]);
      c.beginPath(); c.moveTo(W * .1, H * .15); c.lineTo(W * .6, H * .03); c.lineTo(W * .95, H * .3); c.lineTo(W * .88, H * .85); c.lineTo(W * .4, H * .97); c.lineTo(W * .05, H * .7); c.closePath(); c.fill();
      c.fillStyle = '#2a201a'; c.font = `${H * .16}px "SLTeg", serif`; c.textAlign = 'center';
      c.fillText('𓈖𓆑𓂋', W * .5, H * .35); c.fillText('𓂝𓈖𓐍', W * .5, H * .58); c.fillText('𓇋𓅓𓈖', W * .5, H * .81);
    },
    poggiatesta(c, W, H) {
      c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#6a4426'], [.5, '#a2703f'], [1, '#5a381e']]);
      c.beginPath(); c.moveTo(W * .05, H * .1); c.quadraticCurveTo(W * .5, H * .45, W * .95, H * .1); c.lineTo(W * .95, H * .2); c.quadraticCurveTo(W * .5, H * .58, W * .05, H * .2); c.fill();
      c.fillRect(W * .42, H * .4, W * .16, H * .45); rr(c, W * .15, H * .82, W * .7, H * .14, H * .04); c.fill();
    },
    perle(c, W, H, p) {
      c.strokeStyle = '#7b6650'; c.lineWidth = 1; c.beginPath(); c.arc(W / 2, H * .25, W * .38, Math.PI * .1, Math.PI * .9); c.stroke();
      for (let i = 0; i < 7; i++) { const a = Math.PI * (.12 + i * .76 / 6), x = W / 2 + Math.cos(a) * W * .38, y = H * .25 + Math.sin(a) * W * .38; const col = p.m ? ['#3f74b5', '#d0a535', '#b33b2d', '#2f8a4f'][i % 4] : p.c; c.fillStyle = rad(c, x - 2, y - 2, 1, W * .1, [[0, shade(col, .45)], [1, shade(col, -.3)]]); ell(c, x, y, W * .075, W * .075); c.fill(); }
    },
    frutto(c, W, H, p) { c.fillStyle = rad(c, W * .4, H * .4, 1, W * .45, [[0, shade(p.c, .3)], [1, shade(p.c, -.4)]]); ell(c, W / 2, H / 2, W * .36, H * .4, .4); c.fill(); c.fillStyle = shade(p.c, -.6); ell(c, W * .66, H * .2, W * .05, H * .05); c.fill(); },
    lampadaPietra(c, W, H) {
      c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#c46b4a'], [1, '#7b3a26']]);
      c.beginPath(); c.moveTo(W * .02, H * .3); c.quadraticCurveTo(W * .3, H * .2, W * .62, H * .28); c.quadraticCurveTo(W * .65, H * .9, W * .32, H * .9); c.quadraticCurveTo(W * .02, H * .85, W * .02, H * .3); c.fill();
      c.beginPath(); c.moveTo(W * .6, H * .35); c.lineTo(W * .98, H * .42); c.lineTo(W * .98, H * .62); c.lineTo(W * .58, H * .6); c.fill();
      c.fillStyle = '#3b1d12'; ell(c, W * .32, H * .36, W * .24, H * .1); c.fill();
      c.strokeStyle = '#5a2716'; c.lineWidth = W * .01; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(W * (.65 + i * .07), H * .45); c.lineTo(W * (.68 + i * .07), H * .58); c.stroke(); }
    },
    sasso(c, W, H, p) {
      const rnd = seeded(hash(p.c)); c.fillStyle = rad(c, W * .4, H * .38, 1, W * .5, [[0, shade(p.c, .25)], [1, shade(p.c, -.35)]]);
      c.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = (p.r ? .42 : .3 + rnd() * .14); c.lineTo(W / 2 + Math.cos(a) * W * r, H / 2 + Math.sin(a) * H * r); } c.closePath(); c.fill();
    },
    lama(c, W, H, p) {
      c.fillStyle = lin(c, 0, 0, 0, H, [[0, shade(p.c, .3)], [.5, p.c], [1, shade(p.c, -.35)]]);
      c.beginPath(); c.moveTo(W * .03, H * .55); c.lineTo(W * .3, H * .22); c.lineTo(W * .97, H * .4); c.lineTo(W * .82, H * .7); c.lineTo(W * .2, H * .8); c.closePath(); c.fill();
      c.strokeStyle = shade(p.c, p.lucido ? .5 : -.25); c.lineWidth = 1; c.beginPath(); c.moveTo(W * .1, H * .55); c.lineTo(W * .9, H * .45); c.moveTo(W * .3, H * .3); c.lineTo(W * .5, H * .7); c.stroke();
    },
    zagaglia(c, W, H) {
      c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#eadcbf'], [1, '#a68b63']]);
      c.beginPath(); c.moveTo(W * .02, H * .45); c.lineTo(W * .9, H * .35); c.lineTo(W, H * .5); c.lineTo(W * .9, H * .65); c.lineTo(W * .02, H * .58); c.closePath(); c.fill();
      c.strokeStyle = '#86704f'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(W * (.1 + i * .05), H * .42); c.lineTo(W * (.13 + i * .05), H * .6); c.stroke(); }
    },
    conchiglia(c, W, H, p) {
      c.fillStyle = rad(c, W / 2, H * .9, 1, H * .9, [[0, shade(p.c, -.2)], [1, shade(p.c, .25)]]);
      c.beginPath(); c.moveTo(W / 2, H * .9); c.arc(W / 2, H * .9, W * .42, Math.PI * 1.08, Math.PI * 1.92); c.closePath(); c.fill();
      c.strokeStyle = shade(p.c, -.35); c.lineWidth = W * .02; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + i * .13); c.beginPath(); c.moveTo(W / 2, H * .9); c.lineTo(W / 2 + Math.cos(a) * W * .4, H * .9 + Math.sin(a) * W * .4); c.stroke(); }
      c.fillStyle = '#2a201a'; ell(c, W / 2, H * .45, W * .05, W * .05); c.fill();
    },
    carbone(c, W, H) { const rnd = seeded(3); for (let i = 0; i < 5; i++) { c.fillStyle = shade('#1f1b19', rnd() * .15); c.beginPath(); const x = W * (.2 + rnd() * .6), y = H * (.2 + rnd() * .6); c.moveTo(x, y); c.lineTo(x + W * .18, y + H * .05); c.lineTo(x + W * .1, y + H * .2); c.lineTo(x - W * .05, y + H * .12); c.fill(); } },
    ago(c, W, H) { c.strokeStyle = '#d9cbb0'; c.lineWidth = W * .06; c.lineCap = 'round'; c.beginPath(); c.moveTo(W * .1, H * .9); c.lineTo(W * .9, H * .1); c.stroke(); c.strokeStyle = '#3b2f24'; c.lineWidth = W * .02; ell(c, W * .82, H * .18, W * .03, W * .015, -.8); c.stroke(); },
    depas(c, W, H) {
      const col = '#b9825a', cx = W / 2;
      c.strokeStyle = shade(col, -.15); c.lineWidth = W * .07; c.lineCap = 'round';
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * W * .14, H * .1); c.bezierCurveTo(cx + s * W * .48, H * .1, cx + s * W * .48, H * .8, cx + s * W * .14, H * .82); c.stroke(); }
      c.beginPath(); c.moveTo(cx - W * .18, H * .04); c.lineTo(cx + W * .18, H * .04); c.quadraticCurveTo(cx + W * .22, H * .5, cx + W * .1, H * .9); c.lineTo(cx + W * .12, H * .98); c.lineTo(cx - W * .12, H * .98); c.lineTo(cx - W * .1, H * .9); c.quadraticCurveTo(cx - W * .22, H * .5, cx - W * .18, H * .04); c.closePath();
      c.fillStyle = vol(c, col, cx - W * .2, cx + W * .2); c.fill();
    },
    punta(c, W, H, p) {
      c.fillStyle = lin(c, 0, 0, W, 0, [[0, shade(p.c, -.3)], [.5, shade(p.c, .3)], [1, shade(p.c, -.3)]]);
      c.beginPath(); c.moveTo(W / 2, H * .05); c.lineTo(W * .78, H * .62); c.lineTo(W * .58, H * .55); c.lineTo(W * .56, H * .95); c.lineTo(W * .44, H * .95); c.lineTo(W * .42, H * .55); c.lineTo(W * .22, H * .62); c.closePath(); c.fill();
    },
    idolo(c, W, H) {
      const cx = W / 2; c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#cfc8bb'], [.5, '#f2eee6'], [1, '#bdb5a6']]);
      c.beginPath(); c.moveTo(cx - W * .12, H * .06); c.lineTo(cx + W * .12, H * .06); c.lineTo(cx + W * .14, H * .22); c.quadraticCurveTo(cx + W * .45, H * .3, cx + W * .32, H * .7); c.lineTo(cx + W * .18, H * .96); c.lineTo(cx - W * .18, H * .96); c.lineTo(cx - W * .32, H * .7); c.quadraticCurveTo(cx - W * .45, H * .3, cx - W * .14, H * .22); c.closePath(); c.fill();
      c.strokeStyle = '#8f877a'; c.lineWidth = W * .025; ell(c, cx - W * .05, H * .13, W * .025, W * .025); c.stroke(); ell(c, cx + W * .05, H * .13, W * .025, W * .025); c.stroke();
      c.beginPath(); c.moveTo(cx - W * .2, H * .4); c.lineTo(cx + W * .2, H * .4); c.stroke();
    },
    fusaiola(c, W, H) { c.fillStyle = rad(c, W * .4, H * .4, 1, W * .5, [[0, '#a7826a'], [1, '#5a3f2e']]); c.beginPath(); c.moveTo(W * .1, H * .5); c.lineTo(W / 2, H * .15); c.lineTo(W * .9, H * .5); c.lineTo(W / 2, H * .85); c.closePath(); c.fill(); c.fillStyle = '#20160f'; ell(c, W / 2, H / 2, W * .07, W * .07); c.fill(); c.strokeStyle = '#3a291e'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(W * (.25 + i * .1), H * .3); c.lineTo(W * (.25 + i * .1), H * .4); c.stroke(); } },
    orecchino(c, W, H) { c.strokeStyle = '#d9ad3c'; c.lineWidth = W * .05; c.beginPath(); c.arc(W / 2, H * .3, W * .18, Math.PI, 0); c.stroke(); c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#a8801f'], [.5, '#f6d873'], [1, '#a8801f']]); c.beginPath(); c.moveTo(W * .3, H * .32); c.lineTo(W * .7, H * .32); c.lineTo(W * .62, H * .62); c.lineTo(W * .38, H * .62); c.fill(); for (let i = 0; i < 5; i++) { c.fillRect(W * (.36 + i * .065), H * .62, W * .02, H * .26); } },
    guerriero(c, W, H) {
      const col = '#9c8a76', cx = W / 2;
      const g = lin(c, cx - W * .4, 0, cx + W * .4, 0, [[0, shade(col, -.35)], [.45, shade(col, .2)], [1, shade(col, -.4)]]); c.fillStyle = g;
      ell(c, cx, H * .1, W * .15, H * .075); c.fill(); // testa
      c.fillStyle = shade(col, -.3); ell(c, cx + W * .08, H * .045, W * .08, H * .035); c.fill(); // crocchia
      c.fillStyle = g; c.fillRect(cx - W * .07, H * .16, W * .14, H * .04);
      c.beginPath(); c.moveTo(cx - W * .3, H * .2); c.lineTo(cx + W * .3, H * .2); c.lineTo(cx + W * .36, H * .6); c.lineTo(cx - W * .36, H * .6); c.closePath(); c.fill(); // corpo
      c.fillStyle = shade(col, -.15); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) c.fillRect(cx - W * .26 + k * W * .13, H * (.24 + r * .07), W * .11, H * .055);
      c.fillStyle = g; c.fillRect(cx - W * .46, H * .22, W * .14, H * .3); c.fillRect(cx + W * .32, H * .22, W * .14, H * .3);
      c.fillRect(cx - W * .24, H * .6, W * .18, H * .32); c.fillRect(cx + W * .06, H * .6, W * .18, H * .32);
      c.fillStyle = shade(col, -.45); c.fillRect(cx - W * .3, H * .9, W * .6, H * .08);
      c.fillStyle = '#2e2620'; ell(c, cx - W * .05, H * .1, W * .02, H * .006); c.fill(); ell(c, cx + W * .05, H * .1, W * .02, H * .006); c.fill(); c.fillRect(cx - W * .04, H * .135, W * .08, H * .004);
    },
    testaCavallo(c, W, H) {
      const col = '#8f7d6c'; c.fillStyle = lin(c, 0, 0, W, 0, [[0, shade(col, -.3)], [.5, shade(col, .2)], [1, shade(col, -.35)]]);
      c.beginPath(); c.moveTo(W * .55, H * .02); c.lineTo(W * .72, H * .12); c.quadraticCurveTo(W * .95, H * .55, W * .9, H * .8); c.quadraticCurveTo(W * .8, H * .98, W * .62, H * .9); c.lineTo(W * .3, H * .5); c.lineTo(W * .12, H * .98); c.lineTo(W * .05, H * .4); c.quadraticCurveTo(W * .2, H * .1, W * .55, H * .02); c.fill();
      c.fillStyle = '#2e2620'; ell(c, W * .62, H * .3, W * .04, H * .03); c.fill(); ell(c, W * .82, H * .82, W * .03, H * .025); c.fill();
      c.fillStyle = shade(col, -.4); c.beginPath(); c.moveTo(W * .5, H * .02); c.lineTo(W * .58, H * -.0); c.lineTo(W * .6, H * .1); c.fill();
    },
    grilletto(c, W, H) {
      c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#9a8a54'], [1, '#56492a']]);
      rr(c, W * .1, H * .25, W * .55, H * .45, H * .06); c.fill(); c.fillRect(W * .6, H * .4, W * .3, H * .15); c.beginPath(); c.moveTo(W * .3, H * .65); c.lineTo(W * .4, H * .98); c.lineTo(W * .48, H * .65); c.fill();
      c.fillStyle = '#2f2817'; ell(c, W * .25, H * .45, W * .03, W * .03); c.fill(); ell(c, W * .48, H * .45, W * .03, W * .03); c.fill();
    },
    spada(c, W, H, p) {
      c.fillStyle = lin(c, 0, 0, 0, H, [[0, shade(p.c, .4)], [.5, p.c], [1, shade(p.c, -.3)]]);
      c.beginPath(); c.moveTo(W * .28, H * .42); c.lineTo(W * .98, H * .48); c.lineTo(W * .28, H * .58); c.closePath(); c.fill();
      c.fillStyle = '#5c4b2c'; c.fillRect(W * .24, H * .28, W * .04, H * .44); c.fillStyle = '#4a3a22'; c.fillRect(W * .04, H * .44, W * .2, H * .12); ell(c, W * .04, H * .5, W * .03, H * .1); c.fill();
    },
    mattone(c, W, H, p) { c.fillStyle = lin(c, 0, 0, W, H, [[0, shade(p.c, .15)], [1, shade(p.c, -.3)]]); c.fillRect(W * .05, H * .2, W * .9, H * .6); c.fillStyle = shade(p.c, -.15); const rnd = seeded(hash(p.c)); for (let i = 0; i < 12; i++) { ell(c, W * (.1 + rnd() * .8), H * (.25 + rnd() * .5), W * .015, H * .03); c.fill(); } },
    sigillo(c, W, H) {
      c.fillStyle = lin(c, 0, 0, W, H, [[0, '#ece2cc'], [1, '#bba985']]); rr(c, W * .06, H * .06, W * .88, H * .88, W * .06); c.fill();
      c.strokeStyle = '#7a6a4c'; c.lineWidth = W * .02; rr(c, W * .1, H * .1, W * .8, H * .8, W * .04); c.stroke();
      c.fillStyle = '#5d4f37';
      c.beginPath(); c.moveTo(W * .25, H * .62); c.quadraticCurveTo(W * .3, H * .45, W * .55, H * .48); c.lineTo(W * .66, H * .4); c.lineTo(W * .72, H * .45); c.lineTo(W * .66, H * .56); c.lineTo(W * .66, H * .78); c.lineTo(W * .6, H * .78); c.lineTo(W * .58, H * .64); c.lineTo(W * .36, H * .64); c.lineTo(W * .34, H * .78); c.lineTo(W * .28, H * .78); c.closePath(); c.fill();
      c.lineWidth = W * .02; c.strokeStyle = '#5d4f37'; c.beginPath(); c.moveTo(W * .68, H * .42); c.lineTo(W * .82, H * .3); c.stroke();
      c.fillRect(W * .18, H * .72, W * .08, H * .08); c.fillRect(W * .18, H * .8, W * .02, H * .04);
      const segni = ['|', 'Ψ', '◇', '∪', 'Ⅱ']; c.font = `bold ${H * .12}px serif`; c.textAlign = 'center'; segni.forEach((s, i) => c.fillText(s, W * (.22 + i * .14), H * .28));
    },
    pesi(c, W, H) { const tinte = ['#c7b79a', '#9e8f78', '#b5a68b']; [[.06, .22, .3], [.4, .34, .22], [.67, .44, .16], [.86, .52, .1]].forEach((q, i) => { const s = W * q[2]; c.fillStyle = lin(c, 0, 0, s, s, [[0, shade(tinte[i % 3], .2)], [1, shade(tinte[i % 3], -.3)]]); rr(c, W * q[0], H * .9 - s * 1.8, s, s * 1.8 * .55, s * .08); c.fill(); }); },
    carretto(c, W, H) {
      c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#c98a5c'], [1, '#8d5432']]); c.beginPath(); c.moveTo(W * .1, H * .25); c.lineTo(W * .82, H * .25); c.lineTo(W * .76, H * .6); c.lineTo(W * .16, H * .6); c.fill();
      c.fillRect(W * .82, H * .45, W * .16, H * .05);
      for (const x of [.28, .62]) { c.fillStyle = '#7b4729'; ell(c, W * x, H * .72, W * .14, W * .14); c.fill(); c.fillStyle = '#3b2213'; ell(c, W * x, H * .72, W * .03, W * .03); c.fill(); }
    },
    anello(c, W, H, p) { c.strokeStyle = lin(c, 0, 0, W, H, [[0, shade(p.c, .2)], [1, shade(p.c, -.35)]]); c.lineWidth = W * (p.s || .12); ell(c, W / 2, H / 2, W * .3, H * .3); c.stroke(); },
    khipu(c, W, H) {
      c.strokeStyle = '#8a6a44'; c.lineWidth = H * .05; c.beginPath(); c.moveTo(W * .04, H * .1); c.lineTo(W * .96, H * .1); c.stroke();
      const cols = ['#b88c58', '#d8c39a', '#7c5a3a', '#b88c58', '#d8c39a', '#7c5a3a', '#c9a372'];
      cols.forEach((col, i) => { const x = W * (.1 + i * .13); c.strokeStyle = col; c.lineWidth = W * .022; c.beginPath(); c.moveTo(x, H * .1); c.quadraticCurveTo(x + W * .02, H * .55, x - W * .01, H * .96); c.stroke(); c.fillStyle = shade(col, -.35); for (let k = 0; k < 1 + i % 3; k++) { ell(c, x + W * .005, H * (.28 + k * .07), W * .022, H * .025); c.fill(); } ell(c, x + W * .01, H * .72, W * .022, H * .03); c.fill(); });
    },
    aryballo(c, W, H) {
      const cx = W / 2, col = '#b4593a';
      c.beginPath(); c.moveTo(cx - W * .16, H * .02); c.lineTo(cx + W * .16, H * .02); c.lineTo(cx + W * .1, H * .14); c.lineTo(cx + W * .09, H * .26);
      c.bezierCurveTo(cx + W * .5, H * .3, cx + W * .5, H * .78, cx, H * .99); c.bezierCurveTo(cx - W * .5, H * .78, cx - W * .5, H * .3, cx - W * .09, H * .26); c.lineTo(cx - W * .1, H * .14); c.closePath();
      c.fillStyle = vol(c, col, cx - W * .45, cx + W * .45); c.fill();
      c.save(); c.clip(); c.fillStyle = '#e9d9b8'; c.fillRect(cx - W * .14, H * .35, W * .28, H * .4); c.fillStyle = '#2a1d16'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(cx - W * .12, H * (.38 + i * .075)); c.lineTo(cx, H * (.42 + i * .075)); c.lineTo(cx + W * .12, H * (.38 + i * .075)); c.lineTo(cx + W * .12, H * (.4 + i * .075)); c.lineTo(cx, H * (.44 + i * .075)); c.lineTo(cx - W * .12, H * (.4 + i * .075)); c.fill(); } c.restore();
      c.fillStyle = shade(col, -.2); ell(c, cx - W * .38, H * .52, W * .05, H * .03); c.fill(); ell(c, cx + W * .38, H * .52, W * .05, H * .03); c.fill(); ell(c, cx, H * .29, W * .06, H * .03); c.fill();
    },
    tupu(c, W, H) { c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#8e8e96'], [.5, '#e6e6ee'], [1, '#7a7a82']]); c.beginPath(); c.arc(W / 2, H * .22, W * .42, Math.PI, 0); c.lineTo(W / 2 + W * .05, H * .22); c.lineTo(W * .53, H * .98); c.lineTo(W * .47, H * .98); c.lineTo(W / 2 - W * .05, H * .22); c.closePath(); c.fill(); },
    tumi(c, W, H) { c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#7c5826'], [.5, '#d9a64a'], [1, '#6e4e22']]); c.fillRect(W * .42, H * .12, W * .16, H * .6); ell(c, W / 2, H * .1, W * .22, H * .07); c.fill(); c.beginPath(); c.moveTo(W * .05, H * .72); c.lineTo(W * .95, H * .72); c.arc(W / 2, H * .72, W * .45, 0, Math.PI); c.fill(); },
    lama3d(c, W, H) { c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#8a8a94'], [.5, '#f0f0f6'], [1, '#7a7a84']]); c.fillRect(W * .25, H * .4, W * .5, H * .25); c.fillRect(W * .65, H * .12, W * .12, H * .33); c.fillRect(W * .62, H * .08, W * .22, H * .1); for (const x of [.27, .37, .58, .67]) c.fillRect(W * x, H * .62, W * .07, H * .3); c.fillRect(W * .7, H * .02, W * .04, H * .08); },
    bolas(c, W, H) { c.strokeStyle = '#8d6e4b'; c.lineWidth = 2; c.beginPath(); c.moveTo(W * .15, H * .55); c.quadraticCurveTo(W * .5, H * .1, W * .85, H * .55); c.moveTo(W * .5, H * .3); c.lineTo(W * .5, H * .7); c.stroke(); for (const [x, y] of [[.15, .55], [.85, .55], [.5, .72]]) { c.fillStyle = rad(c, W * x - 3, H * y - 3, 1, W * .14, [[0, '#a3a19c'], [1, '#4b4945']]); ell(c, W * x, H * y, W * .11, W * .11); c.fill(); } },
    chicchi(c, W, H) { const tinte = ['#e8c046', '#d65f3a', '#f2e6c1', '#6b3a7a', '#e8c046']; for (let i = 0; i < 7; i++) { c.fillStyle = tinte[i % 5]; const a = i / 7 * TAU; ell(c, W / 2 + Math.cos(a) * W * .25, H / 2 + Math.sin(a) * H * .25, W * .1, W * .13, a); c.fill(); } },
    amigdala(c, W, H) {
      c.fillStyle = lin(c, 0, 0, W, H, [[0, '#a59a86'], [.5, '#7e7462'], [1, '#544c40']]);
      c.beginPath(); c.moveTo(W / 2, H * .02); c.quadraticCurveTo(W * .95, H * .55, W * .7, H * .95); c.quadraticCurveTo(W / 2, H * 1.02, W * .3, H * .95); c.quadraticCurveTo(W * .05, H * .55, W / 2, H * .02); c.fill();
      c.fillStyle = 'rgba(255,255,255,.12)'; const rnd = seeded(11); for (let i = 0; i < 12; i++) { c.beginPath(); const x = W * (.3 + rnd() * .4), y = H * (.15 + rnd() * .7); c.moveTo(x, y); c.lineTo(x + W * .12, y + H * .04); c.lineTo(x + W * .06, y + H * .1); c.fill(); }
    },
    chopper(c, W, H) { c.fillStyle = rad(c, W * .4, H * .6, 1, W * .6, [[0, '#9a8f7f'], [1, '#4f493f']]); c.beginPath(); c.moveTo(W * .1, H * .6); c.quadraticCurveTo(W * .2, H * .95, W * .6, H * .92); c.quadraticCurveTo(W * .95, H * .85, W * .9, H * .45); c.lineTo(W * .7, H * .2); c.lineTo(W * .45, H * .3); c.lineTo(W * .3, H * .15); c.closePath(); c.fill(); c.fillStyle = '#c4b9a7'; c.beginPath(); c.moveTo(W * .7, H * .2); c.lineTo(W * .45, H * .3); c.lineTo(W * .55, H * .45); c.fill(); },
    dente(c, W, H) { c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#b5a582'], [.5, '#efe6cf'], [1, '#a59471']]); c.beginPath(); c.moveTo(W * .2, H * .15); c.quadraticCurveTo(W / 2, H * .02, W * .8, H * .15); c.lineTo(W * .78, H * .5); c.lineTo(W * .66, H * .95); c.lineTo(W * .55, H * .55); c.lineTo(W * .45, H * .55); c.lineTo(W * .34, H * .95); c.lineTo(W * .22, H * .5); c.closePath(); c.fill(); },
    osso(c, W, H, p) {
      c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#f1e7d0'], [1, '#bfae8c']]);
      c.fillRect(W * .12, H * .38, W * .76, H * .24); for (const x of [.1, .9]) { ell(c, W * x, H * .36, W * .07, H * .2); c.fill(); ell(c, W * x, H * .64, W * .07, H * .2); c.fill(); }
      if (p.tagli) { c.strokeStyle = '#7b6644'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(W * (.35 + i * .04), H * .4); c.lineTo(W * (.33 + i * .04), H * .6); c.stroke(); } }
    },
    zanna(c, W, H) { c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#d8ccb0'], [1, '#8f805f']]); c.beginPath(); c.moveTo(W * .05, H * .3); c.quadraticCurveTo(W * .6, H * .1, W * .95, H * .8); c.quadraticCurveTo(W * .55, H * .55, W * .05, H * .75); c.closePath(); c.fill(); },
    cristalli(c, W, H) { const rnd = seeded(4); for (let i = 0; i < 9; i++) { c.fillStyle = `hsla(${190 + rnd() * 40},30%,${70 + rnd() * 20}%,.95)`; const x = W * (.15 + rnd() * .7), y = H * (.15 + rnd() * .7), s = W * (.06 + rnd() * .08); c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * .6, y); c.lineTo(x, y + s); c.lineTo(x - s * .6, y); c.fill(); } },
    ossoRune(c, W, H) { R.osso(c, W, H, {}); c.fillStyle = '#5a452c'; c.font = `${H * .3}px "SLTru", serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ᚴᛅᛘᛒ ᛋᛏᛅᛁᚾ', W / 2, H * .52); },
    pettine(c, W, H) { c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#e9dcc0'], [1, '#b39d77']]); c.fillRect(W * .05, H * .15, W * .9, H * .32); c.fillStyle = '#c9b48f'; for (let i = 0; i < 26; i++) c.fillRect(W * (.07 + i * .034), H * .45, W * .02, H * .45); c.fillStyle = '#8a7350'; for (let i = 0; i < 5; i++) { ell(c, W * (.15 + i * .18), H * .31, W * .015, W * .015); c.fill(); } },
    fibula(c, W, H) { c.fillStyle = rad(c, W * .45, H * .4, 1, W * .5, [[0, '#e7c06a'], [.7, '#a7782e'], [1, '#5f421a']]); ell(c, W / 2, H / 2, W * .45, H * .38); c.fill(); c.strokeStyle = '#5f421a'; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ell(c, W / 2, H / 2, W * (.1 + i * .08), H * (.08 + i * .07)); c.stroke(); } },
    bilancia(c, W, H) { c.strokeStyle = '#a07a3c'; c.lineWidth = 2; c.beginPath(); c.moveTo(W * .15, H * .2); c.lineTo(W * .85, H * .2); c.moveTo(W / 2, H * .05); c.lineTo(W / 2, H * .2); c.moveTo(W * .15, H * .2); c.lineTo(W * .08, H * .7); c.moveTo(W * .15, H * .2); c.lineTo(W * .22, H * .7); c.moveTo(W * .85, H * .2); c.lineTo(W * .78, H * .7); c.moveTo(W * .85, H * .2); c.lineTo(W * .92, H * .7); c.stroke(); c.fillStyle = '#b8893f'; for (const x of [.15, .85]) { ell(c, W * x, H * .76, W * .12, H * .08); c.fill(); } },
    ascia(c, W, H) { c.fillStyle = '#6b4b2c'; c.fillRect(W * .44, H * .1, W * .1, H * .88); c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#5c5550'], [.6, '#8e8580'], [1, '#3f3a36']]); c.beginPath(); c.moveTo(W * .4, H * .1); c.lineTo(W * .58, H * .12); c.lineTo(W * .58, H * .26); c.quadraticCurveTo(W * .9, H * .3, W * .96, H * .1); c.quadraticCurveTo(W * 1, H * .4, W * .96, H * .6); c.quadraticCurveTo(W * .8, H * .38, W * .58, H * .36); c.lineTo(W * .4, H * .34); c.closePath(); c.fill(); },
    maschera(c, W, H) {
      const cx = W / 2; c.save(); c.beginPath(); ell(c, cx, H * .5, W * .4, H * .47); c.clip();
      const rnd = seeded(21); for (let y = 0; y < H; y += W * .055) for (let x = 0; x < W; x += W * .055) { c.fillStyle = `hsl(${140 + rnd() * 20},${40 + rnd() * 25}%,${25 + rnd() * 18}%)`; c.fillRect(x + .6, y + .6, W * .055 - 1.2, W * .055 - 1.2); }
      c.restore();
      c.fillStyle = '#f3efe2'; ell(c, cx - W * .15, H * .4, W * .09, H * .05); c.fill(); ell(c, cx + W * .15, H * .4, W * .09, H * .05); c.fill();
      c.fillStyle = '#151515'; ell(c, cx - W * .15, H * .4, W * .035, H * .04); c.fill(); ell(c, cx + W * .15, H * .4, W * .035, H * .04); c.fill();
      c.fillStyle = '#c9b276'; rr(c, cx - W * .12, H * .7, W * .24, H * .07, H * .03); c.fill();
      c.strokeStyle = '#1f4a33'; c.lineWidth = W * .02; c.beginPath(); c.moveTo(cx, H * .42); c.lineTo(cx - W * .05, H * .6); c.lineTo(cx + W * .05, H * .6); c.stroke();
    },
    pannelloMaya(c, W, H) {
      c.fillStyle = lin(c, 0, 0, W, H, [[0, '#d7cfbd'], [1, '#a59b86']]); c.fillRect(0, 0, W, H);
      c.strokeStyle = '#6e6553'; c.lineWidth = W * .01; c.strokeRect(W * .03, H * .05, W * .94, H * .9);
      const nums = ISCRIZIONI.maya.numeri; nums.forEach((n, i) => numeroMaya(c, W * (.14 + i * .24), H * .2, W * .18, H * .6, n, '#3b3428'));
    },
    incensiere(c, W, H) {
      const col = '#b0714e', cx = W / 2; c.fillStyle = vol(c, col, cx - W * .3, cx + W * .3); c.fillRect(cx - W * .24, H * .05, W * .48, H * .9);
      c.fillStyle = shade(col, .1); ell(c, cx, H * .35, W * .2, H * .14); c.fill();
      c.fillStyle = '#2b1a12'; ell(c, cx - W * .08, H * .32, W * .04, H * .02); c.fill(); ell(c, cx + W * .08, H * .32, W * .04, H * .02); c.fill(); c.fillRect(cx - W * .07, H * .42, W * .14, H * .02);
      c.fillStyle = '#3d7c8c'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * W * .24, H * .1); c.lineTo(cx + s * W * .46, H * .2); c.lineTo(cx + s * W * .46, H * .7); c.lineTo(cx + s * W * .24, H * .8); c.fill(); }
      c.fillStyle = '#d6c06b'; c.fillRect(cx - W * .24, H * .58, W * .48, H * .04); c.fillRect(cx - W * .24, H * .05, W * .48, H * .05);
    },
    metate(c, W, H) { c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#9b968c'], [1, '#56534d']]); c.beginPath(); c.moveTo(W * .02, H * .45); c.quadraticCurveTo(W / 2, H * .7, W * .98, H * .35); c.lineTo(W * .95, H * .85); c.lineTo(W * .05, H * .85); c.closePath(); c.fill(); c.fillStyle = '#7a756c'; rr(c, W * .3, H * .1, W * .4, H * .3, H * .14); c.fill(); },
    tavoletta(c, W, H) {
      c.fillStyle = lin(c, 0, 0, W, H, [[0, '#c9a77d'], [1, '#8d6a46']]);
      c.beginPath(); c.moveTo(W * .05, H * .1); c.lineTo(W * .95, H * .06); c.lineTo(W * .96, H * .9); c.lineTo(W * .06, H * .94); c.closePath(); c.fill();
      c.strokeStyle = '#6a4d30'; c.lineWidth = 1; for (const y of [.37, .64]) { c.beginPath(); c.moveTo(W * .07, H * y); c.lineTo(W * .94, H * y); c.stroke(); }
      c.fillStyle = '#3b2a1a'; c.font = `${H * .19}px "SLTlb", serif`; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('𐀒𐀜𐀰', W * .1, H * .23); c.fillText('𐀀𐀖𐀛𐀰', W * .1, H * .5); c.fillText('𐀞𐀂𐀵', W * .1, H * .78);
      c.font = `${H * .15}px serif`; c.fillText('||| ∘', W * .66, H * .23); c.fillText('— ||', W * .66, H * .5); c.fillText('∘ |', W * .66, H * .78);
    },
    labrys(c, W, H) { c.fillStyle = '#6a4a2a'; c.fillRect(W * .46, H * .02, W * .08, H * .96); c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#7a5326'], [.5, '#e1b062'], [1, '#7a5326']]); c.beginPath(); c.moveTo(W * .5, H * .3); c.quadraticCurveTo(W * .2, H * .2, W * .05, H * .05); c.quadraticCurveTo(W * .15, H * .35, W * .05, H * .65); c.quadraticCurveTo(W * .2, H * .5, W * .5, H * .42); c.quadraticCurveTo(W * .8, H * .5, W * .95, H * .65); c.quadraticCurveTo(W * .85, H * .35, W * .95, H * .05); c.quadraticCurveTo(W * .8, H * .2, W * .5, H * .3); c.fill(); },
    rhyton(c, W, H) {
      c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#18161a'], [.5, '#3c3a42'], [1, '#121013']]);
      ell(c, W / 2, H * .6, W * .3, H * .36); c.fill();
      c.strokeStyle = '#d9b456'; c.lineWidth = W * .06; c.lineCap = 'round'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(W / 2 + s * W * .2, H * .32); c.quadraticCurveTo(W / 2 + s * W * .48, H * .2, W / 2 + s * W * .36, H * .03); c.stroke(); }
      c.fillStyle = '#d24a3a'; ell(c, W * .4, H * .5, W * .045, H * .04); c.fill(); ell(c, W * .6, H * .5, W * .045, H * .04); c.fill();
      c.fillStyle = '#efe6d2'; ell(c, W / 2, H * .85, W * .15, H * .08); c.fill();
    },
    sigilloTondo(c, W, H) { c.fillStyle = rad(c, W * .4, H * .4, 1, W * .5, [[0, '#d08a6a'], [1, '#7a3b26']]); ell(c, W / 2, H / 2, W * .42, H * .38); c.fill(); c.strokeStyle = '#f0d9c4'; c.lineWidth = W * .04; c.beginPath(); c.moveTo(W * .25, H * .55); c.quadraticCurveTo(W * .5, H * .3, W * .72, H * .5); c.lineTo(W * .78, H * .38); c.stroke(); },
    asciaPietra(c, W, H) { c.fillStyle = lin(c, 0, 0, W, H, [[0, '#6f8170'], [1, '#2f3a31']]); c.beginPath(); c.moveTo(W * .3, H * .08); c.lineTo(W * .7, H * .08); c.quadraticCurveTo(W * .82, H * .6, W * .78, H * .92); c.quadraticCurveTo(W / 2, H * .98, W * .22, H * .92); c.quadraticCurveTo(W * .18, H * .6, W * .3, H * .08); c.fill(); },
    elmo(c, W, H) {
      const cx = W / 2; c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#3c3a38'], [.5, '#86827d'], [1, '#2c2a28']]);
      c.beginPath(); c.moveTo(cx - W * .38, H * .55); c.quadraticCurveTo(cx - W * .4, H * .05, cx, H * .04); c.quadraticCurveTo(cx + W * .4, H * .05, cx + W * .38, H * .55); c.lineTo(cx + W * .36, H * .95); c.lineTo(cx - W * .36, H * .95); c.closePath(); c.fill();
      c.fillStyle = '#c99a3c'; c.fillRect(cx - W * .025, H * .04, W * .05, H * .4);
      c.fillStyle = '#1b1a19'; ell(c, cx - W * .14, H * .45, W * .1, H * .06); c.fill(); ell(c, cx + W * .14, H * .45, W * .1, H * .06); c.fill();
      c.fillStyle = '#c99a3c'; c.beginPath(); c.moveTo(cx - W * .26, H * .38); c.quadraticCurveTo(cx, H * .3, cx + W * .26, H * .38); c.lineTo(cx + W * .26, H * .41); c.quadraticCurveTo(cx, H * .34, cx - W * .26, H * .41); c.fill();
      c.beginPath(); c.moveTo(cx - W * .05, H * .45); c.lineTo(cx + W * .05, H * .45); c.lineTo(cx + W * .07, H * .66); c.lineTo(cx - W * .07, H * .66); c.fill();
      c.fillStyle = '#9a8f80'; c.fillRect(cx - W * .14, H * .7, W * .28, H * .2);
      c.strokeStyle = 'rgba(201,154,60,.5)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.strokeRect(cx - W * .34, H * (.1 + i * .07), W * .12, H * .06); c.strokeRect(cx + W * .22, H * (.1 + i * .07), W * .12, H * .06); }
    },
    fibbia(c, W, H) { c.fillStyle = lin(c, 0, 0, W, H, [[0, '#f6d773'], [.5, '#c9962c'], [1, '#7b5714']]); c.beginPath(); c.moveTo(W * .03, H * .3); c.quadraticCurveTo(W * .1, H * .05, W * .45, H * .2); c.lineTo(W * .97, H * .42); c.lineTo(W * .97, H * .58); c.lineTo(W * .45, H * .8); c.quadraticCurveTo(W * .1, H * .95, W * .03, H * .7); c.closePath(); c.fill(); c.strokeStyle = '#6b4a10'; c.lineWidth = 1; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(W * (.15 + i * .1), H / 2, H * .12, 0, Math.PI * (1 + i % 2 * .5)); c.stroke(); } },
    fermagli(c, W, H) { for (const x of [0, .5]) { c.fillStyle = '#d6a93c'; rr(c, W * (x + .03), H * .15, W * .44, H * .7, H * .1); c.fill(); for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { c.fillStyle = (r + k) % 2 ? '#a3221c' : '#d7362b'; c.fillRect(W * (x + .07 + k * .065), H * (.25 + r * .17), W * .055, H * .14); } } },
    umbone(c, W, H) { c.fillStyle = rad(c, W * .42, H * .38, 1, W * .5, [[0, '#a7a19a'], [.7, '#5d5852'], [1, '#2f2c29']]); c.beginPath(); c.arc(W / 2, H * .8, W * .42, Math.PI, 0); c.fill(); c.fillRect(W * .02, H * .78, W * .96, H * .1); c.fillStyle = '#d0a040'; ell(c, W / 2, H * .38, W * .06, W * .06); c.fill(); for (let i = 0; i < 5; i++) { ell(c, W * (.12 + i * .19), H * .83, W * .025, W * .025); c.fill(); } },
    corno(c, W, H) { c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#4a3a2a'], [1, '#c9b48f']]); c.beginPath(); c.moveTo(W * .02, H * .2); c.quadraticCurveTo(W * .6, H * .15, W * .98, H * .75); c.quadraticCurveTo(W * .6, H * .6, W * .02, H * .8); c.closePath(); c.fill(); c.fillStyle = '#d7d7de'; c.fillRect(W * .02, H * .2, W * .07, H * .6); c.fillRect(W * .9, H * .55, W * .08, H * .25); },
    cucchiai(c, W, H) { for (const y of [.3, .7]) { c.fillStyle = lin(c, 0, 0, W, 0, [[0, '#9b9ba3'], [.5, '#ececf2'], [1, '#8a8a92']]); ell(c, W * .2, H * y, W * .15, H * .14); c.fill(); c.fillRect(W * .3, H * y - H * .03, W * .65, H * .06); } c.fillStyle = '#45454d'; c.font = `${H * .12}px serif`; c.fillText('SAVLOS', W * .42, H * .25); c.fillText('PAVLOS', W * .42, H * .65); },
    rivetto(c, W, H) { c.fillStyle = '#7a3e1c'; c.fillRect(W * .44, H * .3, W * .12, H * .6); ell(c, W / 2, H * .3, W * .26, H * .1); c.fill(); c.fillStyle = '#9c5a2c'; c.fillRect(W * .3, H * .78, W * .4, H * .1); }
  };

  // Numero maya in un riquadro (punti, barre, conchiglia; due piani se >= 20)
  function numeroMaya(c, x, y, w, h, n, col) {
    c.fillStyle = col; c.strokeStyle = col;
    const piano = (v, top, hh) => {
      if (v === 0) { c.lineWidth = w * .06; ell(c, x + w / 2, top + hh * .5, w * .38, hh * .2); c.stroke(); c.beginPath(); c.moveTo(x + w * .2, top + hh * .5); c.lineTo(x + w * .8, top + hh * .5); c.stroke(); return; }
      const barre = Math.floor(v / 5), punti = v % 5, bh = hh * .12, gap = hh * .06;
      let yy = top + hh - bh;
      for (let i = 0; i < barre; i++) { rr(c, x + w * .1, yy, w * .8, bh, bh * .3); c.fill(); yy -= bh + gap; }
      for (let i = 0; i < punti; i++) { ell(c, x + w * (.5 + (i - (punti - 1) / 2) * .2), yy + bh * .4, w * .07, w * .07); c.fill(); }
    };
    if (n >= 20) { piano(Math.floor(n / 20), y, h * .45); c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + h * .5); c.lineTo(x + w, y + h * .5); c.stroke(); piano(n % 20, y + h * .55, h * .45); }
    else piano(n, y + h * .2, h * .7);
  }

  // Disegna un reperto dentro un riquadro (x, y, w, h), mantenendo le proporzioni delle celle
  function reperto(c, f, x, y, w, h) {
    const [tipo, par] = f.d; const fn = R[tipo]; if (!fn) return;
    c.save(); c.translate(x, y); fn(c, w, h, par || {}); c.restore();
  }
  function dimensioni(f) { return f.t === 's' ? [1, 1] : [f.w, f.h]; }

  // Personaggio
  const PELLE = ['#f2d0b1', '#d9a77e', '#a86f48', '#6b4329'], CAPELLI = ['#2b1d14', '#6b4226', '#c4873e', '#e3c46a', '#8a8a8a'], MAGLIA = ['#2f6f8f', '#c4573a', '#3f7d46', '#d1a23a', '#6a4f8f'];
  function personaggio(c, x, y, s, pg, posa) { // x,y = piedi, s = altezza
    if (!pg) return; posa = posa || 0;
    const pelle = PELLE[pg.pelle || 0], cap = CAPELLI[pg.capelli || 0], mag = MAGLIA[pg.maglia || 0];
    c.save(); c.translate(x, y); const u = s / 100;
    c.fillStyle = '#4b4033'; c.fillRect(-14 * u, -40 * u, 11 * u, 38 * u); c.fillRect(3 * u, -40 * u, 11 * u, 38 * u); // gambe
    c.fillStyle = '#3a2a1d'; rr(c, -16 * u, -4 * u, 14 * u, 6 * u, 2 * u); c.fill(); rr(c, 2 * u, -4 * u, 14 * u, 6 * u, 2 * u); c.fill();
    c.fillStyle = mag; rr(c, -17 * u, -78 * u, 34 * u, 42 * u, 6 * u); c.fill(); // busto
    c.fillStyle = shade(mag, -.25); c.fillRect(-17 * u, -48 * u, 34 * u, 4 * u);
    // braccio con attrezzo
    c.save(); c.translate(14 * u, -72 * u); c.rotate(-.6 + Math.sin(posa) * .9); c.fillStyle = mag; rr(c, -4 * u, 0, 8 * u, 26 * u, 4 * u); c.fill(); c.fillStyle = pelle; ell(c, 0, 28 * u, 4.5 * u, 4.5 * u); c.fill();
    c.strokeStyle = '#7a5a36'; c.lineWidth = 3 * u; c.beginPath(); c.moveTo(0, 28 * u); c.lineTo(0, 46 * u); c.stroke(); c.fillStyle = '#9aa0a6'; c.beginPath(); c.moveTo(-5 * u, 44 * u); c.lineTo(5 * u, 44 * u); c.lineTo(0, 56 * u); c.fill(); c.restore();
    c.save(); c.translate(-14 * u, -72 * u); c.rotate(.25); c.fillStyle = mag; rr(c, -4 * u, 0, 8 * u, 26 * u, 4 * u); c.fill(); c.fillStyle = pelle; ell(c, 0, 28 * u, 4.5 * u, 4.5 * u); c.fill(); c.restore();
    c.fillStyle = pelle; c.fillRect(-4 * u, -84 * u, 8 * u, 8 * u); ell(c, 0, -94 * u, 13 * u, 14 * u); c.fill();
    c.fillStyle = cap;
    if (pg.sesso === 'f') { ell(c, 0, -100 * u, 14 * u, 10 * u); c.fill(); c.fillRect(-14 * u, -100 * u, 6 * u, 24 * u); c.fillRect(8 * u, -100 * u, 6 * u, 24 * u); }
    else { ell(c, 0, -102 * u, 13.5 * u, 8 * u); c.fill(); c.fillRect(-13 * u, -104 * u, 4 * u, 10 * u); }
    if (pg.cappello) { c.fillStyle = '#d8c18a'; ell(c, 0, -104 * u, 22 * u, 5 * u); c.fill(); ell(c, 0, -110 * u, 12 * u, 8 * u); c.fill(); c.fillStyle = '#7a5a36'; c.fillRect(-12 * u, -107 * u, 24 * u, 2.5 * u); }
    c.fillStyle = '#2a2018'; ell(c, -4.5 * u, -94 * u, 1.6 * u, 2 * u); c.fill(); ell(c, 4.5 * u, -94 * u, 1.6 * u, 2 * u); c.fill();
    c.strokeStyle = '#7a4b38'; c.lineWidth = 1.4 * u; c.beginPath(); c.arc(0, -89 * u, 4 * u, .2, Math.PI - .2); c.stroke();
    c.restore();
  }

  // Sfondo del cielo sopra lo scavo
  function sfondo(c, sito, W, H) {
    c.fillStyle = lin(c, 0, 0, 0, H, [[0, sito.cielo[0]], [1, sito.cielo[1]]]); c.fillRect(0, 0, W, H);
    const k = sito.sfondo, base = H;
    const monte = (pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, base); pts.forEach(([a, b]) => c.lineTo(W * a, H * b)); c.lineTo(W, base); c.fill(); };
    if (k === 'vesuvio') { monte([[0, .8], [.35, .75], [.55, .3], [.62, .32], [.68, .28], [.9, .7], [1, .75]], '#7d8a95'); c.fillStyle = 'rgba(255,255,255,.6)'; ell(c, W * .62, H * .2, W * .05, H * .06); c.fill(); }
    else if (k === 'colline') { monte([[0, .5], [.2, .35], [.4, .55], [.6, .3], [.8, .5], [1, .4]], '#d9b37a'); }
    else if (k === 'grotta') { c.fillStyle = '#2a221d'; c.fillRect(0, 0, W, H); c.fillStyle = '#4a3a2e'; c.beginPath(); c.moveTo(0, H); c.quadraticCurveTo(W * .5, -H * .4, W, H); c.fill(); c.fillStyle = '#8e3b23'; c.globalAlpha = .7; ell(c, W * .3, H * .5, W * .08, H * .12); c.fill(); c.fillStyle = '#1f1a17'; ell(c, W * .6, H * .45, W * .1, H * .14); c.fill(); c.globalAlpha = 1; }
    else if (k === 'collina') { monte([[0, .7], [.3, .5], [.6, .45], [1, .65]], '#a6a07a'); }
    else if (k === 'campi') { monte([[0, .7], [.5, .62], [1, .7]], '#a8b07a'); c.fillStyle = '#8a8f60'; for (let i = 0; i < 6; i++) { ell(c, W * (.1 + i * .16), H * .66, W * .03, H * .12); c.fill(); } }
    else if (k === 'pianura') { monte([[0, .8], [1, .78]], '#cdb489'); }
    else if (k === 'montagne') { monte([[0, .6], [.15, .2], [.3, .55], [.5, .1], [.7, .5], [.85, .25], [1, .5]], '#6b7d6a'); }
    else if (k === 'savana') { monte([[0, .75], [1, .72]], '#c9a96a'); c.fillStyle = '#4e5a2a'; ell(c, W * .75, H * .48, W * .12, H * .05); c.fill(); c.fillRect(W * .745, H * .5, W * .01, H * .25); }
    else if (k === 'lago') { monte([[0, .7], [1, .7]], '#7e9cb2'); monte([[0, .75], [.4, .72], [.7, .6], [1, .7]], '#4f6b45'); }
    else if (k === 'giungla') { for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#3d6b3a' : '#2f5a2f'; ell(c, W * (i * .12), H * .7, W * .1, H * .35); c.fill(); } }
    else if (k === 'ulivi') { monte([[0, .7], [1, .65]], '#b5a77e'); c.fillStyle = '#7d8c5a'; for (let i = 0; i < 5; i++) { ell(c, W * (.1 + i * .2), H * .55, W * .06, H * .12); c.fill(); } }
    else if (k === 'tumuli') { monte([[0, .8], [.2, .6], [.4, .8], [.7, .55], [1, .8]], '#7b8a5a'); }
  }

  return {R, reperto, dimensioni, personaggio, sfondo, numeroMaya, shade, rr, ell, lin, rad, seeded, hash, PELLE, CAPELLI, MAGLIA};
})();
