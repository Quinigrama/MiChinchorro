// Mi Chinchorro — la mesa: acciones, tocar y arrastrar, pintar, fin de mano, registro de jugadas, estilo de cada jugador
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Acciones del jugador ---------- */
function miTurno() { return G && !G.anim && !G.terminada && G.turno === YO && G.jugadores[YO].humano && !(ONLINE && ONLINE.pend); }
$('mMazo').onclick = () => { if (miTurno() && G.fase === 'robar') cogerYo(false); };
$('mDesc').onclick = () => { if (miTurno() && G.fase === 'robar' && G.descarte.length) cogerYo(true); };
async function cogerYo(deDesc) {
  if (rebarajando) return;
  if (ONLINE && ONLINE.rol === 'invitado') return enviarAccion({ tipo: 'robar', desc: !!deDesc });
  if (!deDesc && hayQueRebarajar()) { await animarRebarajar(); if (!miTurno() || G.fase !== 'robar') return; }
  if (deDesc) { EST.cogidasMonton++; guardarEst(); }
  const origen = deDesc ? cartaMonton() : cartaMazo();
  const c = robar(YO, deDesc);
  if (c) reg(deDesc ? 'D' : 'M', YO, deDesc ? c : null);
  if (c) volar(origen, $('mano'), htmlCarta(c), Math.min(VUELO(), 600));
  if (!c) return manoNula();
  nueva = c.id; sel = null; pistaId = null;
  if (ONLINE) pubOnline([{ t: 'roba', i: YO, desc: !!deDesc, carta: deDesc ? c : null }]);
  mensaje(deDesc ? `Has cogido ${nombreCarta(c)}. Arrastra al montón la que tiras` : `Te ha salido ${nombreCarta(c)}. Arrastra al montón la que tiras`, true);
  pintar(); guardar();
}
/* ---------- Tocar, dar la vuelta y arrastrar cartas ---------- */
let volteada = null, tVuelta = null, ultToque = { id: null, t: 0 };
function tocarCarta(id) {
  const ahora = Date.now();
  if (ultToque.id === id && ahora - ultToque.t < 400) { ultToque = { id: null, t: 0 }; return dobleToque(id); }
  ultToque = { id, t: ahora };
  if (volteada === id) return;
  if (!miTurno() || G.fase !== 'tirar') return;
  sel = sel === id ? null : id; pintar();
}
function dobleToque(id) {
  if (volteada === id) { enderezar(); return; }
  if (!miTurno() || G.fase !== 'tirar') return aviso('Para cerrar, espera a tu turno y roba primero');
  if (id === G.cogida) return aviso('No puedes cerrar con la carta que acabas de coger');
  if (!puedeCerrarCon(analizar(G.jugadores[YO].mano.filter(x => x.id !== id)))) return aviso('Con esa carta todavía no puedes cerrar 🙂');
  volteada = id; sel = id; pintar();
  aviso('Carta boca abajo 🂠 Arrástrala al montón para cerrar');
  relojVuelta();
}
function relojVuelta() { clearTimeout(tVuelta); tVuelta = setTimeout(() => { if (volteada !== null && !(arr && arr.moviendo)) enderezar(); }, 7000); }
function enderezar() { clearTimeout(tVuelta); if (volteada === null) return; volteada = null; if (G) pintar(); }

let arr = null; // {id, x0, y0, moviendo, fantasma}
$('mano').addEventListener('pointerdown', e => {
  const el = e.target.closest('.carta'); if (!el || !G) return;
  arr = { id: +el.dataset.id, x0: e.clientX, y0: e.clientY, moviendo: false, pid: e.pointerId };
});
function sobreMesa(x, y) {
  if (!miTurno() || G.fase !== 'tirar') return false;
  const r = document.querySelector('.mesa').getBoundingClientRect();
  return x > r.left - 20 && x < r.right + 20 && y > r.top - 30 && y < r.bottom + 30;
}
window.addEventListener('pointermove', e => {
  if (!arr || e.pointerId !== arr.pid) return;
  const dx = e.clientX - arr.x0, dy = e.clientY - arr.y0;
  if (!arr.moviendo) {
    if (Math.hypot(dx, dy) < 12) return;
    const el = $('mano').querySelector(`.carta[data-id="${arr.id}"]`); if (!el) { arr = null; return; }
    const r = el.getBoundingClientRect();
    arr.moviendo = true; arr.w = r.width; arr.ox = arr.x0 - r.left; arr.oy = arr.y0 - r.top;
    arr.fantasma = el.cloneNode(true);
    arr.fantasma.classList.remove('sel', 'pista', 'nueva', 'hueco');
    Object.assign(arr.fantasma.style, { position: 'fixed', width: r.width + 'px', left: 0, top: 0, zIndex: 50, pointerEvents: 'none', transform: 'scale(1.08) rotate(-3deg)', boxShadow: '0 14px 28px rgba(0,0,0,.55)', transition: 'transform .15s' });
    document.body.appendChild(arr.fantasma);
    clearTimeout(tVuelta);
    pintar();
  }
  e.preventDefault();
  arr.fantasma.style.left = (e.clientX - arr.ox) + 'px';
  arr.fantasma.style.top = (e.clientY - arr.oy) + 'px';
  const enMesa = sobreMesa(e.clientX, e.clientY);
  document.querySelector('.mesa').classList.toggle('destino', enMesa);
  arr.fantasma.style.transform = enMesa ? 'scale(.85) rotate(4deg)' : 'scale(1.08) rotate(-3deg)';
  if (enMesa) return;
  // ¿sobre qué hueco de la mano está el dedo?
  const cartas = [...$('mano').querySelectorAll('.carta')];
  let mejor = -1, dist = 1e9;
  cartas.forEach((c, k) => { const r = c.getBoundingClientRect(); const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); if (d < dist) { dist = d; mejor = k; } });
  const ord = miOrden(), de = ord.indexOf(arr.id);
  if (mejor >= 0 && mejor !== de && dist < arr.w * 1.2) {
    ord.splice(de, 1); ord.splice(mejor, 0, arr.id);
    G.jugadores[YO].orden = ord; pintar();
  }
}, { passive: false });
function soltar(e) {
  if (!arr || (e && e.pointerId !== arr.pid)) return;
  const a = arr; arr = null;
  document.querySelector('.mesa').classList.remove('destino');
  if (!a.moviendo) { if (e && e.type === 'pointerup') tocarCarta(a.id); return; }
  a.fantasma.remove();
  if (e && e.type === 'pointerup' && sobreMesa(e.clientX, e.clientY)) {
    if (volteada === a.id) return cerrarYo(a.id);
    enderezar();
    return tirarYo(a.id);
  }
  // vuelve a la mano: si estaba boca abajo, se da la vuelta para verla
  if (volteada === a.id) enderezar();
  pintar(); guardar();
}
window.addEventListener('pointerup', soltar);
window.addEventListener('pointercancel', soltar);

function tirarYo(id) {
  if (!miTurno() || G.fase !== 'tirar') return;
  if (id === G.cogida) { pintar(); return aviso('No puedes tirar la carta que acabas de coger del montón'); }
  const c = G.jugadores[YO].mano.find(x => x.id === id); if (!c) return;
  anotarTirada(G.jugadores[YO].mano, id);
  if (ONLINE && ONLINE.rol === 'invitado') {
    // se quita ya de la mano para que no «vuelva»; el anfitrión lo confirma enseguida
    G.jugadores[YO].mano = G.jugadores[YO].mano.filter(x => x.id !== id); G.descarte = [c]; G.turno = -1;
    sel = null; nueva = null; pistaId = null; volteada = null; mensaje(`Has tirado ${nombreCarta(c)}`); pintar(true);
    return enviarAccion({ tipo: 'tirar', id });
  }
  reg('T', YO, c); tirar(YO, id); G.ultimoTira = YO; if (ONLINE) pendEv.push({ t: 'tira', i: YO, carta: c }); sel = null; nueva = null; pistaId = null; volteada = null;
  G.jugadores[YO].ultimo = '';
  mensaje(`Has tirado ${nombreCarta(c)}`);
  pintar(true);
  const t = ++token;
  setTimeout(() => { if (t === token) avanzar(); }, 500);
}
function cerrarYo(id) {
  if (!miTurno() || G.fase !== 'tirar') return;
  const resto = G.jugadores[YO].mano.filter(x => x.id !== id);
  if (id === G.cogida || !puedeCerrarCon(analizar(resto))) { enderezar(); return aviso('Todavía no puedes cerrar con esa carta'); }
  clearTimeout(tVuelta); volteada = null; sel = null;
  if (ONLINE && ONLINE.rol === 'invitado') { G.jugadores[YO].mano = G.jugadores[YO].mano.filter(x => x.id !== id); G.turno = -1; pintar(); mensaje('¡Cierras! 🎉'); return enviarAccion({ tipo: 'cerrar', id }); }
  reg('C', YO);
  const res = cerrar(YO, id);
  finMano(res, alguna('tuCierras', {}, true));
}
$('bOrdenar').onclick = () => {
  if (!G) return;
  G.jugadores[YO].orden = ordenAuto(G.jugadores[YO].mano, orden); pintar(); guardar();
  aviso(['Ordenadas por jugadas', 'Ordenadas por palos', 'Ordenadas por números'][orden] + '. Arrastra las cartas para moverlas a tu gusto 👆');
  orden = (orden + 1) % 3;
};
$('bPista').onclick = () => {
  if (!miTurno()) return aviso('Espera a tu turno');
  if (G.fase === 'robar') {
    const coge = (() => { const n = S.nivel; S.nivel = 2; const r = iaRobo(YO); S.nivel = n; return r; })();
    return aviso(coge ? '💡 Te conviene coger la carta del montón' : '💡 Mejor roba del mazo');
  }
  const ci = mejorCierre(G.jugadores[YO].mano, G.cogida);
  if (ci) { pistaId = ci.c.id; sel = ci.c.id; pintar(); return aviso(`💡 ¡Puedes cerrar! Toca dos veces ${nombreCarta(ci.c)} y llévala al montón`); }
  const mt = mejorTirada(YO, G.jugadores[YO].mano, 2, G.cogida);
  pistaId = mt.c.id; sel = mt.c.id; pintar();
  aviso(`💡 Yo tiraría ${nombreCarta(mt.c)}`);
};

/* ---------- Pintar la mesa ---------- */
const BANDAS = ['#2e9b4a', '#1f6fd1', '#8e3bc4', '#d1781f'];
function ordenAuto(mano, modo) {
  const a = analizar(mano);
  const k = c => c.j ? 999 : (modo === 2 ? c.r * 10 + c.s : c.s * 100 + c.r);
  if (modo !== 0) return mano.slice().sort((x, y) => k(x) - k(y)).map(c => c.id);
  const lista = [];
  a.jugadas.forEach(j => lista.push(...j.cartas));
  lista.push(...a.sueltas.slice().sort((x, y) => k(x) - k(y)));
  return lista.map(c => c.id);
}
// Su orden personal: las cartas que ya tenía se quedan donde las puso, las nuevas van al final
function miOrden() {
  const yo = G.jugadores[YO], ids = new Set(yo.mano.map(c => c.id));
  if (!yo.orden || !yo.orden.some(id => ids.has(id))) yo.orden = ordenAuto(yo.mano, 0);
  const ord = yo.orden.filter(id => ids.has(id));
  for (const c of yo.mano) if (!ord.includes(c.id)) ord.push(c.id);
  yo.orden = ord;
  return ord.slice();
}
function ordenarMano(mano) {
  const porId = new Map(mano.map(c => [c.id, c]));
  return { lista: miOrden().map(id => porId.get(id)), a: analizar(mano) };
}
let golpeVisto = null;
function pintar(flash) {
  if (!G) return;
  const yo = G.jugadores[YO];
  $('infoMano').innerHTML = ONLINE ? `Mano ${G.manoN} · <span style="color:var(--oro)">Mesa ${ONLINE.codigo}</span><br><small style="font-weight:500;opacity:.8">raya al pasar de ${S.limite}</small>` : `Mano ${G.manoN}<br><small style="font-weight:500;opacity:.8">raya al pasar de ${S.limite}</small>`;
  $('bote').textContent = '💰 ' + euros(G.bote);
  // rivales
  // en el orden en que juegan después de mí (en las mesas online, cada móvil gira la mesa desde su sitio)
  const nJ = G.jugadores.length;
  $('rivales').innerHTML = Array.from({ length: nJ - 1 }, (_, k) => (YO + 1 + k) % nJ).map(i => [G.jugadores[i], i]).map(([p, i]) => `
    <div class="rival ${(G.anim ? G.reparte : G.turno) === i && !G.terminada ? 'turno' : ''} ${p.fuera ? 'fuera' : ''}" data-i="${i}">
      <div class="rcab"><span class="avnv">${ava(p)}<span class="nv" title="${p.remoto ? 'Persona conectada' : NIVELES[p.nivel ?? S.nivel]}">${p.remoto ? '📱' : ICONIV[p.nivel ?? S.nivel]}</span></span><div class="rtxt"><div class="nom">${p.nombre}</div>
      <div class="pts">${p.fuera ? '❌ Fuera' : p.puntos + ' pts'}${rayitas(p)}</div></div></div>
      <div class="barrita"><i style="width:${Math.max(0, Math.min(100, p.puntos / S.limite * 100))}%"></i></div>
      <div class="dorsos">${p.fuera ? '' : '<i></i>'.repeat(G.anim ? (G.anim.vis[i] || 0) : p.mano.length - (G.manoOculta === i ? 1 : 0))}</div>
      <div class="ult">${p.ultimo || ''}</div>
    </div>`).join('');
  // mazo y montón
  $('nMazo').textContent = `Mazo (${G.mazo.length + (G.anim ? G.anim.pend : 0)})`;
  const top = G.anim && !G.anim.monton ? null : G.descarte[G.descarte.length - 1];
  $('mMazo').classList.toggle('agotado', !G.anim && !G.mazo.length && !rebarajando);
  // al cerrar, la carta boca abajo queda encima del montón, atravesada
  const cerrada = G.fase === 'resultado' && G.res && !G.anim;
  const golpe = cerrada && golpeVisto !== G.manoN;
  if (golpe) golpeVisto = G.manoN;
  $('mDesc').innerHTML = '<div class="pilaDesc">' + (top ? htmlCarta(top, flash ? 'flash' : '') : '<div class="vacio"></div>') + (cerrada ? `<div class="carta dorso torcida${golpe ? ' golpe' : ''}"></div>` : '') + '</div><span>Montón</span>';
  const robo = miTurno() && G.fase === 'robar';
  $('mMazo').classList.toggle('activo', robo);
  $('mDesc').classList.toggle('activo', robo && !!top);
  // mi mano
  $('yoNom').innerHTML = ava(yo, 'peq') + yo.nombre + rayitas(yo);
  $('yoPts').textContent = yo.puntos + ' pts';
  const { lista, a } = G.anim ? { lista: yo.mano.slice(0, G.anim.vis[YO] || 0), a: analizar([]) } : ordenarMano(yo.mano);
  const banda = {};
  a.jugadas.forEach((j, k) => j.cartas.forEach(c => banda[c.id] = BANDAS[k % BANDAS.length]));
  const mano = $('mano');
  mano.innerHTML = lista.map(c => {
    const cls = [arr && arr.moviendo && arr.id === c.id ? 'hueco' : '', sel === c.id && !(arr && arr.moviendo) ? 'sel' : '', nueva === c.id ? 'nueva' : '', pistaId === c.id ? 'pista' : ''].join(' ');
    if (G.anim) return htmlCarta(c, 'llega');
    if (volteada === c.id) return `<div class="carta dorso volteada ${cls}" data-id="${c.id}"></div>`;
    return htmlCarta(c, cls).replace(/<\/div>$/, banda[c.id] ? `<i class="banda" style="background:${banda[c.id]}"></i></div>` : '</div>');
  }).join('');
  // sueltas / cierre
  const tirando = miTurno() && G.fase === 'tirar';
  let puedeCerrar = false, cierraSel = false;
  if (tirando) {
    puedeCerrar = !!mejorCierre(yo.mano, G.cogida);
    if (sel !== null && sel !== G.cogida) cierraSel = puedeCerrarCon(analizar(yo.mano.filter(x => x.id !== sel)));
  }
  const si = $('sueltas');
  si.classList.toggle('oculto', !S.ayudas || !!G.anim);
  if (tirando && puedeCerrar) { si.textContent = '✅ Cierra'; si.classList.add('cierra'); }
  else { si.textContent = `Sueltas: ${a.muertos}`; si.classList.remove('cierra'); }
  if (tirando && S.ayudas && puedeCerrar) mensaje(volteada !== null ? 'Arrastra la carta boca abajo al montón para cerrar' : '¡Puedes cerrar! Toca dos veces la carta y llévala boca abajo al montón', true);
  $('bPista').disabled = !S.ayudas;
  ajustarTamano(lista.length);
}

/* ---------- Fin de mano ---------- */
/* ---------- Registro de jugadas públicas (para aprender el estilo de cada jugador) ----------
   Solo lo que se ve en la mesa: de dónde roba cada uno (y la carta si es del montón), qué tira,
   cuándo cierra y las cartas que se enseñan al final. Nunca las cartas ocultas durante la mano.
   Lo apunta solo quien lleva la partida (en online, el anfitrión) para no duplicar. */
const REG_K = 'mc-jugadas', REG_MAX = 250;
const cc = c => !c ? '' : c.j ? '*' : c.r + 'oceb'[c.s];
function regMano() {
  if (!G || (ONLINE && ONLINE.rol === 'invitado')) return null;
  if (!G.reg || G.reg.m !== G.manoN) {
    G.reg = { v: 1, m: G.manoN, t: Date.now(), on: ONLINE ? 1 : 0,
      cfg: { b: S.baraja, k: S.comodines, l: S.limite, mp: S.maxPuntos, cg: S.colgar ? 1 : 0 },
      js: G.jugadores.map(p => {
        const hum = !!(p.humano || p.remoto);
        const mn = hum ? null : maniaDe(p);
        return { n: p.nombre || '', h: hum ? 1 : 0, nv: hum ? null : (p.nivel ?? S.nivel), m: mn ? mn.id : null, u: p.remoto ? (p.uid || null) : (p.humano ? (miUid() || null) : null), f: p.fuera ? 1 : 0 };
      }),
      pts: G.jugadores.map(p => p.puntos), rep: G.reparte, ab: cc(G.descarte[0]), ev: [], rk: '' };
  }
  return G.reg;
}
function reg(tipo, i, c) {
  try {
    const r = regMano(); if (!r) return;
    const rk = G.reciclado ? G.reciclado.length + '-' + G.reciclado[0] : '';
    if (rk !== r.rk) { r.rk = rk; if (rk) r.ev.push('R'); }   // se rebarajó el montón
    r.ev.push(i + tipo + (c ? cc(c) : ''));
  } catch (e) { console.warn('registro', e); }
}
function regFin(res) {
  try {
    const r = regMano(); if (!r || r.fin) return;
    r.fin = res ? { c: res.cierra, ch: res.chinchon ? (res.chinchon.limpio ? 2 : 1) : 0,
      f: res.filas.map(f => ({ i: f.i, p: f.puntos, j: f.jugadas.map(x => x.cartas.map(cc).join(' ')), s: f.sueltas.map(cc).join(' '), cg: (f.colgadas || []).map(cc).join(' ') })) }
      : { nula: 1 };
    r.turnos = G.turnos;
    const q = LS.get(REG_K, []); q.push(r); while (q.length > REG_MAX) q.shift(); LS.set(REG_K, q);
    subirRegistro();
  } catch (e) { console.warn('registro', e); }
}
/* ---- Perfil (estilo) de cada jugador, a partir del registro ----
   Personas por su cuenta de Google (o por nombre si no la hay); bots por nivel. */
const escapar = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PERFIL_K = 'mc-perfil', NIV_N = ['Fácil', 'Normal', 'Difícil', 'Experta', 'Gemini', 'DeepSeek'];
const valCod = x => x === '*' ? 25 : Math.min(10, parseInt(x, 10) || 0);
const claveJ = j => j.h ? (j.u ? 'u:' + j.u : 'n:' + j.n) : j.m ? 'm:' + j.m + ':' + j.nv : 'nv:' + j.nv;
const perfil0 = (j) => ({ n: j.n, h: j.h, nv: j.nv, m: j.m || null, manos: 0, rD: 0, rM: 0, tir: 0, vTir: 0, altas: 0, bajas: 0, cierres: 0, m10: 0, ch: 0, tCierre: 0, pill: 0, pPill: 0, bajasG: 0, colg: 0, cogeTira: 0, sm: { h: sit0(), a: sit0() } });
// según el marcador: h = holgada, a = apurada (le faltan 25 puntos o menos para el límite)
function sit0() { return { manos: 0, cierres: 0, tCierre: 0, tir: 0, vTir: 0, pill: 0, pPill: 0, rD: 0, rM: 0 }; }
function sumarMano(A, r) {
  const fin = r && r.fin; if (!fin || fin.nula || !r.js || !r.ev) return;
  const st = {};
  r.js.forEach((j, i) => {
    if (j.f) return;
    const k = claveJ(j), a = A[k] || (A[k] = perfil0(j));
    if (j.h && j.n) a.n = j.n;
    a.manos++;
    if (!a.sm) a.sm = { h: sit0(), a: sit0() };
    const lim = (r.cfg && r.cfg.l) || 100, pts = r.pts ? r.pts[i] : null;
    const b = pts == null ? null : a.sm[pts >= lim - 25 ? 'a' : 'h'];
    if (b) b.manos++;
    st[i] = { a, b, turnos: 0, cogidas: new Set() };
  });
  for (const e of r.ev) {
    const m = /^(\d+)([MDTC])(.*)$/.exec(e); if (!m) continue;
    const s = st[m[1]]; if (!s) continue;
    const a = s.a, b = s.b, c = m[3];
    if (m[2] === 'M') { a.rM++; s.turnos++; if (b) b.rM++; }
    else if (m[2] === 'D') { a.rD++; s.turnos++; s.cogidas.add(c); if (b) b.rD++; }
    else if (m[2] === 'T') { const v = valCod(c); a.tir++; a.vTir += v; if (v >= 10) a.altas++; if (v <= 3) a.bajas++; if (s.cogidas.has(c)) a.cogeTira++; if (b) { b.tir++; b.vTir += v; } }
    else if (m[2] === 'C') { a.cierres++; a.tCierre += s.turnos; if (b) { b.cierres++; b.tCierre += s.turnos; } }
  }
  const lista = x => x ? x.split(' ').filter(Boolean) : [];
  for (const f of fin.f || []) {
    const s = st[f.i]; if (!s) continue; const a = s.a;
    if (f.i === fin.c) { if (f.p === -10) a.m10++; if (fin.ch) a.ch++; }
    else { a.pill++; a.pPill += f.p; if (s.b) { s.b.pill++; s.b.pPill += f.p; } a.bajasG += lista(f.s).filter(x => x !== '*' && parseInt(x, 10) <= 2).length; a.colg += lista(f.cg).length; }
  }
}
const claveReg = r => r.t + '-' + r.m + '-' + (r.ap || '');
async function datosPerfil() {
  let P = LS.get(PERFIL_K, null);
  if (!P || P.v !== 2) P = { v: 2, hasta: 0, A: {}, vistos: [] };   // v2: con el desglose según el marcador (se vuelve a bajar todo)
  const N = window.Nube;
  if (N && N.usuario && N.bajarJugadas) {
    try {
      for (let vuelta = 0; vuelta < 10; vuelta++) {
        const docs = await N.bajarJugadas(P.hasta, 500);
        for (const d of docs) { sumarMano(P.A, d); P.hasta = Math.max(P.hasta, d.subidoMs || 0); P.vistos.push(d.t + '-' + d.m); }
        if (docs.length < 500) break;
      }
      P.vistos = P.vistos.slice(-600);
      LS.set(PERFIL_K, P);
    } catch (e) { console.warn('perfil', e && e.code || e); }
  }
  // más las manos de este móvil que aún no se han subido
  const A = JSON.parse(JSON.stringify(P.A)), vistos = new Set(P.vistos);
  for (const r of LS.get(REG_K, [])) if (!vistos.has(r.t + '-' + r.m)) sumarMano(A, r);
  return A;
}
const pc = (a, b) => b ? Math.round(100 * a / b) : null;
function rasgosDe(a, ref) {
  const t = [], r = (x, y) => y ? x / y : null;
  const mon = r(a.rD, a.rD + a.rM), monR = r(ref.rD, ref.rD + ref.rM);
  if (mon != null && monR != null) { if (mon > monR + 0.08) t.push('🙋 coge mucho del montón'); else if (mon < monR - 0.08) t.push('🎴 casi siempre roba del mazo'); }
  const vt = r(a.vTir, a.tir), vtR = r(ref.vTir, ref.tir);
  if (vt != null && vtR != null) { if (vt > vtR + 0.8) t.push('👑 se quita las figuras enseguida'); else if (vt < vtR - 0.8) t.push('🎲 suelta cartas bajas y se guarda las altas'); }
  const tc = r(a.tCierre, a.cierres), tcR = r(ref.tCierre, ref.cierres);
  if (a.cierres >= 5 && tc != null && tcR != null) { if (tc < tcR - 0.8) t.push('⚡ cierra pronto'); else if (tc > tcR + 1.2) t.push('⏳ espera para cerrar'); }
  const m = r(a.m10, a.cierres), mR = r(ref.m10, ref.cierres);
  if (a.cierres >= 5 && m != null && mR != null && m > mR + 0.12) t.push('💃 le encanta el −10');
  const bg = r(a.bajasG, a.pill), bgR = r(ref.bajasG, ref.pill);
  if (a.pill >= 5 && bg != null && bgR != null && bg > bgR + 0.35) t.push('🪙 guarda ases y doses');
  const ct = r(a.cogeTira, a.rD);
  if (a.rD >= 8 && ct != null && ct > 0.25) t.push('🕵️ coge del montón y luego lo suelta (despista)');
  const pp = r(a.pPill, a.pill), ppR = r(ref.pPill, ref.pill);
  if (a.pill >= 5 && pp != null && ppR != null) { if (pp < ppR - 4) t.push('🛡️ cuando la pillan, se come pocos puntos'); else if (pp > ppR + 5) t.push('🍽️ cuando la pillan, se come muchos puntos'); }
  return t;
}
async function pintarPerfil() {
  const caja = $('perfil'); if (!caja) return;
  let A; try { A = await datosPerfil(); } catch (e) { A = {}; }
  if (!$('perfil')) return;
  const filas = Object.entries(A).map(([k, a]) => Object.assign({ k }, a)).filter(a => a.manos);
  if (!filas.length) { caja.innerHTML = '<div class="nota">Todavía no hay manos apuntadas. Se apuntan solas al jugar (desde esta versión).</div>'; return; }
  const ref = perfil0({}); for (const a of filas) for (const x in ref) if (typeof ref[x] === 'number' && typeof a[x] === 'number') ref[x] += a[x];
  const yoK = new Set(['u:' + (miUid() || '-'), 'n:' + (PREF.nombre || '-')]);
  const gente = filas.filter(a => a.h).sort((x, y) => y.manos - x.manos).slice(0, 10);
  const bots = filas.filter(a => !a.h).sort((x, y) => ((x.nv ?? 0) - (y.nv ?? 0)) || ((x.m ? 1 : 0) - (y.m ? 1 : 0)));
  const nomBot = a => a.nv === 4 ? '✨ Gemini' : a.nv === 5 ? '🐋 DeepSeek' : a.m ? `🎭 ${escapar(a.n)} ${(Object.values(MANIAS).find(z => z.id === a.m) || {}).t || ''} (${NIV_N[a.nv] || 'bot'})` : '🤖 ' + (NIV_N[a.nv] || 'Bot') + ' de libro';
  const num = (x, d = 1) => x == null ? '–' : (+x).toLocaleString('es-ES', { maximumFractionDigits: d });
  const dv = (x, y) => y ? x / y : null;
  const fila = (a, nombre) => `<tr><td>${nombre}</td><td>${a.manos}</td><td>${pc(a.rD, a.rD + a.rM) ?? '–'}${a.rD + a.rM ? ' %' : ''}</td><td>${num(dv(a.vTir, a.tir))}</td><td>${num(dv(a.tCierre, a.cierres))}</td><td>${pc(a.m10, a.cierres) ?? '–'}${a.cierres ? ' %' : ''}</td><td>${num(dv(a.pPill, a.pill))}</td></tr>`;
  const tabla = `<table class="liga"><tr><th>Jugador</th><th>Manos</th><th>Del montón</th><th>Tira (valor)</th><th>Cierra a los</th><th>−10</th><th>Pillada</th></tr>
    ${gente.map(a => fila(a, (yoK.has(a.k) ? '🙋 ' : '') + escapar(a.n || 'Persona'))).join('')}
    ${bots.map(a => fila(a, nomBot(a))).join('')}</table>
    <div class="nota">«Del montón»: de cada 100 robos, cuántos coge del montón. «Tira»: valor medio de lo que tira. «Cierra a los»: turnos suyos hasta cerrar. «−10»: de sus cierres. «Pillada»: puntos que se come cuando cierra otra.</div>`;
  const fichas = gente.concat(bots.filter(a => a.m)).map(a => {
    const t = a.manos >= 30 ? rasgosDe(a, ref) : [];
    const txt = a.manos < 30 ? `Pocas manos todavía (${a.manos} de 30) para sacar conclusiones.` : t.length ? t.join(' · ') : 'Juega muy parecido a la media de la mesa.';
    return `<div class="nota" style="text-align:left;margin-top:6px"><b>${a.h ? (yoK.has(a.k) ? '🙋 ' : '') + escapar(a.n || 'Persona') : nomBot(a)}:</b> ${txt}</div>`;
  }).join('');
  caja.innerHTML = tabla + fichas + tablaMarcador(gente, bots, yoK, nomBot, num);
}
// ¿Cambia cada uno su juego según el marcador? (los bots de libro juegan igual vayan como vayan)
function tablaMarcador(gente, bots, yoK, nomBot, num) {
  const lista = gente.map(a => [a, (yoK.has(a.k) ? '🙋 ' : '') + escapar(a.n || 'Persona')]).concat(bots.map(a => [a, nomBot(a)]))
    .filter(([a]) => a.sm && a.sm.a.manos >= 3 && a.sm.h.manos >= 3);
  if (!lista.length) return '<div class="nota" style="margin-top:10px">🎯 <b>Según el marcador:</b> aún no hay manos jugadas con 75 puntos o más (o el límite que tengáis menos 25). Saldrá aquí cuando las haya.</div>';
  const dv = (x, y) => y ? x / y : null, pcs = (x, y) => y ? Math.round(100 * x / y) + ' %' : '–';
  const celdas = b => `<td>${b.manos}</td><td>${pcs(b.cierres, b.manos)}</td><td>${num(dv(b.vTir, b.tir))}</td><td>${pcs(b.rD, b.rD + b.rM)}</td><td>${num(dv(b.pPill, b.pill))}</td>`;
  const filas = lista.map(([a, nom]) => `<tr><td rowspan="2">${nom}</td><td>😌</td>${celdas(a.sm.h)}</tr><tr><td>😬</td>${celdas(a.sm.a)}</tr>`).join('');
  return `<h4 style="margin:14px 0 4px">🎯 Según el marcador</h4><table class="liga"><tr><th>Jugador</th><th></th><th>Manos</th><th>Cierra</th><th>Tira (valor)</th><th>Del montón</th><th>Pillada</th></tr>${filas}</table>
    <div class="nota">😌 holgado · 😬 apurado (a 25 puntos o menos del límite, al empezar la mano). «Cierra»: de cada 100 manos, en cuántas cierra. Si una persona cambia mucho de una fila a otra y los bots no, ahí está su truco 😉</div>`;
}
let subiendoReg = false;
async function subirRegistro() {
  const N = window.Nube; if (subiendoReg || !N || !N.usuario || !N.subirJugadas) return;
  const q = LS.get(REG_K, []); if (!q.length) return;
  subiendoReg = true;
  try {
    const lote = q.slice(0, 100);
    await N.subirJugadas(lote);
    const ts = new Set(lote.map(r => r.t + '-' + r.m));
    LS.set(REG_K, LS.get(REG_K, []).filter(r => !ts.has(r.t + '-' + r.m)));
  } catch (e) { console.warn('subir jugadas', e && e.code || e); }
  finally { subiendoReg = false; }
}
window.addEventListener('nube', () => setTimeout(subirRegistro, 3000));
window.addEventListener('online', () => setTimeout(subirRegistro, 3000));

function finMano(res, habla, pausa) {
  token++;
  regFin(res);
  anotarMano(res);
  if (ONLINE && ONLINE.rol === 'anfitrion') { G.fase = 'resultado'; G.res = res; pubOnline([{ t: 'cierra', i: res.cierra }]); }
  if (!G.jugadores[res.cierra].humano) vibrar('cierre'); else sonar('golpe');
  G.fase = 'resultado'; G.res = res;
  pintar(); guardar();
  setTimeout(() => mostrarResultado(res), pausa || (habla ? 2300 : 500));
}
function minis(cartas, cls) { return cartas.length ? `<div class="gr ${cls || ''}">${cartas.map(c => htmlCarta(c)).join('')}</div>` : ''; }
function mostrarResultado(res) {
  const quien = G.jugadores[res.cierra];
  if (res.chinchon) sonar('chinchon');
  else if (res.filas.some(f => f.i === YO && f.raya)) setTimeout(() => sonar('raya'), 400);
  if (res.finPartida && res.chinchon && res.chinchon.limpio && S.chinchonGana) return finPartida(`¡CHINCHÓN de ${quien.humano ? 'ti' : quien.nombre}!`);
  const f0 = res.filas[0];
  let titulo = quien.humano ? (f0.puntos === -10 ? '¡Cierras con todo ligado! −10 🎉' : 'Has cerrado tú 👏') : `${quien.nombre} cierra${f0.puntos === -10 ? ' con −10' : ''}`;
  if (res.chinchon && !res.chinchon.limpio) titulo += ' (chinchón con comodín)';
  let h = `<h2>${titulo}</h2>`;
  for (const f of res.filas) {
    const p = G.jugadores[f.i];
    h += `<div class="fila ${f.raya ? 'elim' : ''}"><div class="top"><span class="conava">${ava(p, 'peq')}${p.nombre}</span><span class="suma">${f.puntos >= 0 ? '+' : ''}${f.puntos} → ${f.despues}</span></div>
      <div class="minis">${f.jugadas.map(j => minis(j.cartas)).join('')}${minis(f.colgadas, 'colg')}${minis(f.sueltas, 'suel')}</div>
      ${f.colgadas.length ? `<div class="nota">Ha colgado ${f.colgadas.length === 1 ? 'una carta' : f.colgadas.length + ' cartas'} en las jugadas del que cierra</div>` : ''}
      ${f.raya ? `<div class="nota" style="opacity:1;color:#ffb4a6;font-weight:800">Se pasa de ${S.limite}: se apunta una raya (${euros(S.raya)})${f.reengancha !== undefined ? ` y se reengancha con ${f.reengancha}` : ''}</div>` : ''}</div>`;
  }
  if (res.sinColgar) h += '<div class="nota" style="text-align:center;opacity:1">Ha hecho −10: nadie puede colgar 🚫</div>';
  h += '<div class="nota" style="text-align:center">Verde: ligadas · Azul: colgadas · Rojo: sin ligar</div>';
  ventana(h, [{ t: 'Seguir', f: () => trasResultado(res) }]);
}
function trasResultado(res) {
  const yo = G.jugadores[YO], f = res.filas.find(x => x.i === YO);
  if (f && f.raya) { CART.saldo = Math.round((CART.saldo - S.raya) * 100) / 100; guardarCartera(); EST.rayas++; guardarEst(); }
  if (ONLINE && ONLINE.rol === 'invitado') {
    if (G.terminada) return finPartida();
    if (f && f.raya) aviso(`Te apuntas una raya ✏️`);
    mensaje(`Esperando a que ${ONLINE.nombreAnf} reparta… 🃏`);
    return;
  }
  if (G.terminada) return finPartida();   // (sin tocar la fase: las invitadas aún tienen que ver el resultado)
  G.fase = 'robar';
  if (yo.fuera && activos().length > 1) { simularHastaFinal(); return finPartida(); }
  if (f && f.raya) aviso(`Te apuntas una raya ✏️ y vuelves con ${yo.puntos} puntos`);
  guardar();
  empezarMano();
  reacciones(res);
}
function finPartida(titulo) {
  token++;
  G.terminada = true; borrarGuardada();
  try { anotarLigaFin(); } catch (e) {}
  const g = G.jugadores[G.ganador];
  const gano = g && g.humano;
  if (gano) { CART.saldo = Math.round((CART.saldo + G.bote) * 100) / 100; CART.ganadas++; }
  guardarCartera();
  const yo = G.jugadores[YO];
  const neto = Math.round(((gano ? G.bote : 0) - (yo.rayas - (yo.rayas0 || 0)) * S.raya + chinchonNeto) * 100) / 100;
  EST.partidas++; if (gano) EST.ganadas++;
  if (G.manoN) { EST.manosPartidas += G.manoN; EST.partidasContadas++; if (G.manoN > EST.manosMax) EST.manosMax = G.manoN; } EST.euros = Math.round((EST.euros + neto - chinchonNeto) * 100) / 100; guardarEst();
  subirNube();
  let h = `<div class="premio">${gano ? '🏆' : '🃏'}</div><h2>${titulo ? titulo + '<br>' : ''}${gano ? '¡Has ganado la partida!' : g ? `Gana ${g.nombre}` : 'Fin de la partida'}</h2>`;
  h += `<div class="sub">${gano ? `Te llevas todas las rayas: <b>${euros(G.bote)}</b>` : `${g ? g.nombre + ' se lleva las rayas:' : 'Rayas:'} ${euros(G.bote)}`}</div>`;
  const chf = cobroChinchon(G.res);
  if (chf && G.res.finPartida) h += `<div class="sub">🎉 Chinchón: ${chf.quien === YO ? `cada una te paga <b>${euros(chf.precio)}</b> (+${euros(chf.precio * chf.pagan)})` : `pagas <b>${euros(chf.precio)}</b> a ${esc(G.jugadores[chf.quien].nombre)}`}</div>`;
  h += `<div class="sub">${neto >= 0 ? 'Ganas' : 'Pierdes'} <b>${euros(Math.abs(neto))}</b> · Monedero: <b>${euros(saldoCuenta())}</b></div>`;
  h += G.jugadores.map(p => `<div class="fila"><div class="top"><span class="conava">${ava(p, 'peq')}${p === g ? '🏆 ' : ''}${p.nombre}</span><span class="suma">${p === g ? pts(p.puntos) + (p.rayas ? ' · ' + p.rayas + (p.rayas === 1 ? ' raya' : ' rayas') : '') : (p.rayas === 1 ? '1 raya' : p.rayas + ' rayas') + ' · ' + euros(p.rayas * S.raya)}</span></div></div>`).join('');
  if (ONLINE) {
    if (ONLINE.rol === 'anfitrion') { pubOnline([{ t: 'fin' }], { estado: 'fin' }); guardarNube(true); }
    const yaOnline = ONLINE; salirOnline(false);
    if (yaOnline.rol === 'anfitrion') return ventana(h, [{ t: '🔁 Otra partida en esta mesa', f: () => nuevaRonda(yaOnline.codigo) }, { t: 'Al inicio', clase: 'no', f: () => ir('inicio') }]);
    return ventana(h, [{ t: '🪑 Seguir en la mesa', f: () => abrirMesa(yaOnline.codigo) }, { t: 'Al inicio', clase: 'no', f: () => ir('inicio') }]);
  }
  ventana(h, [{ t: 'Otra partida', f: empezarPartida }, { t: 'Al inicio', clase: 'no', f: () => ir('inicio') }]);
}

/* ---------- Que todo quepa en la pantalla ---------- */
function ajustarTamano(n) {
  const mano = $('mano'), j = $('juego');
  if (j.classList.contains('oculto')) return;
  const vh = window.innerHeight, vw = Math.min(window.innerWidth, 1100) - 24;
  // montones: más grandes en pantallas altas
  j.style.setProperty('--mw', Math.round(Math.max(56, Math.min(110, vh * 0.105))) + 'px');
  const W = mano.clientWidth || vw, H = mano.clientHeight - 16;
  if (H <= 0) return;
  const gap = Math.round(Math.max(5, Math.min(10, W / 60)));
  let mejor = { cw: 0, cols: 4 };
  for (let cols = 2; cols <= Math.max(n, 2); cols++) {
    const filas = Math.ceil(Math.max(n, 7) / cols);
    const cw = Math.min((W - gap * (cols - 1)) / cols, ((H - gap * (filas - 1)) / filas) / 1.5, 150);
    if (cw > mejor.cw + 0.5) mejor = { cw, cols };
  }
  mano.style.setProperty('--cols', mejor.cols);
  mano.style.setProperty('--cw', Math.floor(mejor.cw) + 'px');
  mano.style.setProperty('--gap', gap + 'px');
}
let tRes;
window.addEventListener('resize', () => { clearTimeout(tRes); tRes = setTimeout(() => { if (G && !$('juego').classList.contains('oculto')) pintar(); }, 120); });

/* ---------- Botón de instalar ---------- */
let pedirInstalar = null;
const instalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function mirarInstalar() { $('bInstalar').classList.toggle('oculto', instalada() || location.protocol !== 'https:' || /claude/.test(location.hostname)); }
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pedirInstalar = e; mirarInstalar(); });
window.addEventListener('appinstalled', () => { pedirInstalar = null; $('bInstalar').classList.add('oculto'); aviso('¡Instalada! Ya la tienes en la pantalla de inicio 🎉'); });
$('bInstalar').onclick = async () => {
  if (pedirInstalar) {
    try { pedirInstalar.prompt(); const r = await pedirInstalar.userChoice; if (r && r.outcome === 'accepted') $('bInstalar').classList.add('oculto'); } catch (e) {}
    pedirInstalar = null; return;
  }
  ventana(esIOS
    ? '<h2>📲 Instalar en el iPhone</h2><div class="sub">1. Toca el botón <b>Compartir</b> de Safari (el cuadrado con la flecha ⬆️)<br><br>2. Elige <b>Añadir a pantalla de inicio</b><br><br>3. Pulsa <b>Añadir</b></div>'
    : '<h2>📲 Instalar la app</h2><div class="sub">Abre el menú del navegador <b>⋮</b> (arriba a la derecha) y elige <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</div>',
    [{ t: 'Entendido' }]);
};
mirarInstalar();

