// Huella del motor: juega partidas completas entre bots con semillas fijas y resume todas las jugadas en un hash.
// Si dos versiones del código dan la misma huella, el motor juega exactamente igual.
//   node herramientas/huella.js            (Fácil, Normal, Difícil: 30 partidas; Experta: 2)
//   node herramientas/huella.js 100 4      (partidas por nivel, partidas de Experta)
const crypto = require('crypto');
const N = +process.argv[2] || 30, NX = +(process.argv[3] ?? 2);
function generador(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const E = require('./motor-node.js');
const cc = c => c ? (c.j ? '*' : c.r + 'ocebs'[c.s]) : '-';

function partida(nivel, seed) {
  E.setS(Object.assign({}, E.DEF, { nivel, niveles: null }));
  E.semilla(seed); Math.random = generador(seed * 7919 + 1);
  const G = E.nuevaPartida('Tú');
  const log = [];
  let guard = 0;
  while (!E.G.terminada && guard++ < 500) {
    E.repartir();
    log.push('M' + E.G.manoN + ':' + E.G.jugadores.map(j => j.mano.map(cc).join('')).join('|') + '/' + cc(E.G.descarte[0]));
    let res = null, t = 0;
    while (!res && t++ < 400) {
      const i = E.G.turno, desc = E.iaRobo(i), c = E.robar(i, desc);
      if (!c) break;
      const d = E.iaTirada(i);
      log.push(i + (desc ? 'D' : 'M') + cc(c) + (d.cierra ? 'C' : 'T') + cc(d.carta));
      if (d.cierra) res = E.cerrar(i, d.carta.id); else E.tirar(i, d.carta.id);
    }
    log.push('P' + E.G.jugadores.map(j => j.puntos + '/' + j.rayas + (j.fuera ? 'F' : '')).join(','));
    if (!res) continue;
    if (res.finPartida) break;
    E.comprobarFin();
  }
  log.push('G' + E.G.ganador);
  return log.join('\n');
}

const nombres = ['Fácil', 'Normal', 'Difícil', 'Experta'];
const total = crypto.createHash('sha256');
for (let nivel = 0; nivel < 4; nivel++) {
  const n = nivel === 3 ? NX : N, h = crypto.createHash('sha256'), t0 = Date.now();
  let manos = 0;
  for (let k = 0; k < n; k++) { const l = partida(nivel, 1000 + k); manos += (l.match(/^M/gm) || []).length; h.update(l); total.update(l); }
  console.log(`${nombres[nivel].padEnd(8)} ${String(n).padStart(3)} partidas, ${String(manos).padStart(4)} manos: ${h.digest('hex').slice(0, 16)}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
console.log('TOTAL', total.digest('hex').slice(0, 16));
