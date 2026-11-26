// Mi Chinchorro — cartas que vuelan por la mesa
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Cartas que vuelan por la mesa ---------- */
const VUELO = () => [950, 700, 420][S.velocidad];
function volar(desde, hasta, html, ms) {
  sonar('carta');
  return new Promise(res => {
    if (!desde || !hasta || document.hidden) return res();
    const a = desde.getBoundingClientRect(), b = hasta.getBoundingClientRect();
    if (!a.width || !b.width) return res();
    // la carta siempre tiene el tamaño de las del mazo; se encoge o crece según de dónde sale y adónde va
    const ref = cartaMazo() ? cartaMazo().getBoundingClientRect() : a;
    const w = ref.width, h = w * 1.5;
    const tam = r => Math.max(0.35, Math.min(1.15, Math.min(r.width / w, r.height / h)));
    const e0 = tam(a), e1 = tam(b);
    const el = document.createElement('div');
    el.className = 'vuelo'; el.innerHTML = html;
    const x0 = a.left + a.width / 2 - w / 2, y0 = a.top + a.height / 2 - h / 2;
    Object.assign(el.style, { left: x0 + 'px', top: y0 + 'px', width: w + 'px' });
    document.body.appendChild(el);
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    const an = el.animate([
      { transform: `translate(0,0) scale(${e0}) rotate(0deg)` },
      { transform: `translate(${dx / 2}px,${dy / 2 - 24}px) scale(${Math.max(e0, e1) + 0.08}) rotate(${dx > 0 ? 8 : -8}deg)`, offset: 0.5 },
      { transform: `translate(${dx}px,${dy}px) scale(${e1}) rotate(0deg)` }
    ], { duration: ms, easing: 'ease-in-out' });
    const fin = () => { el.remove(); res(); };
    an.onfinish = fin; an.oncancel = fin;
  });
}
const dorsoHTML = '<div class="carta dorso"></div>';
const cartaMazo = () => $('mMazo').querySelector('.carta');
const cartaMonton = () => $('mDesc').querySelector('.carta, .vacio');
const avatarDe = i => document.querySelector(`.rival[data-i="${i}"] .avatar`);
const espera = ms => new Promise(r => setTimeout(r, ms));


