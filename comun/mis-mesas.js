// Mi Chinchorro — mis mesas, invitaciones y sillas durante la partida
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Mis mesas ---------- */
const DIAS_CADUCA = 90;
const misCodigos = () => LS.get('mc-mismesas', []);
function recordarMesa(c) { const l = misCodigos().filter(x => x !== c); l.unshift(c); LS.set('mc-mismesas', l.slice(0, 40)); LS.set('mc-ocultas', LS.get('mc-ocultas', []).filter(x => x !== c)); }
function olvidarMesa(c) { LS.set('mc-mismesas', misCodigos().filter(x => x !== c)); }
function haceCuanto(t) {
  if (!t) return '';
  const d = Math.floor((Date.now() - t) / 864e5);
  if (d <= 0) return new Date(t).toDateString() === new Date().toDateString() ? 'hoy' : 'ayer';
  return d === 1 ? 'ayer' : `hace ${d} días`;
}
function nombreMesa(m) { return (m && m.nombre) || `Mesa de ${(m && m.nombreAnf) || '…'}`; }
const ESTADO_MESA = { espera: '🪑 Esperando', jugando: '▶ Jugando', pausa: '⏸ En pausa', fin: '🏁 Terminada' };
async function pintarMisMesas() {
  const caja = $('listaMesas'); if (!caja) return;
  const red = RED(), uid = miUid(); if (!red) { caja.innerHTML = '<div class="nota">Sin conexión ahora mismo 📵</div>'; return; }
  let lista = [];
  try { lista = await red.misMesas(uid); } catch (e) { console.warn('misMesas', e); }
  const vistas = new Set(lista.map(m => m.codigo));
  for (const c of misCodigos()) if (!vistas.has(c)) { try { const m = await red.leer(c); if (m) lista.push(Object.assign({ codigo: c }, m)); else olvidarMesa(c); } catch (e) {} }
  const ocultas = new Set(LS.get('mc-ocultas', []));
  // limpieza: las mesas mías sin jugar en 90 días se cierran solas
  const ahora = Date.now();
  for (const m of lista.slice()) {
    const act = m.actividad || m.creada || 0;
    if (m.anfitrion === uid && act && ahora - act > DIAS_CADUCA * 864e5) { red.borrarMesa(m.codigo).catch(() => {}); lista.splice(lista.indexOf(m), 1); }
  }
  lista = lista.filter(m => !ocultas.has(m.codigo) && !(m.reglas && m.reglas.juego && m.reglas.juego !== 'chinchon')).sort((a, b) => (b.actividad || b.creada || 0) - (a.actividad || a.creada || 0));
  if (!$('listaMesas')) return;
  if (!lista.length) { $('listaMesas').innerHTML = '<div class="nota">Aún no tienes mesas. Crea una abajo o siéntate con un código 👇</div>'; return; }
  $('listaMesas').innerHTML = lista.map(m => {
    const mia = m.anfitrion === uid, act = m.actividad || m.creada || 0;
    const quedan = DIAS_CADUCA - Math.floor((ahora - act) / 864e5);
    const gente = m.publico && m.publico.jugadores ? m.publico.jugadores.map(j => j.nombre) : [m.nombreAnf];
    return `<div class="mesaFila" data-c="${m.codigo}">
      <button class="mesaAbrir" data-c="${m.codigo}"><b>${esc(nombreMesa(m))}</b> <span class="mesaCod">${m.codigo}</span>
        <small>${ESTADO_MESA[m.cancelada ? 'fin' : m.estado] || ''} · ${mia ? 'tuya' : 'de ' + esc(m.nombreAnf || '…')} · ${haceCuanto(act)}</small>
        <small style="opacity:.75">${esc(gente.filter(Boolean).join(', '))}</small>
        ${mia && quedan <= 15 ? `<small style="color:var(--oro)">⏳ Se cerrará en ${Math.max(1, quedan)} días si no jugáis</small>` : ''}</button>
      <button class="mesaQuitar" data-c="${m.codigo}" data-mia="${mia ? 1 : ''}" data-n="${esc(nombreMesa(m))}" aria-label="${mia ? 'Cerrar mesa' : 'Quitar de mi lista'}">${mia ? '🗑' : '✕'}</button></div>`;
  }).join('');
  $('listaMesas').querySelectorAll('.mesaAbrir').forEach(b => b.onclick = () => abrirMesa(b.dataset.c));
  $('listaMesas').querySelectorAll('.mesaQuitar').forEach(b => b.onclick = () => b.dataset.mia ? confirmarCerrar(b.dataset.c, b.dataset.n) : quitarMesa(b.dataset.c, b.dataset.n));
}
function confirmarCerrar(c, nombre) {
  ventana(`<h2>¿Cerrar la mesa?</h2><div class="sub">«${esc(nombre || c)}» se borrará para todos y no se podrá seguir la partida.</div>`,
    [{ t: '🗑 Cerrar mesa', f: async () => {
      const red = RED(); if (!red) return aviso('Sin conexión ahora mismo 📵');
      const enEsta = ONLINE && ONLINE.codigo === c;
      if (enEsta) { salirOnline(false); token++; $('velo').classList.add('oculto'); }
      try { await red.borrarMesa(c); olvidarMesa(c); aviso('Mesa cerrada 🗑'); } catch (e) { aviso('No se pudo cerrar la mesa 📵'); }
      if (enEsta || !$('online').classList.contains('oculto')) { ir('online'); pantallaOnline(); }
    } }, { t: 'No', clase: 'no' }]);
}
function quitarMesa(c, nombre) {
  ventana(`<h2>¿Quitar de tu lista?</h2><div class="sub">Dejarás de ver «${esc(nombre || c)}». Podrás volver a sentarte con el código ${c}.</div>`,
    [{ t: '✕ Quitar', f: async () => {
      olvidarMesa(c); LS.set('mc-ocultas', LS.get('mc-ocultas', []).concat(c).slice(-60));
      try { await RED().levantar(c, miUid()); } catch (e) {}
      pantallaOnline();
    } }, { t: 'No', clase: 'no' }]);
}
async function abrirMesa(c) {
  try { if (window.Nube && !window.Nube.red && !window.__redLocal) await window.Nube.cargar(); } catch (e) {}
  if (!miUid()) return aviso('Entra antes con Google ☁️');
  const red = RED(); if (!red) return aviso('Sin conexión ahora mismo 📵');
  let m = null;
  try { m = await red.leer(c); } catch (e) { return aviso('No se pudo mirar la mesa 📵'); }
  if (!m || m.cancelada) { olvidarMesa(c); if (LS.get('mc-online', {}) && (LS.get('mc-online', {}) || {}).codigo === c) LS.del('mc-online'); if (!$('online').classList.contains('oculto')) pantallaOnline(); return aviso('Esa mesa ya no existe'); }
  // las mesas de otros juegos (el julepe de MisNaipes) se abren en su app
  if (m.reglas && m.reglas.juego === 'julepe') return ventana(`<h2>Esa mesa es de julepe 🂠</h2><div class="sub">La mesa ${c} es del julepe de MisNaipes.</div>`,
    [{ t: '🂠 Abrirla en MisNaipes', f: () => { location.href = '../MisNaipes/julepe/?mesa=' + c; } }, { t: 'No', clase: 'no' }]);
  const uid = miUid(), mia = m.anfitrion === uid;
  const estoy = !!(m.publico && m.publico.jugadores && m.publico.jugadores.some(j => j.uid === uid));
  if (mia) {
    if (m.estado === 'espera') return abrirSala(c, m);
    if (m.estado === 'fin') return nuevaRonda(c, m);
    return reanudarMesa(c, m);
  }
  recordarMesa(c);
  if (m.estado === 'pausa') return aviso(`⏸ En pausa: espera a que ${m.nombreAnf || 'quien creó la mesa'} la siga`);
  if (m.estado === 'jugando') return estoy ? entrarInvitado(c, m, true) : elegirSitio(c, m);
  try { await red.sentar(c, uid, limpiar({ nombre: PREF.nombre || 'Invitado', avatar: miAvatar(), gen: PREF.genero || null, t: Date.now() })); } catch (e) { return aviso('No se pudo entrar en la mesa 📵'); }
  entrarInvitado(c, m, false);
}
/* ---------- Invitaciones: enlace ?mesa=CÓDIGO ---------- */
function atenderInvitacion() {
  if (!INVITA || !NUBE_OK) return;
  if (ONLINE) {
    if (ONLINE.codigo === INVITA) aviso('Ya estás en esta mesa 👍'); else aviso(`Ya estás en la mesa ${ONLINE.codigo}`);
    INVITA = null; return;
  }
  const visible = id => !$(id).classList.contains('oculto');
  if (!visible('inicio') && !visible('online')) return aviso(`Te invitan a la mesa ${INVITA} 🃏 Sal de esta partida para sentarte`);
  const mo = LS.get('mc-online', null);
  if (miUid() && mo && mo.codigo === INVITA) { INVITA = null; return volverMesa(); }   // es tu mesa (o ya estabas sentado)
  ir('online'); pantallaOnline();
}
// Si la app ya estaba abierta, el enlace llega aquí sin recargar la página
try {
  if ('launchQueue' in window) window.launchQueue.setConsumer(p => {
    try {
      const c = (new URL(p.targetURL).searchParams.get('mesa') || '').trim().toUpperCase();
      if (/^[A-Z]{4}$/.test(c)) { INVITA = c; atenderInvitacion(); }
    } catch (e) {}
  });
} catch (e) {}
// Al volver a abrir la app (p. ej. tras compartir por WhatsApp), regresar a la mesa sola
let autoVuelta = false;
function volverSolo() {
  if (autoVuelta || ONLINE || INVITA || !miUid() || !NUBE_OK) return;
  const mo = LS.get('mc-online', null);
  if (!mo || !mo.t || Date.now() - mo.t > 3 * 3600e3 || $('inicio').classList.contains('oculto')) return;
  autoVuelta = true; volverMesa();
}
function enlaceMesa(c) { return location.origin + location.pathname.replace(/index\.html$/, '') + '?mesa=' + c; }
function textoInvitacion(c) {
  const n = ONLINE && ONLINE.nombre ? ` «${ONLINE.nombre}»` : '';
  return `🃏 ¡${PREF.nombre || 'Te'} ${PREF.nombre ? 'te invita' : 'invitan'} a la mesa${n} de Mi Chinchorro!\nCódigo: ${c}\nEntra aquí 👉 ${enlaceMesa(c)}`;
}
async function invitar() {
  const c = ONLINE && ONLINE.codigo; if (!c) return;
  const txt = textoInvitacion(c);
  if (navigator.share) {
    try { await navigator.share({ title: 'Mi Chinchorro', text: txt }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const caja = $('cajaCompartir'); if (!caja) return;
  const t = encodeURIComponent(txt);
  caja.innerHTML = `<div class="compartir">
    <a href="https://wa.me/?text=${t}" target="_blank" rel="noopener">💬 WhatsApp</a>
    <a href="https://t.me/share/url?url=${encodeURIComponent(enlaceMesa(c))}&text=${encodeURIComponent(txt.split('\n').slice(0, 2).join('\n'))}" target="_blank" rel="noopener">✈️ Telegram</a>
    <a href="mailto:?subject=${encodeURIComponent('Partida de Mi Chinchorro')}&body=${t}">✉️ Email</a>
    <button id="bCopiarInv">📋 Copiar</button></div>`;
  $('bCopiarInv').onclick = async () => { try { await navigator.clipboard.writeText(txt); aviso('Invitación copiada 📋'); } catch (e) { aviso('No se pudo copiar'); } };
}
async function crearMesa(nombre) {
  const red = RED(); if (!red) return aviso('Sin conexión ahora mismo 📵');
  const uid = miUid();
  let codigo = null, datos = null;
  for (let k = 0; k < 6 && !codigo; k++) {
    const c = Array.from({ length: 4 }, () => LETRAS_COD[Math.floor(Math.random() * LETRAS_COD.length)]).join('');
    datos = limpiar({ anfitrion: uid, nombreAnf: PREF.nombre || 'Anfitriona', avatarAnf: miAvatar(), nombre: (nombre || '').slice(0, 24), miembros: [uid], estado: 'espera', reglas: reglasMesa(), creada: Date.now(), actividad: Date.now() });
    try { await red.crear(c, datos); codigo = c; } catch (e) { if (!/existe|exists|permission/i.test(String(e && (e.code || e.message)))) { aviso('No se pudo crear la mesa 📵'); return; } }
  }
  if (!codigo) return aviso('No se pudo crear la mesa, prueba otra vez');
  abrirSala(codigo, datos);
}
function abrirSala(codigo, m) {
  const red = RED(), uid = miUid();
  if (ONLINE) salirOnline(false);
  const total = Math.min(5, Math.max(2, (m && m.total) || PREF.jugadores));
  ONLINE = { rol: 'anfitrion', codigo, uid, sentados: [], unsubs: [], nombreAnf: PREF.nombre, nombre: (m && m.nombre) || '', miembros: ((m && m.miembros) || [uid]).slice(),
    total, personas: Math.min(total, (m && m.personas) || 2) };
  recordarMesa(codigo);
  LS.set('mc-online', { rol: 'anfitrion', codigo, espera: true, nombreAnf: PREF.nombre, t: Date.now() });
  escucharSillas(codigo);
  ir('online'); salaAnfitrion();
}
function escucharSillas(codigo) {
  const red = RED(), uid = miUid();
  ONLINE.unsubs.push(red.escucharSentados(codigo, l => {
    if (!ONLINE || ONLINE.codigo !== codigo || ONLINE.rol !== 'anfitrion') return;
    ONLINE.sentados = l.filter(x => x.uid !== uid).sort((a, b) => (a.t || 0) - (b.t || 0));
    ONLINE.sillasListas = true;
    const nuevos = ONLINE.sentados.map(x => x.uid).filter(u => !ONLINE.miembros.includes(u));
    if (nuevos.length) { ONLINE.miembros = ONLINE.miembros.concat(nuevos); red.publicar(codigo, { miembros: ONLINE.miembros, actividad: Date.now() }).catch(() => {}); }
    if (ONLINE.empezada) aplicarSillas(false); else salaAnfitrion();
  }));
}
/* ---------- Sillas durante la partida (solo el anfitrión) ---------- */
function botLibre() {
  const usados = new Set(G.jugadores.map(p => (p.nombre || '').toLowerCase()).concat((PREF.nombre || '').toLowerCase()));
  const n = rivalesElegidos().concat(NOMBRES_P).find(b => !usados.has(b.toLowerCase())) || 'Rival';
  return { nombre: n, avatar: n, nivel: (PREF.nivelDe || {})[n] ?? S.nivel };
}
function aBot(p) {
  const b = (p.bot && !G.jugadores.some(q => q !== p && q.nombre === p.bot.nombre)) ? p.bot : botLibre();
  Object.assign(p, { nombre: b.nombre, avatar: b.avatar, nivel: b.nivel, uid: null, remoto: false, humano: false, bot: b, rayas0: 0 });
}
// enAvanzar: se llama justo antes de decidir quién juega (momento seguro para cualquier silla)
function aplicarSillas(enAvanzar) {
  if (!ONLINE || ONLINE.rol !== 'anfitrion' || !G || G.terminada || !ONLINE.sillasListas) return;
  const sent = new Map(ONLINE.sentados.map(x => [x.uid, x]));
  const libre = i => G.anim == null && (enAvanzar || G.fase === 'resultado' || G.turno !== i);
  let cambio = false, turnoAfectado = false;
  // se fue (dejó la silla): la ocupa un bot
  G.jugadores.forEach((p, i) => {
    if (!p.remoto || sent.has(p.uid)) return;
    const esperando = G.turno === i && !G.anim;
    if (!libre(i) && !esperando) return;
    const nom = p.nombre; aBot(p); cambio = true;
    if (G.turno === i) turnoAfectado = true;
    pendEv.push({ t: 'sienta', txt: `${nom} se levanta: juega ${p.nombre} 🤖` }); mensaje(`${nom} se levanta: juega ${p.nombre} 🤖`);
  });
  // llega alguien que quiere una silla de bot
  for (const x of ONLINE.sentados) {
    if (G.jugadores.some(p => p.uid === x.uid)) continue;
    if (x.quiere === 'silla') {
      let i = x.i;
      const vale = k => k > 0 && G.jugadores[k] && !G.jugadores[k].remoto && !G.jugadores[k].humano;
      if (!vale(i)) i = G.jugadores.findIndex((p, k) => vale(k) && p.reservada);
      if (!vale(i)) i = G.jugadores.findIndex((p, k) => vale(k));
      if (i < 0 || !libre(i)) continue;
      const p = G.jugadores[i], antes = p.nombre;
      if (!p.bot) p.bot = { nombre: p.nombre, avatar: p.avatar, nivel: p.nivel };
      Object.assign(p, { nombre: x.nombre || 'Invitado', avatar: avatarSeguro(x.avatar), gen: x.gen === 'f' || x.gen === 'm' ? x.gen : null, uid: x.uid, remoto: true, humano: false, nivel: 1, reservada: false, rayas0: p.rayas });
      cambio = true;
      pendEv.push({ t: 'sienta', txt: `${p.nombre} se sienta en el sitio de ${antes} 🪑` }); aviso(`${p.nombre} se sienta en el sitio de ${antes} 🪑`);
    }
  }
  if (!cambio) return;
  guardar();
  if (!enAvanzar) {
    if (turnoAfectado) { clearTimeout(tRemoto); clearTimeout(tQuien); return avanzar(); }
    pintar(); pubOnline();
  } else pintar();
}
// sillas nuevas: entran al empezar una mano, reenganchadas con quien más tiene
function sillasNuevas() {
  if (!ONLINE || !ONLINE.sillasListas || !G) return;
  for (const x of ONLINE.sentados) {
    if (x.quiere !== 'nueva' || G.jugadores.length >= 5 || G.jugadores.some(p => p.uid === x.uid)) continue;
    const vivos = G.jugadores.filter(p => !p.fuera);
    const pts = vivos.length ? Math.max(...vivos.map(p => p.puntos)) : 0;
    G.jugadores.push({ nombre: x.nombre || 'Invitado', avatar: avatarSeguro(x.avatar), gen: x.gen === 'f' || x.gen === 'm' ? x.gen : null, uid: x.uid, remoto: true, humano: false, nivel: 1,
      puntos: pts, fuera: false, reeng: 0, rayas: 0, rayas0: 0, mano: [], ultimo: '' });
    S.jugadores = G.jugadores.length;
    if (S.jugadores >= 5 && S.baraja === 40) S.baraja = 48;   // con 5 la de 40 se queda sin mazo
    pendEv.push({ t: 'sienta', txt: `${x.nombre} se une a la mesa con ${pts} puntos ➕` }); aviso(`${x.nombre} se une a la mesa con ${pts} puntos ➕`);
  }
}
async function nuevaRonda(codigo, m) {
  const red = RED(); if (!red) return aviso('Sin conexión ahora mismo 📵');
  try { m = m || await red.leer(codigo); } catch (e) {}
  if (!m) return aviso('Esa mesa ya no existe');
  const otros = new Set((m.miembros || []).concat((m.publico && m.publico.jugadores || []).map(j => j.uid)).filter(u => u && u !== miUid()));
  await Promise.all([...otros].map(u => red.mano(codigo, u, []).catch(() => {})));
  await red.publicar(codigo, { estado: 'espera', publico: null, eventos: [], actividad: Date.now() }).catch(() => {});
  red.guardarPriv(codigo, { json: '' }).catch(() => {});
  abrirSala(codigo, m);
}
function asientosMesa() {
  const n = ONLINE.total || PREF.jugadores;
  const quieren = ONLINE.sentados.filter(h => h.quiere !== 'mirar');
  const hum = quieren.slice(0, n - 1);
  const personas = Math.max(ONLINE.personas || 1, hum.length + 1);
  const ocupados = new Set([PREF.nombre].concat(hum.map(h => h.nombre)).map(x => (x || '').toLowerCase()));
  const bots = rivalesElegidos().filter(b => !ocupados.has(b.toLowerCase())).concat(NOMBRES_P.filter(b => !ocupados.has(b.toLowerCase()))).filter((b, k, a) => a.indexOf(b) === k).slice(0, n - 1 - hum.length);
  const reservadas = Math.min(bots.length, Math.max(0, personas - 1 - hum.length));
  return { hum, bots, reservadas, mirando: ONLINE.sentados.length - hum.length };
}
function salaAnfitrion() {
  if (!ONLINE || ONLINE.rol !== 'anfitrion' || ONLINE.empezada) return;
  const n = ONLINE.total, { hum, bots, reservadas, mirando } = asientosMesa();
  const per = Math.max(ONLINE.personas, hum.length + 1);
  const botones = (k, desde, hasta, actual) => Array.from({ length: hasta - desde + 1 }, (_, x) => desde + x).map(v => `<button data-plaza="${k}" data-v="${v}" aria-pressed="${v === actual}">${v}</button>`).join('');
  pintarOnline(`<div class="grupo"><h3>${ONLINE.nombre ? esc(ONLINE.nombre) + ' · código' : 'Código de tu mesa'}</h3><div class="codigo">${ONLINE.codigo}</div>
      <button class="grande" id="bInvitar" style="width:100%;margin-top:6px">📨 Invitar</button><div id="cajaCompartir"></div>
      <div class="nota" style="text-align:center;margin-top:8px">Mándales el enlace, o el código: en su móvil, 🌍 Jugar online → Sentarme.</div></div>
    <div class="grupo"><h3>¿Cuántos sois?</h3>
      <div class="sub" style="text-align:left;margin:4px 0">Jugadores en la mesa</div><div class="seg">${botones('total', 2, 5, n)}</div>
      <div class="sub" style="text-align:left;margin:10px 0 4px">Personas (contándote a ti)</div><div class="seg">${botones('personas', 1, n, per)}</div>
      <div class="nota" style="margin-top:8px">${n - per ? `${n - per} ${n - per === 1 ? 'bot' : 'bots'} · ` : ''}${per - 1 - hum.length > 0 ? `${per - 1 - hum.length} ${per - 1 - hum.length === 1 ? 'sitio reservado' : 'sitios reservados'}: mientras no lleguen, los guarda un bot.` : 'Todos sentados 🙌'}</div></div>
    <div class="grupo"><h3>En la mesa</h3>
      <div class="sentado">${avatarSVGmini(miAvatar())}${esc(PREF.nombre || 'Tú')}<small>tú · repartes</small></div>
      ${hum.map(h => `<div class="sentado">${avatarSVGmini(avatarSeguro(h.avatar))}${esc(h.nombre)}<small>📱 en la mesa</small></div>`).join('')}
      ${bots.map((b, k) => k < reservadas
        ? `<div class="sentado" style="opacity:.85">${avatarSVGmini(b)}<span>🪑 Sitio reservado</span><small>lo guarda ${b} 🤖</small></div>`
        : `<div class="sentado" style="opacity:.75">${avatarSVGmini(b)}${b}<small>🤖 la app</small></div>`).join('')}
      ${mirando > 0 ? `<div class="nota">👀 ${mirando} ${mirando === 1 ? 'persona mirando' : 'personas mirando'} (no caben)</div>` : ''}
    </div>
    <button class="grande" id="bEmpezarMesa" style="width:100%">▶ Empezar partida</button>
    <div class="nota" style="text-align:center;margin:8px 0">No hace falta esperar: quien llegue tarde se sienta en su sitio, aunque la partida ya haya empezado.</div>
    <button class="secund" id="bMisMesas" style="width:100%;margin-top:4px">🗂️ Volver a Mis mesas</button>`);
  document.querySelectorAll('[data-plaza]').forEach(b => b.onclick = () => {
    const v = +b.dataset.v;
    if (b.dataset.plaza === 'total') { ONLINE.total = v; ONLINE.personas = Math.min(ONLINE.personas, v); }
    else ONLINE.personas = v;
    RED().publicar(ONLINE.codigo, { total: ONLINE.total, personas: ONLINE.personas }).catch(() => {});
    salaAnfitrion();
  });
  $('bMisMesas').onclick = () => { salirOnline(false); pantallaOnline(); };
  $('bEmpezarMesa').onclick = empezarMesa;
  $('bInvitar').onclick = invitar;
}
function empezarMesa() {
  const { hum, bots, reservadas } = asientosMesa();
  ONLINE.empezada = true;
  Object.keys(S).forEach(k => delete S[k]); Object.assign(S, PREF, reglasMesa());
  S.nombres = hum.map(h => h.nombre).concat(bots).join(', ');
  nuevaPartida((PREF.nombre || '').trim() || 'Tú');
  G.jugadores.forEach((p, i) => {
    if (i === 0) { p.avatar = miAvatar(); p.uid = ONLINE.uid; return; }
    const h = hum[i - 1];
    if (h) { p.nombre = h.nombre; p.avatar = avatarSeguro(h.avatar); p.uid = h.uid; p.remoto = true; p.humano = false; p.nivel = 1; }
    else {
      p.avatar = p.nombre; p.nivel = (PREF.nivelDe || {})[p.nombre] ?? S.nivel;
      p.bot = { nombre: p.nombre, avatar: p.avatar, nivel: p.nivel };
      if (i - 1 - hum.length < reservadas) p.reservada = true;
    }
  });
  CART.jugadas++; guardarCartera(); chinchonNeto = 0;
  ONLINE.eventos = []; ONLINE.seq = 0;
  ONLINE.unsubs.push(RED().escucharAcciones(ONLINE.codigo, a => onAccion(a)));
  RED().publicar(ONLINE.codigo, { estado: 'jugando', reglas: reglasMesa(), actividad: Date.now() }).catch(() => {});
  ir('juego');
  empezarMano();
  setTimeout(() => alguna('inicio'), 700);
}
function pubOnline(evs = [], extra = {}) {
  if (!ONLINE || ONLINE.rol !== 'anfitrion' || !G) return;
  const ev = pendEv.concat(evs).map(e => Object.assign({ n: ++ONLINE.seq }, e)); pendEv = [];
  ONLINE.eventos = (ONLINE.eventos || []).concat(ev).slice(-25);
  const P = {
    jugadores: G.jugadores.map(p => ({ nombre: p.nombre, avatar: p.avatar, uid: p.uid || null, puntos: p.puntos, rayas: p.rayas, fuera: p.fuera, reeng: p.reeng, n: p.mano.length, ultimo: p.ultimo || '', nivel: p.remoto ? null : (p.nivel ?? null), rayas0: p.rayas0 || 0, reservada: !!p.reservada })),
    top: G.descarte[G.descarte.length - 1] || null, nMazo: G.mazo.length, turno: G.turno, fase: G.fase, reparte: G.reparte, manoN: G.manoN,
    bote: G.bote, cogida: G.cogida ?? null, res: G.fase === 'resultado' ? G.res : null, terminada: !!G.terminada, ganador: G.ganador ?? null, ultimoTira: G.ultimoTira ?? null
  };
  const red = RED(), c = ONLINE.codigo;
  G.jugadores.forEach(p => { if (p.remoto) { const k = p.mano.map(x => x.id).join(','); if (manosPub[p.uid] !== k) { manosPub[p.uid] = k; red.mano(c, p.uid, limpiar(p.mano)).catch(e => console.warn('mano', e)); } } });
  red.publicar(c, limpiar(Object.assign({ publico: P, eventos: ONLINE.eventos, actividad: Date.now() }, extra))).catch(e => console.warn('publicar', e));
  if (!G.terminada) LS.set('mc-online', { rol: 'anfitrion', t: Date.now(), codigo: c, G, S, seq: ONLINE.seq, eventos: ONLINE.eventos, nombreAnf: ONLINE.nombreAnf, nombre: ONLINE.nombre, miembros: ONLINE.miembros, chinchonNeto });
  guardarNube(G.fase === 'resultado');
}
// Copia de la partida en la nube (solo la lee el anfitrión): así se puede seguir otro día y desde otro móvil
let tNube = null;
function guardarNube(ya) {
  if (!ONLINE || ONLINE.rol !== 'anfitrion' || !G) return;
  const c = ONLINE.codigo;
  const hazlo = () => {
    tNube = null; if (!ONLINE || ONLINE.codigo !== c || !G) return;
    const red = RED(); if (!red) return;
    red.guardarPriv(c, { json: JSON.stringify({ codigo: c, G: Object.assign({}, G, { anim: null }), S, seq: ONLINE.seq, eventos: ONLINE.eventos, nombreAnf: ONLINE.nombreAnf, chinchonNeto }), t: Date.now() }).catch(e => console.warn('priv', e));
  };
  clearTimeout(tNube);
  if (ya) hazlo(); else tNube = setTimeout(hazlo, 4000);
}
function pausarMesa() {
  if (!ONLINE || ONLINE.rol !== 'anfitrion') return;
  clearTimeout(tNube); guardarNube(true);
  RED().publicar(ONLINE.codigo, { estado: 'pausa', actividad: Date.now() }).catch(() => {});
  aviso('⏸ Partida en pausa. Seguidla cuando queráis');
  salirOnline(false); token++; $('velo').classList.add('oculto'); ir('online'); pantallaOnline();
}
async function reanudarMesa(c, m) {
  const red = RED();
  const local = LS.get('mc-online', null);
  let nube = null;
  try { const p = await red.leerPriv(c); if (p && p.json) nube = JSON.parse(p.json); } catch (e) { console.warn('leerPriv', e); }
  const loc = local && local.codigo === c && local.G ? local : null;
  const g = loc && (!nube || (loc.seq || 0) >= (nube.seq || 0)) ? loc : nube;
  if (!g || !g.G) return aviso('No encuentro la partida guardada 🤔');
  if (ONLINE) salirOnline(false);
  Object.keys(S).forEach(k => delete S[k]); Object.assign(S, g.S);
  G = g.G; G.anim = null; YO = 0; chinchonNeto = g.chinchonNeto || 0;
  ONLINE = { rol: 'anfitrion', codigo: c, uid: miUid(), sentados: [], unsubs: [], nombreAnf: g.nombreAnf || PREF.nombre, nombre: (m && m.nombre) || '', miembros: ((m && m.miembros) || [miUid()]).slice(), eventos: g.eventos || [], seq: g.seq || 0, empezada: true };
  ONLINE.total = G.jugadores.length; ONLINE.personas = 1;
  manosPub = {}; pendEv = [];
  recordarMesa(c);
  ONLINE.unsubs.push(red.escucharAcciones(c, a => onAccion(a)));
  escucharSillas(c);
  red.publicar(c, { estado: 'jugando', actividad: Date.now() }).catch(() => {});
  ir('juego'); aviso(m && m.estado === 'pausa' ? '▶ ¡Seguimos la partida!' : '¡Mesa recuperada! 🙌');
  if (G.fase === 'resultado' && G.res) { pintar(); pubOnline(); mostrarResultado(G.res); return; }
  pubOnline(); avanzar();
}
let tRemoto = null;
let tQuien = null;
function esperarRemoto(t) {
  clearTimeout(tRemoto); clearTimeout(tQuien);
  tQuien = setTimeout(() => { if (t === token && G && !G.terminada && G.jugadores[G.turno].remoto) alguna('quienJuega', {}, true); }, 20000);
  tRemoto = setTimeout(() => {
    if (t !== token || !G || G.terminada) return;
    const p = G.jugadores[G.turno]; if (!p.remoto) return;
    // tarda demasiado (o se le ha ido la conexión): juega la app por ella este turno
    mensaje(`${p.nombre} tarda… juega la app por ella 🤖`);
    turnoIA(t);
  }, 75000);
}
async function onAccion(a) {
  const log = m => { if (window.__log) window.__log.push(m + ' ' + a.tipo + ' turno=' + (G && G.turno) + ' fase=' + (G && G.fase)); };
  if (!ONLINE || ONLINE.rol !== 'anfitrion' || !G || G.terminada) return log('sin partida');
  if (G.anim) { setTimeout(() => onAccion(a), 400); return log('espera anim'); }
  const i = G.turno, p = G.jugadores[i];
  if (!p || !p.remoto || p.uid !== a.uid) return log('no es su turno');
  log('ok');
  if (a.tipo === 'robar' && G.fase === 'robar') {
    if (!a.desc && hayQueRebarajar()) { await animarRebarajar(); if (!G || G.turno !== i || G.fase !== 'robar') return; }
    const t = ++token;
    const origen = a.desc ? cartaMonton() : cartaMazo();
    const c = robar(i, !!a.desc); if (!c) return manoNula();
    reg(a.desc ? 'D' : 'M', i, a.desc ? c : null);
    p.ultimo = a.desc ? 'Cogió ' + nombreCarta(c) : 'Robó del mazo';
    mensaje(a.desc ? `${p.nombre} coge ${nombreCarta(c)}` : `${p.nombre} roba del mazo`);
    pubOnline([{ t: 'roba', i, desc: !!a.desc, carta: a.desc ? c : null }]);
    volar(origen, avatarDe(i), a.desc ? htmlCarta(c) : dorsoHTML, VUELO()); pintar();
    esperarRemoto(t);
  } else if (a.tipo === 'tirar' && G.fase === 'tirar') {
    const c = p.mano.find(x => x.id === a.id); if (!c || c.id === G.cogida) return;
    clearTimeout(tRemoto); const t = ++token;
    await volar(avatarDe(i), cartaMonton(), htmlCarta(c), VUELO()); if (t !== token) return;
    reg('T', i, c); tirar(i, c.id); G.ultimoTira = i; p.ultimo += ' y tiró ' + nombreCarta(c);
    pendEv.push({ t: 'tira', i, carta: c });
    mensaje(`${p.nombre} tira ${nombreCarta(c)}`); pintar(true);
    setTimeout(() => { if (t === token) avanzar(); }, 400);
  } else if (a.tipo === 'cerrar' && G.fase === 'tirar') {
    const resto = p.mano.filter(x => x.id !== a.id);
    if (a.id === G.cogida || !p.mano.some(x => x.id === a.id) || !puedeCerrarCon(analizar(resto))) return;
    clearTimeout(tRemoto); const t = ++token;
    mensaje(`¡${p.nombre} cierra!`);
    await volar(avatarDe(i), cartaMonton(), dorsoHTML, VUELO()); if (t !== token) return;
    reg('C', i);
    const res = cerrar(i, a.id);
    finMano(res, alguna('otraCierra', { p: p.nombre, pi: i }, true));
  }
}

/* ---- Volver a una mesa a medias ---- */
async function volverMesa(guardada) {
  const d = guardada || LS.get('mc-online', null); if (!d) return;
  return abrirMesa(d.codigo);
}

/* ---- Invitado ---- */
async function unirme(codigo) {
  if (!/^[A-Z]{4}$/.test(codigo)) return aviso('El código tiene 4 letras');
  return abrirMesa(codigo);
}
function elegirSitio(c, m) {
  const P = m.publico; if (!P) return aviso('La partida aún se está preparando, prueba en un momento');
  const bots = P.jugadores.map((j, i) => [j, i]).filter(([j, i]) => i > 0 && !j.uid).sort((a, b) => (b[0].reservada ? 1 : 0) - (a[0].reservada ? 1 : 0));
  const vivos = P.jugadores.filter(j => !j.fuera), max = vivos.length ? Math.max(...vivos.map(j => j.puntos)) : 0;
  const op = bots.map(([j, i]) => ({ t: `🪑 ${j.reservada ? 'Sitio reservado (lo guarda ' + j.nombre + ')' : 'El sitio de ' + j.nombre + ' 🤖'} · ${j.fuera ? 'fuera' : j.puntos + ' pts'}`, f: () => sentarseYa(c, m, { quiere: 'silla', i }) }));
  if (P.jugadores.length < 5) op.push({ t: `➕ Silla nueva (entras en la mano siguiente con ${max} pts)`, clase: bots.length ? 'no' : '', f: () => sentarseYa(c, m, { quiere: 'nueva' }) });
  op.push({ t: '👀 Solo mirar', clase: 'no', f: () => sentarseYa(c, m, { quiere: 'mirar' }) });
  ventana(`<h2>${esc(nombreMesa(m))}</h2><div class="sub">La partida ya ha empezado (mano ${P.manoN}). ¿Dónde te sientas?</div>`, op);
}
async function sentarseYa(c, m, quiere) {
  const red = RED(), uid = miUid();
  try { await red.sentar(c, uid, limpiar(Object.assign({ nombre: PREF.nombre || 'Invitado', avatar: miAvatar(), gen: PREF.genero || null, t: Date.now() }, quiere))); } catch (e) { return aviso('No se pudo entrar en la mesa 📵'); }
  recordarMesa(c);
  entrarInvitado(c, m, false, quiere.quiere);
}
function entrarInvitado(codigo, m, vuelta, quiere) {
  const red = RED(), uid = miUid();
  ONLINE = { rol: 'invitado', codigo, uid, unsubs: [], nombreAnf: m.nombreAnf || 'quien creó la mesa', ultEv: 0, cola: [], mano: [], resVisto: 0, pend: false, vuelta, quiere, mitad: m.estado === 'jugando' && !vuelta };
  if (vuelta) aviso('¡De vuelta en la mesa! 🙌');
  if (m.estado !== 'jugando') LS.set('mc-online', { rol: 'invitado', codigo, espera: true, nombreAnf: ONLINE.nombreAnf, t: Date.now() });
  ir('online');
  pintarOnline(`<div class="grupo"><h3>${esc(nombreMesa(m))} · ${codigo}</h3><div class="sentado">${avatarSVGmini(avatarSeguro(m.avatarAnf))}${esc(m.nombreAnf || '')}<small>reparte</small></div>
    <div class="sub" style="margin-top:12px">¡Ya tienes sitio! 🪑<br>Esperando a que ${esc(m.nombreAnf || 'quien creó la mesa')} empiece la partida…</div></div>
    <button class="secund" id="bMisMesasInv" style="width:100%">🗂️ Volver a Mis mesas</button>`);
  $('bMisMesasInv').onclick = () => { salirOnline(false); pantallaOnline(); };
  if (ONLINE.mitad) pintarOnline(`<div class="grupo"><h3>${esc(nombreMesa(m))} · ${codigo}</h3><div class="sub">${quiere === 'nueva' ? 'Entrarás al empezar la mano siguiente ✋' : quiere === 'mirar' ? 'Mirando la mesa 👀' : 'Sentándote… 🪑'}</div></div><div id="mirador"></div>
    <button class="secund" id="bMisMesasInv" style="width:100%">🗂️ Volver a Mis mesas</button>`);
  $('bMisMesasInv').onclick = () => { salirOnline(false); pantallaOnline(); };
  ONLINE.unsubs.push(red.escucharMano(codigo, uid, cartas => { if (!ONLINE) return; ONLINE.mano = cartas || []; manoRecibida(); }));
  ONLINE.unsubs.push(red.escuchar(codigo, d => onMesaInvitado(d)));
}
function onMesaInvitado(d) {
  if (!ONLINE || ONLINE.rol !== 'invitado') return;
  if (!d) { ventana('<h2>Mesa cerrada</h2><div class="sub">Esta mesa ya no existe.</div>', [{ t: 'Al inicio', f: () => salirOnline(true) }]); salirOnline(false); return; }
  if (d.estado === 'pausa') { ventana(`<h2>⏸ Partida en pausa</h2><div class="sub">${esc(ONLINE.nombreAnf)} la ha dejado para otro día. La seguiréis desde 🗂️ Mis mesas.</div>`, [{ t: 'Vale', f: () => { ir('online'); pantallaOnline(); } }]); salirOnline(false); return; }
  if (!ONLINE.empezada && d.estado !== 'jugando') return;   // esperando a que empiece
  if (d.cancelada || (d.estado === 'fin' && !d.publico)) { ventana('<h2>Mesa cerrada</h2><div class="sub">Quien creó la mesa la ha cerrado.</div>', [{ t: 'Al inicio', f: () => salirOnline(true) }]); salirOnline(false); return; }
  if (!d.publico) return;
  if (!ONLINE.empezada) {
    // primera vez: preparar la partida espejo
    const k = d.publico.jugadores.findIndex(j => j.uid === ONLINE.uid);
    if (k < 0) { if (!$('mirador')) { const c = ONLINE.codigo; salirOnline(false); return elegirSitio(c, d); } return pintarMirador(d); }
    if (ONLINE.mitad) ONLINE.vuelta = true;   // llega con la partida empezada: desde aquí, sin repetir lo anterior
    if (!$('velo').classList.contains('oculto')) $('velo').classList.add('oculto');
    ONLINE.empezada = true; YO = k;
    LS.set('mc-online', { rol: 'invitado', codigo: ONLINE.codigo, nombreAnf: ONLINE.nombreAnf, t: Date.now() });
    if (ONLINE.vuelta) { ONLINE.ultEv = Math.max(0, ...(d.eventos || []).map(e => e.n)); if (d.publico.fase === 'resultado') ONLINE.resVisto = d.publico.manoN; }
    Object.keys(S).forEach(x => delete S[x]); Object.assign(S, PREF, d.reglas || {});
    if (!ONLINE.vuelta || ONLINE.mitad) { CART.jugadas++; guardarCartera(); chinchonNeto = 0; }
    if (ONLINE.mitad) { const yo = d.publico.jugadores[k]; aviso(yo.puntos ? `¡Dentro! Sigues con ${yo.puntos} puntos 🪑` : '¡Dentro! 🪑'); }
    G = null; aplicarPublico(d.publico);
    ir('juego');
  }
  ONLINE.ultimoP = d.publico;
  for (const e of (d.eventos || [])) if (e.n > ONLINE.ultEv) { ONLINE.cola.push(e); ONLINE.ultEv = e.n; }
  procesarCola();
}
function pintarMirador(d) {
  const caja = $('mirador'); if (!caja || !d || !d.publico) return;
  const P = d.publico;
  const sub = caja.previousElementSibling && caja.previousElementSibling.querySelector('.sub');
  if (sub && ONLINE.quiere === 'mirar') sub.textContent = `Mirando la mesa 👀 · Mano ${P.manoN}`;
  caja.innerHTML = `<div class="grupo">${P.jugadores.map((j, i) => `<div class="sentado" style="${P.turno === i && P.fase !== 'resultado' ? 'outline:3px solid var(--oro)' : ''};${j.fuera ? 'opacity:.5' : ''}">${avatarSVGmini(avatarSeguro(j.avatar))}${esc(j.nombre)}<small>${j.uid ? '📱' : '🤖'} ${j.fuera ? 'fuera' : j.puntos + ' pts'}${j.rayas ? ' · ' + '✏️'.repeat(Math.min(j.rayas, 5)) : ''}</small></div>`).join('')}
    ${P.top ? `<div style="display:flex;align-items:center;gap:12px;margin-top:8px"><div style="width:56px">${htmlCarta(P.top)}</div><span class="nota">En el montón · quedan ${P.nMazo} en el mazo</span></div>` : ''}</div>
    ${ONLINE.quiere === 'mirar' ? '<button class="grande" id="bQuieroJugar" style="width:100%;margin-bottom:10px">✋ Quiero jugar</button>' : ''}`;
  const q = $('bQuieroJugar'); if (q) q.onclick = () => { const c = ONLINE.codigo, m = d; salirOnline(false); elegirSitio(c, m); };
}
function espejoMano(i, n) { return Array.from({ length: n }, (_, k) => ({ id: -1000 - i * 30 - k, s: 0, r: 1 })); }
function aplicarPublico(P) {
  const prev = G, miOrdenAnt = prev && prev.jugadores && prev.jugadores[YO] ? prev.jugadores[YO].orden : null;
  const mia = ONLINE.mano || [];
  G = {
    jugadores: P.jugadores.map((j, i) => Object.assign({}, j, { humano: i === YO, remoto: !!j.uid && i !== YO, mano: i === YO ? mia.slice() : espejoMano(i, j.n) })),
    descarte: P.top ? [P.top] : [], mazo: espejoMano(9, P.nMazo), turno: P.turno, fase: P.fase, reparte: P.reparte, manoN: P.manoN, bote: P.bote,
    cogida: P.cogida, res: P.res, terminada: P.terminada, ganador: P.ganador, ultimoTira: P.ultimoTira, cogidas: {}, conocidas: {}, vistas: [], turnos: 0,
    anim: prev ? prev.anim : null
  };
  G.jugadores[YO].orden = miOrdenAnt;
  if (G.turno === YO && G.fase === 'tirar' && mia.length !== 8) G.turno = -1; // aún no ha llegado la carta robada
  if (G.turno === YO && G.fase === 'robar' && mia.length === 8) G.turno = -1; // la carta ya llegó, falta el aviso del anfitrión
  // la petición sigue pendiente hasta que cambie algo de mi turno
  const clave = `${P.turno}/${P.fase}/${P.nMazo}`;
  if (ONLINE.pend && clave !== ONLINE.pendClave) { ONLINE.pend = false; if (window.__log) window.__log.push(Date.now() % 100000 + ' pend off ' + ONLINE.pendClave + ' -> ' + clave); }
}
function manoRecibida() {
  if (!G || !ONLINE || !ONLINE.ultimoP) return;
  const antes = new Set(G.jugadores[YO].mano.map(c => c.id));
  aplicarPublico(ONLINE.ultimoP);
  const nuevaC = ONLINE.mano.find(c => !antes.has(c.id));
  if (nuevaC && ONLINE.mano.length === 8) nueva = nuevaC.id;
  if (!G.anim && !ONLINE.procesando) { pintar(); if (G.fase !== 'resultado') avanzarInvitado(); }
}
async function procesarCola() {
  if (ONLINE.procesando) return; ONLINE.procesando = true;
  try {
    while (ONLINE && ONLINE.cola.length) { const e = ONLINE.cola.shift(); await animarEvento(e); }
    if (ONLINE && ONLINE.ultimoP && !(G && G.anim)) trasPublico();
  } finally { if (ONLINE) ONLINE.procesando = false; }
  if (ONLINE && ONLINE.cola.length) procesarCola();
}
async function animarEvento(e) {
  const nom = i => G.jugadores[i] ? G.jugadores[i].nombre : '';
  if (e.t === 'dice') { bocadillo(e.i, e.f); return; }
  if (e.t === 'sienta') { mensaje(e.txt); return; }
  if (e.t === 'reparte') { $('velo').classList.add('oculto'); ONLINE.resVisto = 0; aplicarPublico(ONLINE.ultimoP); G.jugadores[YO].orden = null; orden = 1; const t = ++token; await repartoInvitado(t); return; }
  if (e.t === 'roba') {
    if (!e.desc && !G.mazo.length) await animarRebarajar();
    const origen = e.desc ? cartaMonton() : cartaMazo();
    if (e.i !== YO) mensaje(e.desc ? `${nom(e.i)} coge ${nombreCarta(e.carta)}` : `${nom(e.i)} roba del mazo`);
    if (e.desc) { G.descarte = []; pintar(); }
    await volar(origen, e.i === YO ? $('mano') : avatarDe(e.i), e.carta ? htmlCarta(e.carta) : dorsoHTML, VUELO());
    return;
  }
  if (e.t === 'tira') {
    if (e.i !== YO) { mensaje(`${nom(e.i)} tira ${nombreCarta(e.carta)}`); await volar(avatarDe(e.i), cartaMonton(), htmlCarta(e.carta), VUELO()); }
    G.descarte = [e.carta]; pintar(true); return;
  }
  if (e.t === 'cierra') {
    if (e.i !== YO) { mensaje(`¡${nom(e.i)} cierra!`); vibrar('cierre'); await volar(avatarDe(e.i), cartaMonton(), dorsoHTML, VUELO()); }
    return;
  }
}
async function repartoInvitado(t) {
  // mismo espectáculo que en local, pero sin tocar el turno (lo lleva el anfitrión)
  await repartoAnimado(t);
}
function trasPublico() {
  aplicarPublico(ONLINE.ultimoP);
  pintar();
  if (G.fase === 'resultado' && G.res && ONLINE.resVisto !== G.manoN) {
    ONLINE.resVisto = G.manoN;
    anotarMano(G.res);
    setTimeout(() => { if (ONLINE && G && G.res) mostrarResultado(G.res); }, 1500);
    return;
  }
  avanzarInvitado();
}
function avanzarInvitado() {
  if (!G || G.anim) return;
  pintar();
  if (G.fase === 'resultado') return;
  if (G.turno === YO) {
    if (G.fase === 'robar') { mensaje('Te toca: coge del mazo o del montón 👇', true); vibrar('turno'); }
    else mensaje('Arrastra al montón la carta que tiras', true);
  } else if (G.turno >= 0 && G.jugadores[G.turno]) mensaje(`Le toca a ${G.jugadores[G.turno].nombre}…`);
}
function enviarAccion(a) {
  if (!ONLINE) return;
  ONLINE.pend = true; if (window.__log) window.__log.push(Date.now() % 100000 + ' envio ' + a.tipo + ' miTurno=' + G.turno + ' fase=' + G.fase);
  const P = ONLINE.ultimoP; ONLINE.pendClave = P ? `${P.turno}/${P.fase}/${P.nMazo}` : '';
  setTimeout(() => { if (ONLINE && ONLINE.pend) { ONLINE.pend = false; pintar(); } }, 8000);
  if (a.tipo === 'robar') mensaje('…');
  RED().accion(ONLINE.codigo, limpiar(Object.assign({ uid: ONLINE.uid, t: Date.now() }, a))).catch(() => { ONLINE.pend = false; aviso('No llegó tu jugada 📵 Inténtalo otra vez'); pintar(); });
}

