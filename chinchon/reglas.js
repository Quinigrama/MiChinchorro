// Mi Chinchorro — reglas del chinchón: baraja, mezcla real, jugadas, cierre, puntos
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ================= MOTOR DEL CHINCHORRO ================= */
const PALOS = ['oros', 'copas', 'espadas', 'bastos'];
const DEF = {
  jugadores: 4, baraja: 40, comodines: 0, nivel: 1, velocidad: 1, raya: 0.20,
  limite: 100, maxSueltas: 1, maxPuntos: 5, figuras: 10, valorComodin: 25,
  reenganche: true, precioChinchon: 1, colgar: true, chinchonGana: true,
  ayudas: true, reparto: 2, barajado: 'real', vibrar: true, sonido: 1, tapete: 'verde', reverso: 'rojo', manias: true, niveles: null, genero: '', charla: 2, naipes: 'clasicas', indices: true, nombre: '', nombres: 'Matilde, Elvira, Pepita', rivales: ['Matilde', 'Elvira', 'Pepita'], nivelDe: {}, avatar: null, perfilHecho: false
};
let S = Object.assign({}, DEF);
// Azar criptográfico del navegador: cualquier orden de la baraja es posible e imprevisible
// (Math.random tiene 128 bits de estado; 40 cartas necesitan ~159 y 48, ~203)
const rndCripto = (() => {
  const C = typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues ? globalThis.crypto : null;
  if (!C) return Math.random;
  const buf = new Uint32Array(256); let pos = 256;
  return () => { if (pos >= 255) { C.getRandomValues(buf); pos = 0; } const a = buf[pos++] >>> 5, b = buf[pos++] >>> 6; return (a * 67108864 + b) / 9007199254740992; };
})();
let rnd = rndCripto;
function semilla(s) { rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function rangos() { return S.baraja === 48 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]; }
function rIdx(r) { return rangos().indexOf(r); }
function valor(c) { return c.j ? S.valorComodin : (c.r <= 9 ? c.r : (S.figuras === 10 ? 10 : c.r)); }

function barajaOrdenada() {
  const b = []; let id = 0;
  for (let s = 0; s < 4; s++) for (const r of rangos()) b.push({ id: id++, s, r });
  for (let k = 0; k < S.comodines; k++) b.push({ id: id++, j: true });
  return b;
}
function fisherYates(b) { for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [b[i], b[k]] = [b[k], b[i]]; } return b; }
function nuevaBaraja() { return fisherYates(barajaOrdenada()); }
/* ---------- Mezcla real: modelo Gilbert–Shannon–Reeds (Bayer y Diaconis: ~7 mezclas bastan) ---------- */
function mezclaHojear(b) {
  let k = 0; for (let x = 0; x < b.length; x++) if (rnd() < 0.5) k++;   // se parte por donde cae (binomial)
  const izq = b.slice(0, k), der = b.slice(k), r = [];
  let a = 0, c = 0;
  while (a < izq.length || c < der.length) {
    const qi = izq.length - a, qd = der.length - c;
    if (rnd() * (qi + qd) < qi) r.push(izq[a++]); else r.push(der[c++]);   // cae del montón más gordo con más probabilidad
  }
  return r;
}
const MEZCLAS = { real: 7, casa: 3 };
function cuantasMezclas() { return MEZCLAS[S.barajado] || 0; }
function barajarComoMesa(b) {
  const n = cuantasMezclas();
  if (!n) return fisherYates(b);
  for (let x = 0; x < n; x++) b = mezclaHojear(b);
  return b;
}
function cortarEn(b, frac) {
  const k = Math.max(4, Math.min(b.length - 4, Math.round(b.length * frac)));
  return b.slice(k).concat(b.slice(0, k));
}
// Al acabar la mano se recogen las cartas como en la mesa: el montón, las jugadas de cada una juntas y lo que quedó del mazo
function recogerCartas() {
  const todas = G.todas || [];
  if (!todas.length || !G.manoN) return null;
  const ref = barajaOrdenada();
  if (ref.length !== todas.length) return null;   // han cambiado la baraja o los comodines: baraja nueva
  const r = [], vistas = new Set(), pon = c => { if (c && !vistas.has(c.id)) { vistas.add(c.id); r.push(c); } };
  (G.descarte || []).forEach(pon);
  const n = G.jugadores.length;
  for (let x = 0; x < n; x++) {
    const p = G.jugadores[(G.reparte + 1 + x) % n];
    if (!p.mano || !p.mano.length) continue;
    const a = analizar(p.mano);
    a.jugadas.forEach(j => j.cartas.forEach(pon)); a.sueltas.forEach(pon);
  }
  (G.mazo || []).forEach(pon);
  todas.forEach(pon);   // por si falta alguna (la carta del cierre)
  return r.length === todas.length ? r : null;
}

function nombreCarta(c) {
  if (c.j) return 'el comodín';
  const n = { 1: 'el as', 10: 'la sota', 11: 'el caballo', 12: 'el rey' }[c.r] || ('el ' + c.r);
  return n + ' de ' + PALOS[c.s];
}

/* ---- Mejor reparto de una mano en jugadas (tríos/cuartetos y escaleras, con comodines) ----
   Con caché: la Experta analiza millones de veces las mismas manos en sus simulaciones. Se guarda el resultado
   por posiciones (qué cartas de la lista van en cada jugada) y se rehace con las cartas de cada llamada,
   así devuelve exactamente lo mismo que sin caché (mismos objetos de carta, mismo orden). */
const AN_CACHE = new Map(); let anClaveS = '';
function analizar(cartas) {
  const cs = S.baraja + '|' + S.valorComodin + '|' + S.figuras;
  if (cs !== anClaveS) { AN_CACHE.clear(); anClaveS = cs; }
  // clave: las cartas reales por su id (único); las imaginarias de la Experta (id < 0) y los comodines, con su palo y número
  let k = '';
  for (let i = 0; i < cartas.length; i++) { const c = cartas[i]; k += (c.id >= 0 && !c.j) ? c.id + ',' : (c.j ? '*' : c.s + '.' + c.r) + '.' + c.id + ','; }
  let h = AN_CACHE.get(k);
  if (!h) {
    AN_STATS.f++;
    const r = analizarCalc(cartas), pos = new Map();
    for (let i = 0; i < cartas.length; i++) pos.set(cartas[i], i);
    h = { m: r.muertos, j: r.jugadas.map(j => { const o = Object.assign({}, j); o.cartas = j.cartas.map(c => pos.get(c)); return o; }), s: r.sueltas.map(c => pos.get(c)) };
    if (AN_CACHE.size > 300000) AN_CACHE.clear();
    AN_CACHE.set(k, h);
  } else AN_STATS.a++;
  const jug = new Array(h.j.length);
  for (let t = 0; t < h.j.length; t++) { const o = Object.assign({}, h.j[t]), ix = o.cartas, cs = new Array(ix.length); for (let u = 0; u < ix.length; u++) cs[u] = cartas[ix[u]]; o.cartas = cs; jug[t] = o; }
  const su = new Array(h.s.length); for (let u = 0; u < h.s.length; u++) su[u] = cartas[h.s[u]];
  return { muertos: h.m, jugadas: jug, sueltas: su };
}
const AN_STATS = { a: 0, f: 0 };   // aciertos y fallos de la caché (para medir)
function analizarCalc(cartas) {
  const reales = cartas.filter(c => !c.j), joks = cartas.filter(c => c.j);
  const n = reales.length, J = joks.length, R = rangos().length;
  const cands = [];
  // grupos del mismo número
  const porR = {};
  reales.forEach((c, i) => (porR[c.r] = porR[c.r] || []).push(i));
  for (const r in porR) {
    const ix = porR[r], m = ix.length;
    for (let sub = 1; sub < (1 << m); sub++) {
      let mask = 0, k = 0;
      for (let t = 0; t < m; t++) if (sub & (1 << t)) { mask |= 1 << ix[t]; k++; }
      for (let nj = 0; nj <= Math.min(J, 4 - k); nj++) if (k + nj >= 3) cands.push({ t: 'g', mask, nj, r: +r });
    }
  }
  // escaleras del mismo palo
  for (let s = 0; s < 4; s++) {
    const pos = {};
    reales.forEach((c, i) => { if (c.s === s) pos[rIdx(c.r)] = i; });
    for (let a = 0; a < R; a++) for (let b = a + 2; b < R; b++) {
      let mask = 0, k = 0;
      for (let p = a; p <= b; p++) if (pos[p] !== undefined) { mask |= 1 << pos[p]; k++; }
      const nj = (b - a + 1) - k;
      if (k >= 1 && nj <= J) cands.push({ t: 'r', mask, nj, s, a, b });
    }
  }
  const memo = new Map();
  function resolver(mask, jl) {
    const key = mask * 8 + jl;
    if (memo.has(key)) return memo.get(key);
    let res;
    if (mask === 0) res = { d: jl * S.valorComodin, p: [] };
    else {
      let i = 0; while (!(mask & (1 << i))) i++;
      const sin = resolver(mask & ~(1 << i), jl);
      res = { d: valor(reales[i]) + sin.d, p: sin.p };
      for (const c of cands) {
        if (!(c.mask & (1 << i)) || (c.mask & mask) !== c.mask || c.nj > jl) continue;
        const r2 = resolver(mask & ~c.mask, jl - c.nj);
        if (r2.d < res.d) res = { d: r2.d, p: [c].concat(r2.p) };
      }
    }
    memo.set(key, res);
    return res;
  }
  const sol = resolver((1 << n) - 1, J);
  // reconstruir jugadas con cartas reales
  const usadas = new Set(); let jq = joks.slice();
  const jugadas = sol.p.map(c => {
    if (c.t === 'g') {
      const cs = reales.filter((x, i) => c.mask & (1 << i));
      cs.forEach(x => usadas.add(x.id));
      const js = jq.splice(0, c.nj);
      return { t: 'g', r: c.r, cartas: cs.concat(js) };
    }
    const rs = rangos(), cs = [];
    for (let p = c.a; p <= c.b; p++) {
      const x = reales.find((y, i) => (c.mask & (1 << i)) && rIdx(y.r) === p);
      if (x) { cs.push(x); usadas.add(x.id); } else cs.push(jq.shift());
    }
    return { t: 'r', s: c.s, a: c.a, b: c.b, cartas: cs };
  });
  jugadas.forEach(j => j.cartas.forEach(x => usadas.add(x.id)));
  const sueltas = cartas.filter(c => !usadas.has(c.id));
  return { muertos: sol.d, jugadas, sueltas };
}

function esChinchon(cartas7) {
  if (cartas7.length !== 7) return null;
  const reales = cartas7.filter(c => !c.j), nj = 7 - reales.length;
  if (!reales.length || reales.some(c => c.s !== reales[0].s)) return null;
  const ix = reales.map(c => rIdx(c.r)).sort((x, y) => x - y);
  for (let k = 1; k < ix.length; k++) if (ix[k] === ix[k - 1]) return null;
  if (ix[ix.length - 1] - ix[0] + 1 > 7) return null; // los huecos caben con los comodines
  return { limpio: nj === 0 };
}

function puedeCerrarCon(a) {
  return a.sueltas.length <= S.maxSueltas && a.muertos <= S.maxPuntos;
}

/* ---- Colgar cartas en las jugadas del que cierra ---- */
// ¿Encaja la carta c en alguna jugada de la mesa? Si encaja, se cuelga
function intentaColgar(c, jugadasMesa) {
  const R = rangos().length;
  for (const j of jugadasMesa) {
    if (j.t === 'g' && j.cartas.length < 4 && (c.j || c.r === j.r)) { j.cartas.push(c); return true; }
    if (j.t === 'r' && (c.j || c.s === j.s)) {
      const ri = c.j ? null : rIdx(c.r);
      if ((c.j && j.a > 0) || ri === j.a - 1) { j.cartas.unshift(c); j.a--; return true; }
      if ((c.j && j.b < R - 1) || ri === j.b + 1) { j.cartas.push(c); j.b++; return true; }
    }
  }
  return false;
}
// Cuelgan todas a la vez y en cualquier orden: se repite hasta que nadie puede colgar nada más
// (primero las cartas normales; los comodines, al final, donde mejor encajen)
function colgarTodas(filas, jugadasMesa) {
  for (const conComodin of [false, true]) {
    let cambio = true;
    while (cambio) {
      cambio = false;
      for (const f of filas) for (const c of f.sueltas.slice()) {
        if (!!c.j !== conComodin) continue;
        if (intentaColgar(c, jugadasMesa)) { f.colgadas.push(c); f.sueltas = f.sueltas.filter(x => x !== c); cambio = true; }
      }
    }
  }
  filas.forEach(f => f.puntos = f.sueltas.reduce((t, c) => t + valor(c), 0));
}
function colgar(mano, jugadasMesa) {
  const a = analizar(mano), f = { jugadas: a.jugadas, sueltas: a.sueltas.slice(), colgadas: [] };
  colgarTodas([f], jugadasMesa);
  return f;
}

/* ---- Estado de la partida ---- */
let G = null;

function nuevaPartida(nombreHumano) {
  const rivales = S.nombres.split(',').map(x => x.trim()).filter(Boolean);
  const js = [{ nombre: nombreHumano || 'Tú', humano: true }];
  for (let i = 1; i < S.jugadores; i++) js.push({ nombre: rivales[i - 1] || ('Rival ' + i), humano: false });
  G = {
    jugadores: js.map(j => Object.assign(j, { puntos: 0, fuera: false, reeng: 0, rayas: 0, mano: [], ultimo: '' })),
    reparte: Math.floor(rnd() * js.length), turno: 0, mazo: [], descarte: [], bote: 0,
    manoN: 0, fase: 'robar', vistas: [], cogidas: {}, terminada: false, ganador: null, turnos: 0
  };
  return G;
}

function activos() { return G.jugadores.map((j, i) => i).filter(i => !G.jugadores[i].fuera); }
function siguienteActivo(i) {
  const n = G.jugadores.length;
  for (let k = 1; k <= n; k++) { const x = (i + k) % n; if (!G.jugadores[x].fuera) return x; }
  return i;
}

function repartir() {
  const recogidas = cuantasMezclas() ? recogerCartas() : null;
  G.manoN++;
  G.reparte = siguienteActivo(G.reparte);
  // baraja recogida de la mano anterior y mezclada de verdad; la primera vez (o si cambia la baraja), bien barajada
  const b = recogidas ? barajarComoMesa(recogidas) : nuevaBaraja();
  G.antesDelCorte = b.slice();
  repartirDe(cortarEn(b, 0.25 + rnd() * 0.5));
}
function repartirDe(mazo) {
  G.mazo = mazo; G.todas = G.mazo.slice(); G.descarte = []; G.vistas = []; G.cogidas = {}; G.conocidas = {}; G.tiradasDe = {}; G.reciclado = null; G.turnos = 0;
  G.jugadores.forEach(j => { j.mano = []; j.ultimo = ''; });
  for (let k = 0; k < 7; k++) for (const i of activos()) G.jugadores[i].mano.push(G.mazo.pop());
  G.descarte.push(G.mazo.pop());
  G.turno = siguienteActivo(G.reparte);
  G.fase = 'robar';
}
// Corte de verdad: quien corta elige por dónde (0 = arriba del todo, 1 = abajo); solo antes de jugar
function cortarYRepartir(frac) {
  if (!G.antesDelCorte || G.turnos) return false;
  repartirDe(cortarEn(G.antesDelCorte.slice(), frac));
  return true;
}

function rellenarMazo() {
  if (G.mazo.length) return true;
  if (G.descarte.length <= 1) return false;
  const top = G.descarte.pop();
  G.mazo = G.descarte; G.descarte = [top];
  G.reciclado = G.mazo.map(c => c.id); // todo el mundo sabe qué cartas forman el mazo nuevo
  G.mazo = barajarComoMesa(G.mazo);
  return true;
}

function robar(i, deDescarte) {
  const j = G.jugadores[i];
  let c;
  if (deDescarte && G.descarte.length) {
    c = G.descarte.pop();
    if (!c.j) (G.cogidas[i] = G.cogidas[i] || []).push(c);
    (G.conocidas[i] = G.conocidas[i] || []).push(c); // a la vista de todas: la tiene ella
  } else {
    if (!rellenarMazo()) return null;
    c = G.mazo.pop();
  }
  j.mano.push(c); G.fase = 'tirar'; G.cogida = deDescarte ? c.id : null;
  return c;
}

function tirar(i, cartaId) {
  const j = G.jugadores[i];
  const c = j.mano.find(x => x.id === cartaId);
  j.mano = j.mano.filter(x => x.id !== cartaId);
  if (G.conocidas && G.conocidas[i]) G.conocidas[i] = G.conocidas[i].filter(x => x.id !== cartaId);
  G.descarte.push(c); G.vistas.push(c);
  if (!G.tiradasDe) G.tiradasDe = {};
  (G.tiradasDe[i] = G.tiradasDe[i] || []).push(c);   // lo que ha tirado cada una en esta mano (lo ve toda la mesa)
  G.turno = siguienteActivo(i); G.fase = 'robar'; G.turnos++;
  return c;
}

/* Cierra el jugador i tirando boca abajo la carta cartaId. Devuelve el resumen de la mano. */
function cerrar(i, cartaId) {
  const cj = G.jugadores[i];
  cj.mano = cj.mano.filter(x => x.id !== cartaId);
  const a = analizar(cj.mano);
  const ch = esChinchon(cj.mano);
  const res = { cierra: i, filas: [], chinchon: ch, finPartida: false };
  const mesa = a.jugadas.map(x => Object.assign({}, x, { cartas: x.cartas.slice() }));
  let pc = a.muertos === 0 ? -10 : a.muertos;
  if (ch && !ch.limpio) pc = -10;
  res.filas.push({ i, jugadas: a.jugadas, sueltas: a.sueltas, colgadas: [], puntos: pc });
  if (ch && ch.limpio && S.chinchonGana) {
    res.finPartida = true; G.ganador = i; G.terminada = true;
    return res;
  }
  let k = siguienteActivo(i);
  const otras = [];
  while (k !== i) {
    const b = analizar(G.jugadores[k].mano);
    otras.push({ i: k, jugadas: b.jugadas, sueltas: b.sueltas.slice(), colgadas: [], puntos: b.muertos });
    k = siguienteActivo(k);
  }
  // se cuelga en las jugadas de quien cierra… salvo si ha hecho −10 (ahí está prohibido)
  if (S.colgar && pc !== -10) colgarTodas(otras, mesa);
  res.filas.push(...otras);
  res.sinColgar = S.colgar && pc === -10;
  res.mesa = mesa;
  for (const f of res.filas) { const p = G.jugadores[f.i]; f.antes = p.puntos; p.puntos += f.puntos; f.despues = p.puntos; }
  // Quien pasa del límite se apunta una raya (va al bote)
  const pasan = res.filas.filter(f => G.jugadores[f.i].puntos > S.limite);
  res.eliminados = pasan.map(f => f.i);
  if (pasan.length === res.filas.length) {
    // todas se pasan a la vez: gana la que menos tiene
    const min = Math.min(...res.filas.map(f => G.jugadores[f.i].puntos));
    const g = res.filas.find(f => G.jugadores[f.i].puntos === min).i;
    res.eliminados = res.eliminados.filter(x => x !== g);
  }
  for (const f of res.filas) {
    if (!res.eliminados.includes(f.i)) continue;
    const p = G.jugadores[f.i];
    f.raya = true; p.rayas++; p.fuera = true;
    G.bote = Math.round((G.bote + S.raya) * 100) / 100;
  }
  // Reenganche: si quedan al menos dos por debajo, las que se pasan vuelven con los puntos de la que más tiene
  const quedan = activos();
  if (quedan.length >= 2 && S.reenganche) {
    const max = Math.max(...quedan.map(x => G.jugadores[x].puntos));
    for (const f of res.filas) if (f.raya) { const p = G.jugadores[f.i]; p.fuera = false; p.reeng++; p.puntos = max; f.reengancha = max; }
  } else if (quedan.length <= 1) {
    G.terminada = true; G.ganador = quedan[0];
    res.finPartida = true;
  }
  return res;
}

function comprobarFin() {
  const a = activos();
  if (a.length <= 1) { G.terminada = true; G.ganador = a[0]; }
  return G.terminada;
}

