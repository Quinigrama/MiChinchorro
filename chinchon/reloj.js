// Mi Chinchorro — ⏱️ partida rápida: reloj para tu turno y rivales «relámpago»
// Ajustes → «Partida rápida ⏱️»: No / 8 s por turno / 5 s por turno / ♟️ ajedrez (2 min + 2 s por turno).
// Solo jugando en tu móvil (en mesas online no hay reloj).
// Si se te acaba el tiempo: si no has robado, robas del mazo; luego se tira la carta que acabas de robar
// (si la cogiste del montón, tu carta suelta más alta).

const RELOJ_BANCO = 120, RELOJ_INC = 2;
function relojModo() { return (!ONLINE && S.reloj) ? S.reloj : 0; }      // 0 | 8 | 5 | 'ajedrez'
function relampago() { return !!relojModo(); }

let relojT = null, relojFin = 0, relojTurno = null, relojTick = 0;
function relojCaja() {
  let el = document.getElementById('relojPartida');
  if (!el) {
    el = document.createElement('div');
    el.id = 'relojPartida';
    el.style.cssText = 'position:fixed;z-index:15;' +   // por debajo de las ventanas (velo: 20) y avisos (30)
      'background:#1b1b1b;color:#fff;border-radius:14px;padding:5px 6px 7px;font-weight:800;font-size:20px;line-height:1.15;border:2px solid #f3c44f;' +
      'box-sizing:border-box;text-align:center;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.4);display:none';
    el.innerHTML = '<div id="relojIco" style="font-size:.9em">⏱️</div><div id="relojNum" style="font-variant-numeric:tabular-nums">5</div><div style="height:5px;background:rgba(255,255,255,.2);border-radius:3px;margin-top:4px">' +
      '<div id="relojBarra" style="height:100%;width:100%;background:#4caf50;border-radius:3px"></div></div>';
    document.body.appendChild(el);
  }
  return el;
}
function relojOcultar() { const el = document.getElementById('relojPartida'); if (el) el.style.display = 'none'; }
function relojFmt(seg) { return `${Math.floor(seg / 60)}:${String(Math.floor(seg % 60)).padStart(2, '0')}`; }
// A la derecha del montón, en el hueco libre de la mesa, centrado en altura con las cartas.
// Si no cabe (pantallas muy estrechas), en la esquina del mensaje «Te toca…».
function relojColocar() {
  const caja = document.getElementById('relojPartida'), mon = document.getElementById('mDesc');
  if (!caja) return;
  // se mide la caja del montón (no la carta, que a veces está volando y no se puede medir)
  const rm = mon ? mon.getBoundingClientRect() : null, carta = mon && mon.querySelector('.carta, .vacio');
  const rc = carta ? carta.getBoundingClientRect() : null;
  const r = rm && rm.width ? { right: rm.right, top: rm.top, width: rm.width, height: rc && rc.height ? rc.height : rm.height * 0.85 } : null;
  const hueco = r ? window.innerWidth - r.right : 0;
  const SEP = 16, BORDE = 6;                               // aire con el montón y con el borde de la pantalla
  if (r && r.width && hueco - SEP - BORDE >= 54) {
    const w = Math.min(84, hueco - SEP - BORDE);
    caja.style.width = w + 'px';
    caja.style.fontSize = w >= 76 ? '20px' : w >= 64 ? '18px' : '16px';   // en pantallas estrechas, más pequeño
    caja.style.left = (r.right + SEP + (hueco - SEP - BORDE - w) / 2) + 'px';
    caja.style.top = (r.top + r.height / 2 - caja.offsetHeight / 2) + 'px';
    return;
  }
  const msj = document.getElementById('mensaje');
  caja.style.width = ''; caja.style.fontSize = '22px';
  if (msj) { const m = msj.getBoundingClientRect(); caja.style.left = Math.max(4, m.right - caja.offsetWidth - 8) + 'px'; caja.style.top = Math.max(4, m.top - caja.offsetHeight * 0.45) + 'px'; }
}
// Modo ajedrez: mientras juegan las demás, tu reloj se ve quieto (y un poco apagado) con lo que te queda
function relojMostrarQuieto() {
  if (relojModo() !== 'ajedrez' || !G || G.terminada || relojT) return;
  const msj = document.getElementById('mensaje');
  if (!msj || !msj.offsetParent) return relojOcultar();          // no estás en la mesa
  const caja = relojCaja(), seg = G.relojBanco == null ? RELOJ_BANCO : G.relojBanco;
  caja.style.display = 'block'; caja.style.opacity = '0.6';
  document.getElementById('relojIco').textContent = '♟️';
  document.getElementById('relojNum').textContent = relojFmt(seg);
  const b = document.getElementById('relojBarra'); b.style.width = Math.min(100, 100 * seg / RELOJ_BANCO) + '%'; b.style.background = '#9e9e9e';
  relojColocar();
}
// Vigía: muestra u oculta el reloj quieto según dónde estés (mesa, menú, fin de partida)
setInterval(() => {
  if (relojT) return;
  if (relojModo() === 'ajedrez' && G && !G.terminada) relojMostrarQuieto(); else relojOcultar();
}, 400);

// Empieza tu turno (lo llama avanzar)
function relojEmpezar(t) {
  relojParar(false);
  const m = relojModo();
  if (!m || !G || G.terminada) return relojOcultar();
  let seg;
  if (m === 'ajedrez') {
    if (G.relojBanco == null) G.relojBanco = RELOJ_BANCO;
    G.relojBanco += RELOJ_INC;                       // incremento por jugada, como en el ajedrez
    seg = G.relojBanco;
  } else seg = +m;
  relojTurno = t; relojFin = performance.now() + seg * 1000; relojTick = 0;
  const total = m === 'ajedrez' ? Math.max(seg, 30) : seg;
  const caja = relojCaja(); caja.style.display = 'block'; caja.style.opacity = '1';
  const pintarR = () => {
    const quedan = Math.max(0, (relojFin - performance.now()) / 1000);
    const txt = m === 'ajedrez' ? relojFmt(quedan) : `${Math.ceil(quedan)} s`;
    document.getElementById('relojIco').textContent = m === 'ajedrez' ? '♟️' : '⏱️';
    document.getElementById('relojNum').textContent = txt;
    relojColocar();   // pegado a la esquina del mensaje «Te toca…», que es donde miras en tu turno
    const b = document.getElementById('relojBarra');
    b.style.width = Math.min(100, 100 * quedan / total) + '%';
    b.style.background = quedan <= 2 ? '#e53935' : quedan <= 4 ? '#ffb300' : '#4caf50';
    const s = Math.ceil(quedan);
    if (quedan <= 3 && quedan > 0 && s !== relojTick) { relojTick = s; vibrar('turno'); }
    return quedan;
  };
  pintarR();
  relojT = setInterval(() => {
    if (relojTurno !== token || !G || G.terminada || G.turno !== YO) { relojParar(false); return; }
    if (pintarR() <= 0) { relojParar(false); relojAgotado(t); }
  }, 100);
}
// Termina tu turno (lo llaman tirarYo y cerrarYo): en modo ajedrez se guarda lo que te quedaba
function relojParar(guardarBanco = true) {
  if (relojT) { clearInterval(relojT); relojT = null; }
  if (guardarBanco && relojModo() === 'ajedrez' && G && relojFin) G.relojBanco = Math.max(0, (relojFin - performance.now()) / 1000);
  relojFin = 0;
  if (relojModo() === 'ajedrez') relojMostrarQuieto(); else relojOcultar();
}
// Se acabó el tiempo: juega por ti lo más neutro
async function relojAgotado(t) {
  if (relojModo() === 'ajedrez' && G) G.relojBanco = 0;
  aviso('⏱️ ¡Se acabó tu tiempo!');
  for (let k = 0; k < 30 && G && !miTurno(); k++) { await new Promise(r => setTimeout(r, 150)); if (!G || G.terminada || G.turno !== YO) return; }
  if (!G || G.terminada || !miTurno()) return;
  EST.relojAgotados = (EST.relojAgotados || 0) + 1;
  if (G.fase === 'robar') {
    await cogerYo(false);
    for (let k = 0; k < 30 && G && !miTurno(); k++) await new Promise(r => setTimeout(r, 120));
    if (!G || G.terminada || !miTurno() || G.fase !== 'tirar') return;
  }
  if (typeof enderezar === 'function' && volteada != null) { try { enderezar(); } catch (e) {} }
  const mano = G.jugadores[YO].mano;
  let id = (nueva != null && nueva !== G.cogida && mano.some(c => c.id === nueva)) ? nueva : null;
  if (id == null) {
    const su = analizar(mano).sueltas.filter(c => c.id !== G.cogida).sort((a, b) => valor(b) - valor(a));
    const c = su[0] || mano.filter(c => c.id !== G.cogida).sort((a, b) => valor(b) - valor(a))[0];
    if (c) id = c.id;
  }
  if (id != null) tirarYo(id);
}

// Tiempos de las rivales en modo relámpago: lo que da información (coger del montón) se ve; lo demás, volando
const RELAMPAGO = { roboMazo: 200, roboMonton: 900, trasMazo: 40, trasMonton: 550, tirada: 300, trasTirada: 120, antesTurno: 60 };
