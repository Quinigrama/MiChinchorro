// Mi Chinchorro — vibración, tapete y reverso, sonidos y voces
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Vibración ---------- */
// No se puede elegir la fuerza, solo la duración: suave = toque corto; cierre = doble toque algo más largo
const VIBRA = { turno: 35, cierre: [110, 70, 110] };
function vibrar(tipo) { sonar(tipo === 'cierre' ? 'golpe' : tipo); if (PREF.vibrar === false || !navigator.vibrate) return; try { navigator.vibrate(VIBRA[tipo]); } catch (e) {} }
/* ---------- Tapete y reverso ---------- */
const TAPETES = { verde: ['#2a7a4b', '#1d5a37', '#123d25'], azul: ['#3a6fb0', '#24507f', '#14304f'], granate: ['#93323f', '#6d2230', '#43141d'], madera: ['#94633a', '#6d4627', '#432a17'], noche: ['#3d4656', '#2a303c', '#171b22'] };
const REVERSOS = { rojo: ['#a3262a', '#8c1f22'], azul: ['#1f4f9a', '#183d78'], verde: ['#1f6b3a', '#17542d'], morado: ['#6a2c91', '#53216f'], negro: ['#2e2e2e', '#1b1b1b'] };
function aplicarTema() {
  const t = TAPETES[PREF.tapete] || TAPETES.verde, r = REVERSOS[PREF.reverso] || REVERSOS.rojo, st = document.documentElement.style;
  st.setProperty('--tapete0', t[0]); st.setProperty('--tapete', t[1]); st.setProperty('--tapete2', t[2]);
  st.setProperty('--dorso1', r[0]); st.setProperty('--dorso2', r[1]);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t[2];
  const cl = document.documentElement.classList;   // dibujo del tapete: A (liso), B, C, D
  ['dib-B', 'dib-C', 'dib-D'].forEach(c => cl.remove(c));
  if (['B', 'C', 'D'].includes(PREF.dibujo)) cl.add('dib-' + PREF.dibujo);
}
aplicarTema();
/* ---------- Sonidos (sintetizados: sin archivos) ---------- */
const SON = (() => {
  let ctx = null, ruidoBuf = null;
  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const ruido = () => {
    if (ruidoBuf) return ruidoBuf;
    const c = ac(), n = c.sampleRate * 0.5; ruidoBuf = c.createBuffer(1, n, c.sampleRate);
    const d = ruidoBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return ruidoBuf;
  };
  // golpecito de cartón: ruido filtrado muy corto
  const roce = (t, dur = 0.06, f = 2400, v = 0.25) => {
    const c = ac(), s = c.createBufferSource(), fi = c.createBiquadFilter(), g = c.createGain();
    s.buffer = ruido(); fi.type = 'bandpass'; fi.frequency.value = f; fi.Q.value = 0.9;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fi).connect(g).connect(c.destination); s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.02);
  };
  const tono = (t, f, dur, v = 0.12, tipo = 'sine') => {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  };
  return {
    ac,
    carta() { const c = ac(); if (c) roce(c.currentTime, 0.07, 2200 + Math.random() * 900, 0.22); },
    mezcla() { const c = ac(); if (!c) return; const t = c.currentTime; for (let k = 0; k < 14; k++) roce(t + k * 0.022 + Math.random() * 0.01, 0.035, 3000 + Math.random() * 1500, 0.13); },
    turno() { const c = ac(); if (!c) return; const t = c.currentTime; tono(t, 880, 0.18, 0.07); tono(t + 0.12, 1320, 0.25, 0.06); },
    golpe() { const c = ac(); if (!c) return; const t = c.currentTime; for (const d of [0, 0.16]) { tono(t + d, 140, 0.12, 0.35, 'triangle'); roce(t + d, 0.05, 900, 0.3); } },
    chinchon() { const c = ac(); if (!c) return; const t = c.currentTime; [523, 659, 784, 1047].forEach((f, k) => tono(t + k * 0.12, f, 0.35, 0.1, 'triangle')); },
    raya() { const c = ac(); if (!c) return; const t = c.currentTime; tono(t, 392, 0.25, 0.09, 'triangle'); tono(t + 0.2, 294, 0.4, 0.09, 'triangle'); }
  };
})();
function sonar(tipo) { if (!(PREF.sonido > 0) || document.hidden) return; try { SON[tipo] && SON[tipo](); } catch (e) {} }
document.addEventListener('pointerdown', () => { if (PREF.sonido > 0) try { SON.ac(); } catch (e) {} }, { passive: true });
/* ---------- Voces: cada personaje con su voz, su tono y su ritmo ---------- */
const VOCES_P = { MCarmen: ['f', 1.05, 0.95], Matilde: ['f', 0.92, 0.9], Elvira: ['f', 1.25, 1.05], Pepita: ['f', 1.15, 1.0],
  Pedro: ['m', 0.85, 1.0], 'Andrés': ['m', 0.95, 0.92], Manolo: ['m', 0.72, 0.9], Lucas: ['m', 1.02, 1.08] };
const NOMBRES_M = /(jorge|pablo|diego|carlos|enrique|juan|alvaro|álvaro|raul|raúl|miguel|antonio|male|hombre|masculin|x-eed|x-eef)/i;
const NOMBRES_F = /(helena|laura|luc[ií]a|m[oó]nica|paulina|marisol|sabina|esperanza|dalia|conchita|pen[eé]lope|lupe|elvira|female|mujer|femenin|x-eea|x-eec|x-eee)/i;
function vozDe(gen) {
  const vs = (window.speechSynthesis && speechSynthesis.getVoices() || []).filter(v => /^es/i.test(v.lang));
  if (!vs.length) return null;
  const esp = vs.filter(v => /es[-_]ES/i.test(v.lang)), base = esp.length ? esp : vs;
  const re = gen === 'm' ? NOMBRES_M : NOMBRES_F;
  return base.find(v => re.test(v.name)) || vs.find(v => re.test(v.name)) || base[0];
}
function hablar(nombre, texto) {
  if (PREF.sonido !== 2 || !window.speechSynthesis || document.hidden) return;
  const limpio = String(texto).replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s+/g, ' ').trim();
  if (!limpio) return;
  let pf = VOCES_P[nombre];
  if (!pf) { let h = 0; for (const ch of String(nombre)) h = (h * 31 + ch.charCodeAt(0)) | 0; const f = /a$/i.test(nombre); pf = [f ? 'f' : 'm', (f ? 1.1 : 0.85) + ((h & 7) - 3) * 0.03, 1]; }
  const [gen, tono, ritmo] = pf, v = vozDe(gen);
  const u = new SpeechSynthesisUtterance(limpio);
  u.lang = v ? v.lang : 'es-ES'; if (v) u.voice = v;
  // si la voz no es del género, se compensa con el tono
  const acierta = v && (gen === 'm' ? NOMBRES_M : NOMBRES_F).test(v.name);
  u.pitch = Math.max(0.1, Math.min(2, acierta ? tono : tono * (gen === 'm' ? 0.78 : 1.12)));
  u.rate = ritmo; u.volume = 0.9;
  if (speechSynthesis.speaking && speechSynthesis.pending) speechSynthesis.cancel();
  if (typeof RADIO !== 'undefined' && RADIO.sonando) { RADIO.baja = true; volRadio(); u.onend = u.onerror = () => { RADIO.baja = false; volRadio(); }; }
  speechSynthesis.speak(u);
}
if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }

