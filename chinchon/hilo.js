// Mi Chinchorro — la Experta piensa en otro hilo (chinchon/ia-worker.js) para que la pantalla no se congele.
// Si el hilo no está disponible, falla o tarda más de 15 s, piensa aquí como siempre: la partida nunca se para.
let HILO = null, hiloN = 0;
const hiloEsperas = new Map();
function hiloIA() {
  if (HILO === false) return null;
  if (HILO) return HILO;
  try {
    HILO = new Worker('chinchon/ia-worker.js');
    HILO.onmessage = e => { const f = hiloEsperas.get(e.data.n); if (f) { hiloEsperas.delete(e.data.n); f(e.data); } };
    HILO.onerror = ev => { console.warn('hilo de la Experta', ev && ev.message); HILO = false; hiloEsperas.forEach(f => f({ ok: false })); hiloEsperas.clear(); };
  } catch (e) { HILO = false; }
  return HILO || null;
}
async function iaTiradaHilo(i) {
  const p = G.jugadores[i];
  if ((p.nivel ?? S.nivel) !== 3) return iaTirada(i);     // solo la Experta piensa lo bastante como para notarse
  const w = hiloIA();
  if (!w) return iaTirada(i);
  const n = ++hiloN;
  const r = await new Promise(res => {
    const to = setTimeout(() => { if (hiloEsperas.delete(n)) res({ ok: false, err: 'tarda demasiado' }); }, 15000);
    hiloEsperas.set(n, x => { clearTimeout(to); res(x); });
    try { w.postMessage({ n, i, S: Object.assign({}, S), G }); }
    catch (e) { hiloEsperas.delete(n); clearTimeout(to); res({ ok: false, err: String(e) }); }
  });
  const carta = r.ok ? p.mano.find(c => c.id === r.id) : null;
  if (!carta) { if (r.err) console.warn('hilo de la Experta:', r.err); return iaTirada(i); }
  return { carta, cierra: r.cierra };
}
