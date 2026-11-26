// Mi Chinchorro — radio por internet
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Radio: emisoras por internet mientras se juega ---------- */
const EMISORAS = [
  { n: 'Sol Radio Madrid', d: 'Música en español de los 60 a hoy · Madrid 99.8', url: 'https://azura.abcorp.es/radio/8220/solradio' },
  { n: 'Flamenco FM', d: 'Flamenco · 128 kbps', q: 'Flamenco FM', kbps: 128 },
  { n: 'Jazz Radio', d: 'Jazz y soul · Francia', q: 'Jazz Radio' }
];
const RADIO = { audio: null, sonando: false, baja: false };
function prefRadio() { return Object.assign({ vol: 0.5, n: EMISORAS[0].n, url: EMISORAS[0].url, on: false, fav: [], cache: {} }, PREF.radio || {}); }
function guardarRadio(o) { PREF.radio = Object.assign(prefRadio(), o); LS.set('mc-ajustes2', PREF); }
function volRadio() { if (RADIO.audio) RADIO.audio.volume = Math.max(0, Math.min(1, prefRadio().vol * (RADIO.baja ? 0.3 : 1))); }
function pintarBotonRadio() { const b = $('bRadio'); if (b) b.classList.toggle('suena', RADIO.sonando); }
const claveEm = e => e.url || ('q:' + e.q);
const esFav = e => prefRadio().fav.some(f => claveEm(f) === claveEm(e) || (f.n === e.n && f.q && e.q));
function alternarFav(e) {
  const pr = prefRadio();
  const fav = esFav(e) ? pr.fav.filter(f => !(claveEm(f) === claveEm(e) || (f.n === e.n && f.q && e.q))) : pr.fav.concat([{ n: e.n, d: e.d || '', url: e.url || null, q: e.q || null, kbps: e.kbps || null }]);
  guardarRadio({ fav });
}
// busca la emisión en el directorio libre Radio Browser (solo emisiones seguras https)
const normR = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
async function buscarEmisoras(q, n = 15, kbps) {
  const servs = ['all.api.radio-browser.info', 'de1.api.radio-browser.info', 'fi1.api.radio-browser.info'];
  for (const h of servs) {
    try {
      const r = await fetch(`https://${h}/json/stations/search?name=${encodeURIComponent(q)}&hidebroken=true&order=clickcount&reverse=true&limit=60`);
      if (!r.ok) continue;
      let l = (await r.json()).filter(e => /^https:/.test(e.url_resolved || '') && /mp3|aac|ogg|^$/i.test(e.codec || '') && e.lastcheckok !== 0);
      // primero las que se llaman justo así; luego las que tienen la calidad pedida
      const nq = normR(q);
      const nota = e => (normR(e.name) === nq ? 4 : normR(e.name).startsWith(nq) ? 2 : 0) + (kbps && +e.bitrate === kbps ? 1 : 0);
      l = l.map((e, k) => ({ e, k, v: nota(e) })).sort((a, b) => b.v - a.v || a.k - b.k).map(x => x.e);
      return l.slice(0, n).map(e => ({ n: e.name.trim(), d: [e.country, e.tags && e.tags.split(',').slice(0, 3).join(', '), e.bitrate ? e.bitrate + ' kbps' : ''].filter(Boolean).join(' · '), url: e.url_resolved }));
    } catch (e) {}
  }
  return null;
}
function audioRadio() {
  if (!RADIO.audio) {
    RADIO.audio = new Audio(); RADIO.audio.preload = 'none';
    RADIO.audio.onplaying = () => { RADIO.sonando = true; pintarBotonRadio(); };
    RADIO.audio.onpause = () => { RADIO.sonando = false; pintarBotonRadio(); };
  }
  return RADIO.audio;
}
// intenta que suene una dirección; espera hasta 9 s a que empiece
function probarUrl(url) {
  const a = audioRadio();
  return new Promise(res => {
    let hecho = false;
    const fin = ok => { if (hecho) return; hecho = true; clearTimeout(t); a.removeEventListener('playing', bien); a.removeEventListener('error', mal); res(ok); };
    const bien = () => fin(true), mal = () => fin(a.error ? false : true);
    const t = setTimeout(() => fin(!a.paused && a.readyState > 2), 9000);
    a.addEventListener('playing', bien); a.addEventListener('error', mal);
    a.src = url; volRadio();
    a.play().catch(e => { if (e && e.name === 'NotAllowedError') { hecho = true; clearTimeout(t); res('permiso'); } });
  });
}
let radioTurno = 0;
async function sonarEmisora(em) {
  const turno = ++radioTurno, pr = prefRadio();
  let urls = [];
  if (em.url) urls.push(em.url);
  if (em.q) {
    if (pr.cache[em.q]) urls.push(pr.cache[em.q]);
    aviso(`Buscando ${em.n}… 📻`);
    const l = await buscarEmisoras(em.q, 6, em.kbps);
    if (turno !== radioTurno) return;
    if (l) urls.push(...l.map(x => x.url));
  }
  urls = [...new Set(urls.filter(Boolean))];
  if (!urls.length) return aviso('No encuentro esa emisora ahora mismo 📵');
  for (const url of urls) {
    const ok = await probarUrl(url);
    if (turno !== radioTurno) return;
    if (ok === 'permiso') { guardarRadio({ n: em.n, url, on: true }); return aviso('Toca otra vez para escuchar la radio 📻'); }
    if (ok) {
      const cache = Object.assign({}, prefRadio().cache); if (em.q) cache[em.q] = url;
      guardarRadio({ n: em.n, url, q: em.q || null, on: true, cache });
      return aviso(`📻 ${em.n}`);
    }
  }
  RADIO.sonando = false; pintarBotonRadio();
  aviso(`${em.n} no responde ahora mismo 📵`);
}
function pararRadio() { radioTurno++; if (RADIO.audio) { RADIO.audio.pause(); RADIO.audio.removeAttribute('src'); RADIO.audio.load(); } RADIO.sonando = false; guardarRadio({ on: false }); pintarBotonRadio(); }
function panelRadio(lista, titulo) {
  const pr = prefRadio();
  const favs = lista ? [] : pr.fav;
  const sugeridas = lista || EMISORAS.filter(e => !esFav(e));
  const items = favs.concat(sugeridas);
  const fila = (e, k) => {
    const activa = RADIO.sonando && pr.n === e.n;
    return `<div style="display:flex;gap:6px;align-items:stretch"><button class="emisora ${activa ? 'activa' : ''}" data-k="${k}" style="flex:1">${activa ? '🔊' : '▶️'}<span><b>${esc(e.n)}</b><small>${esc(e.d || '')}</small></span></button>`
      + `<button class="radioBtn" data-fav="${k}" title="${esFav(e) ? 'Quitar de favoritas' : 'Guardar como favorita'}" style="min-width:46px;font-size:20px">${esFav(e) ? '⭐' : '☆'}</button></div>`;
  };
  ventana(`<h2>📻 ${titulo || 'Música mientras jugáis'}</h2>
    <div class="sub" style="font-size:14px">Radio por internet: gasta datos (unos 40 MB por hora). Mejor con wifi. Toca ☆ para guardar una emisora en tus favoritas.</div>
    ${favs.length ? '<div class="sub" style="text-align:left;margin:8px 0 4px">⭐ Tus favoritas</div>' + favs.map((e, k) => fila(e, k)).join('') : ''}
    ${!lista && favs.length && sugeridas.length ? '<div class="sub" style="text-align:left;margin:10px 0 4px">Otras emisoras</div>' : ''}
    ${sugeridas.map((e, k) => fila(e, favs.length + k)).join('')}
    <div class="sub" style="text-align:left;margin:10px 0 4px">Volumen</div>
    <input type="range" id="volRadio" min="0" max="100" value="${Math.round(pr.vol * 100)}" style="width:100%">
    <div style="display:flex;gap:8px;margin-top:12px"><input class="inpnom" id="qRadio" placeholder="Buscar otra emisora…" autocomplete="off"><button class="radioBtn" id="bBuscarRadio">🔍</button></div>`,
    [RADIO.sonando ? { t: '⏹ Apagar la radio', f: pararRadio } : null, lista ? { t: '⬅ Volver', f: () => setTimeout(() => panelRadio(), 0) } : null, { t: 'Cerrar', clase: 'no' }].filter(Boolean));
  document.querySelectorAll('.emisora').forEach(b => b.onclick = () => { $('velo').classList.add('oculto'); sonarEmisora(items[+b.dataset.k]); });
  document.querySelectorAll('[data-fav]').forEach(b => b.onclick = () => {
    const e = items[+b.dataset.fav]; const era = esFav(e); alternarFav(e);
    aviso(era ? `Quitada de favoritas: ${e.n}` : `⭐ ${e.n} guardada en favoritas`);
    panelRadio(lista, titulo);
  });
  $('volRadio').oninput = e => { guardarRadio({ vol: e.target.value / 100 }); volRadio(); };
  const buscar = async () => {
    const q = $('qRadio').value.trim(); if (!q) return;
    $('bBuscarRadio').textContent = '⏳';
    const l = await buscarEmisoras(q);
    if (!l) { $('bBuscarRadio').textContent = '🔍'; return aviso('Sin conexión ahora mismo 📵'); }
    if (!l.length) { $('bBuscarRadio').textContent = '🔍'; return aviso('No he encontrado emisoras con ese nombre'); }
    panelRadio(l, `«${q}»`);
  };
  $('bBuscarRadio').onclick = buscar; $('qRadio').onkeydown = e => { if (e.key === 'Enter') buscar(); };
}
$('bRadio').onclick = () => panelRadio();
$('bRadioIni').onclick = () => panelRadio();
// si se dejó sonando, vuelve a sonar al primer toque (los navegadores no dejan arrancar solos)
document.addEventListener('pointerdown', function primera() {
  document.removeEventListener('pointerdown', primera);
  const pr = prefRadio(); if (pr.on && pr.url && !RADIO.sonando) sonarEmisora({ n: pr.n, url: pr.url, q: pr.q || null });
}, { passive: true });

