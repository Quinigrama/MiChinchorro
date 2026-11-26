// Mi Chinchorro — interfaz básica: dibujar cartas y pantallas
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ================= INTERFAZ ================= */
// Naipes clásicos: imágenes en la carpeta naipes/ (01o.jpg … 12b.jpg)
const LETRA = ['o', 'c', 'e', 'b'];

const $ = id => document.getElementById(id);
const LS = {
  p: window.__lsp || '',   // prefijo solo para pruebas con dos jugadores en el mismo navegador
  get(k, d) { try { const v = localStorage.getItem(this.p + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(this.p + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(this.p + k); } catch (e) {} }
};
const euros = x => (Math.round(x * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
let PREF = Object.assign({}, DEF, LS.get('mc-ajustes2', {}));
let INVITA = (() => {
  try {
    const u = new URL(location.href), c = (u.searchParams.get('mesa') || '').trim().toUpperCase();
    if (u.searchParams.has('mesa')) { u.searchParams.delete('mesa'); history.replaceState(null, '', u.pathname + u.search + u.hash); }
    return /^[A-Z]{4}$/.test(c) ? c : null;
  } catch (e) { return null; }
})();
if (PREF.niveles && !Object.keys(PREF.nivelDe || {}).length) { PREF.nivelDe = {}; ['Matilde', 'Elvira', 'Pepita'].forEach((n, k) => { if (PREF.niveles[k] != null) PREF.nivelDe[n] = PREF.niveles[k]; }); }
let CART = Object.assign({ saldo: 10, jugadas: 0, ganadas: 0 }, LS.get('mc-cartera', {}));
const guardarCartera = () => LS.set('mc-cartera', CART);

/* ---------- Dibujar cartas ---------- */
function htmlCarta(c, extra = '') {
  if (!c) return '<div class="vacio"></div>';
  if (c.j && PREF.naipes === 'castellana') return `<div class="carta foto comodin ${extra}" data-id="${c.id}" aria-label="Comodín"><img src="naipes-castellana/comodin.svg" alt="Comodín" draggable="false"></div>`;
  if (c.j) return `<div class="carta comodin ${extra}" data-id="${c.id}"><div class="jk">🃏<small>COMODÍN</small></div></div>`;
  const p = PALOS[c.s], fig = { 10: 'SOTA', 11: 'CABALLO', 12: 'REY' }[c.r];
  if (PREF.naipes === 'castellana')
    return `<div class="carta foto c-${p} ${extra}" data-id="${c.id}" aria-label="${nombreCarta(c)}"><img src="naipes-castellana/${String(c.r).padStart(2, '0')}${LETRA[c.s]}.svg" alt="" draggable="false">${PREF.indices ? `<span class="indice">${c.r}</span>` : ''}</div>`;
  if (PREF.naipes === 'clasicas')
    return `<div class="carta foto c-${p} ${extra}" data-id="${c.id}" aria-label="${nombreCarta(c)}"><img src="naipes/${String(c.r).padStart(2, '0')}${LETRA[c.s]}.jpg" alt="" draggable="false">${PREF.indices ? `<span class="indice">${c.r}</span>` : ''}</div>`;
  return `<div class="carta c-${p} ${fig ? 'fig' : ''} ${extra}" data-id="${c.id}" aria-label="${nombreCarta(c)}">
    <span class="esq">${c.r}</span>
    <svg class="palo"><use href="#p-${p}"/></svg>${fig ? `<span class="figtxt">${fig}</span>` : ''}</div>`;
}


/* ---------- Pantallas ---------- */
function ir(id) {
  for (const s of document.querySelectorAll('section')) s.classList.toggle('oculto', s.id !== id);
  window.scrollTo(0, 0);
  if (id === 'inicio') pintarInicio();
  if (id === 'ajustes') pintarAjustes();
  if (id === 'estad') pintarEstad();
  if (id === 'records') pintarRecords();
}
document.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => ir(b.dataset.ir));

function pedirPerfil() {
  const html = `<h2>¡Hola! 👋</h2>
    ${NUBE_OK ? `<button id="perfGoogle" class="grande" style="width:100%;margin-bottom:6px">☁️ Entrar con Google</button>
    <div id="perfGoogleNota" class="sub" style="font-size:14px;margin-bottom:12px">Para ver récords y jugar online. Puedes hacerlo luego.</div>` : ''}
    <div class="sub">¿Quién eres? Toca tu personaje…</div>
    <div class="soy">${NOMBRES_P.map(n => `<button class="soybtn" data-soy="${n}"><span class="avatar">${avatarSVG(n)}</span>${n}</button>`).join('')}</div>
    <div class="sub" style="margin-top:14px">…o escribe tu nombre</div>
    <input id="perfNombre" value="${esc(PERSONAJES[(PREF.nombre || '').trim()] ? '' : PREF.nombre || '')}" placeholder="Tu nombre" style="width:100%;padding:14px;border-radius:12px;border:0;font-size:20px;margin-bottom:10px">
    <div id="perfAvCaja" class="oculto"><div class="sub">y elige tu avatar</div><div class="avatares" id="perfAv"></div></div>`;
  ventana(html, [{ t: '¡A jugar!', f: () => {
    PREF.nombre = ($('perfNombre').value || '').trim() || 'Yo';
    if (!PREF.avatar || PERSONAJES[PREF.avatar]) PREF.avatar = PREF.fotoGoogle ? 'google' : `letra:${PREF.nombre[0].toUpperCase()}:#e07a3a`;
    else if (/^letra:/.test(PREF.avatar)) PREF.avatar = PREF.avatar.replace(/^letra:[^:]*:/, `letra:${PREF.nombre[0].toUpperCase()}:`);
    PREF.perfilHecho = true; LS.set('mc-ajustes2', PREF); pintarInicio(); subirNube();
  } }]);
  // un toque en un personaje: nombre y avatar de golpe
  document.querySelectorAll('.soybtn').forEach(b => b.onclick = () => {
    const n = b.dataset.soy;
    PREF.nombre = n; PREF.avatar = n; PREF.perfilHecho = true;
    if (PREF.rivales) PREF.rivales = PREF.rivales.filter(x => x !== n);
    LS.set('mc-ajustes2', PREF); $('velo').classList.add('oculto'); pintarInicio();
    aviso(`¡Hola, ${n}! 😊`);
  });
  const pintaAv = () => {
    const sel = miAvatar();
    $('perfAv').innerHTML = opcionesAvatar().filter(k => !PERSONAJES[k]).map(k => `<button class="avbtn" data-av="${k}" aria-pressed="${(k === 'google' ? PREF.avatar === 'google' : sel === k)}">${avatarSVG(k)}</button>`).join('');
    $('perfAv').querySelectorAll('button').forEach(b => b.onclick = () => { PREF.avatar = b.dataset.av; pintaAv(); });
  };
  const g = $('perfGoogle');
  if (g) g.onclick = async () => {
    if (!window.Nube) return aviso('Sin conexión ahora mismo 📵');
    try {
      await window.Nube.entrar(); try { localStorage.setItem('mc-nube', '1'); } catch (e) {}
      const u = window.Nube.usuario || {};
      if (u.photoURL) PREF.fotoGoogle = u.photoURL;
      const nom = (u.displayName || (u.email || '').split('@')[0] || '').trim().split(/\s+/)[0];
      if (nom && !$('perfNombre').value.trim()) $('perfNombre').value = nom.slice(0, 20);
      PREF.avatar = PREF.fotoGoogle ? 'google' : PREF.avatar;
      if ($('perfGoogleNota')) $('perfGoogleNota').remove();
      g.outerHTML = `<div class="sub" style="color:var(--oro);font-weight:800">✅ Dentro con ${esc(u.email || 'Google')}</div>`;
      $('perfNombre').oninput(); pintarNube();
      aviso('Cambia el nombre si quieres y pulsa «¡A jugar!»');
    } catch (e) { aviso(/popup/i.test(e && e.code || '') ? 'Se cerró la ventana de Google' : 'No se pudo entrar. ¿Hay internet?'); }
  };
  $('perfNombre').oninput = () => {
    PREF.nombre = $('perfNombre').value;
    if (!PREF.avatar || PERSONAJES[PREF.avatar]) PREF.avatar = PREF.fotoGoogle ? 'google' : 'letra:X:#e07a3a';
    $('perfAvCaja').classList.toggle('oculto', !PREF.nombre.trim());
    pintaAv();
  };
}
function pintarInicio() {
  if (!PREF.perfilHecho) setTimeout(pedirPerfil, 300);
  else if (INVITA) setTimeout(atenderInvitacion, 50);
  const mo = LS.get('mc-online', null);
  $('bVolverMesa').classList.toggle('oculto', !mo || !NUBE_OK);
  if (mo) $('bVolverMesa').textContent = `🌍 Volver a la mesa ${mo.codigo}`;
  $('miAvInicio').innerHTML = PREF.perfilHecho ? `${avatarSVG(miAvatar())}` : '';
  $('saldo').textContent = euros(saldoCuenta());
  { const c = cartCuenta(); $('estad').textContent = c.jugadas ? `Partidas: ${c.jugadas} · Ganadas: ${c.ganadas}` : ''; }
  $('bContinuar').classList.toggle('oculto', !LS.get('mc-partida2', null));
  $('abanico').innerHTML = [{ s: 0, r: 1 }, { s: 1, r: 12 }, { s: 2, r: 7 }, { s: 3, r: 11 }].map(c => htmlCarta(c)).join('');
  const cs = $('abanico').children;
  [...cs].forEach((e, k) => e.style.transform = `rotate(${(k - 1.5) * 9}deg) translateY(${Math.abs(k - 1.5) * 6}px)`);
}

