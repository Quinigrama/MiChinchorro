// Mi Chinchorro — estadísticas, Liga de niveles y cuentas de la cuenta de Google
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Estadísticas de la jugadora ---------- */
const EST0 = { partidas: 0, ganadas: 0, manos: 0, cierres: 0, menos10: 0, chinchones: 0, puntos: 0, pillada: 0, figurasPilladas: 0, rayas: 0, euros: 0, tiradas: 0, mejorables: 0, cierresPerdidos: 0, cogidasMonton: 0, cogidasUtiles: 0, manosPartidas: 0, partidasContadas: 0, manosMax: 0, desde: null };
// Liga de niveles: por nivel (n0..n3), tú (yo) y personas online (per): manos, suma y suma² de puntos frente a la mesa, cierres, −10, rayas, partidas y ganadas
// más, desde el 25/11/2026: k = partidas con esperado, e = ganadas esperadas por azar (1/jugadores), v = su varianza (para ver si se gana más de la cuenta)
const LIGA = ['n5', 'n4', 'n3', 'n2', 'n1', 'n0', 'yo', 'per'], LIGA_C = ['m', 'r', 'q', 'c', 'd', 'y', 'p', 'g', 'k', 'e', 'v'];
for (const L of LIGA) for (const c of LIGA_C) EST0[`lg_${L}_${c}`] = 0;
// para la liga global: los bots solo los apunta quien lleva la partida (en una mesa online, el anfitrión), para no contarlos dos veces
for (const L of ['n5', 'n4', 'n3', 'n2', 'n1', 'n0']) for (const c of LIGA_C) EST0[`lgx_${L}_${c}`] = 0;
let EST = Object.assign({}, EST0, LS.get('mc-estad', {}));
function claveLiga(i) { const p = G.jugadores[i]; if (i === YO) return 'yo'; if (p.uid || p.remoto || p.humano) return 'per'; return 'n' + (p.nivel ?? S.nivel); }
function anotarLiga(res) {
  if (res.liga) return; res.liga = true;
  if (res.chinchon && res.chinchon.limpio && S.chinchonGana) { const k = claveLiga(res.cierra); EST[`lg_${k}_c`]++; if (k[0] === 'n' && !(ONLINE && ONLINE.rol === 'invitado')) EST[`lgx_${k}_c`]++; return; }
  const fs = res.filas.filter(f => G.jugadores[f.i]); if (fs.length < 2) return;
  const tot = fs.reduce((a, f) => a + f.puntos, 0);
  for (const f of fs) {
    const k = claveLiga(f.i), rel = f.puntos - (tot - f.puntos) / (fs.length - 1);
    const pref = [`lg_${k}`]; if (k[0] === 'n' && !(ONLINE && ONLINE.rol === 'invitado')) pref.push(`lgx_${k}`);
    for (const x of pref) {
      EST[`${x}_m`]++; EST[`${x}_r`] += rel; EST[`${x}_q`] += rel * rel;
      if (f.i === res.cierra) { EST[`${x}_c`]++; if (f.puntos === -10) EST[`${x}_d`]++; }
      if (f.raya) EST[`${x}_y`]++;
    }
  }
  guardarEst();
}
function anotarLigaFin() {
  if (G.ligaFin) return; G.ligaFin = true;
  const lleva = !(ONLINE && ONLINE.rol === 'invitado');
  const pe = 1 / Math.max(1, G.jugadores.length);   // si todas jugaran igual, cada una ganaría 1 de cada N partidas
  G.jugadores.forEach((p, i) => {
    const k = claveLiga(i), pref = [`lg_${k}`]; if (k[0] === 'n' && lleva) pref.push(`lgx_${k}`);
    for (const x of pref) { EST[`${x}_p`]++; if (G.ganador === i) EST[`${x}_g`]++; EST[`${x}_k`]++; EST[`${x}_e`] += pe; EST[`${x}_v`] += pe * (1 - pe); }
  });
  guardarEst();
}
function pintarLiga(e, otrosNombres) {
  const NOM = Object.assign({ n5: '🐋 DeepSeek', n4: '✨ Gemini', n3: '🧠 Experta', n2: '🔴 Difícil', n1: '🟡 Normal', n0: '🟢 Fácil', yo: '🙋 Tú', per: '📱 Personas online' }, otrosNombres || {});
  const filas = LIGA.filter(L => e[`lg_${L}_m`] > 0).map(L => {
    const n = e[`lg_${L}_m`], m = e[`lg_${L}_r`] / n, sd = Math.sqrt(Math.max(0, e[`lg_${L}_q`] / n - m * m));
    const p = e[`lg_${L}_p`] || 0, k = e[`lg_${L}_k`] || 0;
    // ganadas esperadas: con las partidas apuntadas desde que existe el dato, extrapolado a todas (mismo tamaño de mesa)
    const esp = k ? e[`lg_${L}_e`] / k * p : null, ve = k ? e[`lg_${L}_v`] / k * p : 0;
    const z = esp != null && ve > 0 ? (e[`lg_${L}_g`] - esp) / Math.sqrt(ve) : 0;
    return { L, n, m, ic: n > 1 ? 1.96 * sd / Math.sqrt(n) : 99, c: e[`lg_${L}_c`] / n, d: e[`lg_${L}_d`] / n, y: e[`lg_${L}_y`] / n, p, g: e[`lg_${L}_g`], esp, z };
  }).sort((a, b) => a.m - b.m);
  if (!filas.length) return '<div class="nota">Aún no hay manos. Juega unas cuantas y aquí verás qué nivel juega mejor.</div>';
  const pc = x => Math.round(x * 100) + ' %', num = x => (x > 0 ? '+' : '') + x.toFixed(1).replace('.', ',');
  return `<table class="liga"><tr><th>Nivel</th><th>Manos</th><th>Pts vs mesa</th><th>Cierra</th><th>−10</th><th>Raya</th><th>Gana</th></tr>
    ${filas.map(f => `<tr><td>${NOM[f.L]}</td><td>${f.n}</td><td><b>${num(f.m)}</b><small> ±${f.ic.toFixed(1).replace('.', ',')}</small>${f.n < 100 ? ' 🤏' : ''}</td><td>${pc(f.c)}</td><td>${pc(f.d)}</td><td>${pc(f.y)}</td><td>${f.p ? `${f.g}/${f.p}` : '—'}${f.esp != null && f.p ? `<br><small>esp. ${f.esp.toFixed(1).replace('.', ',')}${f.z > 1.96 ? ' ⬆️' : f.z < -1.96 ? ' ⬇️' : ''}</small>` : ''}</td></tr>`).join('')}</table>
    <div class="nota">Puntos de cada uno menos la media de los demás en la misma mano: <b>cuanto más negativo, mejor</b>. El ± es el margen de error: si dos niveles se solapan, aún no se puede decir cuál es mejor. 🤏 = menos de 100 manos. «Gana»: partidas ganadas; «esp.» son las que tocarían por azar si todas jugaran igual (⬆️ / ⬇️: gana de verdad más o menos de la cuenta). Cuenta por nivel, no por personaje.</div>`;
}
const guardarEst = () => { if (!EST.desde) EST.desde = new Date().toISOString().slice(0, 10); LS.set('mc-estad', EST); };
function anotarTirada(mano, id) {
  // ¿había algo mejor? (lo mismo que miraría la rival Difícil)
  const c = mano.find(x => x.id === id); if (!c) return;
  EST.tiradas++;
  if (mejorCierre(mano, G.cogida)) EST.cierresPerdidos++;
  const mejor = mejorTirada(YO, mano, 2, G.cogida);
  const mia = evaluar(mano.filter(x => x !== c), 2).v - valor(c) * 0.01 + peligro(c, YO) * 0.6;
  if (mejor && mia - mejor.v >= 2.5) EST.mejorables++;
  guardarEst();
}
let chinchonNeto = 0; // lo cobrado o pagado por chinchones en esta partida
function cobroChinchon(res) {
  // devuelve {quien, precio, pagan} si en esta mano hubo chinchón limpio que se cobra
  const precio = S.precioChinchon ?? 1;
  if (!res || !res.chinchon || !res.chinchon.limpio || !precio) return null;
  const pagan = activos().filter(k => k !== res.cierra).length;
  return { quien: res.cierra, precio, pagan };
}
function anotarMano(res) {
  try { anotarLiga(res); } catch (e) { console.warn('liga', e); }
  if (res.anotada) return; res.anotada = true;
  const ch = cobroChinchon(res);
  if (ch) {
    const mov = ch.quien === YO ? ch.precio * ch.pagan : (G.jugadores[YO].fuera ? 0 : -ch.precio);
    chinchonNeto = Math.round((chinchonNeto + mov) * 100) / 100;
    CART.saldo = Math.round((CART.saldo + mov) * 100) / 100; guardarCartera();
    EST.euros = Math.round((EST.euros + mov) * 100) / 100;
  }
  const f = res.filas.find(x => x.i === YO); if (!f) return;
  EST.manos++;
  if (res.cierra === YO) { EST.cierres++; if (f.puntos === -10) EST.menos10++; if (res.chinchon && res.chinchon.limpio) EST.chinchones++; }
  else { EST.pillada++; EST.puntos += f.puntos; EST.figurasPilladas += f.sueltas.filter(c => !c.j && c.r >= 10).length; }
  guardarEst();
}
const media = (a, b, d = 1) => b ? (a / b).toLocaleString('es-ES', { maximumFractionDigits: d }) : '–';
function consejosPersonales(E = EST) {
  const t = [];
  if (E.manos < 3) return ['Juega unas cuantas manos y aquí te diré en qué puedes mejorar 😊'];
  if (E.cierresPerdidos > 0) t.push(`Has dejado pasar <b>${E.cierresPerdidos}</b> ${E.cierresPerdidos === 1 ? 'ocasión' : 'ocasiones'} de cerrar. Cuando salga «✅ Cierra», ¡plántate!`);
  if (E.pillada >= 3 && E.figurasPilladas / E.pillada >= 0.8) t.push(`Cuando cierra alguien te pilla con <b>${media(E.figurasPilladas, E.pillada)}</b> figuras de media. Suelta antes las sotas, caballos y reyes sueltos`);
  if (E.tiradas >= 10 && E.mejorables / E.tiradas >= 0.15) t.push(`En <b>${Math.round(100 * E.mejorables / E.tiradas)}</b> de cada 100 tiradas había una carta mejor para tirar. Prueba el botón 💡 de vez en cuando para comparar`);
  if (E.manos >= 6 && E.cierres / E.manos < 0.2) t.push('Cierras pocas manos. Guarda una carta baja (as, 2 o 3) para poder plantarte antes');
  if (E.pillada >= 3 && E.puntos / E.pillada > 18) t.push('Cuando cierran otras te comes muchos puntos. Si una coge dos veces del montón, suelta tus cartas altas');
  if (!t.length) t.push('¡Vas de maravilla! Sigue así: cierra pronto y no regales cartas 🏆');
  return t.slice(0, 3);
}
// Junta las cuentas de este aparato con las que hay en la nube (cada aparato suma lo suyo)
window.mezclarCuenta = (previo, yo) => {
  // ¿algún aparato pidió empezar de cero después de lo último que vio este?
  const rNube = (previo && previo.reinicios) || {};
  window.aplicarReinicios(rNube);
  const d = window.datosNube(), rLoc = d.reinicios || {};
  const reinicios = { est: Math.max(rNube.est || 0, rLoc.est || 0), mon: Math.max(rNube.mon || 0, rLoc.mon || 0) };
  const aparatos = Object.assign({}, previo && previo.aparatos);
  // versión antigua (sin aparatos): si este aparato no las contiene, se conservan como «antiguo»
  if (previo && !previo.aparatos && previo.estad && (previo.estad.partidas || 0) > (d.estad.partidas || 0)) aparatos.antiguo = previo.estad;
  // el aparato que hizo esas partidas «antiguas» las trae consigo: no contarlas dos veces
  if (!aparatos[yo] && aparatos.antiguo && (d.estad.partidas || 0) >= (aparatos.antiguo.partidas || 0)) delete aparatos.antiguo;
  aparatos[yo] = d.estad;
  // tras un «empezar de cero», lo que otros aparatos subieron antes ya no cuenta
  for (const [k, v] of Object.entries(aparatos)) if (k !== yo && v) {
    if (reinicios.est && (v.t || 0) < reinicios.est) aparatos[k] = Object.assign({}, v, Object.fromEntries(Object.keys(v).filter(x => !['saldoNeto', 'jugadasC', 'ganadasC', 't'].includes(x)).map(x => [x, typeof v[x] === 'number' ? 0 : v[x]])));
    if (reinicios.mon && (v.t || 0) < reinicios.mon) aparatos[k] = Object.assign({}, aparatos[k], { saldoNeto: 0 });
  }
  d.estad.t = Date.now();
  const suma = {};
  for (const e of Object.values(aparatos)) for (const [k, v] of Object.entries(e || {})) if (typeof v === 'number') suma[k] = Math.round(((suma[k] || 0) + v) * 100) / 100;
  const publicos = ['partidas', 'ganadas', 'manos', 'cierres', 'menos10', 'chinchones', 'rayas', 'euros']
    .concat(Object.keys(EST0).filter(k => /^lg_yo_|^lgx_/.test(k)));
  const estad = Object.fromEntries(publicos.map(k => [k, suma[k] || 0]));
  return { nombre: d.nombre, avatar: d.avatar, estad, aparatos, reinicios };
};
/* ---------- Cuentas de la cuenta de Google: suma de todos los aparatos ---------- */
const SALDO0 = 10;
function idAparato() { try { return localStorage.getItem('mc-aparato'); } catch (e) { return null; } }
function otrosAparatos() {
  const c = window.Nube && window.Nube.usuario && window.__cuenta; if (!c) return [];
  const yo = idAparato();
  return Object.entries(c).filter(([k]) => k !== yo).map(([, v]) => v || {});
}
function estCuenta() {
  const e = Object.assign({}, EST);
  for (const o of otrosAparatos()) {
    for (const k of Object.keys(EST0)) if (typeof EST0[k] === 'number' && typeof o[k] === 'number') e[k] = k === 'manosMax' ? Math.max(e[k], o[k]) : Math.round((e[k] + o[k]) * 100) / 100;
    if (o.desde && (!e.desde || o.desde < e.desde)) e.desde = o.desde;
  }
  return e;
}
function saldoCuenta() { return Math.round((CART.saldo + otrosAparatos().reduce((a, o) => a + (o.saldoNeto || 0), 0)) * 100) / 100; }
function cartCuenta() { const o = otrosAparatos(); return { jugadas: CART.jugadas + o.reduce((a, x) => a + (x.jugadasC || 0), 0), ganadas: CART.ganadas + o.reduce((a, x) => a + (x.ganadasC || 0), 0) }; }
function enCuenta() { return !!(window.Nube && window.Nube.usuario && window.__cuenta); }
// otro aparato pidió empezar de cero: se aplica aquí también
window.aplicarReinicios = r => {
  if (!r) return;
  const loc = LS.get('mc-reinicios', {});
  if (r.est && r.est > (loc.est || 0)) { EST = Object.assign({}, EST0); LS.set('mc-estad', EST); loc.est = r.est; }
  if (r.mon && r.mon > (loc.mon || 0)) { CART.saldo = SALDO0; guardarCartera(); loc.mon = r.mon; }
  LS.set('mc-reinicios', loc);
};
window.marcarReinicio = k => { const loc = LS.get('mc-reinicios', {}); loc[k] = Date.now(); LS.set('mc-reinicios', loc); return loc[k]; };
window.addEventListener('cuenta', () => {
  if (!$('inicio').classList.contains('oculto')) { $('saldo').textContent = euros(saldoCuenta()); const c = cartCuenta(); $('estad').textContent = c.jugadas ? `Partidas: ${c.jugadas} · Ganadas: ${c.ganadas}` : ''; }
  if (document.querySelector('section#estad:not(.oculto)')) pintarEstad();
});
function pintarEstad() {
  const e = estCuenta(), saldo = saldoCuenta();
  const tile = (n, l, cls = '') => `<div class="tile ${cls}"><b>${n}</b><span>${l}</span></div>`;
  $('estadDatos').innerHTML = `
    <div class="grupo"><h3>🃏 Partidas</h3><div class="tiles">
      ${tile(e.partidas, 'jugadas')}${tile(e.ganadas, 'ganadas')}${tile(e.partidas ? Math.round(100 * e.ganadas / e.partidas) + ' %' : '–', 'de victorias')}
      ${tile(e.partidasContadas ? (e.manosPartidas / e.partidasContadas).toFixed(1).replace('.', ',') : '–', 'manos por partida (media)')}${tile(e.manosMax || '–', 'manos en la partida más larga')}
    </div></div>
    <div class="grupo"><h3>✋ Manos</h3><div class="tiles">
      ${tile(e.manos, 'jugadas')}${tile(e.cierres, 'cerradas por ti')}${tile(e.menos10, 'con −10')}
      ${tile(e.chinchones, 'chinchones 🎉')}${tile(media(e.puntos, e.pillada), 'puntos que te comes cuando cierra alguien')}${tile(media(e.figurasPilladas, e.pillada), 'figuras sueltas cuando te pillan')}
    </div></div>
    <div class="grupo"><h3>💰 Dinero de mentira</h3><div class="tiles">
      ${tile(e.rayas, 'rayas apuntadas')}${tile(euros(e.euros), e.euros >= 0 ? 'ganados' : 'perdidos', e.euros >= 0 ? 'bien' : 'mal')}${tile(euros(saldo), 'en el monedero')}
    </div></div>
    <div class="grupo"><h3>🏆 Liga de niveles</h3>${pintarLiga(e)}</div>
    <div class="grupo"><h3>🧠 Estilo de cada jugador</h3><div id="perfil"><div class="nota">Cargando…</div></div></div>
    <div class="grupo"><h3>💡 Tus consejos</h3><ul class="consejos">${consejosPersonales(e).map(x => `<li>${x}</li>`).join('')}</ul>
      ${e.desde ? `<div class="nota">Desde el ${e.desde.split('-').reverse().join('/')}</div>` : ''}
      <div class="nota">${enCuenta() ? '☁️ Suma de todos tus aparatos con tu cuenta de Google' : NUBE_OK ? 'Solo de este aparato. Entra con Google para juntar las de todos tus aparatos.' : ''}</div></div>`;
  pintarPerfil();
}
$('bEstad').onclick = () => { ir('estad'); subirNube(); };
$('bBorrarEstad').onclick = () => ventana(`<h2>¿Empezar de cero?</h2><div class="sub">Se borran las estadísticas${enCuenta() ? ' de todos tus aparatos' : ''} (el monedero no).</div>`,
  [{ t: 'Sí, borrar', f: () => { EST = Object.assign({}, EST0); LS.set('mc-estad', EST); if (enCuenta()) { window.marcarReinicio('est'); window.__cuenta = null; subirNube(); } pintarEstad(); } }, { t: 'No', clase: 'no' }]);

