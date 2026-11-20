// Genera las 49 cartas de la baraja Castellana (naipes-castellana/*.svg)
// Uso, desde la raíz del repo:  node herramientas/generar-castellana.js
const fs = require('fs'), path = require('path');
const { cartaCastellanaSVG, CODIGOS_BARAJA } = require('./baraja-castellana.js');
const dir = path.join(__dirname, '..', 'naipes-castellana');
fs.mkdirSync(dir, { recursive: true });
for (const c of CODIGOS_BARAJA) {
  const svg = cartaCastellanaSVG(c).replace(/>\s+</g, '><').replace(/\n\s*/g, ' ').trim();
  fs.writeFileSync(path.join(dir, c + '.svg'), svg + '\n');
}
console.log(`Listo: ${CODIGOS_BARAJA.length} cartas en naipes-castellana/`);
