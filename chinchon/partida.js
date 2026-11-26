// Mi Chinchorro — la partida: turnos, reparto como en la mesa
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ================= PARTIDA ================= */
let sel = null, orden = 0, nueva = null, token = 0, pistaId = null;
const ESPERA = () => [1700, 1000, 450][S.velocidad];
let YO = 0;
const rayitas = p => p.rayas ? ` <span style="color:#ffb4a6;font-weight:900;letter-spacing:1px" title="rayas">${'|'.repeat(p.rayas)}</span>` : '';
const pts = n => n + (Math.abs(n) === 1 ? ' punto' : ' puntos');

function guardar() { if (ONLINE) return; if (G && !G.terminada) LS.set('mc-partida2', { G, S }); }
function borrarGuardada() { LS.del('mc-partida2'); }

$('bJugar').onclick = () => {
  if (LS.get('mc-partida2', null)) {
    ventana('<h2>¿Partida nueva?</h2><div class="sub">Tienes una partida empezada. Si empiezas otra, la raya de esa se pierde.</div>',
      [{ t: 'Sí, empezar otra', f: empezarPartida }, { t: 'No, seguir la que tengo', clase: 'no', f: continuar }]);
  } else empezarPartida();
};
$('bContinuar').onclick = continuar;

function empezarPartida() {
  if (ONLINE) salirOnline(false);
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, PREF);
  if (S.baraja === 40 && S.jugadores === 5) S.baraja = 48;
  const rivales = rivalesElegidos().slice(0, S.jugadores - 1);
  S.nombres = rivales.join(', ');
  nuevaPartida((PREF.nombre || '').trim() || 'Tú');
  G.jugadores.forEach((p, i) => {
    if (i === 0) { p.avatar = miAvatar(); return; }
    p.avatar = p.nombre;
    p.nivel = (PREF.nivelDe || {})[p.nombre] ?? S.nivel;
  });
  CART.jugadas++; guardarCartera(); chinchonNeto = 0;
  ir('juego');
  empezarMano();
  setTimeout(() => alguna('inicio'), 700);
}
function continuar() {
  const d = LS.get('mc-partida2', null);
  if (!d) return;
  Object.keys(S).forEach(k => delete S[k]); Object.assign(S, d.S);
  G = d.G; G.anim = null;
  ir('juego');
  if (G.fase === 'resultado' && G.res) { pintar(); mostrarResultado(G.res); return; }
  pintar(); avanzar();
}
$('bSalir').onclick = () => {
  if (ONLINE && ONLINE.rol === 'anfitrion') return ventana(`<h2>¿Dejarlo por hoy?</h2><div class="sub">Si pausas, la partida se guarda y la seguís otro día desde 🗂️ Mis mesas.</div>`,
    [{ t: '⏸ Pausar la partida', f: pausarMesa }, { t: '🚪 Cerrar la mesa', clase: 'no', f: () => confirmarCerrar(ONLINE.codigo, ONLINE.nombre) }, { t: 'Seguir jugando', clase: 'no' }]);
  if (ONLINE) return ventana(`<h2>¿Salir de la mesa?</h2><div class="sub">Un bot ocupará tu sitio. Puedes volver cuando quieras desde 🗂️ Mis mesas.</div>`,
    [{ t: 'Salir', f: () => { const c = ONLINE.codigo; RED().levantar(c, miUid()).catch(() => {}); salirOnline(true); } }, { t: 'Seguir jugando', clase: 'no' }]);
  ventana('<h2>¿Salir?</h2><div class="sub">La partida se queda guardada y puedes seguirla luego.</div>',
    [{ t: 'Salir al inicio', f: () => { token++; ir('inicio'); } }, { t: 'Seguir jugando', clase: 'no' }]);
};

function empezarMano() {
  if (ONLINE && ONLINE.rol === 'anfitrion') { aplicarSillas(true); sillasNuevas(); }
  repartir(); G.reg = null; regMano(); G.jugadores[YO].orden = null; orden = 1; sel = null; nueva = null; pistaId = null;
  G.res = null;
  G.jugadores.forEach(p => p.farol = null);
  G.anim = null; guardar();
  if (ONLINE) { manosPub = {}; pubOnline([{ t: 'reparte' }]); }
  const r = G.jugadores[G.reparte];
  const t = ++token;
  const animar = PREF.reparto === 2 || (PREF.reparto === 1 && G.manoN === 1);
  if (animar && !document.hidden) return repartoAnimado(t);
  pintar();
  mensaje(`${r.humano ? 'Repartes tú' : 'Reparte ' + r.nombre}. ¡Mano ${G.manoN}!`);
  setTimeout(() => { if (t === token) avanzar(); }, 1100);
}

/* ---------- Reparto como en la mesa: barajar, cortar y repartir de una en una ---------- */
let saltarReparto = false, finCorte = null;
function anteriorActivo(i) { const n = G.jugadores.length; for (let k = 1; k <= n; k++) { const x = (i - k + n) % n; if (!G.jugadores[x].fuera) return x; } return i; }
const RITMO = () => [1.35, 1, 0.6][S.velocidad];
function montoncito(n, rect, extra = '') {
  // pila de dorsos que se dibuja encima del mazo para las animaciones
  const caja = document.createElement('div');
  caja.className = 'pila ' + extra;
  Object.assign(caja.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' });
  for (let k = 0; k < n; k++) { const d = document.createElement('div'); d.className = 'carta dorso'; d.style.transform = `translate(${-k * 0.7}px,${-k * 0.9}px)`; caja.appendChild(d); }
  document.body.appendChild(caja);
  return caja;
}
async function animarBarajar(rect, texto, vueltas, rapido) {
  const izq = montoncito(5, rect), der = montoncito(5, rect);
  const n = vueltas || cuantasMezclas() || 3, ms = 260 * RITMO() * (rapido ? 0.5 : n > 3 ? 0.55 : 1);
  for (let vuelta = 0; vuelta < n && !saltarReparto; vuelta++) {
    if (texto && n > 3) mensaje(`${texto} · mezcla ${vuelta + 1} de ${n}`);
    sonar('mezcla');
    const sep = rect.width * 0.62;
    await Promise.all([
      izq.animate([{ transform: 'none' }, { transform: `translateX(${-sep}px) rotate(-10deg)` }], { duration: ms, fill: 'forwards', easing: 'ease-out' }).finished,
      der.animate([{ transform: 'none' }, { transform: `translateX(${sep}px) rotate(10deg)` }], { duration: ms, fill: 'forwards', easing: 'ease-out' }).finished
    ]);
    // las cartas caen intercaladas, una de cada lado
    const cartas = [];
    for (let k = 4; k >= 0; k--) { cartas.push([izq.children[k], -sep]); cartas.push([der.children[k], sep]); }
    await Promise.all(cartas.map(([c, x], k) => c.animate([{ transform: c.style.transform }, { transform: `translate(${-x}px,-6px) rotate(${x > 0 ? -10 : 10}deg)` }], { duration: ms * 0.55, delay: k * ms * 0.09, fill: 'forwards', easing: 'ease-in' }).finished));
    izq.getAnimations().forEach(a => a.cancel()); der.getAnimations().forEach(a => a.cancel());
    [...izq.children, ...der.children].forEach(c => c.getAnimations().forEach(a => a.cancel()));
    await espera(ms * 0.3);
  }
  izq.remove(); der.remove();
}
/* Se acabó el mazo: el montón (menos la de arriba) pasa boca abajo al hueco del mazo y se mezcla una vez, rápido */
let rebarajando = false;
const hayQueRebarajar = () => !!G && !G.mazo.length && (G.descarte.length > 1 || !!(ONLINE && ONLINE.rol === 'invitado'));
async function animarRebarajar() {
  if (rebarajando) return;
  rebarajando = true; saltarReparto = false;
  try {
    const mz = cartaMazo(), md = cartaMonton();
    if (!mz || !md || document.hidden) return;
    const rm = mz.getBoundingClientRect(), rd = md.getBoundingClientRect();
    mensaje('Se acabó el mazo: se baraja el montón 🔀');
    sonar('mezcla');
    const pila = montoncito(5, rd);
    await pila.animate([{ transform: 'translateY(6px)', opacity: 0 }, { transform: 'none', opacity: 1, offset: 0.2 }, { transform: `translate(${rm.left - rd.left}px,${rm.top - rd.top}px)`, opacity: 1 }],
      { duration: 320 * RITMO(), easing: 'ease-in-out', fill: 'forwards' }).finished;
    pila.remove();
    if (!saltarReparto) await animarBarajar(rm, null, 1, true);
  } finally {
    rebarajando = false; saltarReparto = false;
    if (G) {
      if (ONLINE && ONLINE.rol === 'invitado') { if (!G.mazo.length) G.mazo = espejoMano(9, 1); }
      else rellenarMazo();   // lo mismo que haría robar(): el juego no cambia
      pintar();
    }
  }
}
async function animarCorte(rect) {
  const abajo = montoncito(4, rect), arriba = montoncito(4, rect, 'encima');
  const ms = 320 * RITMO();
  await arriba.animate([{ transform: 'none' }, { transform: `translate(${rect.width * 0.85}px,-14px) rotate(6deg)` }], { duration: ms, fill: 'forwards', easing: 'ease-out' }).finished;
  arriba.style.zIndex = 41; abajo.style.zIndex = 42;
  await Promise.all([
    abajo.animate([{ transform: 'none' }, { transform: `translate(${rect.width * 0.85}px,-${rect.height * 0.12}px)` }], { duration: ms, fill: 'forwards', easing: 'ease-in-out' }).finished,
    arriba.animate([{ transform: `translate(${rect.width * 0.85}px,-14px) rotate(6deg)` }, { transform: `translate(${rect.width * 0.85}px,0) rotate(0)` }], { duration: ms, fill: 'forwards' }).finished
  ]);
  await Promise.all([abajo, arriba].map(p => p.animate([{ transform: getComputedStyle(p).transform }, { transform: 'none' }], { duration: ms, fill: 'forwards', easing: 'ease-in-out' }).finished));
  abajo.remove(); arriba.remove();
}
function esperarCorteYo(t) {
  return new Promise(res => {
    const m = $('mMazo'); m.classList.add('activo');
    mensaje('Te toca cortar ✂️ Toca el mazo: arriba cortas pocas, abajo muchas', true); vibrar('turno');
    const fin = e => {
      finCorte = null; m.classList.remove('activo'); m.removeEventListener('click', fin); clearTimeout(tt);
      // el corte de verdad: por donde tocas el mazo
      if (e && e.clientY != null) { const r = m.getBoundingClientRect(); const f = Math.max(0.1, Math.min(0.9, (e.clientY - r.top) / r.height)); cortarYRepartir(f); G.reg = null; regMano(); }
      res();
    };
    finCorte = fin;
    m.addEventListener('click', fin);
    const tt = setTimeout(fin, 8000);
  });
}
async function repartoAnimado(t) {
  saltarReparto = false;
  const act = activos(), total = act.length * 7;
  G.anim = { vis: {}, monton: false, pend: total + 1 };
  pintar();
  const r = G.jugadores[G.reparte], cortadora = anteriorActivo(G.reparte);
  const vivo = () => t === token;
  const rect = cartaMazo().getBoundingClientRect();
  try {
    $('velo').classList.add('oculto');
    const txtB = `${r.humano ? 'Barajas tú' : 'Baraja ' + r.nombre} 🔀 · Mano ${G.manoN}`;
    mensaje(txtB);
    await animarBarajar(rect, txtB); if (!vivo()) return;
    if (!saltarReparto) {
      if (G.jugadores[cortadora].humano && !ONLINE) { await esperarCorteYo(t); if (!vivo()) return; }
      else mensaje(`Corta ${G.jugadores[cortadora].nombre} ✂️`);
      await animarCorte(rect); if (!vivo()) return;
    }
    mensaje(`${r.humano ? 'Repartes tú' : 'Reparte ' + r.nombre}… (toca para saltar)`);
    // de una en una, empezando por la siguiente a la que reparte
    const orden = []; let k = siguienteActivo(G.reparte);
    for (let n = 0; n < act.length; n++) { orden.push(k); k = siguienteActivo(k); }
    const ms = 300 * RITMO();
    for (let vuelta = 0; vuelta < 7 && !saltarReparto; vuelta++) {
      for (const i of orden) {
        if (saltarReparto || !vivo()) break;
        const destino = i === YO ? $('mano') : avatarDe(i);
        const v = volar(cartaMazo(), destino, dorsoHTML, ms);
        await espera(ms * 0.55);
        v.then(() => { if (!G.anim) return; G.anim.vis[i] = (G.anim.vis[i] || 0) + 1; G.anim.pend--; pintar(); });
      }
      if (!vivo()) return;
    }
    await espera(ms * 0.6); if (!vivo()) return;
    // se destapa la primera carta del montón
    if (!saltarReparto) {
      await volar(cartaMazo(), cartaMonton(), dorsoHTML, ms * 1.2); if (!vivo()) return;
    }
  } finally {
    if (vivo()) {
      G.anim = null;
      pintar(true);
      mensaje(`${r.humano ? 'Has repartido tú' : 'Ha repartido ' + r.nombre}. ¡A jugar!`);
      setTimeout(() => { if (vivo()) avanzar(); }, 700);
    }
  }
}
document.addEventListener('pointerdown', e => { if (G && (G.anim || rebarajando) && !e.target.closest('#mMazo') && !e.target.closest('.volver')) { saltarReparto = true; if (finCorte) finCorte(); } });

function mensaje(t, tuyo) { const m = $('mensaje'); m.textContent = t; m.classList.toggle('tuyo', !!tuyo); if (G) ajustarTamano(G.jugadores[YO].mano.length); }

function avanzar() {
  if (!G || G.terminada) return;
  const t = ++token;
  if (ONLINE && ONLINE.rol === 'invitado') return avanzarInvitado();
  if (ONLINE) aplicarSillas(true);
  pintar(); guardar();
  if (ONLINE) pubOnline();
  const pt = G.jugadores[G.turno];
  if (pt.remoto && !pt.ausente) { mensaje(`Le toca a ${pt.nombre}… 📱`); esperarRemoto(t); return; }
  if (G.jugadores[G.turno].humano) {
    if (G.fase === 'robar') { mensaje('Te toca: coge del mazo o del montón 👇', true); vibrar('turno'); }
    else mensaje('Arrastra al montón la carta que tiras', true);
    setTimeout(() => { if (t === token && miTurno()) alguna('quienJuega', {}, true); }, 20000);
    setTimeout(() => { if (t === token && miTurno()) alguna('prisa', {}, true); }, 40000);
    return;
  }
  setTimeout(() => { if (t === token) turnoIA(t); }, ESPERA() * 0.6);
}

