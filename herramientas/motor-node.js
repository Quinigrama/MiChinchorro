// Carga el motor del chinchón en Node (para simulaciones y pruebas), igual que lo carga la web:
//   const E = require('./herramientas/motor-node.js');
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const src = ['chinchon/reglas.js', 'chinchon/bots.js'].map(f => fs.readFileSync(path.join(raiz, f), 'utf8')).join('\n');
const m = { exports: {} };
new Function('module', 'require', src)(m, require);
module.exports = m.exports;
