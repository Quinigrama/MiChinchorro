// Mi Chinchorro — nube: Google y récords (parte de la interfaz)
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Nube: Google + récords (solo en la web publicada) ---------- */
const NUBE_OK = /(^|\.)quinigrama\.github\.io$/.test(location.hostname) || location.hostname === 'localhost' || window.__nubePrueba;
function datosNube() {
  const e = EST;
  return { nombre: (PREF.nombre || 'Sin nombre').slice(0, 24), avatar: miAvatar(),
    estad: Object.assign({}, e, { saldoNeto: Math.round((CART.saldo - SALDO0) * 100) / 100, jugadasC: CART.jugadas, ganadasC: CART.ganadas }),
    reinicios: LS.get('mc-reinicios', {}) };
}
window.datosNube = datosNube;
function subirNube() { try { if (window.Nube && window.Nube.usuario) window.Nube.subir().catch(() => {}); } catch (e) {} }
function pintarNube() {
  const caja = $('nubeCaja'); if (!caja) return;
  caja.classList.toggle('oculto', !NUBE_OK);
  const u = window.Nube && window.Nube.usuario;
  $('bEntrar').classList.toggle('oculto', !!u);
  $('bRecords').classList.toggle('oculto', !u);
  $('bOnline').classList.toggle('oculto', !u);
  $('nubeQuien').innerHTML = u ? `Sesión iniciada: ${esc(u.displayName || u.email || '')} · <a href="#" id="bSalirNube" style="color:var(--oro)">salir</a>` : '';
  const s = $('bSalirNube'); if (s) s.onclick = ev => { ev.preventDefault(); window.Nube.salir().then(pintarNube); };
}
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
window.addEventListener('nube', () => {
  const u = window.Nube && window.Nube.usuario;
  if (u && u.photoURL && PREF.fotoGoogle !== u.photoURL) { PREF.fotoGoogle = u.photoURL; LS.set('mc-ajustes2', PREF); }
  pintarNube(); if (!$('records').classList.contains('oculto')) pintarRecords();
  if (INVITA && !ONLINE) atenderInvitacion(); else if (u) volverSolo(); });
$('bEntrar').onclick = async () => {
  if (!window.Nube) return aviso('Sin conexión ahora mismo 📵');
  try {
    aviso('Abriendo Google…'); await window.Nube.entrar(); try { localStorage.setItem('mc-nube', '1'); } catch (e) {}
    const u = window.Nube.usuario || {};
    if (u.photoURL) { PREF.fotoGoogle = u.photoURL; if (!PREF.avatar || /^letra:/.test(PREF.avatar)) PREF.avatar = 'google'; LS.set('mc-ajustes2', PREF); }
    pintarNube(); pintarInicio(); subirNube(); recCache = null;
    aviso(PREF.avatar === 'google' ? '¡Dentro! ☁️ Ya tienes tu foto de Google y puedes ver los récords' : '¡Dentro! ☁️ Ya puedes ver los récords (tu foto de Google está en ⚙️ Perfil)');
  }
  catch (e) { aviso(/popup/i.test(e && e.code || '') ? 'Se cerró la ventana de Google' : 'No se pudo entrar. ¿Hay internet?'); }
};
$('bRecords').onclick = () => ir('records');
let recOrden = 'ganadas', recCache = null;
const REC_TABS = [['ganadas', '🏆 Ganadas'], ['pct', '% Victorias'], ['chinchones', '🎉 Chinchón'], ['menos10', '✨ −10'], ['rayas', '✏️ Rayas']];
function avatarSeguro(k) { return (typeof k === 'string' && (PERSONAJES[k] || FOTO_OK.test(k) || /^letra:[^:<>"]{1,2}:#[0-9a-f]{6}$/i.test(k))) ? k : 'letra:?:#888888'; }
async function pintarRecords() {
  $('recTabs').innerHTML = REC_TABS.map(([k, l]) => `<button data-rec="${k}" aria-pressed="${recOrden === k}">${l}</button>`).join('');
  $('recTabs').querySelectorAll('button').forEach(b => b.onclick = () => { recOrden = b.dataset.rec; pintarRecords(); });
  const lista = $('recLista');
  if (!window.Nube || !window.Nube.usuario) { lista.innerHTML = '<div class="grupo">Entra con Google desde el inicio para ver los récords.</div>'; return; }
  if (!recCache) lista.innerHTML = '<div class="grupo">Cargando récords… ⏳</div>';
  try {
    if (!recCache || Date.now() - recCache.t > 30000) { await window.Nube.subir().catch(() => {}); recCache = { t: Date.now(), datos: await window.Nube.records() }; }
  } catch (e) { lista.innerHTML = '<div class="grupo">No se pudieron cargar los récords. ¿Hay internet? 📵</div>'; return; }
  const yo = window.Nube.usuario.uid;
  const filas = recCache.datos.filter(d => d.estad && d.estad.partidas > 0).map(d => {
    const e = d.estad; return { id: d.id, nombre: d.nombre, avatar: avatarSeguro(d.avatar), e, pct: e.partidas ? Math.round(100 * e.ganadas / e.partidas) : 0 };
  });
  const val = f => recOrden === 'pct' ? f.pct : (f.e[recOrden] || 0);
  const asc = recOrden === 'rayas';
  filas.sort((a, b) => asc ? (val(a) / Math.max(1, a.e.partidas)) - (val(b) / Math.max(1, b.e.partidas)) : val(b) - val(a) || b.e.partidas - a.e.partidas);
  if (!filas.length) { lista.innerHTML = '<div class="grupo">Todavía no hay récords. ¡Juega una partida y serás la primera! 🥇</div>'; return; }
  // liga global: todas las personas juntas frente a cada nivel de bots
  const g = {}; let gente = 0;
  for (const d of recCache.datos) {
    const e = d.estad || {}; if (!e.lg_yo_m) continue; gente++;
    for (const c of LIGA_C) {
      g[`lg_yo_${c}`] = (g[`lg_yo_${c}`] || 0) + (e[`lg_yo_${c}`] || 0);
      for (const L of ['n5', 'n4', 'n3', 'n2', 'n1', 'n0']) g[`lg_${L}_${c}`] = (g[`lg_${L}_${c}`] || 0) + (e[`lgx_${L}_${c}`] || 0);
    }
  }
  const ligaGlobal = gente ? `<div class="grupo"><h3>🌍 Liga global de niveles</h3>${pintarLiga(g, { yo: `🙋 Personas (${gente})` })}</div>` : '';
  const medalla = k => ['🥇', '🥈', '🥉'][k] || (k + 1) + '.';
  const etiqueta = f => recOrden === 'pct' ? f.pct + ' %' : recOrden === 'rayas' ? `${media(f.e.rayas, f.e.partidas)} por partida` : val(f);
  lista.innerHTML = ligaGlobal + filas.slice(0, 50).map((f, k) => `<div class="recfila ${f.id === yo ? 'mia' : ''}">
      <span class="pos">${medalla(k)}</span><span class="avatar">${conInicial(f.nombre, () => avatarSVG(f.avatar))}</span>
      <span class="rnom">${esc(f.nombre || 'Sin nombre')}<small>${f.e.partidas} partidas · ${f.e.ganadas} ganadas</small></span>
      <b class="rval">${etiqueta(f)}</b></div>`).join('')
    + (asc ? '<div class="nota">En rayas gana quien menos paga por partida 😉</div>' : '');
}
pintarNube();

ir('inicio');
setTimeout(volverSolo, 400);
// Funciona sin internet una vez instalada
if ('serviceWorker' in navigator && location.protocol === 'https:') { try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {} }
