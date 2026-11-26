// Mi Chinchorro — inteligencia de los rivales: Fácil, Normal, Difícil, Experta (Monte Carlo) y manías
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ================= INTELIGENCIA DE LOS RIVALES ================= */
// nivel: 0 fácil, 1 normal, 2 difícil
/* Pesos de la valoración (Difícil y Experta usan PD; un jugador puede traer los suyos en p.pesos) */
const PD = { kPot: 0.7, wPar: 1, esc1: 1.5, esc2: 1, pel: 0.6, pelR: 2, pelS: 1.5, uRobo: 0.5 };
let PS = PD;
function potencial(sueltas, nivel) {
  const vistos = new Set(G.vistas.map(c => c.s + '-' + c.r));
  const salen = cartasQuePuedenSalir();
  const vivo = salen ? (s, r) => salen.has(s + '-' + r) : (s, r) => !vistos.has(s + '-' + r);
  let p = 0;
  const rs = sueltas.filter(c => !c.j);
  for (let x = 0; x < rs.length; x++) for (let y = x + 1; y < rs.length; y++) {
    const A = rs[x], B = rs[y];
    if (A.r === B.r) {
      let vivas = 0; for (let s = 0; s < 4; s++) if (s !== A.s && s !== B.s && vivo(s, A.r)) vivas++;
      p += nivel === 2 ? vivas * PS.wPar : 1.5;
    } else if (A.s === B.s) {
      const d = Math.abs(rIdx(A.r) - rIdx(B.r));
      if (d === 1) p += nivel === 2 ? PS.esc1 : 1.5; else if (d === 2) p += nivel === 2 ? PS.esc2 : 1;
    }
  }
  return p;
}
function evaluar(mano, nivel) {
  const a = analizar(mano);
  const u = nivel ? urgencia() : 0;
  const prisa = u ? u * TX.wPrisa * Math.max(0, a.sueltas.length - 1) : 0;   // con prisa cuenta cuántas sueltas faltan para poder cerrar
  return { v: a.muertos * (1 - u * TX.bajaValor) + prisa - (nivel ? potencial(a.sueltas, nivel) * (nivel === 2 ? PS.kPot : 0.15) : 0), a };
}
function peligro(c, i) {
  // ¿le vendría bien al siguiente jugador? (nivel difícil)
  if (c.j) return 0;
  const sig = siguienteActivo(i);
  const cog = G.conocidas[sig] || [];   // lo que sigue teniendo de lo que cogió del montón
  let p = 0;
  for (const x of cog) {
    if (x.r === c.r) p += PS.pelR;
    if (x.s === c.s && Math.abs(rIdx(x.r) - rIdx(c.r)) <= 2) p += PS.pelS;
  }
  return p;
}
function mejorTirada(i, mano8, nivel, prohibida) {
  let mejor = null;
  for (const c of mano8) {
    if (c.id === prohibida) continue;
    if (c.j && mano8.some(x => !x.j && x.id !== prohibida)) continue; // no tira comodines
    const resto = mano8.filter(x => x !== c);
    const e = evaluar(resto, nivel);
    let v = e.v - valor(c) * (0.01 + (PS.alta || 0));   // el prudente prefiere soltar lo que más pesa
    if (nivel === 2 || (nivel > 0 && PS.pelR > PD.pelR)) v += peligro(c, i) * PS.pel;
    if (!mejor || v < mejor.v) mejor = { c, v, a: e.a };
  }
  return mejor;
}
function mejorCierre(mano8, prohibida) {
  let mejor = null;
  for (const c of mano8) {
    if (c.id === prohibida) continue;
    const a = analizar(mano8.filter(x => x !== c));
    if (!puedeCerrarCon(a)) continue;
    const ch = esChinchon(mano8.filter(x => x !== c));
    const score = (ch && ch.limpio) ? -1000 : a.muertos;
    if (!mejor || score < mejor.score) mejor = { c, score, a };
  }
  return mejor;
}


/* ================= NIVEL EXPERTA =================
   Solo usa información que una jugadora atenta conoce: su mano, el montón,
   las cartas que cada rival ha cogido del montón (y no ha soltado) y, tras
   rebarajar, qué cartas forman el mazo nuevo. Nunca mira cartas ocultas. */
const TX = { wPartida: 0, kCrit: 1, pcMul: 1, pcAdd: 0, peligro: 0.6, wPar: 1, wEsc: 0.75, bEsc: 0, bHueco: 0, kPot: 0.7, kDef: 0, uRobo: 0.5, robo: 'exp', mc: 1, K: 40, cand: 3, prof: 4, hoja: 1, relativa: 1, decideCierre: 1, margenEspera: 1, wRaya: 25, limiteReal: 0, wPrisa: 6, bajaValor: 0.9, prisaDesde: 6, prisaRampa: 3 };
function poolMazo(i) {
  // cartas que pueden salir del mazo
  const fuera = new Set(G.jugadores[i].mano.map(c => c.id));
  G.descarte.forEach(c => fuera.add(c.id));
  for (const k in (G.conocidas || {})) if (+k !== i) G.conocidas[k].forEach(c => fuera.add(c.id));
  const base = G.reciclado ? G.todas.filter(c => G.reciclado.includes(c.id)) : (G.todas || []);
  return base.filter(c => !fuera.has(c.id));
}
function probCierre(i) {
  // cuánto riesgo hay de que alguien cierre antes de mi próximo turno
  const n = activos().length, vueltas = G.turnos / Math.max(1, n);
  let p = 0.06 + 0.07 * vueltas;
  for (const k of activos()) if (k !== i && (G.conocidas[k] || []).length >= 2) p += 0.08;
  if (G.jugadores[i].puntos >= S.limite * 0.7) p += 0.15; // voy justa: a la defensiva
  return Math.max(0.05, Math.min(0.9, p * TX.pcMul + TX.pcAdd));
}
function peligroExperta(c, i) {
  if (c.j) return 0;
  let p = 0;
  // la siguiente jugadora es la única que puede cogerla del montón
  const sig = siguienteActivo(i), sus = G.conocidas[sig] || [];
  const mismoN = sus.filter(x => !x.j && x.r === c.r).length;
  const vecinas = sus.filter(x => !x.j && x.s === c.s && Math.abs(rIdx(x.r) - rIdx(c.r)) <= 2).length;
  if (mismoN >= 2) p += 6; else if (mismoN === 1) p += 2;
  if (vecinas >= 2) p += 5; else if (vecinas === 1) p += 1.5;
  if (sus.some(x => x.j)) p += 1;
  return p;
}
// Potencial con información real: cuenta cuántas cartas que ligarían siguen vivas en el mazo
function potencialExperta(sueltas, vivas) {
  const v = (s, r) => vivas.has(s + '-' + r) ? 1 : 0;
  let p = 0;
  const rs = sueltas.filter(c => !c.j);
  for (let x = 0; x < rs.length; x++) for (let y = x + 1; y < rs.length; y++) {
    const A = rs[x], B = rs[y];
    if (A.r === B.r) { let n = 0; for (let s = 0; s < 4; s++) if (s !== A.s && s !== B.s) n += v(s, A.r); p += n * TX.wPar; }
    else if (A.s === B.s) {
      const ia = rIdx(A.r), ib = rIdx(B.r), lo = Math.min(ia, ib), hi = Math.max(ia, ib), R = rangos();
      if (hi - lo === 1) p += TX.bEsc + ((lo > 0 ? v(A.s, R[lo - 1]) : 0) + (hi < R.length - 1 ? v(A.s, R[hi + 1]) : 0)) * TX.wEsc;
      else if (hi - lo === 2) p += TX.bHueco + v(A.s, R[lo + 1]) * TX.wEsc;
    }
  }
  return p;
}
function contexto(i) {
  const pool = poolMazo(i);
  return { pool, vivas: new Set(pool.filter(c => !c.j).map(c => c.s + '-' + c.r)), pc: probCierre(i) };
}
function evaluarExperta(mano7, ctx) {
  const a = analizar(mano7);
  // cuanto más riesgo de cierre, más pesan los puntos sueltos y menos las esperanzas
  return a.muertos * (1 + TX.kDef * ctx.pc) - potencialExperta(a.sueltas, ctx.vivas) * TX.kPot * (1 - ctx.pc);
}
function tiradaExperta(i, mano8, prohibida, ctx) {
  ctx = ctx || contexto(i);
  let mejor = null;
  for (const c of mano8) {
    if (c.id === prohibida) continue;
    if (c.j && mano8.some(x => !x.j && x.id !== prohibida)) continue;
    const v = evaluarExperta(mano8.filter(x => x !== c), ctx) + peligroExperta(c, i) * TX.peligro - valor(c) * 0.01;
    if (!mejor || v < mejor.v) mejor = { c, v };
  }
  return mejor;
}
function roboExperta(i) {
  const p = G.jugadores[i], top = G.descarte[G.descarte.length - 1];
  if (!top) return false;
  const con = p.mano.concat([top]);
  if (mejorCierre(con, top.id)) return true;
  if (top.j) return true;
  const ctx = contexto(i);
  if (!ctx.pool.length) return true;
  if (TX.robo === 'dif') {
    let s = 0; for (const u of ctx.pool) s += mejorTirada(i, p.mano.concat([u]), 1, null).v;
    const o = mejorTirada(i, con, 1, top.id); return o && o.v < s / ctx.pool.length - 0.5;
  }
  const tomar = tiradaExperta(i, con, top.id, ctx);
  let suma = 0;
  for (const u of ctx.pool) suma += tiradaExperta(i, p.mano.concat([u]), null, ctx).v;
  return tomar && tomar.v < suma / ctx.pool.length - TX.uRobo;
}


/* ---- Experta: simulación Monte Carlo con repartos posibles ---- */
function clonarG() {
  const c = Object.assign({}, G);
  c.prisaTotal = false;   // la prisa de Elvira es solo suya: en las simulaciones cada una decide la suya
  c.jugadores = G.jugadores.map(j => Object.assign({}, j, { mano: j.mano.slice() }));
  c.mazo = G.mazo.slice(); c.descarte = G.descarte.slice(); c.vistas = G.vistas.slice();
  c.cogidas = {}; for (const k in G.cogidas) c.cogidas[k] = G.cogidas[k].slice();
  c.conocidas = {}; for (const k in (G.conocidas || {})) c.conocidas[k] = G.conocidas[k].slice();
  return c;
}
// Reparte al azar lo que la jugadora i no puede ver, respetando lo que sí sabe
function determinizar(i, aleat) {
  const g = clonarG();
  const conocidasDe = k => new Set((G.conocidas[k] || []).map(c => c.id));
  const ocultas = [];
  g.jugadores.forEach((p, k) => { if (k === i || p.fuera) return; const kn = conocidasDe(k); p.mano.forEach(c => { if (!kn.has(c.id)) ocultas.push(c); }); });
  ocultas.push(...g.mazo);
  for (let a = ocultas.length - 1; a > 0; a--) { const b = Math.floor(aleat() * (a + 1)); [ocultas[a], ocultas[b]] = [ocultas[b], ocultas[a]]; }
  let resto = ocultas;
  if (G.reciclado) {
    // tras rebarajar se sabe qué cartas pueden estar en el mazo
    const rec = new Set(G.reciclado);
    const cand = resto.filter(c => rec.has(c.id)), otras = resto.filter(c => !rec.has(c.id));
    g.mazo = cand.slice(0, G.mazo.length);
    resto = otras.concat(cand.slice(G.mazo.length));
  } else { g.mazo = resto.slice(0, G.mazo.length); resto = resto.slice(G.mazo.length); }
  let pos = 0;
  g.jugadores.forEach((p, k) => {
    if (k === i || p.fuera) return;
    const kn = conocidasDe(k);
    p.mano = p.mano.map(c => kn.has(c.id) ? c : resto[pos++]);
  });
  g.jugadores.forEach(p => { p.nivel = 1; p.humano = false; });
  return g;
}
// Juega lo que queda de mano y devuelve mis puntos menos la media de las demás
function rollout(g, i, accion) {
  const Greal = G, Sreal = S.limite;
  // marcador antes de la mano y lo que duele una raya para esta jugadora
  const base = g.jugadores.map(p => p.puntos), LIM = TX.limiteReal || Sreal;
  const W = Greal.jugadores[i].wRaya ?? TX.wRaya;
  const raya = (k, extra) => base[k] + extra > LIM ? 1 : 0;
  G = g; S.limite = 1e9;
  let res = null;
  try {
    res = accion() || null;
    if (res && !res.filas) res = null;
    let t = 0;
    const lim = TX.prof || 60;
    while (!res && t++ < lim) {
      if (G.fase === 'resultado') break;
      const k = G.turno;
      if (G.fase === 'robar') { if (!robar(k, iaRobo(k))) break; }
      const d = iaTirada(k);
      if (d.cierra) res = cerrar(k, d.carta.id); else tirar(k, d.carta.id);
    }
  } finally { G = Greal; S.limite = Sreal; }
  if (!res) {
    if (!TX.prof) return 0;
    // hoja: cómo de buena queda mi mano (puntos sueltos menos esperanzas)
    const Gr = G; G = g;
    const m8 = g.jugadores[i].mano.length === 8 ? mejorTirada(i, g.jugadores[i].mano, 2, null) : null;
    const v = m8 ? m8.v : evaluar(g.jugadores[i].mano, 2).v;
    let otros = 0, n = 0, rOtras = 0;
    g.jugadores.forEach((p, k) => { if (k !== i && !p.fuera) { const m = p.mano.length === 8 ? mejorTirada(k, p.mano, 1, null).a : analizar(p.mano); const d = m ? m.muertos : 0; otros += d; rOtras += raya(k, d); n++; } });
    const mia = m8 ? m8.a.muertos : analizar(g.jugadores[i].mano).muertos;   // con 8 cartas: tras su mejor descarte
    G = Gr;
    // si nadie ha cerrado aún, el riesgo de raya cuenta a medias
    const rRiesgo = W ? 0.5 * W * (raya(i, mia) - (n ? rOtras / n : 0)) : 0;
    return v * TX.hoja - (TX.relativa && n ? otros / n : 0) + rRiesgo;
  }
  if (res.chinchon && res.chinchon.limpio && S.chinchonGana) return res.cierra === i ? -60 - TX.wPartida : 30 + TX.wPartida / 3;   // si el chinchón no gana, cuenta como un −10 normal
  let mio = 0, otros = 0, n = 0, rMia = 0, rOtras = 0;
  for (const f of res.filas) { if (f.i === i) { mio = f.puntos; rMia = raya(i, f.puntos); } else { otros += f.puntos; rOtras += raya(f.i, f.puntos); n++; } }
  return mio - (n ? otros / n : 0) + W * (rMia - (n ? rOtras / n : 0)) + valorPartida(res, base, LIM, i);
}
// La Experta «sabe» el final: si con esta mano la partida se acaba, ganarla vale TX.wPartida puntos (y perderla, lo mismo repartido)
function valorPartida(res, base, LIM, i) {
  if (!TX.wPartida || !S.reenganche) return 0;
  const tot = {}, act = res.filas.map(f => f.i);
  for (const f of res.filas) tot[f.i] = base[f.i] + f.puntos;
  const quedan = act.filter(k => tot[k] <= LIM);
  if (quedan.length >= 2) return 0;                     // sigue la partida
  const gana = quedan.length === 1 ? quedan[0] : act.reduce((a, k) => tot[k] < tot[a] ? k : a, act[0]);
  return gana === i ? -TX.wPartida : TX.wPartida / Math.max(1, act.length - 1);
}
// Momento decisivo: puede cerrar o alguien (ella incluida) está cerca del límite → piensa más (TX.kCrit veces)
function momentoCritico(i) {
  const LIM = TX.limiteReal || S.limite;
  if (mejorCierre(G.jugadores[i].mano, G.cogida)) return true;
  return activos().some(k => G.jugadores[k].puntos >= LIM - 25);
}
function semillasMC(n) { const r = []; for (let k = 0; k < n; k++) r.push(Math.floor(Math.random() * 2 ** 31)); return r; }
function aleatDe(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function evaluarOpciones(i, opciones) {
  // mismas cartas imaginadas para todas las opciones: así la comparación es justa
  const semillas = semillasMC(Math.round(TX.K * (TX.kCrit > 1 && momentoCritico(i) ? TX.kCrit : 1)));
  const rndReal = rnd;
  const medias = opciones.map(() => 0);
  for (const s of semillas) {
    opciones.forEach((op, k) => {
      const a = aleatDe(s);
      rnd = aleatDe(s ^ 0x5bd1e995);
      const g = determinizar(i, a);
      medias[k] += rollout(g, i, () => op(g));
    });
  }
  rnd = rndReal;
  return medias.map(m => m / semillas.length);
}
function tiradaMC(i, mano8, prohibida) {
  // candidatas: las mejores según la Difícil
  const lista = [];
  for (const c of mano8) {
    if (c.id === prohibida) continue;
    if (c.j && mano8.some(x => !x.j && x.id !== prohibida)) continue;
    const e = evaluar(mano8.filter(x => x !== c), 2);
    lista.push({ c, v: e.v - valor(c) * (0.01 + (PS.alta || 0)) + peligro(c, i) * PS.pel });
  }
  lista.sort((a, b) => a.v - b.v);
  const cand = lista.slice(0, TX.cand);
  const W = G.jugadores[i].wRaya ?? TX.wRaya;
  if (W && G.jugadores[i].puntos >= (TX.limiteReal || S.limite) - 35) {
    // va justa: que también valore quitarse la carta suelta más alta
    const sueltas = analizar(mano8).sueltas.filter(c => !c.j && c.id !== prohibida);
    const alta = sueltas.sort((a, b) => valor(b) - valor(a))[0];
    if (alta && !cand.some(x => x.c === alta)) { const x = lista.find(y => y.c === alta); if (x) cand.push(x); }
  }
  if (cand.length <= 1) return cand[0];
  const vals = evaluarOpciones(i, cand.map(x => () => { tirar(i, x.c.id); }));
  if (PS.pelR > PD.pelR) cand.forEach((x, k) => { vals[k] += peligro(x.c, i) * 1.5; });   // el vigilante: antes perder un poco que dar carta
  let mejor = 0; vals.forEach((v, k) => { if (v < vals[mejor]) mejor = k; });
  return cand[mejor];
}
function roboMC(i) {
  const p = G.jugadores[i], top = G.descarte[G.descarte.length - 1];
  if (!top) return false;
  if (mejorCierre(p.mano.concat([top]), top.id)) return true;
  if (top.j) return true;
  const sigue = k => { const d = iaTirada(k); if (d.cierra) return cerrar(k, d.carta.id); tirar(k, d.carta.id); };
  const [vTomar, vMazo] = evaluarOpciones(i, [() => { robar(i, true); sigue(i); }, () => { if (robar(i, false)) sigue(i); }]);
  return vTomar < vMazo;
}

/* Decide el robo: true = coger del descarte */
function conPesos(i, f) {
  const p = G.jugadores[i], prev = PS, m = maniaDe(p);
  PS = p.pesos || (m ? Object.assign({}, PD, m.pesos) : PD);
  const prisa = !!(m && m.id === 'estratega' && finDePartida(i)), prevP = G.prisaTotal;
  if (prisa) G.prisaTotal = true;
  try { return f(); } finally { PS = prev; G.prisaTotal = prevP; }
}
// ¿Qué cartas pueden salir todavía? Tras rebarajar, el mazo nuevo son las que ya salieron al montón:
// las que nunca salieron están en manos de otras y no van a llegar
function cartasQuePuedenSalir() {
  if (!G.reciclado) return null;
  const ids = new Set(G.reciclado), m = new Set();
  for (const c of G.todas) if (!c.j && ids.has(c.id)) m.add(c.s + '-' + c.r);
  for (const c of G.descarte) if (!c.j) m.add(c.s + '-' + c.r);
  return m;
}
// Prisa: si la mano se alarga (más de 6 vueltas) o se rebaraja el montón, importa más poder cerrar que guardar cartas bajas
function urgencia() {
  if (G && G.prisaTotal) return 1;   // Elvira la estratega en el final de la partida
  if (!G || !G.turnos) return 0;
  const v = G.turnos / Math.max(1, activos().length);
  return Math.max(G.reciclado ? 0.5 : 0, Math.min(1, (v - TX.prisaDesde) / TX.prisaRampa));
}
/* ---- Manías: 3 personajes juegan a su manera; MCarmen, Elvira, Pepita, Pedro y Manolo juegan «de libro» (grupo de control) ---- */
const MANIAS = {
  'Andrés': { id: 'prudente', t: 'el prudente', pesos: { kPot: 0.35, pel: 1.2, alta: 0.35 } },     // cierra en cuanto puede y no se carga de cartas
  'Lucas': { id: 'arriesgado', t: 'el arriesgado', pesos: { kPot: 1.1 } },             // va a por el −10: no cierra pronto con puntos
  'Matilde': { id: 'monton', t: 'la ojo avizor', pesos: {} },                           // coge del montón lo que le arrime algo
  'Elvira': { id: 'estratega', t: 'la estratega', pesos: {} }                            // juega a ganar la partida: en el final, cerrar es lo único que cuenta
};
// Elvira: la partida la gana quien cierra la última mano (con reenganche, al final todas están cerca del límite).
// En el final (todas las rivales a EP.fin puntos o menos del límite) va con prisa total y cierra en cuanto puede,
// aunque se pase del límite si queda por debajo de la rival que menos tiene (EP.margen).
const EP = { fin: 20, margen: 4, pasarse: 1 };
function finDePartida(i) {
  const r = activos().filter(k => k !== i);
  return r.length > 0 && r.every(k => G.jugadores[k].puntos >= S.limite - EP.fin);
}
function maniaDe(p) { return (!p || p.humano || p.remoto || p.nivel >= 4 || p.sinMania || S.manias === false) ? null : (MANIAS[p.nombre] || null); }
// Niveles 4 = Gemini y 5 = DeepSeek (IAs, las decide la interfaz). Cuando decide el motor (simulaciones o si Gemini falla), juega como la Difícil de libro
function comoBot(i, f) { const p = G.jugadores[i]; if (!(p.nivel >= 4)) return f(); const nv = p.nivel; p.nivel = 2; p.sinMania = true; try { return f(); } finally { p.nivel = nv; p.sinMania = false; } }
function arrima(mano, c) {   // ¿la carta hace jugada, pareja o escalerita con algo de la mano?
  if (c.j) return true;
  if (analizar(mano.concat([c])).muertos < analizar(mano).muertos + valor(c)) return true;   // liga con algo
  return valor(c) <= 7 && mano.some(x => !x.j && (x.r === c.r || (x.s === c.s && Math.abs(rIdx(x.r) - rIdx(c.r)) <= 1)));   // pareja o seguida, si no pesa mucho
}
function iaRobo(i) { return comoBot(i, () => iaRoboM(i)); }
function iaRoboM(i) {
  const m = maniaDe(G.jugadores[i]);
  const top = G.descarte[G.descarte.length - 1];
  if (m && m.id === 'monton' && top && arrima(G.jugadores[i].mano, top)) return true;
  return conPesos(i, () => iaRobo_(i));
}
function iaTirada(i) { return comoBot(i, () => conPesos(i, () => iaTirada_(i))); }
function iaRobo_(i) {
  const p = G.jugadores[i], nivel = (p.nivel ?? S.nivel);
  if (nivel === 3 && TX.mc) return roboMC(i);
  if (nivel === 3 && !TX.roboClon) return roboExperta(i);
  if (nivel === 3) { const q = p.nivel; p.nivel = 2; const r = iaRobo_(i); p.nivel = q; return r; }
  const top = G.descarte[G.descarte.length - 1];
  if (!top) return false;
  const con = p.mano.concat([top]);
  if (nivel > 0 && mejorCierre(con, top.id)) return true;
  if (top.j) return nivel > 0 || rnd() < 0.6;
  if (nivel === 2) {
    // compara con lo que se espera sacar del mazo (cartas no vistas)
    const conocidas = new Set(p.mano.concat(G.vistas).map(c => c.j ? 'J' + c.id : c.s + '-' + c.r));
    const noVistas = [], salen = cartasQuePuedenSalir(), mias = new Set(p.mano.map(c => c.s + '-' + c.r));
    for (let s = 0; s < 4; s++) for (const r of rangos()) {
      const k = s + '-' + r;
      if (salen ? (salen.has(k) && !mias.has(k)) : !conocidas.has(k)) noVistas.push({ id: -1 - noVistas.length, s, r });
    }
    let suma = 0;
    for (const u of noVistas) { const t = mejorTirada(i, p.mano.concat([u]), 1, null); suma += t.v; }
    const esperado = noVistas.length ? suma / noVistas.length : 99;
    const opt = mejorTirada(i, con, 1, top.id);
    return opt && opt.v < esperado - PS.uRobo;
  }
  const act = evaluar(p.mano, nivel).v;
  const opt = mejorTirada(i, con, nivel, top.id);
  const umbral = [2.5, 1.5, 0.6][nivel];
  if (nivel === 0 && rnd() < 0.3) return false;
  return opt && opt.v < act - umbral;
}
/* Decide qué tirar y si cierra: {carta, cierra} */
function iaTirada_(i) {
  const p = G.jugadores[i], nivel = (p.nivel ?? S.nivel), proh = G.cogida;
  let ci = mejorCierre(p.mano, proh);
  const mn = maniaDe(p);
  if (ci && mn && mn.id === 'estratega' && finDePartida(i)) {
    const tot = p.puntos + (ci.a.muertos === 0 ? -10 : ci.a.muertos);
    const minR = Math.min(...activos().filter(k => k !== i).map(k => G.jugadores[k].puntos));
    if (tot <= S.limite || (EP.pasarse && tot < minR + EP.margen)) return { carta: ci.c, cierra: true };
  }
  // No cerrar si con esos puntos me paso del límite (me apuntaría yo la raya)
  if (ci && ci.a.muertos > 0 && p.puntos + ci.a.muertos > S.limite) {
    const ch = esChinchon(p.mano.filter(x => x !== ci.c));
    if (!(ch && ch.limpio)) ci = null;
  }
  if (ci && mn && mn.id === 'arriesgado' && ci.a.muertos >= 2 && urgencia() < 0.5 && G.turnos < activos().length * 4) ci = null;   // espera al −10
  if (ci && mn && mn.id === 'prudente') return { carta: ci.c, cierra: true };   // cierra en cuanto puede
  if (ci && nivel === 3 && TX.mc && TX.decideCierre && ci.a.muertos > 0) {
    const ch = esChinchon(p.mano.filter(x => x !== ci.c));
    if (!(ch && ch.limpio)) {
      const sigo = tiradaMC(i, p.mano, proh) || mejorTirada(i, p.mano, 2, proh);
      if (sigo) {
        const [vCerrar, vSeguir] = evaluarOpciones(i, [() => cerrar(i, ci.c.id), () => { tirar(i, sigo.c.id); }]);
        if (vSeguir + TX.margenEspera < vCerrar) return { carta: sigo.c, cierra: false };
      }
    }
    return { carta: ci.c, cierra: true };
  }
  if (ci) {
    const ok = nivel > 0 || ci.a.muertos <= 1 || rnd() < 0.5;
    if (ok) return { carta: ci.c, cierra: true };
  }
  let t = nivel === 3 && TX.mc ? tiradaMC(i, p.mano, proh) : nivel === 3 && !TX.tiraClon ? tiradaExperta(i, p.mano, proh) : mejorTirada(i, p.mano, nivel === 3 ? 2 : nivel, proh);
  if (nivel === 0 && rnd() < 0.35) {
    const a = analizar(p.mano);
    const opc = a.sueltas.filter(c => !c.j && c.id !== proh);
    if (opc.length) t = { c: opc[Math.floor(rnd() * opc.length)] };
  }
  if (!t) t = { c: p.mano.find(c => c.id !== proh) };
  return { carta: t.c, cierra: false };
}

/* Simulación rápida (cuando el humano queda fuera) */
function simularHastaFinal() {
  let guard = 0;
  while (!G.terminada && guard++ < 500) {
    repartir();
    let res = null, t = 0;
    while (!res && t++ < 400) {
      const i = G.turno;
      const desc = iaRobo(i);
      if (!robar(i, desc)) break;
      const d = iaTirada(i);
      if (d.cierra) res = cerrar(i, d.carta.id); else tirar(i, d.carta.id);
    }
    if (!res) continue;
    if (res.finPartida) break;
    comprobarFin();
  }
  return G.ganador;
}

/* ---- Pensar en otro hilo (Web Worker, chinchon/ia-worker.js) ----
   Recibe una copia del estado (S y G, copiados con structuredClone por postMessage) y decide la tirada. */
function tiradaDesdeOtroHilo(datos) {
  for (const k in S) delete S[k];
  Object.assign(S, datos.S);
  G = datos.G;
  const d = iaTirada(datos.i);
  return { id: d.carta.id, cierra: !!d.cierra };
}

if (typeof module !== "undefined") module.exports = { tiradaDesdeOtroHilo, AN_STATS: typeof AN_STATS !== "undefined" ? AN_STATS : null, PD, MANIAS, EP, maniaDe, mezclaHojear, barajarComoMesa, recogerCartas, cortarYRepartir, rndCripto, tiradaExpertaX: (i,m,p)=>tiradaExperta(i,m,p), semilla, TX, repartirExp: repartir,  S, DEF, analizar, colgar, esChinchon, nuevaPartida, repartir, robar, tirar, cerrar, iaRobo, iaTirada, simularHastaFinal, get G() { return G; }, setS: o => Object.assign(S, o), valor, nombreCarta, puedeCerrarCon, mejorCierre, mejorTirada, activos, comprobarFin };

