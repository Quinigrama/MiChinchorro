// Generador completo de la Baraja Castellana vectorial para Mi Chinchorro
// 48 cartas (01o..12b) + Comodín ('comodin') en SVG 200x300 (relación 2:3)

const INK = '#1d1a16';
const PIEL = '#fbd4b4';

function dientesMoneda(rOut, rIn, n) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 === 0 ? rOut : rIn;
    d += (i === 0 ? 'M' : 'L') + (Math.cos(a) * r).toFixed(2) + ' ' + (Math.sin(a) * r).toFixed(2) + ' ';
  }
  return d + 'Z';
}

function cuentasAnillo(r, n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    s += `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="1.4" fill="${INK}"/>`;
  }
  return s;
}

const DIENTES = dientesMoneda(46, 41.5, 44);
const CUENTAS = cuentasAnillo(34.5, 22);

function monedaSVG(esAs = false) {
  return `
    <path d="${DIENTES}" fill="${INK}"/>
    <circle cx="0" cy="0" r="41" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="0" cy="0" r="28" fill="#ffe156" stroke="${INK}" stroke-width="1.5"/>
    ${esAs ? `
      <defs>
        <path id="arcSup" d="M -33.5,0 A 33.5,33.5 0 1,1 33.5,0"/>
        <path id="arcInf" d="M -36,0 A 36,36 0 0,0 36,0"/>
      </defs>
      <text font-family="Georgia, serif" font-size="6.8" font-weight="700" letter-spacing="1.1" fill="${INK}">
        <textPath href="#arcSup" startOffset="50%" text-anchor="middle">MI CHINCHORRO</textPath>
      </text>
      <text font-family="Georgia, serif" font-size="5.6" font-weight="700" letter-spacing="1.2" fill="${INK}">
        <textPath href="#arcInf" startOffset="50%" text-anchor="middle">★ CASTELLANA ★</textPath>
      </text>
    ` : CUENTAS}
    <g clip-path="url(#clipMon)">
      <path d="M -6,12 L -5,22 L 10,24 L 11,6 Z" fill="#f2b916" stroke="${INK}" stroke-width="1.3"/>
      <path d="M -16,28 C -14,20 -8,17 -2,18 C 5,19 11,17 17,22 L 22,30 L -18,30 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.5"/>
      <path d="M -10,23 Q 2,26 14,21 M -5,27 Q 4,28 12,25" fill="none" stroke="${INK}" stroke-width="1.1"/>
      <path d="M -10,-12 C -12,-9 -12,-6 -13,-4 L -17,1 C -17.5,2.5 -16,3.5 -14,3.8 L -15.5,6 C -15.5,7.2 -13.5,7.5 -14.8,9.2 C -14.8,10.2 -13.5,10.6 -13,11.8 C -12.8,14 -10.5,15 -6,14.5 C -1,14 4,11 7,6 L 9,-10 Z"
            fill="#ffe45e" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M -12,-5 Q -9,-6.5 -6,-5" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M -11,-2.5 Q -8.5,-3.6 -6.5,-2" fill="none" stroke="${INK}" stroke-width="1.1"/>
      <circle cx="-9" cy="-2" r="1.1" fill="${INK}"/>
      <path d="M -14,6.8 Q -11.5,7 -10,6.4" fill="none" stroke="${INK}" stroke-width="1"/>
      <path d="M -11,-12 C -12,-18 -6,-23 3,-22 C 12,-21 17,-14 16,-5 C 16,1 13,6 15,12 C 16,15 12,18 7,17 C 5,13 6,8 4,4 C 2,6 -1,5 -1,1 C -1,-2 1,-4 2,-5 C -1,-9 -6,-11 -11,-12 Z"
            fill="#f5c418" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M 1,-1 C 3.5,-2 4.5,2 2,4.5" fill="#ffe45e" stroke="${INK}" stroke-width="1.2"/>
      <path d="M -4,-19 C 3,-17 8,-10 10,-1 L 14,-3 C 12,-12 7,-19 0,-21 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.3"/>
      <path d="M -7,-16 Q -1,-17 2,-13 M 4,-16 Q 11,-14 12,-7 M 8,-1 Q 12,3 11,10 M 7,8 Q 10,12 9,15"
            fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/>
    </g>
  `;
}

const PIP_COPA = `
  <path d="M -18,-18 Q 0,-34 18,-18 Z" fill="#63a6d8" stroke="${INK}" stroke-width="1.8"/>
  <path d="M -21,-17 Q 0,-38 21,-17 L 23,-14 L -23,-14 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="0" cy="-31" r="3.5" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
  <path d="M -20,-14 C -20,4 -11,12 0,13 C 11,12 20,4 20,-14 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.8"/>
  <path d="M 11,-12 C 11,1 7,7 2,10" fill="none" stroke="#9e2017" stroke-width="3" stroke-linecap="round"/>
  <polygon points="0,-10 5.5,-3 0,4 -5.5,-3" fill="#b8e7ff" stroke="${INK}" stroke-width="1.2"/>
  <polygon points="0,-10 5.5,-3 0,-3" fill="#ffffff"/>
  <polygon points="0,-3 5.5,-3 0,4" fill="#4e9ad4"/>
  <polygon points="-15,-7 -10,-3 -15,1 -18,-3" fill="#ffe156" stroke="${INK}" stroke-width="1"/>
  <polygon points="15,-7 18,-3 15,1 10,-3" fill="#ffe156" stroke="${INK}" stroke-width="1"/>
  <circle cx="-10" cy="-12.5" r="1.8" fill="#b8e7ff" stroke="${INK}" stroke-width="0.9"/>
  <circle cx="10" cy="-12.5" r="1.8" fill="#b8e7ff" stroke="${INK}" stroke-width="0.9"/>
  <path d="M -8,15 C -5,11 5,11 8,15 L 12,26 L -12,26 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
  <ellipse cx="0" cy="14" rx="4.2" ry="4.5" fill="#b8e7ff" stroke="${INK}" stroke-width="1.4"/>
  <circle cx="-1" cy="13" r="1.2" fill="#fff"/>
  <rect x="-15" y="26" width="30" height="5" rx="1" fill="#63a6d8" stroke="${INK}" stroke-width="1.6"/>
  <rect x="-18" y="30" width="36" height="5" rx="1" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
`;

const COPA_FIG = `
  <path d="M -17,-15 L 17,-15 C 16,3 8,10 0,11 C -8,10 -16,3 -17,-15 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.8"/>
  <rect x="-19" y="-17" width="38" height="4.5" rx="1.5" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
  <polygon points="0,-10 5,-3 0,4 -5,-3" fill="#b8e7ff" stroke="${INK}" stroke-width="1.2"/>
  <polygon points="0,-10 5,-3 0,-3" fill="#ffffff"/>
  <polygon points="0,-3 5,-3 0,4" fill="#4e9ad4"/>
  <circle cx="-9" cy="-5" r="2.2" fill="#ffe156" stroke="${INK}" stroke-width="1"/>
  <circle cx="9" cy="-5" r="2.2" fill="#ffe156" stroke="${INK}" stroke-width="1"/>
  <path d="M -5,11 L 5,11 L 4,23 L -4,23 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.4"/>
  <ellipse cx="0" cy="12" rx="4" ry="3.5" fill="#b8e7ff" stroke="${INK}" stroke-width="1.3"/>
  <path d="M -6,22 L 6,22 L 13,29 L -13,29 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
  <rect x="-15" y="28" width="30" height="4" rx="1" fill="#63a6d8" stroke="${INK}" stroke-width="1.4"/>
`;

const PIP_ESPADA = `
  <rect x="-4.5" y="-45" width="9" height="14" rx="2" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="0" cy="-46" r="4.2" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
  <path d="M -15,-31 C -11,-26 -4,-26 0,-29 C 4,-26 11,-26 15,-31 C 13,-34 7,-34 4,-32 L -4,-32 C -7,-34 -13,-34 -15,-31 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
  <rect x="-3.8" y="-33" width="7.6" height="5.5" fill="#d83b2d" stroke="${INK}" stroke-width="1.3"/>
  <path d="M -7.5,-27 L 0,50 L 7.5,-27 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M 0,-27 L 0,49 L 7.5,-27 Z" fill="#4686bf"/>
  <path d="M 0,-27 L 0,49" stroke="${INK}" stroke-width="1.1"/>
`;

function pipBasto(c1, c2) {
  return `
    <path d="M -9,-38 C -12,-24 -13,-6 -7.5,18 L -4,41 L 4,41 L 7.5,18 C 13,-6 12,-24 9,-38 C 4.5,-44 -4.5,-44 -9,-38 Z"
          fill="${c1}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M -3,-33 C -4,-18 -4,4 0,26 C 3,4 4,-18 3,-33 Z" fill="${c2}"/>
    <ellipse cx="-9" cy="-14" rx="2.6" ry="4.2" fill="#f5c418" stroke="${INK}" stroke-width="1.3"/>
    <ellipse cx="9" cy="-2" rx="2.6" ry="4.2" fill="#f5c418" stroke="${INK}" stroke-width="1.3"/>
    <ellipse cx="-7" cy="14" rx="2.3" ry="3.8" fill="#f5c418" stroke="${INK}" stroke-width="1.3"/>
    <ellipse cx="0" cy="41" rx="4" ry="1.8" fill="#ffe156" stroke="${INK}" stroke-width="1.4"/>
  `;
}

function vainaSVG(color = '#a84e24', largo = 68) {
  return `
    <path d="M -4,0 L 4,0 L 2.5,${largo} L -2.5,${largo} Z" fill="${color}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M -3,${largo - 12} L 3,${largo - 12} L 2.5,${largo} L -2.5,${largo} Z" fill="#f5c418" stroke="${INK}" stroke-width="1.3"/>
    <path d="M -10,0 L 10,0" stroke="#f5c418" stroke-width="4" stroke-linecap="round"/>
    <path d="M -10,0 L 10,0" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="-3" y="-11" width="6" height="10" rx="1.5" fill="#d83b2d" stroke="${INK}" stroke-width="1.4"/>
    <circle cx="0" cy="-13" r="3.2" fill="#f5c418" stroke="${INK}" stroke-width="1.3"/>
  `;
}

function manoAgarre(x, y, rot = 0) {
  return `<g transform="translate(${x},${y}) rotate(${rot})">
    <rect x="-6.5" y="-5" width="13" height="10" rx="4.5" fill="${PIEL}" stroke="${INK}" stroke-width="1.5"/>
    <path d="M -5.5,-1.5 H 5.5 M -5.5,2 H 5.5" stroke="#b87d56" stroke-width="1.2" stroke-linecap="round"/>
    <ellipse cx="4.5" cy="-4.5" rx="3.2" ry="2.2" fill="${PIEL}" stroke="${INK}" stroke-width="1.3"/>
  </g>`;
}

function manoAbierta(x, y, rot = 0) {
  return `<g transform="translate(${x},${y}) rotate(${rot})">
    <path d="M -7,2 C -7,-3 -2,-5 5,-4 L 9,-1 C 10,1 8,3 4,3 L -5,4 Z" fill="${PIEL}" stroke="${INK}" stroke-width="1.4"/>
    <path d="M -3,-2 L -7,-7" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M -3,-2 L -7,-7" stroke="${PIEL}" stroke-width="1.3" stroke-linecap="round"/>
  </g>`;
}

function marcoYPintas(palo, num) {
  const cortes = palo ? { o: 0, c: 1, e: 2, b: 3 }[palo] : 0;
  let top = 'M12 12 H188', bot = 'M12 288 H188';
  if (cortes === 1) { top = 'M12 12 H86 M114 12 H188'; bot = 'M12 288 H86 M114 288 H188'; }
  if (cortes === 2) { top = 'M12 12 H55 M78 12 H122 M145 12 H188'; bot = 'M12 288 H55 M78 288 H122 M145 288 H188'; }
  if (cortes === 3) { top = 'M12 12 H41 M59 12 H90 M110 12 H141 M159 12 H188'; bot = 'M12 288 H41 M59 288 H90 M110 288 H141 M159 288 H188'; }
  const idx = `<text x="18" y="36" font-family="Georgia, 'Times New Roman', serif" font-size="23" font-weight="700" fill="${INK}">${num}</text>`;
  return `<path d="M12 12 V288 M188 12 V288 ${top} ${bot}" stroke="${INK}" stroke-width="2.6" stroke-linecap="square" fill="none"/>
    ${idx}<g transform="rotate(180 100 150)">${idx}</g>`;
}

const ASES = {
  o: `<g transform="translate(100,150) scale(1.48)">${monedaSVG(true)}</g>`,
  c: `<g transform="translate(100,154) scale(1.08)">
        <path d="M 0,-112 C 6,-106 8,-96 0,-90 C -8,-96 -6,-106 0,-112 Z" fill="#6aa84f" stroke="${INK}" stroke-width="1.6"/>
        <path d="M -11,-90 Q 0,-96 11,-90 Q 4,-84 0,-86 Q -4,-84 -11,-90 Z" fill="#8bc34a" stroke="${INK}" stroke-width="1.5"/>
        <path d="M -52,-36 C -48,-62 -20,-78 0,-88 C 20,-78 48,-62 52,-36 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.8"/>
        <path d="M -26,-42 C -22,-58 -8,-68 0,-74 C 8,-68 22,-58 26,-42 Z" fill="#63a6d8" stroke="${INK}" stroke-width="1.5"/>
        <path d="M 0,-68 C 7,-60 8,-50 0,-43 C -8,-50 -7,-60 0,-68 Z" fill="#ffe156" stroke="${INK}" stroke-width="1.4"/>
        <rect x="-56" y="-37" width="112" height="12" rx="4" fill="#f5c418" stroke="${INK}" stroke-width="1.8"/>
        <path d="M -48,-35 L -38,-27 M -32,-35 L -22,-27 M -16,-35 L -6,-27 M 0,-35 L 10,-27 M 16,-35 L 26,-27 M 32,-35 L 42,-27" stroke="#63a6d8" stroke-width="3"/>
        <path d="M -50,-25 L 50,-25 L 42,-17 L -42,-17 Z" fill="#ffe156" stroke="${INK}" stroke-width="1.5"/>
        <circle cx="0" cy="-21" r="4.5" fill="#b8e7ff" stroke="${INK}" stroke-width="1.5"/>
        <path d="M -46,-17 C -42,22 -24,44 0,46 C 24,44 42,22 46,-17 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.8"/>
        <path d="M 24,-14 C 22,14 14,32 4,40" fill="none" stroke="#9e2017" stroke-width="6" stroke-linecap="round"/>
        <rect x="-32" y="-7" width="5" height="14" rx="2.5" fill="#b8e7ff" stroke="${INK}" stroke-width="1.2"/>
        <rect x="-16" y="-7" width="5" height="14" rx="2.5" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
        <rect x="-2" y="-7" width="6" height="14" rx="2.5" fill="#b8e7ff" stroke="${INK}" stroke-width="1.2"/>
        <rect x="16" y="-7" width="5" height="14" rx="2.5" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
        <rect x="29" y="-7" width="4" height="14" rx="2" fill="#b8e7ff" stroke="${INK}" stroke-width="1.2"/>
        <rect x="-37" y="14" width="74" height="9" rx="3" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
        <circle cx="-22" cy="18.5" r="2.6" fill="#b8e7ff" stroke="${INK}" stroke-width="1.1"/>
        <circle cx="0" cy="18.5" r="3" fill="#b8e7ff" stroke="${INK}" stroke-width="1.1"/>
        <circle cx="22" cy="18.5" r="2.6" fill="#b8e7ff" stroke="${INK}" stroke-width="1.1"/>
        <path d="M -25,36 C -16,52 16,52 25,36 L 14,56 L -14,56 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
        <path d="M -9,56 L 9,56 L 7,76 L -7,76 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.6"/>
        <path d="M -14,76 L 14,76 L 30,96 L -30,96 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
        <rect x="-38" y="96" width="76" height="10" rx="1.5" fill="#63a6d8" stroke="${INK}" stroke-width="1.8"/>
      </g>`,
  e: `<g transform="translate(100,150) scale(1.08) translate(-100,-150)">
        <path d="M 150,48 C 122,95 62,132 54,185 C 50,206 54,218 46,232" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
        <path d="M 150,48 C 122,95 62,132 54,185 C 50,206 54,218 46,232" fill="none" stroke="#d83b2d" stroke-width="7.5" stroke-linecap="round"/>
        <path d="M 150,48 C 154,105 162,146 156,188" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
        <path d="M 150,48 C 154,105 162,146 156,188" fill="none" stroke="#63a6d8" stroke-width="7.5" stroke-linecap="round"/>
        <path d="M 150,48 C 124,62 114,54 102,62" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
        <path d="M 150,48 C 124,62 114,54 102,62" fill="none" stroke="#63a6d8" stroke-width="6.5" stroke-linecap="round"/>
        <circle cx="150" cy="48" r="10" fill="#f5c418" stroke="${INK}" stroke-width="1.8"/>
        <circle cx="150" cy="48" r="5" fill="#d83b2d" stroke="${INK}" stroke-width="1.4"/>
        <path d="M 42,230 L 50,230 L 53,245 L 39,245 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.4"/>
        <path d="M 151,185 L 161,185 L 164,200 L 148,200 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.4"/>
        <g transform="translate(94,148) rotate(-25)">
          <path d="M -8,-108 L 8,-108 L 10,-62 L -10,-62 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.8"/>
          <path d="M -10,-96 L 10,-90 M -10,-84 L 10,-78 M -10,-72 L 10,-66" stroke="#f5c418" stroke-width="2.5"/>
          <path d="M -6,-108 C -30,-106 -32,-68 -10,-62 L -20,-62 C -38,-68 -36,-112 -6,-114 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.8"/>
          <circle cx="-2" cy="-111" r="6" fill="#f5c418" stroke="${INK}" stroke-width="1.7"/>
          <rect x="-22" y="-64" width="44" height="9" rx="4" fill="#d83b2d" stroke="${INK}" stroke-width="1.7"/>
          <circle cx="-22" cy="-60" r="6" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
          <circle cx="22" cy="-60" r="6" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
          <path d="M -10,-55 L -6.5,95 L 6.5,95 L 10,-55 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.8"/>
          <path d="M 0,-55 L 0,95 L 6.5,95 L 10,-55 Z" fill="#4686bf"/>
          <path d="M -12,86 C -16,105 -8,118 0,118 C 8,118 16,105 12,86 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.8"/>
          <polygon points="0,-16 8,-4 0,8 -8,-4" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
          <polygon points="0,30 8,42 0,54 -8,42" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
        </g>
      </g>`,
  b: `<g transform="translate(100,150) rotate(-28) scale(1.12)">
        <path d="M -14,-44 L -32,-56" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="-34" cy="-60" rx="7" ry="3.5" transform="rotate(-30 -34 -60)" fill="#6aa84f" stroke="${INK}" stroke-width="1.4"/>
        <path d="M 14,-54 L 34,-68" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="38" cy="-70" rx="8" ry="4" transform="rotate(-15 38 -70)" fill="#8bc34a" stroke="${INK}" stroke-width="1.4"/>
        <path d="M 12,30 L 34,20" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="38" cy="18" rx="8" ry="4" transform="rotate(-20 38 18)" fill="#6aa84f" stroke="${INK}" stroke-width="1.4"/>
        <path d="M -10,62 L -28,74" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="-31" cy="77" rx="7" ry="3.5" transform="rotate(-25 -31 77)" fill="#8bc34a" stroke="${INK}" stroke-width="1.4"/>
        <path d="M -18,-98 C -22,-65 -16,25 -8,105 L 8,105 C 16,25 22,-65 18,-98 C 12,-112 -12,-112 -18,-98 Z"
              fill="#f5c418" stroke="${INK}" stroke-width="2"/>
        <path d="M -18,-98 C -20,-60 -15,15 -8,95 L -2,95 C -6,15 -9,-60 -6,-106 Z" fill="#d84528"/>
        <path d="M 18,-98 C 20,-60 15,15 8,95 L 3,95 C 7,15 9,-60 6,-106 Z" fill="#6aa84f"/>
        <path d="M -19,-32 L 19,-18 L 18,-4 L -18,-18 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
        <path d="M -16,22 L 16,36 L 15,50 L -15,36 Z" fill="#ffe156" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="-17" cy="-64" r="4" fill="#ffe156" stroke="${INK}" stroke-width="1.5"/>
        <circle cx="15" cy="-12" r="4" fill="#ffe156" stroke="${INK}" stroke-width="1.5"/>
        <ellipse cx="0" cy="105" rx="8" ry="3.5" fill="#ffe156" stroke="${INK}" stroke-width="1.6"/>
      </g>`
};

function cuerpoNumerico(num, palo) {
  if (num === 1) return ASES[palo];

  if (palo === 'o') {
    const mon = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">${monedaSVG(false)}</g>`;
    const L = {
      2: [[100, 82, 1.02], [100, 218, 1.02]],
      3: [[66, 72, .80], [100, 150, .80], [134, 228, .80]],
      4: [[62, 76, .74], [138, 76, .74], [62, 224, .74], [138, 224, .74]],
      5: [[58, 66, .64], [142, 66, .64], [100, 150, .90], [58, 234, .64], [142, 234, .64]],
      6: [[60, 58, .67], [140, 58, .67], [60, 150, .67], [140, 150, .67], [60, 242, .67], [140, 242, .67]],
      7: [[58, 56, .58], [142, 56, .58], [100, 108, .58], [58, 170, .58], [142, 170, .58], [58, 242, .58], [142, 242, .58]],
      8: [[58, 50, .57], [142, 50, .57], [58, 116, .57], [142, 116, .57], [58, 184, .57], [142, 184, .57], [58, 250, .57], [142, 250, .57]],
      9: [[58, 54, .56], [142, 54, .56], [46, 112, .56], [154, 112, .56], [100, 150, .56], [46, 188, .56], [154, 188, .56], [58, 246, .56], [142, 246, .56]]
    };
    return L[num].map(p => mon(...p)).join('');
  }

  if (palo === 'c') {
    const copa = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">${PIP_COPA}</g>`;
    const L = {
      2: [[100, 86, 1.55], [100, 214, 1.55]],
      3: [[62, 72, 1.25], [100, 150, 1.25], [138, 228, 1.25]],
      4: [[60, 76, 1.22], [140, 76, 1.22], [60, 224, 1.22], [140, 224, 1.22]],
      5: [[56, 66, 1.05], [144, 66, 1.05], [100, 150, 1.12], [56, 234, 1.05], [144, 234, 1.05]],
      6: [[60, 60, 1.05], [140, 60, 1.05], [60, 150, 1.05], [140, 150, 1.05], [60, 240, 1.05], [140, 240, 1.05]],
      7: [[56, 58, .96], [144, 58, .96], [100, 102, .96], [56, 158, .96], [144, 158, .96], [56, 242, .96], [144, 242, .96]],
      8: [[52, 58, .94], [148, 58, .94], [100, 104, .94], [52, 150, .94], [148, 150, .94], [100, 196, .94], [52, 242, .94], [148, 242, .94]],
      9: [[50, 60, .94], [100, 60, .94], [150, 60, .94], [50, 150, .94], [100, 150, .94], [150, 150, .94], [50, 240, .94], [100, 240, .94], [150, 240, .94]]
    };
    return L[num].map(p => copa(...p)).join('');
  }

  if (palo === 'e') {
    const esp = (x, y, rot, sx, sy) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sx},${sy ?? sx})">${PIP_ESPADA}</g>`;
    const L = {
      2: [[60, 150, 0, 2.25], [140, 150, 180, 2.25]],
      3: [[48, 142, 0, 1.92], [100, 158, 180, 1.92], [152, 142, 0, 1.92]],
      4: [[62, 76, -24, 1.24], [138, 76, 24, 1.24], [62, 224, 204, 1.24], [138, 224, 156, 1.24]],
      5: [[56, 70, 0, 1.08], [144, 70, 0, 1.08], [100, 150, 90, 1.22], [56, 230, 180, 1.08], [144, 230, 180, 1.08]],
      6: [[56, 72, 0, 1.14], [100, 72, 0, 1.14], [144, 72, 0, 1.14], [56, 228, 180, 1.14], [100, 228, 180, 1.14], [144, 228, 180, 1.14]],
      7: [[56, 66, 0, 1.04], [100, 66, 0, 1.04], [144, 66, 0, 1.04], [100, 150, 90, 1.18], [56, 234, 180, 1.04], [100, 234, 180, 1.04], [144, 234, 180, 1.04]],
      8: [[50, 72, 0, 1.00, 1.14], [83, 72, 0, 1.00, 1.14], [117, 72, 0, 1.00, 1.14], [150, 72, 0, 1.00, 1.14],
          [50, 228, 180, 1.00, 1.14], [83, 228, 180, 1.00, 1.14], [117, 228, 180, 1.00, 1.14], [150, 228, 180, 1.00, 1.14]],
      9: [[50, 65, 0, 1.00, 1.04], [83, 65, 0, 1.00, 1.04], [117, 65, 0, 1.00, 1.04], [150, 65, 0, 1.00, 1.04],
          [100, 150, 90, 1.18, 1.18],
          [50, 235, 180, 1.00, 1.04], [83, 235, 180, 1.00, 1.04], [117, 235, 180, 1.00, 1.04], [150, 235, 180, 1.00, 1.04]]
    };
    return L[num].map(p => esp(...p)).join('');
  }

  if (palo === 'b') {
    if (num === 3) {
      return `<g transform="translate(100,152) scale(1.15)">
        <g transform="scale(1.85)">${pipBasto('#d83b2d', '#f5c418')}</g>
        <g transform="rotate(28) scale(1.95)">${pipBasto('#f5c418', '#ffe875')}</g>
        <g transform="rotate(-28) scale(1.95)">${pipBasto('#6aa84f', '#cbe86b')}</g>
        <path d="M -38,-48 C -22,-32 18,-26 24,-10 C 30,8 -30,16 -28,36 C -26,52 10,62 28,82" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
        <path d="M -38,-48 C -22,-32 18,-26 24,-10 C 30,8 -30,16 -28,36 C -26,52 10,62 28,82" fill="none" stroke="#82bce8" stroke-width="9" stroke-linecap="round"/>
      </g>`;
    }
    const V = ['#6aa84f', '#cbe86b'], R = ['#d83b2d', '#f5c418'], A = ['#f5c418', '#ffe875'];
    const bas = (x, y, rot, sx, sy, col) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sx},${sy})">${pipBasto(col[0], col[1])}</g>`;
    const L = {
      2: [[64, 150, 0, 2.35, 2.35, V], [136, 150, 180, 2.35, 2.35, R]],
      4: [[62, 76, -22, 1.32, 1.32, V], [138, 76, 22, 1.32, 1.32, R], [62, 224, 202, 1.32, 1.32, R], [138, 224, 158, 1.32, 1.32, V]],
      5: [[58, 68, 18, 1.20, 1.20, V], [142, 68, -18, 1.20, 1.20, R], [100, 150, 90, 1.30, 1.30, A], [58, 232, 162, 1.20, 1.20, R], [142, 232, 198, 1.20, 1.20, V]],
      6: [[56, 74, 0, 1.30, 1.30, R], [100, 74, 180, 1.30, 1.30, V], [144, 74, 0, 1.30, 1.30, R], [56, 226, 180, 1.30, 1.30, V], [100, 226, 0, 1.30, 1.30, R], [144, 226, 180, 1.30, 1.30, V]],
      7: [[56, 66, 0, 1.15, 1.15, R], [100, 66, 180, 1.15, 1.15, V], [144, 66, 0, 1.15, 1.15, R], [100, 150, 90, 1.30, 1.30, A], [56, 234, 180, 1.15, 1.15, V], [100, 234, 0, 1.15, 1.15, R], [144, 234, 180, 1.15, 1.15, V]],
      8: [[50, 74, 180, 1.14, 1.28, V], [83, 74, 0, 1.14, 1.28, R], [117, 74, 180, 1.14, 1.28, V], [150, 74, 0, 1.14, 1.28, R],
          [50, 226, 0, 1.14, 1.28, R], [83, 226, 180, 1.14, 1.28, V], [117, 226, 0, 1.14, 1.28, R], [150, 226, 180, 1.14, 1.28, V]],
      9: [[50, 65, 180, 1.12, 1.14, V], [83, 65, 0, 1.12, 1.14, R], [117, 65, 180, 1.12, 1.14, V], [150, 65, 0, 1.12, 1.14, R],
          [100, 150, 90, 1.30, 1.30, A],
          [50, 235, 0, 1.12, 1.14, R], [83, 235, 180, 1.12, 1.14, V], [117, 235, 0, 1.12, 1.14, R], [150, 235, 180, 1.12, 1.14, V]]
    };
    return L[num].map(p => bas(...p)).join('');
  }
}

function rostroJoven(cx, cy, dir = 1) {
  return `<g transform="translate(${cx},${cy}) scale(${dir},1)">
    <path d="M -9,-8 C -9,-13 9,-13 10,-5 C 11,2 10,8 6,11 C 2,13 -5,12 -8,7 Z" fill="${PIEL}" stroke="${INK}" stroke-width="1.5"/>
    <path d="M -5,-2 Q -2,-3.5 1,-2 M 3,-2 Q 6,-3.5 8,-2" fill="none" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="-2" cy="0" r="1.1" fill="${INK}"/><circle cx="5.5" cy="0" r="1.1" fill="${INK}"/>
    <path d="M 2,1 L 3.5,5 L 1,5.5" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M -1,8 Q 2,9 4.5,7.8" fill="none" stroke="#a63024" stroke-width="1.3" stroke-linecap="round"/>
  </g>`;
}

function cabezaRey(cx, cy, dir = 1) {
  return `<g transform="translate(${cx},${cy}) scale(${dir},1)">
    <path d="M -16,-14 C -22,-4 -22,12 -20,18 L 16,18 C 18,8 16,-8 8,-14 Z" fill="#e6dcd0" stroke="${INK}" stroke-width="1.6"/>
    <path d="M -10,-12 C -10,-16 8,-16 10,-8 C 12,0 12,8 8,13 C 3,16 -6,15 -10,10 Z" fill="${PIEL}" stroke="${INK}" stroke-width="1.5"/>
    <path d="M -5,-4 Q -1,-5.5 2,-4 M 4,-4 Q 7,-5.5 10,-4" fill="none" stroke="${INK}" stroke-width="1.3"/>
    <circle cx="-1" cy="-1.5" r="1.2" fill="${INK}"/><circle cx="6.5" cy="-1.5" r="1.2" fill="${INK}"/>
    <path d="M -11,4 C -13,15 -6,23 3,23 C 12,23 15,15 12,4 C 7,7 -6,7 -11,4 Z" fill="#f0ebe1" stroke="${INK}" stroke-width="1.5"/>
    <path d="M -5,4 Q 3,1 10,5" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M -13,-12 L -16,-28 L -7,-20 L 0,-32 L 7,-20 L 16,-28 L 12,-12 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="-16" cy="-29" r="2" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="0" cy="-33" r="2.2" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="16" cy="-29" r="2" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
  </g>`;
}

function sota(palo) {
  const suelo = `<ellipse cx="106" cy="268" rx="44" ry="6" fill="#d6c582"/>`;
  if (palo === 'o') {
    return `${suelo}
      <path d="M 88,92 C 66,118 62,158 72,190 L 96,172 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.7"/>
      <path d="M 94,186 C 92,212 94,234 97,253 L 106,253 C 106,234 106,210 107,186 Z" fill="#d84528" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 108,186 C 110,212 114,234 117,251 L 126,251 C 125,232 122,208 119,186 Z" fill="#e05a2b" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 97,251 L 82,262 C 81,266 92,267 104,261 L 108,252 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 117,249 L 105,258 C 105,262 115,263 125,257 L 127,250 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 86,154 C 78,170 84,192 106,192 C 128,192 134,170 126,154 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.7"/>
      <path d="M 94,158 L 92,188 M 106,158 L 106,190 M 118,158 L 120,188" stroke="#c98e0a" stroke-width="1.4"/>
      <path d="M 90,92 C 104,88 122,90 126,98 L 127,148 L 87,148 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.7"/>
      <rect x="86" y="144" width="42" height="10" rx="2" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
      <path d="M 95,88 Q 108,98 122,88 L 118,98 Q 108,104 97,98 Z" fill="#fff" stroke="${INK}" stroke-width="1.4"/>
      <path d="M 90,98 C 76,98 66,98 58,97 L 60,108 C 70,110 80,110 92,112 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
      <g transform="translate(58,72) scale(0.54)">${monedaSVG()}</g>
      ${manoAbierta(59, 98, -10)}
      <ellipse cx="127" cy="103" rx="10" ry="12" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 128,112 C 128,128 118,138 102,132 L 104,122 C 115,126 118,120 119,112 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
      ${manoAgarre(101, 127, 20)}
      <path d="M 98,64 C 92,68 92,82 96,86 L 122,86 C 125,78 122,64 114,62 Z" fill="#a86a28" stroke="${INK}" stroke-width="1.5"/>
      ${rostroJoven(110, 74, 1)}
      <path d="M 96,62 C 98,52 122,50 128,60 C 120,64 104,64 96,62 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 102,55 C 94,42 102,32 112,42 C 109,48 107,52 106,55 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.5"/>
    `;
  }
  if (palo === 'c') {
    return `${suelo}
      <g transform="translate(125,146) rotate(-24)">${vainaSVG('#8b3a1e', 44)}</g>
      <path d="M 94,178 C 92,208 93,234 95,254 L 105,254 C 106,234 107,208 107,178 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 108,178 C 111,208 114,232 117,250 L 127,250 C 125,230 123,204 121,178 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 95,252 L 80,262 C 79,266 91,267 102,261 L 106,254 Z" fill="#5ba43a" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 117,248 L 105,257 C 105,261 116,262 125,256 L 128,250 Z" fill="#5ba43a" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 88,154 L 126,154 L 129,180 L 85,180 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 96,156 L 96,178 M 107,156 L 107,178 M 118,156 L 118,178" stroke="#d83b2d" stroke-width="3"/>
      <path d="M 88,92 L 68,164 L 84,168 L 94,116 Z" fill="#6aa84f" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 126,92 L 144,172 L 130,174 L 120,116 Z" fill="#6aa84f" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 89,90 C 100,88 118,88 126,94 L 126,152 L 88,152 Z" fill="#6aa84f" stroke="${INK}" stroke-width="1.7"/>
      <path d="M 91,114 L 123,114 L 123,142 L 91,142 Z" fill="#f7f4ec" stroke="${INK}" stroke-width="1.4"/>
      <rect x="87" y="144" width="40" height="9" rx="2" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
      <path d="M 89,94 C 74,98 62,98 54,95 L 54,105 C 64,108 76,108 90,104 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      <g transform="translate(52,76) scale(1.05)">${COPA_FIG}</g>
      ${manoAgarre(52, 95, 90)}
      <path d="M 126,100 C 136,112 136,130 124,138 L 118,130 C 126,124 126,114 120,108 Z" fill="#6aa84f" stroke="${INK}" stroke-width="1.6"/>
      ${manoAgarre(120, 134, -20)}
      <path d="M 96,56 C 88,64 88,78 92,84 L 124,84 C 126,74 124,60 114,56 Z" fill="#f2c94c" stroke="${INK}" stroke-width="1.5"/>
      ${rostroJoven(106, 70, -1)}
      <path d="M 96,58 Q 108,44 120,58 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 116,52 C 128,36 146,38 152,50 C 140,48 128,50 118,56 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.5"/>
    `;
  }
  if (palo === 'e') {
    return `${suelo}
      <path d="M 88,184 C 86,210 85,232 84,252 L 94,252 C 96,232 98,208 100,184 Z" fill="#d84528" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 108,184 C 110,210 111,232 112,250 L 122,250 C 122,230 121,206 120,184 Z" fill="#d84528" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 84,250 L 70,262 C 69,266 80,267 91,260 L 95,252 Z" fill="#d84528" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 112,248 L 126,256 C 128,260 118,262 108,257 L 108,250 Z" fill="#d84528" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 84,90 C 98,86 118,86 126,92 L 134,186 L 78,186 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.7"/>
      <path d="M 79,168 L 133,168 L 134,186 L 78,186 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.4"/>
      <path d="M 92,126 L 90,182 M 104,126 L 104,182 M 116,126 L 118,182" stroke="#4686bf" stroke-width="1.4"/>
      <rect x="83" y="122" width="46" height="8" rx="2" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
      <path d="M 90,82 C 110,78 134,90 140,114 C 126,126 102,118 86,96 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.7"/>
      <path d="M 128,96 C 144,106 144,126 128,134 L 120,126 C 130,120 130,110 122,104 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.6"/>
      ${manoAgarre(122, 130, -25)}
      <path d="M 84,96 L 56,132 L 62,142 L 90,108 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.6"/>
      <ellipse cx="83" cy="96" rx="10" ry="11" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
      <g transform="translate(56,95) rotate(180) scale(1.18)">${PIP_ESPADA}</g>
      ${manoAgarre(56, 138, 90)}
      <path d="M 92,42 C 84,50 82,70 80,82 L 122,82 C 122,64 118,44 104,42 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
      ${rostroJoven(102, 62, -1)}
    `;
  }
  return `${suelo}
    <path d="M 82,92 L 60,162 L 146,158 L 128,92 Z" fill="#6aa84f" stroke="${INK}" stroke-width="1.7"/>
    <path d="M 88,184 C 89,210 92,232 94,252 L 104,252 C 104,230 103,208 102,184 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 106,184 C 109,210 112,234 114,256 L 124,256 C 123,234 122,208 120,184 Z" fill="#d84528" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 94,250 L 80,258 C 79,262 89,263 99,259 L 104,252 Z" fill="#5ba43a" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 114,254 L 128,263 C 129,267 119,267 110,261 L 112,254 Z" fill="#5ba43a" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 82,146 L 128,146 L 134,186 L 76,186 Z" fill="#82bce8" stroke="${INK}" stroke-width="1.7"/>
    <path d="M 88,150 L 84,184 M 102,150 L 101,184 M 116,150 L 119,184" stroke="#4686bf" stroke-width="1.4"/>
    <path d="M 86,88 C 100,86 116,86 126,92 L 126,146 L 86,146 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.7"/>
    <path d="M 86,130 L 126,130 L 128,148 L 84,148 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
    <path d="M 88,96 C 78,108 72,118 66,128 L 75,134 C 82,124 88,114 96,106 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    <g transform="translate(72,96) rotate(-8) scale(1.36)">${pipBasto('#6aa84f', '#cbe86b')}</g>
    ${manoAgarre(68, 128, 82)}
    <path d="M 126,96 L 132,144 L 122,144 L 118,104 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    ${manoAgarre(127, 146, 0)}
    <path d="M 92,62 C 86,68 86,82 90,86 L 122,86 C 124,76 120,62 110,60 Z" fill="#f2c94c" stroke="${INK}" stroke-width="1.5"/>
    ${rostroJoven(106, 74, 1)}
    <path d="M 94,62 Q 106,46 118,62 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 98,52 L 93,38 L 103,48 L 109,38 L 112,52 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
  `;
}

function caballoBase(dir, colores) {
  const flip = dir === 1 ? 'translate(200,0) scale(-1,1)' : '';
  return `<ellipse cx="102" cy="264" rx="58" ry="6" fill="#d6c582"/>
  <g transform="${flip}">
    <path d="M 148,154 C 168,154 178,176 172,205 C 168,220 174,234 166,244 C 156,232 154,212 156,194 C 156,178 152,166 144,160 Z"
          fill="#e2d7be" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M 154,164 Q 168,184 163,212 M 158,176 Q 166,204 164,234" fill="none" stroke="#9e8f74" stroke-width="1.2"/>
    <path d="M 116,192 C 118,206 122,216 125,222 C 122,232 119,242 118,251 L 111,257 L 122,258 L 124,249 C 126,238 130,228 134,218 C 132,208 131,200 131,192 Z"
          fill="#c4b494" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 118,251 L 111,257 L 122,258 L 124,251 Z" fill="#5e5446" stroke="${INK}" stroke-width="1.2"/>
    <path d="M 126,184 C 132,200 140,208 147,215 C 145,227 142,240 140,252 L 133,260 L 146,260 L 147,250 C 149,236 154,224 156,212 C 154,198 148,182 146,168 Z"
          fill="#ebe3cf" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M 140,252 L 133,260 L 146,260 L 147,252 Z" fill="#6b6050" stroke="${INK}" stroke-width="1.2"/>
    <path d="M 58,172 C 47,178 38,186 35,194 C 38,204 44,213 49,219 L 47,227 L 56,223 L 54,215 C 50,207 47,199 45,194 C 52,189 60,185 68,182 Z"
          fill="#c4b494" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 49,219 L 47,227 L 56,223 L 54,216 Z" fill="#5e5446" stroke="${INK}" stroke-width="1.2"/>
    <path d="M 60,176 C 59,192 59,204 60,213 C 59,226 59,238 58,250 L 52,261 L 66,261 L 66,249 C 67,236 68,223 69,211 C 72,199 76,187 78,175 Z"
          fill="#ebe3cf" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M 58,250 L 52,261 L 66,261 L 66,250 Z" fill="#6b6050" stroke="${INK}" stroke-width="1.2"/>
    <path d="M 54,180 C 46,162 46,144 49,126 C 46,112 40,98 40,89 L 55,88 C 67,96 77,112 83,130 C 89,144 96,150 108,150 L 138,148 C 151,148 158,158 154,178 C 148,191 132,196 112,196 L 76,193 C 64,191 58,187 54,180 Z"
          fill="#ebe3cf" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M 52,162 C 56,174 64,180 74,182 M 58,136 C 64,146 68,156 68,168" fill="none" stroke="#b5a587" stroke-width="2" stroke-linecap="round"/>
    <path d="M 40,89 L 37,76 L 44,85 L 48,76 L 54,88 Z" fill="#ebe3cf" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M 41,89 C 34,94 26,108 19,121 C 17,126 20,132 26,133 C 30,133 34,129 38,125 C 44,122 51,113 55,103 L 54,88 Z"
          fill="#ebe3cf" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M 28,118 C 34,122 40,121 44,115" fill="none" stroke="#b5a587" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="37" cy="103" r="1.8" fill="${INK}"/>
    <circle cx="23" cy="124" r="1.3" fill="${INK}"/>
    <path d="M 53,88 C 68,94 79,110 83,130 C 76,126 71,118 64,109 C 59,102 55,95 50,92 Z" fill="#f7f4ec" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M 58,95 Q 68,106 72,118 M 62,102 Q 72,114 76,124" fill="none" stroke="#b5a587" stroke-width="1.1"/>
    <path d="M 23,119 L 38,124 M 39,94 L 42,122 M 31,130 C 48,136 66,138 82,138" fill="none" stroke="#d83b2d" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M 58,156 Q 94,166 150,150 C 156,166 155,184 148,198 Q 124,205 100,200 Q 76,205 53,195 C 51,180 53,168 58,156 Z"
          fill="#d83b2d" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M 53,195 Q 76,205 100,200 Q 124,205 148,198 L 149,210 Q 124,217 100,212 Q 76,217 52,207 Z"
          fill="#f5c418" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 54,191 Q 76,200 100,196 Q 124,200 148,194" fill="none" stroke="#569cd6" stroke-width="2.8"/>
    <path d="M 88,148 C 95,162 119,162 127,148 L 130,168 L 85,168 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 98,140 C 96,154 96,164 102,172 L 103,196 L 116,196 L 116,140 Z" fill="${colores.calza}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 102,194 L 114,194 L 119,204 L 96,204 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.4"/>
    <path d="M 88,88 C 100,85 114,86 122,90 L 122,144 L 88,144 Z" fill="${colores.jubon}" stroke="${INK}" stroke-width="1.7"/>
    <rect x="87" y="136" width="36" height="8" rx="2" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
    <path d="M 94,58 C 88,64 88,78 92,84 L 120,84 C 122,74 118,60 110,58 Z" fill="#c9a87c" stroke="${INK}" stroke-width="1.5"/>
    ${rostroJoven(105, 70, -1)}
    <path d="M 90,60 Q 106,46 122,60 Z" fill="${colores.sombrero}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 106,50 C 114,34 134,36 138,48 C 126,46 116,48 108,54 Z" fill="${colores.pluma}" stroke="${INK}" stroke-width="1.5"/>
  </g>`;
}

function caballo(palo) {
  if (palo === 'o') {
    return caballoBase(-1, { calza: '#5ba43a', jubon: '#569cd6', sombrero: '#5ba43a', pluma: '#d83b2d' }) + `
      <g transform="translate(62,58) scale(0.50)">${monedaSVG()}</g>
      <path d="M 96,96 L 78,128 L 88,134 L 106,104 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
      ${manoAgarre(80, 130, 30)}
    `;
  }
  if (palo === 'c') {
    return caballoBase(-1, { calza: '#5ba43a', jubon: '#569cd6', sombrero: '#d83b2d', pluma: '#6aa84f' }) + `
      <path d="M 90,92 C 76,86 64,82 54,78 L 54,88 C 64,94 78,98 88,104 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
      <g transform="translate(54,62) scale(0.96)">${COPA_FIG}</g>
      ${manoAgarre(54, 79, 90)}
      <path d="M 102,98 L 86,128 L 96,134 L 112,106 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
      ${manoAgarre(88, 130, 30)}
    `;
  }
  if (palo === 'e') {
    return caballoBase(1, { calza: '#f5c418', jubon: '#569cd6', sombrero: '#d83b2d', pluma: '#f5c418' }) + `
      <path d="M 80,90 L 52,138 L 78,144 Z" fill="#6aa84f" stroke="${INK}" stroke-width="1.6"/>
      <path d="M 94,96 L 84,126 L 93,132 L 104,104 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      <g transform="translate(64,92) rotate(150) scale(1.18)">${PIP_ESPADA}</g>
      ${manoAgarre(86, 130, 60)}
    `;
  }
  return caballoBase(1, { calza: '#5ba43a', jubon: '#569cd6', sombrero: '#6aa84f', pluma: '#d83b2d' }) + `
    <path d="M 94,96 L 76,122 L 85,129 L 104,104 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    <g transform="translate(68,92) rotate(-18) scale(1.36)">${pipBasto('#6aa84f', '#cbe86b')}</g>
    ${manoAgarre(78, 123, 72)}
  `;
}

function reyBase(dir, interior) {
  return `<ellipse cx="104" cy="266" rx="46" ry="6.5" fill="#d6c582"/>
    <path d="M 60,115 L 44,236 C 58,242 74,240 82,232 L 84,115 Z" fill="#f7f4ec" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 134,110 L 154,232 C 142,238 130,236 122,226 Z" fill="#f7f4ec" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 55,148 l 2,4 M 62,174 l -2,4 M 52,202 l 2,4 M 68,218 l -2,4 M 138,162 l 2,4 M 142,196 l -2,4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    <path d="M 80,242 L 76,258 L 58,264 C 57,267 66,268 78,264 L 88,256 L 88,242 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 118,242 L 122,258 L 138,264 C 139,267 130,268 118,264 L 110,256 L 110,242 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 76,112 C 92,108 116,108 132,112 L 136,244 L 68,244 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.8"/>
    <path d="M 70,224 L 135,224 L 136,244 L 68,244 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
    <path d="M 73,210 Q 88,200 100,214 Q 114,200 132,212 L 134,224 L 70,224 Z" fill="#ffe156" stroke="${INK}" stroke-width="1.3"/>
    <path d="M 72,234 L 134,234" stroke="${INK}" stroke-width="1.3" stroke-dasharray="4 4"/>
    <rect x="75" y="138" width="58" height="9" rx="2" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
    ${interior}
    <path d="M 92,82 C 74,90 58,104 48,116 C 68,128 106,120 138,98 C 132,86 122,80 106,82 Z"
          fill="#569cd6" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M 64,114 Q 96,112 126,95 M 78,104 Q 102,102 122,88" fill="none" stroke="#2c6396" stroke-width="1.6" stroke-linecap="round"/>
    ${cabezaRey(108, 64, dir)}
  `;
}

function rey(palo) {
  if (palo === 'o') {
    return `<g transform="translate(56,70) scale(0.54)">${monedaSVG()}</g>` +
      reyBase(1, `
        <path d="M 76,94 C 54,104 42,114 36,126 L 46,132 C 52,120 64,112 80,106 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
        <g transform="translate(40,140) rotate(-18)">${vainaSVG('#a84e24', 92)}</g>
        ${manoAgarre(37, 127, 20)}
        <path d="M 130,96 C 148,108 152,130 132,144 L 122,138 C 136,128 134,114 124,106 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
        ${manoAgarre(120, 140, 10)}
      `);
  }
  if (palo === 'c') {
    return `<g transform="translate(54,76) scale(1.02)">${COPA_FIG}</g>` +
      reyBase(-1, `
        <g transform="translate(122,148) rotate(-6)">${vainaSVG('#5ba43a', 70)}</g>
        <path d="M 80,96 C 68,104 58,110 52,112 L 54,122 C 64,120 74,116 84,108 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
        ${manoAbierta(53, 113, -8)}
        <path d="M 128,100 C 142,112 142,132 126,140 L 120,132 C 130,126 130,114 122,108 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
        ${manoAgarre(122, 136, -15)}
      `);
  }
  if (palo === 'e') {
    return reyBase(-1, `
      <path d="M 116,144 L 124,144 L 118,214 L 112,214 Z" fill="#5ba43a" stroke="${INK}" stroke-width="1.5"/>
      <path d="M 113,200 L 119,200 L 118,214 L 112,214 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.3"/>
      <path d="M 78,98 L 42,132 L 50,140 L 86,108 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      <g transform="translate(52,90) rotate(192) scale(1.25)">${PIP_ESPADA}</g>
      ${manoAgarre(42, 135, 102)}
      <path d="M 130,104 L 138,144 L 128,146 L 122,112 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
      ${manoAgarre(133, 148, 0)}
    `);
  }
  return reyBase(1, `
    <g transform="translate(114,144)">${vainaSVG('#5ba43a', 78)}</g>
    <path d="M 80,98 L 70,126 L 78,132 L 88,108 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    <g transform="translate(64,96) rotate(-14) scale(1.38)">${pipBasto('#6aa84f', '#cbe86b')}</g>
    ${manoAgarre(72, 128, 76)}
    <path d="M 130,96 C 146,108 148,128 130,138 L 122,130 C 134,122 134,112 124,104 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    ${manoAgarre(126, 134, -15)}
  `);
}

function comodinSVG() {
  const cuerpo = `
    <ellipse cx="100" cy="244" rx="44" ry="6" fill="#d6c582"/>
    <g transform="translate(132,74) scale(0.19)">${monedaSVG()}</g>
    <g transform="translate(150,82) scale(0.30)">${COPA_FIG}</g>
    <g transform="translate(162,100) rotate(22) scale(0.22)">${PIP_ESPADA}</g>
    <g transform="translate(144,104) rotate(12) scale(0.24)">${pipBasto('#6aa84f', '#cbe86b')}</g>
    <path d="M 88,166 C 82,194 76,214 72,232 L 82,234 C 88,216 94,196 100,166 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 102,166 C 108,194 114,214 118,232 L 128,230 C 124,210 118,190 112,166 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 72,230 L 54,238 C 51,241 58,245 72,240 L 83,234 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="53" cy="238" r="2.6" fill="#f5c418" stroke="${INK}" stroke-width="1.1"/>
    <path d="M 118,230 L 136,236 C 139,239 132,244 118,239 L 116,232 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="137" cy="236" r="2.6" fill="#f5c418" stroke="${INK}" stroke-width="1.1"/>
    <path d="M 78,144 L 122,144 L 130,170 L 116,162 L 106,174 L 96,162 L 84,174 L 72,166 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="72" cy="168" r="2.6" fill="#f5c418" stroke="${INK}" stroke-width="1.1"/>
    <circle cx="84" cy="176" r="2.6" fill="#f5c418" stroke="${INK}" stroke-width="1.1"/>
    <circle cx="106" cy="176" r="2.6" fill="#f5c418" stroke="${INK}" stroke-width="1.1"/>
    <circle cx="130" cy="172" r="2.6" fill="#f5c418" stroke="${INK}" stroke-width="1.1"/>
    <path d="M 80,92 L 100,92 L 100,146 L 78,146 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 100,92 L 120,92 L 122,146 L 100,146 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.6"/>
    <rect x="77" y="139" width="46" height="8" rx="2" fill="#f5c418" stroke="${INK}" stroke-width="1.4"/>
    <path d="M 84,88 Q 92,102 100,94 Q 108,102 116,88 L 112,99 Q 100,106 88,99 Z" fill="#fff" stroke="${INK}" stroke-width="1.4"/>
    <path d="M 80,96 C 68,110 60,122 52,134 L 62,138 C 68,126 76,116 84,108 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 48,96 L 60,180" stroke="#8b3a1e" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M 48,96 L 60,180" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="47" cy="92" r="7.5" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
    <path d="M 40,88 L 36,78 L 46,84 L 53,76 L 54,88 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.3"/>
    ${manoAgarre(55, 136, 80)}
    <path d="M 120,96 C 132,108 140,118 148,124 L 142,132 C 132,126 124,116 116,106 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    ${manoAgarre(147, 126, -30)}
    ${rostroJoven(100, 74, 1)}
    <path d="M 86,66 C 84,54 94,48 100,50 C 108,48 116,54 114,66 Q 100,60 86,66 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.6"/>
    <path d="M 88,58 C 72,46 66,54 64,62 C 74,58 82,60 88,64 Z" fill="#569cd6" stroke="${INK}" stroke-width="1.5"/>
    <path d="M 112,58 C 126,44 134,50 136,60 C 126,56 118,58 112,64 Z" fill="#f5c418" stroke="${INK}" stroke-width="1.5"/>
    <path d="M 96,50 C 98,34 106,30 112,38 C 106,42 104,46 104,52 Z" fill="#d83b2d" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="63" cy="63" r="3" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="113" cy="38" r="3" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="137" cy="61" r="3" fill="#f5c418" stroke="${INK}" stroke-width="1.2"/>
    <rect x="44" y="254" width="112" height="20" rx="5" fill="#f5c418" stroke="${INK}" stroke-width="1.6"/>
    <text x="100" y="268.5" text-anchor="middle" font-family="Georgia, serif" font-size="12" font-weight="700" letter-spacing="1.4" fill="${INK}">COMODÍN</text>
  `;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
    <defs><clipPath id="clipMon"><circle cx="0" cy="0" r="27.2"/></clipPath></defs>
    <rect width="200" height="300" fill="#faf7ef"/>
    ${marcoYPintas(null, '★')}
    ${cuerpo}
  </svg>`;
}

function cartaCastellanaSVG(codigo) {
  if (codigo === 'comodin') return comodinSVG();
  const num = parseInt(codigo.slice(0, 2), 10);
  const palo = codigo.slice(2);
  const cuerpo = num <= 9
    ? cuerpoNumerico(num, palo)
    : num === 10 ? sota(palo) : num === 11 ? caballo(palo) : rey(palo);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
    <defs><clipPath id="clipMon"><circle cx="0" cy="0" r="27.2"/></clipPath></defs>
    <rect width="200" height="300" fill="#faf7ef"/>
    ${marcoYPintas(palo, num)}
    ${cuerpo}
  </svg>`;
}

const CODIGOS_BARAJA = [];
for (let n = 1; n <= 12; n++) {
  for (const p of ['o', 'c', 'e', 'b']) {
    CODIGOS_BARAJA.push(String(n).padStart(2, '0') + p);
  }
}
CODIGOS_BARAJA.push('comodin');

if (typeof module !== 'undefined') {
  module.exports = { cartaCastellanaSVG, CODIGOS_BARAJA };
}