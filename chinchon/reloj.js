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
    el.style.cssText = 'position:fixed;z-index:60;' +
      'background:#1b1b1b;color:#fff;border-radius:14px;padding:3px 12px 5px;font-weight:800;font-size:20px;border:2px solid #f3c44f;' +
      'min-width:96px;text-align:center;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.4);display:none';
    el.innerHTML = '<div id="relojNum">⏱️ 5</div><div style="height:5px;background:rgba(255,255,255,.2);border-radius:3px;margin-top:3px">' +
      '<div id="relojBarra" style="height:100%;width:100%;background:#4caf50;border-radius:3px"></div></div>';
    document.body.appendChild(el);
  }
  return el;
}
function relojOcultar() { const el = document.getElementById('relojPartida'); if (el) el.style.display = 'none'; }

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
  const caja = relojCaja(); caja.style.display = 'block';
  const pintarR = () => {
    const quedan = Math.max(0, (relojFin - performance.now()) / 1000);
    const txt = m === 'ajedrez' ? `♟️ ${Math.floor(quedan / 60)}:${String(Math.floor(quedan % 60)).padStart(2, '0')}` : `⏱️ ${Math.ceil(quedan)}`;
    document.getElementById('relojNum').textContent = txt;
    // pegado a la esquina de arriba a la derecha del mensaje «Te toca…», que es donde miras en tu turno
    const msj = document.getElementById('mensaje'), caja = document.getElementById('relojPartida');
    if (msj && caja) { const r = msj.getBoundingClientRect(); caja.style.left = Math.max(4, r.right - caja.offsetWidth - 8) + 'px'; caja.style.top = Math.max(4, r.top - caja.offsetHeight * 0.45) + 'px'; }
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
  relojOcultar();
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
