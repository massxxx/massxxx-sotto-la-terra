// Sotto la terra — musica generativa calma ed effetti, tutto sintetizzato
const Audio = (() => {
  let ctx = null, master, musBus, sfxBus, timer = null, brano = null, step = 0;
  const vol = {musica: .5, effetti: .8};
  // Scale (semitoni dalla tonica), tonica in Hz, tempo in ms per passo, timbro
  const BRANI = {
    menu:    {t: 196, s: [0, 2, 4, 7, 9, 12, 14], ms: 520, tim: 'triangle'},
    pompei:  {t: 220, s: [0, 2, 3, 5, 7, 9, 10, 12], ms: 560, tim: 'triangle'},
    egitto:  {t: 174.6, s: [0, 1, 4, 5, 7, 8, 11, 12], ms: 600, tim: 'sine'},
    lascaux: {t: 130.8, s: [0, 3, 5, 7, 10, 12], ms: 900, tim: 'sine'},
    troia:   {t: 196, s: [0, 2, 3, 5, 7, 8, 10, 12], ms: 560, tim: 'triangle'},
    xian:    {t: 233, s: [0, 2, 4, 7, 9, 12, 14], ms: 620, tim: 'triangle'},
    mohenjo: {t: 185, s: [0, 1, 4, 5, 7, 8, 10, 12], ms: 600, tim: 'sine'},
    machu:   {t: 261.6, s: [0, 3, 5, 7, 10, 12, 15], ms: 640, tim: 'sine'},
    olduvai: {t: 146.8, s: [0, 2, 5, 7, 9, 12], ms: 700, tim: 'sine'},
    birka:   {t: 164.8, s: [0, 2, 3, 5, 7, 9, 10, 12], ms: 680, tim: 'triangle'},
    palenque:{t: 207.7, s: [0, 2, 4, 7, 9, 12], ms: 580, tim: 'sine'},
    cnosso:  {t: 220, s: [0, 1, 3, 5, 7, 8, 10, 12], ms: 600, tim: 'triangle'},
    sutton:  {t: 174.6, s: [0, 2, 3, 5, 7, 9, 10, 12], ms: 700, tim: 'triangle'},
    museo:   {t: 261.6, s: [0, 2, 4, 5, 7, 9, 11, 12], ms: 600, tim: 'sine'}
  };
  function avvia() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
    // riverbero leggero con un ritardo
    musBus = ctx.createGain(); sfxBus = ctx.createGain();
    const del = ctx.createDelay(); del.delayTime.value = .33; const fb = ctx.createGain(); fb.gain.value = .32; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
    musBus.connect(master); musBus.connect(del); del.connect(lp); lp.connect(fb); fb.connect(del); lp.connect(master);
    sfxBus.connect(master);
    aggiornaVolumi();
    if (brano) suona(brano, true);
  }
  function aggiornaVolumi() { if (!ctx) return; musBus.gain.value = vol.musica * .22; sfxBus.gain.value = vol.effetti * .6; }
  function nota(f, t0, dur, tim, g, bus) {
    const o = ctx.createOscillator(), a = ctx.createGain(); o.type = tim; o.frequency.value = f;
    a.gain.setValueAtTime(0, t0); a.gain.linearRampToValueAtTime(g, t0 + Math.min(.08, dur * .2)); a.gain.exponentialRampToValueAtTime(.0005, t0 + dur);
    o.connect(a); a.connect(bus || musBus); o.start(t0); o.stop(t0 + dur + .05);
  }
  function suona(nome, forza) {
    if (brano === nome && !forza) return; brano = nome; step = 0;
    if (timer) clearInterval(timer); timer = null;
    if (!ctx || !BRANI[nome]) return;
    const b = BRANI[nome]; let accordo = 0;
    const tick = () => {
      if (!ctx || vol.musica <= 0 || document.hidden) return;
      const t = ctx.currentTime + .05, f = n => b.t * Math.pow(2, n / 12);
      if (step % 16 === 0) { accordo = [0, 3, 4, 0, 5, 3][Math.floor(step / 16) % 6]; const r = b.s[accordo % b.s.length]; nota(f(r - 12), t, b.ms * 16 / 1000, 'sine', .22); nota(f(r - 5), t, b.ms * 16 / 1000, 'sine', .12); }
      if (Math.random() < .55) { const i = Math.floor(Math.random() * b.s.length); nota(f(b.s[i]), t, b.ms * (2 + Math.random() * 3) / 1000, b.tim, .16); }
      if (step % 8 === 4 && Math.random() < .5) nota(f(b.s[(accordo + 2) % b.s.length] + 12), t, .8, 'sine', .07);
      step++;
    };
    timer = setInterval(tick, b.ms);
  }
  function rumore(dur, freq, q, g, tipo) {
    if (!ctx || vol.effetti <= 0) return;
    const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = tipo || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const a = ctx.createGain(); a.gain.value = g; s.connect(f); f.connect(a); a.connect(sfxBus); s.start();
  }
  const sfx = {
    piccone() { rumore(.18, 180, 1.2, 1.4); if (ctx) nota(90, ctx.currentTime, .12, 'square', .08, sfxBus); },
    cazzuola() { rumore(.12, 1400, 2, .7); },
    pennello() { rumore(.22, 4200, .8, .35, 'highpass'); },
    roccia() { rumore(.1, 900, 6, .5); },
    crack() { rumore(.25, 600, 3, 1.2); if (ctx) nota(140, ctx.currentTime, .2, 'sawtooth', .05, sfxBus); },
    scintilla() { if (!ctx) return; const t = ctx.currentTime; [0, 4, 7, 12].forEach((n, i) => nota(880 * Math.pow(2, n / 12), t + i * .07, .5, 'sine', .14, sfxBus)); },
    trovato() { if (!ctx) return; const t = ctx.currentTime; [0, 7, 12, 16, 19].forEach((n, i) => nota(523 * Math.pow(2, n / 12), t + i * .09, .9, 'triangle', .14, sfxBus)); },
    incastro() { if (!ctx) return; nota(660, ctx.currentTime, .15, 'triangle', .2, sfxBus); nota(990, ctx.currentTime + .05, .2, 'sine', .12, sfxBus); },
    setaccio() { rumore(.35, 2400, .7, .5); },
    tocco() { if (!ctx) return; nota(520, ctx.currentTime, .08, 'sine', .12, sfxBus); },
    errore() { if (!ctx) return; nota(220, ctx.currentTime, .2, 'triangle', .14, sfxBus); nota(196, ctx.currentTime + .1, .25, 'triangle', .12, sfxBus); },
    fanfara() { if (!ctx) return; const t = ctx.currentTime; [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((n, i) => nota(392 * Math.pow(2, n / 12), t + i * .14, .7, 'triangle', .16, sfxBus)); }
  };
  return {avvia, suona, sfx, vol, aggiornaVolumi};
})();
