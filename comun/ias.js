// Mi Chinchorro — IAs de rival: Gemini y DeepSeek
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- IAs de rival (experimento): ✨ Gemini (nivel 4) y 🐋 DeepSeek (nivel 5) ----------
   Cada clave se guarda solo en este móvil (mc-gemini / mc-deepseek), nunca en GitHub ni en la nube.
   Si la IA no responde, se equivoca o se acaba el cupo o el saldo, juega la Difícil de libro en su lugar. */
const IAS = {
  4: { id: 'gemini', nombre: 'Gemini', ico: '✨', K: 'mc-gemini', modelo: 'gemini-flash-latest', reserva: ['gemini-flash-lite-latest', 'gemini-flash-latest'],
       ayuda: 'Pon tu clave gratuita de <b>aistudio.google.com</b> («Get API key» → «Create API key»).', ph: 'Clave (AIza…)' },
  5: { id: 'deepseek', nombre: 'DeepSeek', ico: '🐋', K: 'mc-deepseek', modelo: 'deepseek-flash', reserva: [],
       ayuda: 'Pon tu clave de <b>platform.deepseek.com</b> («API keys» → «Create new API key»). DeepSeek no tiene nivel gratis: hay que recargar saldo (con 2 € hay para cientos de partidas).', ph: 'Clave (sk-…)' }
};
const esIA = nv => !!IAS[nv];
function gemEsc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function iaCfg(nv) { const d = IAS[nv]; return Object.assign({ clave: '', modelo: d.modelo }, LS.get(d.K, {})); }
function gemCfg() { return iaCfg(4); }
function nivOpc() { const o = [[0, '🟢'], [1, '🟡'], [2, '🔴'], [3, '🧠']]; for (const nv of [4, 5]) if (iaCfg(nv).clave) o.push([nv, IAS[nv].ico]); return o; }
function leyendaIAs() { return [4, 5].filter(nv => iaCfg(nv).clave).map(nv => ` · ${IAS[nv].ico} ${IAS[nv].nombre}`).join(''); }
function iaUso(nv) { const hoy = new Date().toISOString().slice(0, 10), u = LS.get('mc-ia-uso-' + IAS[nv].id, {}); return u.dia === hoy ? u : { dia: hoy, llamadas: 0, tokens: 0, fallos: 0 }; }
function iaApuntar(nv, tok, fallo) { const u = iaUso(nv); u.llamadas++; u.tokens += tok || 0; if (fallo) u.fallos++; LS.set('mc-ia-uso-' + IAS[nv].id, u); }
const iaAgotada = {}, iaUltimo = {}; let iaAvisado = 0;
function htmlIA(nv) {
  const d = IAS[nv], c = iaCfg(nv), u = iaUso(nv);
  return `<div class="nota" style="text-align:left;margin-bottom:6px">${d.ayuda} Se guarda <b>solo en este móvil</b>. Luego, en «Con quién juegas», elige ${d.ico} para cualquier personaje.</div>
    <input data-ia="${nv}" data-campo="clave" type="password" autocomplete="off" placeholder="${d.ph}" value="${gemEsc(c.clave)}">
    <div class="tit" style="margin-top:8px">Modelo</div><input data-ia="${nv}" data-campo="modelo" value="${gemEsc(c.modelo)}">
    <div class="seg" style="margin-top:8px"><button data-iaprueba="${nv}">Probar la clave</button></div>
    <div class="nota" id="iaEstado${nv}">${c.clave ? `Hoy: <b>${u.llamadas}</b> preguntas a ${d.nombre}, unos <b>${u.tokens.toLocaleString('es-ES')}</b> tokens${u.fallos ? `, ${u.fallos} fallos (jugó la Difícil)` : ''}.` : `Sin clave: el nivel ${d.ico} no aparece.`}</div>`;
}
const iaSinModoJson = {}, iaPiensa = {};   // DeepSeek piensa por defecto: se lo quitamos (más rápido y barato); si no lo admite, le damos más espacio
// Lee la respuesta aunque venga con adornos: ```json, comas sobrantes, comillas simples, o cortada al final
function leerJson(txt) {
  let t = String(txt || '').replace(/```(json)?/gi, '');
  const a = t.indexOf('{'); if (a < 0) return null;
  t = t.slice(a);
  const b = t.lastIndexOf('}');
  const prueba = x => { try { const o = JSON.parse(x); return o && typeof o === 'object' ? o : null; } catch (e) { return null; } };
  const arregla = x => x.replace(/,\s*}/g, '}').replace(/'/g, '"').replace(/([{,]\s*)([a-zA-Z_]+)\s*:/g, '$1"$2":');
  if (b > 0) { const x = t.slice(0, b + 1); const o = prueba(x) || prueba(arregla(x)); if (o) return o; }
  // cortada: cierra comillas y llave
  let y = t.replace(/,\s*"[^"]*$/, ''); if ((y.match(/"/g) || []).length % 2) y += '"'; y += '}';
  const o = prueba(y) || prueba(arregla(y)); if (o) return o;
  // último recurso: sacar los campos sueltos con expresiones
  const campo = k => { const m = new RegExp('"?' + k + '"?\\s*:\\s*"?([^",}]+)"?', 'i').exec(t); return m ? m[1].trim() : null; };
  const res = {}; for (const k of ['accion', 'tira', 'cierra', 'motivo', 'ok']) { const v = campo(k); if (v != null) res[k] = k === 'cierra' ? /true|s[ií]/i.test(v) : v; }
  return Object.keys(res).length ? res : null;
}
const saturado = e => e && (e.status >= 500 || /high demand|overloaded|unavailable|busy/i.test(e.message || ''));
async function iaPreguntar(nv, texto) {
  const d = IAS[nv], { clave, modelo } = iaCfg(nv);
  if (!clave) throw new Error('sin clave');
  const lista = [...new Set([modelo || d.modelo, ...d.reserva])];
  let ultimo;
  for (const m of lista) {
    try { return await iaPreguntarCon(nv, texto, clave, m); }
    catch (e) {
      ultimo = e;
      if (e.malJson) { try { return await iaPreguntarCon(nv, texto + '\n\nIMPORTANTE: responde SOLO con el objeto JSON, completo y bien escrito.', clave, m); } catch (e2) { ultimo = e2; if (!saturado(e2)) throw e2; continue; } }
      if (!saturado(e)) throw e;
    }
  }
  throw ultimo;
}
async function iaPreguntarCon(nv, texto, clave, modelo) {
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 30000);
  try {
    let r;
    if (nv === 4) r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: iaReglas() }] }, contents: [{ role: 'user', parts: [{ text: texto }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.4 } })
    });
    else r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + clave },
      body: JSON.stringify(Object.assign({ model: modelo, temperature: 0.4, max_tokens: 800, messages: [{ role: 'system', content: iaReglas() }, { role: 'user', content: texto }] }, iaSinModoJson[nv] ? {} : { response_format: { type: 'json_object' } }, iaPiensa[nv] ? { max_tokens: 4000 } : { thinking: { type: 'disabled' } }))
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok && r.status === 400 && nv === 5 && !iaPiensa[nv] && /thinking/i.test(JSON.stringify(j))) { iaPiensa[nv] = true; return iaPreguntarCon(nv, texto, clave, modelo); }
    if (!r.ok && r.status === 400 && nv === 5 && !iaSinModoJson[nv] && /response_format|json/i.test(JSON.stringify(j))) { iaSinModoJson[nv] = true; return iaPreguntarCon(nv, texto, clave, modelo); }
    if (!r.ok) { iaApuntar(nv, 0, true); const e = new Error((j.error && (j.error.message || j.error)) || ('HTTP ' + r.status)); e.status = r.status; throw e; }
    let tok, txt;
    if (nv === 4) { tok = (j.usageMetadata && j.usageMetadata.totalTokenCount) || 0; txt = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map(x => x.text || '').join(''); }
    else { tok = (j.usage && j.usage.total_tokens) || 0; const msg = (j.choices && j.choices[0] && j.choices[0].message) || {}; txt = msg.content || msg.reasoning_content || ''; }
    const o = leerJson(txt);
    if (!o) { iaApuntar(nv, tok, true); const e = new Error('respuesta mal escrita'); e.malJson = true; throw e; }
    iaApuntar(nv, tok, false); iaUltimo[nv] = modelo;
    return o;
  } finally { clearTimeout(to); }
}
async function probarIA(nv) {
  const caja = () => $('iaEstado' + nv);
  if (caja()) caja().textContent = 'Probando…';
  try {
    const r = await iaPreguntar(nv, 'Esto es una prueba. Responde solo {"ok":true,"motivo":"un saludo corto en español"}');
    iaAgotada[nv] = false;
    if (caja()) caja().innerHTML = `✅ Funciona (${gemEsc(iaUltimo[nv] || '')}). ${IAS[nv].nombre} dice: «${gemEsc(r.motivo || 'ok')}»`;
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'no responde (30 s)' : e instanceof TypeError ? 'no se pudo conectar (¿sin internet, o el servidor no deja llamarlo desde una web?)' : e.message;
    if (caja()) caja().textContent = '❌ No funciona: ' + msg;
  }
}
function iaReglas() {
  const fig = S.figuras === 10 ? 'sota, caballo y rey valen 10' : 'sota 10, caballo 11 y rey 12';
  const orden = S.baraja === 48 ? '1-2-3-4-5-6-7-8-9-10(sota)-11(caballo)-12(rey)' : '1-2-3-4-5-6-7-sota(10)-caballo(11)-rey(12) (no hay 8 ni 9: la sota va detrás del 7)';
  return `Eres una jugadora de chinchón (chinchorro) con baraja española de ${S.baraja} cartas, en una partida de ${G ? G.jugadores.length : 4} jugadores.
Códigos de carta: número + palo (o = oros, c = copas, e = espadas, b = bastos); "*" es un comodín. Ejemplo: "12b" = rey de bastos.
Valores: as 1, del 2 al 9 su número, ${fig}${S.comodines ? `, comodín sin ligar ${S.valorComodin}` : ''}.
Jugadas (ligar cartas): grupos de 3 o 4 cartas del mismo número, o escaleras de 3 o más seguidas del mismo palo en el orden ${orden}.${S.comodines ? ' El comodín sustituye a cualquier carta.' : ''}
Cada turno: robas una carta (de arriba del mazo, boca abajo, o la de arriba del montón de descartes, que se ve) y luego tiras una al montón. No puedes tirar la carta que acabas de coger del montón.
Cerrar: en vez de tirar, la dejas boca abajo si con las 7 que te quedan tienes como mucho ${S.maxSueltas >= 7 ? 'las cartas que sean' : S.maxSueltas + ' carta(s)'} sin ligar y como mucho ${S.maxPuntos} puntos sin ligar. Si las 7 quedan ligadas haces −10 puntos.${S.chinchonGana ? ' Siete seguidas del mismo palo sin comodín es chinchón y gana la partida al instante.' : ''}
Al cerrar alguien, las demás suman los puntos de sus cartas sin ligar${S.colgar ? ' (antes pueden colgar sus sueltas en las jugadas de quien cierra, salvo si hizo −10)' : ''}.
Quien pasa de ${S.limite} puntos se apunta una raya (${String(S.raya).replace('.', ',')} €)${S.reenganche ? ' y se reengancha con los puntos de la que más tiene' : ' y queda fuera'}. Gana la partida la última que queda por debajo de ${S.limite} y se lleva el dinero de todas las rayas.
Responde SIEMPRE solo con un objeto JSON, sin nada más. En "motivo" explica tu jugada en 12 palabras como mucho, en español, con gracia.`;
}
const gemCod = c => c ? cc(c) : '';
const gemLista = cs => cs.length ? cs.map(c => `${gemCod(c)} (${nombreCarta(c)})`).join(', ') : 'ninguna';
function iaEstado(i) {
  const p = G.jugadores[i], a = analizar(p.mano);
  const rivales = G.jugadores.map((q, k) => ({ q, k })).filter(x => x.k !== i)
    .map(({ q, k }) => `- ${q.nombre}: ${q.puntos} puntos${q.fuera ? ' (fuera esta mano)' : ''}, ${q.rayas || 0} rayas; ha cogido del montón y aún tiene: ${gemLista((G.conocidas && G.conocidas[k]) || [])}`).join('\n');
  return `Mano ${G.manoN}, turno ${G.turnos}. Quedan ${G.mazo.length} cartas en el mazo.${G.reciclado ? ' El montón ya se rebarajó.' : ''}
Tú (${p.nombre}): ${p.puntos} puntos, ${p.rayas || 0} rayas.
Rivales:
${rivales}
Montón de descartes (de abajo a arriba, las últimas): ${gemLista(G.descarte.slice(-10))}.
Cartas tiradas en esta mano (todas): ${G.vistas.map(gemCod).join(' ') || 'ninguna'}.
Tu mano: ${gemLista(p.mano)}.
Tus jugadas ahora: ${a.jugadas.length ? a.jugadas.map(j => j.cartas.map(gemCod).join(' ')).join(' | ') : 'ninguna'}. Sueltas: ${a.sueltas.map(gemCod).join(' ') || 'ninguna'} (${a.muertos} puntos sin ligar).`;
}
function iaFallo(nv, e) {
  const d = IAS[nv];
  if (e && (e.status === 429 || e.status === 402 || /quota|exhaust|insufficient|balance/i.test(e.message || ''))) iaAgotada[nv] = true;
  if (Date.now() - iaAvisado > 60000) { iaAvisado = Date.now(); aviso(iaAgotada[nv] ? `${d.ico} ${d.nombre}: sin cupo o sin saldo. Juega la Difícil por ella` : `${d.ico} ${d.nombre} falló (${e && e.name === 'AbortError' ? 'tarda demasiado' : String(e && e.message || 'error').slice(0, 60)}). Juega la Difícil`); }
  console.warn(d.id, e);
}
async function iaRoboAsync(i, t) {
  const p = G.jugadores[i], nv = p.nivel, d = IAS[nv], top = G.descarte[G.descarte.length - 1];
  p.gemMotivo = '';
  if (!top || iaAgotada[nv] || !iaCfg(nv).clave) return iaRobo(i);
  mensaje(`${d.ico} ${p.nombre} está pensando…`);
  try {
    const r = await iaPreguntar(nv, `${iaEstado(i)}\n\nTe toca ROBAR. Arriba del montón está ${gemCod(top)} (${nombreCarta(top)}). ¿La coges o robas del mazo? Responde {"accion":"monton" o "mazo","motivo":"..."}`);
    if (t !== token) return false;
    const acc = String(r.accion || '').toLowerCase().replace('ó', 'o');
    if (acc !== 'monton' && acc !== 'mazo') throw new Error('acción rara: ' + acc);
    p.gemMotivo = r.motivo ? String(r.motivo).slice(0, 90) : '';
    return acc === 'monton';
  } catch (e) { iaFallo(nv, e); return iaRobo(i); }
}
async function iaTiradaAsync(i, t) {
  const p = G.jugadores[i], nv = p.nivel, d = IAS[nv], proh = G.cogida;
  if (iaAgotada[nv] || !iaCfg(nv).clave) return iaTirada(i);
  const cierres = new Set();
  for (const c of p.mano) {
    if (c.id === proh) continue;
    const a = analizar(p.mano.filter(x => x !== c));
    if (puedeCerrarCon(a)) cierres.add(`tirando ${gemCod(c)} cierras con ${a.muertos === 0 ? '−10' : a.muertos + ' puntos'}`);
  }
  mensaje(`${d.ico} ${p.nombre} está pensando…`);
  try {
    const cogida = proh != null ? p.mano.find(c => c.id === proh) : null;
    const r = await iaPreguntar(nv, `${iaEstado(i)}\n${cogida ? `Acabas de coger del montón ${gemCod(cogida)}: no la puedes tirar.\n` : ''}
Te toca TIRAR (tienes 8 cartas). ${cierres.size ? 'Puedes cerrar: ' + [...cierres].join('; ') + '.' : 'Ahora no puedes cerrar.'}
Responde {"tira":"código de la carta","cierra":true o false,"motivo":"..."}`);
    if (t !== token) return iaTirada(i);
    const cod = String(r.tira || '').toLowerCase().replace(/\s/g, '').replace(/^(comod[ií]n|j)$/, '*');
    const c = p.mano.find(x => x.id !== proh && gemCod(x) === cod);
    if (!c) throw new Error('quiso tirar una carta que no tiene: ' + cod);
    let cierra = !!r.cierra;
    if (cierra && !puedeCerrarCon(analizar(p.mano.filter(x => x !== c)))) cierra = false;   // no puede cerrar con eso: solo la tira
    const motivo = (r.motivo ? String(r.motivo).slice(0, 90) : '') || p.gemMotivo;
    p.gemMotivo = '';
    return { carta: c, cierra, motivo, ico: d.ico };
  } catch (e) { iaFallo(nv, e); p.gemMotivo = ''; return iaTirada(i); }
}

async function turnoIA(t) {
  const i = G.turno, p = G.jugadores[i];
  if (G.fase === 'robar') {
  const deDesc = esIA(p.nivel) ? await iaRoboAsync(i, t) : iaRobo(i);
  if (t !== token) return;
  if (!deDesc && hayQueRebarajar()) { await animarRebarajar(); if (t !== token) return; }
  const origen = deDesc ? cartaMonton() : cartaMazo();
  const c = robar(i, deDesc);
  if (!c) return manoNula();
  reg(deDesc ? 'D' : 'M', i, deDesc ? c : null);
  if (deDesc) { const de = G.ultimoTira; de === YO ? decir(i, 'cogeTuya') : decir(i, 'coge', { p: de != null && G.jugadores[de] ? G.jugadores[de].nombre : '', pi: de }); }
  p.ultimo = deDesc ? 'Cogió ' + nombreCarta(c) : 'Robó del mazo';
  mensaje(deDesc ? `${p.nombre} coge ${nombreCarta(c)}` : `${p.nombre} roba del mazo`);
  // del montón se ve la carta; del mazo va boca abajo
  const vuelo = volar(origen, avatarDe(i), deDesc ? htmlCarta(c) : dorsoHTML, relampago() ? (deDesc ? RELAMPAGO.roboMonton : RELAMPAGO.roboMazo) : VUELO());
  G.manoOculta = i; pintar(); // el montón ya enseña la carta de debajo
  if (ONLINE) pendEv.push({ t: 'roba', i, desc: deDesc, carta: deDesc ? c : null });
  await vuelo; G.manoOculta = null; if (t !== token) return;
  pintar();
  await espera(relampago() ? (deDesc ? RELAMPAGO.trasMonton : RELAMPAGO.trasMazo) : ESPERA() * 0.7); if (t !== token) return;
  }
  const d = esIA(p.nivel) ? await iaTiradaAsync(i, t) : await iaTiradaHilo(i);
  if (t !== token) return;
  if (d.cierra) {
    mensaje(`¡${p.nombre} cierra!`);
    await volar(avatarDe(i), cartaMonton(), dorsoHTML, VUELO()); if (t !== token) return;
    reg('C', i);
    const res = cerrar(i, d.carta.id);
    const deFarol = p.farol != null && G.turnos - p.farol <= activos().length * 2 && !(res.finPartida && res.chinchon);
    const habla = decir(i, res.finPartida && res.chinchon ? 'chinchon' : deFarol ? 'cierraFarol' : (res.filas[0].puntos === -10 ? 'menos10' : 'cierra'), {}, true);
    if (deFarol && PREF.charla) {
      const otras = activos().filter(k => k !== i && k !== YO);
      if (otras.length) setTimeout(() => decir(otras[Math.floor(Math.random() * otras.length)], 'pillada', { p: p.nombre, pi: i }, true), 1500);
      return finMano(res, habla, 3600);
    }
    return finMano(res, habla);
  }
  await volar(avatarDe(i), cartaMonton(), htmlCarta(d.carta), relampago() ? RELAMPAGO.tirada : VUELO()); if (t !== token) return;
  reg('T', i, d.carta); tirar(i, d.carta.id); G.ultimoTira = i;
  if (ONLINE) pendEv.push({ t: 'tira', i, carta: d.carta });
  if (!d.carta.j && d.carta.r >= 10) decir(i, 'figura', { c: nombreCarta(d.carta), rey: d.carta.r === 12 });
  else if (PREF.charla) {
    const sueltos = analizar(p.mano).muertos, mult = PREF.charla === 1 ? 0.5 : 1;
    const cerca = sueltos <= S.maxPuntos + 6;           // casi lo tiene: farol
    const fatal = sueltos >= 30;                          // va mal de verdad
    if ((cerca && Math.random() < 0.45 * mult) || (fatal && Math.random() < 0.15 * mult) || Math.random() < 0.04 * mult) {
      if (decir(i, 'farol')) p.farol = G.turnos;
    }
  }
  p.ultimo += ' y tiró ' + nombreCarta(d.carta);
  mensaje(`${p.nombre} tira ${nombreCarta(d.carta)}${d.motivo ? ` · ${d.ico || '✨'} «${gemEsc(d.motivo)}»` : ''}`);
  pintar(true);
  await espera(relampago() ? RELAMPAGO.trasTirada : ESPERA() * 0.8); if (t === token) avanzar();
}

function manoNula() {
  regFin(null);
  mensaje('Se acabó el mazo: mano nula, se vuelve a repartir');
  const t = ++token;
  setTimeout(() => { if (t === token) empezarMano(); }, 2000);
}

