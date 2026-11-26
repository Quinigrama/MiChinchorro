// Mi Chinchorro — mesas online (base)
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ================= MESAS ONLINE =================
   El móvil que crea la mesa (anfitrión) lleva la partida: reparte, mueve a los
   personajes y comprueba las jugadas. Los demás (invitados) ven lo que publica
   y le mandan lo que roban y tiran. Cada uno recibe solo sus cartas. */
let ONLINE = null, pendEv = [], manosPub = {};
const RED = () => (window.__redLocal ? RED_LOCAL : window.Nube && window.Nube.red);
const limpiar = x => JSON.parse(JSON.stringify(x));
const LETRAS_COD = 'ABCDEFGHJKLMNPRSTUVXYZ';
const miUid = () => window.__uid || (window.Nube && window.Nube.usuario && window.Nube.usuario.uid);

// Red de pruebas: varias pestañas del mismo navegador (no sale a internet)
const RED_LOCAL = {
  _k: (...p) => 'red:' + p.join('/'),
  _get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  _set(k, v) { localStorage.setItem(k, JSON.stringify(v)); this._fire(k); },
  _subs: [],
  _fire(k) { for (const s of this._subs.slice()) if (k.startsWith(s.pref)) setTimeout(s.cb, 0); },
  _on(pref, cb) { const s = { pref, cb }; this._subs.push(s); const h = e => { if (e.key && e.key.startsWith(pref)) cb(); }; addEventListener('storage', h); setTimeout(cb, 0); return () => { this._subs = this._subs.filter(x => x !== s); removeEventListener('storage', h); }; },
  async crear(c, d) { if (this._get(this._k('mesa', c))) throw new Error('existe'); this._set(this._k('mesa', c), d); },
  async leer(c) { return this._get(this._k('mesa', c)); },
  escuchar(c, cb) { const k = this._k('mesa', c); return this._on(k, () => cb(this._get(k))); },
  async publicar(c, d) { const k = this._k('mesa', c); this._set(k, Object.assign(this._get(k) || {}, d)); },
  async sentar(c, uid, d) { this._set(this._k('sent', c, uid), d); },
  escucharSentados(c, cb) { const pref = this._k('sent', c) + '/'; return this._on(pref, () => { const l = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(pref)) l.push(Object.assign({ uid: k.slice(pref.length) }, this._get(k))); } cb(l); }); },
  async mano(c, uid, cartas) { this._set(this._k('mano', c, uid), { cartas }); },
  escucharMano(c, uid, cb) { const k = this._k('mano', c, uid); return this._on(k, () => { const v = this._get(k); if (v) cb(v.cartas); }); },
  async accion(c, d) { this._set(this._k('acc', c) + '/' + Date.now() + Math.random(), d); },
  async misMesas(uid) { const l = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && /^red:mesa\/[A-Z]{4}$/.test(k)) { const d = this._get(k); if (d && (d.miembros || []).includes(uid)) l.push(Object.assign({ codigo: k.slice(-4) }, d)); } } return l; },
  async guardarPriv(c, d) { localStorage.setItem(this._k('priv', c), JSON.stringify(d)); },
  async leerPriv(c) { return this._get(this._k('priv', c)); },
  async levantar(c, uid) { localStorage.removeItem(this._k('sent', c, uid)); this._fire(this._k('sent', c) + '/'); },
  async borrarMesa(c) { for (const k of Object.keys(localStorage)) if (k.startsWith('red:') && k.split('/')[1] === c) localStorage.removeItem(k); this._fire(this._k('mesa', c)); },
  escucharAcciones(c, cb) { const pref = this._k('acc', c) + '/'; return this._on(pref, () => { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(pref)) ks.push(k); } ks.sort().forEach(k => { const v = this._get(k); localStorage.removeItem(k); if (v) cb(v); }); }); }
};

function salirOnline(irInicio) {
  if (ONLINE) (ONLINE.unsubs || []).forEach(f => { try { f(); } catch (e) {} });
  LS.del('mc-online');
  ONLINE = null; YO = 0; pendEv = []; manosPub = {};
  clearTimeout(tRemoto);
  if (irInicio) { token++; $('velo').classList.add('oculto'); ir('inicio'); }
}
function reglasMesa() {
  const r = {}; const J = ONLINE && ONLINE.rol === 'anfitrion' && ONLINE.total ? ONLINE.total : PREF.jugadores; ['baraja', 'comodines', 'limite', 'raya', 'precioChinchon', 'maxPuntos', 'maxSueltas', 'figuras', 'valorComodin', 'reenganche', 'colgar', 'chinchonGana', 'jugadores', 'nivel'].forEach(k => r[k] = PREF[k]); r.jugadores = J;
  if (r.baraja === 40 && r.jugadores === 5) r.baraja = 48;
  return r;
}
function pintarOnline(html) { $('onlineCuerpo').innerHTML = html; }
$('bVolverMesa').onclick = () => volverMesa();
$('bOnline').onclick = () => { if (!miUid()) return aviso('Entra antes con Google ☁️'); ir('online'); pantallaOnline(); };
$('bVolverOnline').onclick = () => {
  if (ONLINE && !ONLINE.empezada) { salirOnline(false); ir('online'); return pantallaOnline(); }   // de la sala a Mis mesas (la mesa sigue abierta)
  salirOnline(true);
};
function pantallaOnline() {
  const logeado = !!miUid(), inv = INVITA;
  pintarOnline(`${inv ? `<div class="invita">🃏 ¡Te han invitado a la mesa <span style="letter-spacing:3px">${inv}</span>!<br><small style="font-weight:600">${logeado ? 'Pulsa «Sentarme» y a jugar' : 'Primero entra con Google y luego siéntate'}</small></div>` : ''}
    ${logeado && !inv ? `<div class="grupo"><h3>🗂️ Mis mesas</h3><div id="listaMesas"><div class="nota">Mirando tus mesas… ⏳</div></div></div>` : ''}
    <div class="grupo"><h3>Sentarme en una mesa</h3><input class="inpcod" id="inpCod" maxlength="4" placeholder="CÓDIGO" autocomplete="off" autocapitalize="characters" value="${inv || ''}">
      ${logeado ? '<button class="grande" id="bUnirme" style="width:100%;margin-top:10px">🔑 Sentarme</button>'
        : '<button class="grande" id="bEntrarSentar" style="width:100%;margin-top:10px">☁️ Entrar con Google</button>'}</div>
    ${logeado ? `<div class="grupo"><h3>Crear una mesa nueva</h3>
      <input class="inpnom" id="inpNomMesa" maxlength="24" placeholder="Nombre: Con mamá, Primos…" autocomplete="off">
      <div class="nota" style="margin:8px 0 10px">Te dará un código y un enlace para invitar. La mesa se queda guardada para jugar otros días. Los huecos los ocupan tus rivales de siempre (${esc(rivalesElegidos().slice(0, PREF.jugadores - 1).join(', '))}).</div>
      <button class="grande" id="bCrearMesa" style="width:100%">➕ Crear mesa de ${PREF.jugadores}</button></div>` : ''}`);
  if (logeado) {
    $('bCrearMesa').onclick = () => { INVITA = null; crearMesa(($('inpNomMesa').value || '').trim()); };
    $('bUnirme').onclick = () => { const c = ($('inpCod').value || '').trim().toUpperCase(); if (c === INVITA) INVITA = null; unirme(c); };
    if (!inv) pintarMisMesas();
  } else {
    $('bEntrarSentar').onclick = async () => {
      if (!window.Nube) return aviso('Sin conexión ahora mismo 📵');
      try { await window.Nube.entrar(); try { localStorage.setItem('mc-nube', '1'); } catch (e) {} pintarNube(); pantallaOnline(); }
      catch (e) { aviso('No se pudo entrar. ¿Hay internet?'); }
    };
  }
}
