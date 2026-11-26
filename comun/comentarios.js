// Mi Chinchorro — comentarios y faroles de las jugadoras
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Comentarios de las jugadoras ---------- */
const FRASES = {
  inicio: ['¡A ver quién paga hoy! 💸', 'Barajad bien, que la última vez hubo trampa 😏', 'Hoy vengo con suerte 🍀', '¡Venga, que empiece la partida! 🃏', 'Yo hoy no pago ni una raya, [G:avisadas estáis|avisados estáis|ya lo sabéis] 😌'],
  coge: ['Gracias, {p}, me venía de perlas 😘', '¡Uy, qué bien! Esa me la quedo', 'Mmm… esta me gusta 🤭', 'Tú tira, {p}, tú tira, que yo recojo 😏', '¡Justo la que buscaba! 😍'],
  cogeTuya: ['Gracias, {h}, me venía de perlas 😘', '{h}, qué [T:generosa|generoso] estás hoy 🤭', '¡Ay, {h}, que me la has puesto a huevo! 😂', 'Esa no la tenías que haber tirado, {h} 😏'],
  figura: ['Ahí va {c}, que pesa mucho', 'Fuera figuras, que suman mucho', 'Toma {c}, para quien le haga falta 😅', 'Esa no me sirve ni para abanicarme 🪭'],
  cierra: ['¡Cierro! A contar, [G:chicas|chicos|familia] 😎', '¡Hala, cerrado! 😏', 'Lo siento, [G:guapas|guapos|cariños], pero cierro 💅', '¡Cierre al canto! 🎺', '¡A contar puntitos! 🧮', 'Me planto, a contar puntos 😂'],
  menos10: ['¡Menos diez! Toma ya 💃', '¡Todo ligado! Aprended, aprended 😌', '¡Menos diez! ¿Quién da más? 😎'],
  chinchon: ['¡¡Chinchón!! 😱🎉', '¡No me lo puedo creer! ¡CHINCHÓN! 🥳'],
  tuCierras: ['¡Qué suerte tiene [T:la|el] {h}! 🍀', '¡Ya ha cerrado [T:esta|este]! 😱', 'Hay que vigilar a {h}, que es muy [T:lista|listo] 🕵️', '¡{h}, eres [T:una lagarta|un lagarto]! 😂', '¡Pero si yo iba a cerrar ahora! 😤', '¡Anda, {h} ha cerrado! 😱', '¡Qué buena mano lleva {h}! 🍀'],
  raya: ['¡Ay, otra raya! 😩', 'Apúntamela, que ya la pago…', 'Esto es un robo, ¡un robo! 😤', 'Me reengancho, que esto no ha acabado 💪', 'Bueno, la próxima es mía…', '¡Qué mala pata tengo hoy! 🙈'],
  rayaTuya: ['¡Una rayita para {h}! 😜', '¡{h}, a pagar! Ji, ji 🤭', 'Esa raya te queda muy bien, {h} 😂', '¡Ay, {h}, que te vas a arruinar! 💸'],
  gana: ['Ji, ji, ji 🤭', 'Qué bien voy… no digo nada 🤐', 'Hoy me llevo el bote, ya veréis 💰', 'Ay, qué suerte tengo hoy 🍀', '[G:Tranquilas|Tranquilos|Tranquilidad], que no se me sube a la cabeza 😌'],
  cerca: ['Uy, que me la cargo… 😬', 'Con cuidadito, que voy [Y:justa|justo]', 'Virgen santa, qué puntos tengo 🙈', 'Ay, que esta mano me toca pagar…'],
  farol: ['Uy, qué malas 😮‍💨', 'Hoy no me entra ni una…', 'Madre mía, qué cartas me dais 🙄', 'Esta mano la pierdo, ya veréis', 'No ligo nada, ¡nada!', 'Yo con estas cartas me voy a casa 😩', 'Ay, qué desastre de mano…', 'Pues yo voy fatal, para que lo sepáis', 'Qué rachita llevo… 😔', 'Ni una pareja, os lo juro'],
  cierraFarol: ['¿Yo dije que iba mal? ¡Cierro! 😇', 'Uy, mira, ha entrado… ¡cierro! 🤭', 'Ji, ji… ¡cierro! 🤫', 'Pues al final… ¡cierro! 😏', 'Milagro, [G:chicas|chicos|familia]: ¡cierro! 🙏'],
  pillada: ['¡Anda que tus cartas malas, {p}! 🙄', '¡[T:Mentirosa|Mentiroso]! ¿No decías que ibas fatal? 😂', 'Ya decía yo que tanto quejarse… 🤨', '¡[T:Esta|Este] siempre igual, llorando y cerrando! 😤', 'La próxima vez no me lo creo, {p} 😒', '¡Qué cuentista eres, {p}! 😂', '{p}, a ti no te vuelvo a creer en la vida 🙅'],
  prisa: ['¿Quién juga 😮‍💨?', '¿Quién juga 😮‍💨?', '¿Piensas tirar hoy, {h}? ☕', '{h}, que se enfría el café ☕', 'Venga, {h}, que nos hacemos mayores 😅', 'Piénsatelo, piénsatelo… 🥱', '{h}, ¿te has dormido? 😴']
};
FRASES.quienJuega = ['¿Quién juga 😮‍💨?'];
FRASES.rayaOtra = FRASES.rayaTuya.map(f => f.replace(/\{h\}/g, '{p}'));
FRASES.otraCierra = FRASES.tuCierras.map(f => f.replace(/\{h\}/g, '{p}'));
const PROB = { quienJuega: 1, rayaOtra: .85, otraCierra: .8, farol: 1, cierraFarol: 1, pillada: 1, inicio: .9, coge: .45, cogeTuya: .7, figura: .15, cierra: 1, menos10: 1, chinchon: 1, tuCierras: .8, raya: .8, rayaTuya: .85, gana: .5, cerca: .45, prisa: 1 };
let ultimaFrase = {}, tUltBocadillo = 0;
function rivalesActivos() { return activos().filter(i => i !== YO && !G.jugadores[i].remoto); }
/* Género en las frases: [T:ella|él] de quien se habla, [Y:ella|él] de quien habla,
   [G:todas chicas|todos chicos|mezcla o sin saber] de quienes escuchan. Si no se sabe el género, esa frase no se dice. */
function generoDe(k) {
  const p = G && G.jugadores[k]; if (!p) return null;
  if (k === YO && (PREF.genero === 'f' || PREF.genero === 'm')) return PREF.genero;
  if (p.gen === 'f' || p.gen === 'm') return p.gen;
  const porAvatar = typeof p.avatar === 'string' && VOCES_P[p.avatar] ? VOCES_P[p.avatar][0] : null;
  if (k === YO) { const a = miAvatar(); return VOCES_P[a] ? VOCES_P[a][0] : null; }
  if (!p.humano && !p.remoto && VOCES_P[p.nombre]) return VOCES_P[p.nombre][0];
  return porAvatar;
}
function conGenero(f, i, ti) {
  if (f.indexOf('[') < 0) return f;
  const gT = generoDe(ti), gY = generoDe(i);
  if ((f.includes('[T:') && !gT) || (f.includes('[Y:') && !gY)) return null;
  const oyen = activos().filter(k => k !== i).map(generoDe);
  const gG = oyen.length && oyen.every(g => g === 'f') ? 0 : oyen.length && oyen.every(g => g === 'm') ? 1 : 2;
  return f.replace(/\[T:([^|\]]*)\|([^\]]*)\]/g, (_, a, b) => gT === 'f' ? a : b)
    .replace(/\[Y:([^|\]]*)\|([^\]]*)\]/g, (_, a, b) => gY === 'f' ? a : b)
    .replace(/\[G:([^|\]]*)\|([^|\]]*)\|([^\]]*)\]/g, (_, a, b, c) => [a, b, c][gG]);
}
function decir(i, tipo, vars = {}, forzar) {
  if (!PREF.charla || !G || i == null || i === YO) return false;
  if (ONLINE && ONLINE.rol === 'invitado') return false;           // en la mesa online hablan desde el móvil anfitrión
  if (G.jugadores[i] && G.jugadores[i].remoto) return false;         // las personas de verdad no hablan por boca de la app
  const mult = PREF.charla === 1 ? 0.5 : 1;
  if (!forzar && Math.random() > PROB[tipo] * mult) return false;
  const ahora = Date.now();
  if (!forzar && ahora - tUltBocadillo < 2500) return false;
  const caja = document.querySelector(`.rival[data-i="${i}"]`); if (!caja) return false;
  const ti = vars.pi != null ? vars.pi : YO;   // de quién se habla
  const lista = FRASES[tipo].filter(f => f !== ultimaFrase[tipo] && conGenero(f, i, ti) !== null);
  if (!lista.length) return false;
  let f = lista[Math.floor(Math.random() * lista.length)];
  ultimaFrase[tipo] = f;
  f = conGenero(f, i, ti);
  const h = G.jugadores[YO].nombre;
  f = f.replace(/\{h\}/g, h).replace(/\{p\}/g, vars.p || h).replace(/\{c\}/g, vars.c || 'esta');
  if (vars.rey && /pesa mucho$/.test(f)) f += ' 👑';
  tUltBocadillo = ahora;
  if (ONLINE && ONLINE.rol === 'anfitrion') pendEv.push({ t: 'dice', i, f });
  return bocadillo(i, f);
}
function bocadillo(i, f) {
  const caja = document.querySelector(`.rival[data-i="${i}"]`); if (!caja) return false;
  document.querySelectorAll(`.bocadillo[data-i="${i}"]`).forEach(b => b.remove());
  const b = document.createElement('div');
  b.className = 'bocadillo'; b.dataset.i = i; b.textContent = f;
  if (G && G.jugadores[i] && !G.jugadores[i].humano && !G.jugadores[i].remoto && !G.jugadores[i].uid) hablar(G.jugadores[i].nombre, f);
  document.body.appendChild(b);
  const r = caja.getBoundingClientRect(), bw = b.offsetWidth;
  const cx = r.left + r.width / 2;
  const left = Math.max(8, Math.min(window.innerWidth - bw - 8, cx - bw / 2));
  b.style.left = left + 'px'; b.style.top = (r.bottom + 10) + 'px';
  b.style.setProperty('--fl', (cx - left) + 'px');
  setTimeout(() => b.classList.add('fuera'), 2900);
  setTimeout(() => b.remove(), 3300);
  return true;
}
function alguna(tipo, vars, forzar) { const r = rivalesActivos(); if (r.length) return decir(r[Math.floor(Math.random() * r.length)], tipo, vars, forzar); }
// Tras una mano: rayas, quién va ganando y quién va justa
function reacciones(res) {
  if (!PREF.charla || !res || !res.filas) return;
  const cola = [];
  for (const f of res.filas) if (f.raya) cola.push(f.i === YO ? () => alguna('rayaTuya') : G.jugadores[f.i].remoto ? () => alguna('rayaOtra', { p: G.jugadores[f.i].nombre, pi: f.i }) : () => decir(f.i, 'raya'));
  const act = activos();
  if (act.length > 1) {
    const min = Math.min(...act.map(i => G.jugadores[i].puntos));
    const lider = act.filter(i => G.jugadores[i].puntos === min);
    if (lider.length === 1 && lider[0] !== YO) cola.push(() => decir(lider[0], 'gana'));
    const justa = rivalesActivos().find(i => G.jugadores[i].puntos >= S.limite * 0.85);
    if (justa !== undefined) cola.push(() => decir(justa, 'cerca'));
  }
  let n = 0;
  cola.slice(0, 2).forEach((fn, k) => setTimeout(() => { tUltBocadillo = 0; fn(); }, 1300 + k * 3000));
}

