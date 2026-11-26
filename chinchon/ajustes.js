// Mi Chinchorro — pantalla de ajustes (reglas de casa y opciones)
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

/* ---------- Ajustes ---------- */
const OPC = [
  { h: 'La partida' },
  { k: 'naipes', t: 'Naipes', vis: true },
  { k: 'indices', t: 'Números grandes en los naipes (Clásicos y Castellana)', op: [[true, 'Sí'], [false, 'No']] },
  { k: 'jugadores', t: 'Número de jugadores', op: [[2, '2'], [3, '3'], [4, '4'], [5, '5']] },
  { k: 'baraja', t: 'Baraja', op: [[40, '40 cartas'], [48, '48 cartas (con 8 y 9)']] },
  { k: 'comodines', t: 'Comodines 🃏', op: [[0, 'Sin'], [1, '1'], [2, '2']] },
  { k: 'perfil', t: 'Quién eres', perfil: true },
  { k: 'genero', t: 'Los personajes te hablan como a…', op: [['', 'Según tu avatar'], ['f', 'Una chica'], ['m', 'Un chico']] },
  { k: 'mesa', t: 'Con quién juegas', mesa: true },
  { k: 'gemini', t: '✨ Gemini de rival (experimento)', ia: 4 },
  { k: 'deepseek', t: '🐋 DeepSeek de rival (experimento)', ia: 5 },
  { k: 'nivel', t: 'Dificultad de todos los rivales', op: [[0, 'Fácil'], [1, 'Normal'], [2, 'Difícil'], [3, 'Experta 🧠']] },
  { k: 'manias', t: 'Manías de los personajes 🎭 (Andrés prudente, Lucas arriesgado, Matilde la ojo avizor, Elvira la estratega)', op: [[true, 'Sí'], [false, 'No, todos de libro']] },
  { k: 'velocidad', t: 'Velocidad de los rivales', op: [[0, 'Despacio'], [1, 'Normal'], [2, 'Rápido']] },
  { k: 'reloj', t: 'Partida rápida ⏱️ (reloj para tu turno y rivales relámpago; no en mesas online)', op: [[0, 'No'], [8, '8 s por turno'], [5, '5 s por turno'], ['ajedrez', '♟️ Ajedrez: 2 min + 2 s']] },
  { k: 'charla', t: 'Comentarios de los personajes 💬', op: [[0, 'No'], [1, 'Pocos'], [2, 'Muchos']] },
  { k: 'reparto', t: 'Ver barajar y repartir', op: [[2, 'Siempre'], [1, 'Solo al empezar'], [0, 'No']] },
  { k: 'barajado', t: 'Forma de barajar', op: [['real', '7 mezclas de verdad'], ['azar', 'Rápido (3 vueltas)']] },
  { k: 'vibrar', t: 'Vibración (al tocarte y cuando alguien cierra)', op: [[true, 'Sí'], [false, 'No']] },
  { k: 'sonido', t: 'Sonido 🔊', op: [[0, 'No'], [1, 'Efectos'], [2, 'Efectos y voces']] },
  { k: 'tapete', t: 'Tapete', op: [['verde', '🟩 Verde'], ['azul', '🟦 Azul'], ['granate', '🟥 Granate'], ['madera', '🟫 Madera'], ['noche', '⬛ Noche']] },
  { k: 'reverso', t: 'Reverso de las cartas', op: [['rojo', '🟥 Rojo'], ['azul', '🟦 Azul'], ['verde', '🟩 Verde'], ['morado', '🟪 Morado'], ['negro', '⬛ Negro']] },
  { k: 'ayudas', t: 'Ayudas (avisos y puntos sueltos)', op: [[true, 'Sí'], [false, 'No']] },
  { h: 'Dinero y puntos' },
  { k: 'raya', t: 'Cada raya vale (se apunta al pasarse)', op: [[0.1, '0,10 €'], [0.2, '0,20 €'], [0.5, '0,50 €'], [1, '1 €']] },
  { k: 'precioChinchon', t: 'El chinchón se cobra (cada una le paga)', op: [[1, '1 €'], [2, '2 €'], [3, '3 €'], [5, '5 €']] },
  { k: 'limite', t: 'Raya al pasar de', op: [[50, '50'], [75, '75'], [100, '100'], [150, '150']] },
  { k: 'reenganche', t: 'Reengancharse con los puntos de la que más tiene', op: [[true, 'Sí'], [false, 'No, se queda fuera']] },
  { h: 'Reglas de la casa' },
  { k: 'maxPuntos', t: 'Cerrar con, como mucho… (puntos)', op: [[0, '0'], [1, '1'], [3, '3'], [5, '5'], [7, '7']] },
  { k: 'maxSueltas', t: 'Cartas sin ligar al cerrar', op: [[0, 'Ninguna'], [1, '1'], [2, '2'], [7, 'Da igual']] },
  { k: 'figuras', t: 'Sota, caballo y rey valen', op: [[10, '10 puntos'], [0, '10, 11 y 12']] },
  { k: 'valorComodin', t: 'Comodín sin ligar vale', op: [[25, '25'], [50, '50']] },
  { k: 'colgar', t: 'Colgar (descartarse) en las jugadas del que cierra · no si hace −10', op: [[true, 'Sí'], [false, 'No']] },
  { k: 'chinchonGana', t: 'El chinchón gana la partida', op: [[true, 'Sí'], [false, 'No (vale −10)']] }
];
function pintarAjustes() {
  $('notaPartida').classList.toggle('oculto', !LS.get('mc-partida2', null));
  let h = '', abierto = false;
  for (const o of OPC) {
    if (o.h) { if (abierto) h += '</div>'; h += `<div class="grupo"><h3>${o.h}</h3>`; abierto = true; continue; }
    h += `<div class="opc"><div class="tit">${o.t}</div>`;
    if (o.ia) { h += htmlIA(o.ia) + '</div>'; continue; }
    if (o.perfil) {
      h += `<input data-k="nombre" value="${String(PREF.nombre || '').replace(/"/g, '&quot;')}" placeholder="Escribe tu nombre">`;
      h += `<div class="tit" style="margin-top:10px">Tu avatar</div><div class="avatares">${opcionesAvatar().map(k => `<button class="avbtn" data-avatar="${k}" aria-pressed="${PREF.avatar === k}">${avatarSVG(k)}</button>`).join('')}</div></div>`;
      continue;
    }
    if (o.mesa) {
      const yo = (PREF.nombre || '').trim().toLowerCase();
      const sent = rivalesSentados(), falta = PREF.jugadores - 1;
      h += `<div class="nota" style="margin:-2px 0 8px">Toca para sentar o levantar. Sentados: <b>${Math.min(sent.length, falta)} de ${falta}</b>${sent.length < falta ? ' (si faltan, se sientan solos al empezar)' : ''}.</div><div class="porrival">`;
      for (const n of NOMBRES_P) {
        if (n.toLowerCase() === yo) continue;
        const pos = sent.indexOf(n), dentro = pos >= 0 && pos < falta;
        const nv = (PREF.nivelDe || {})[n] ?? PREF.nivel;
        h += `<div class="fr ${dentro ? '' : 'fuera'}"><button class="sentar" data-sentar="${n}" aria-pressed="${dentro}">${avatarSVGmini(n)}${n}${dentro ? ' ✓' : ''}</button>`
          + (dentro ? `<div class="seg chico">${nivOpc().map(([v, l]) => `<button data-nivelde="${n}" data-v="${v}" aria-pressed="${nv === v}" title="${NIVELES[v]}">${l}</button>`).join('')}</div>` : '') + '</div>'
        if (MANIAS[n] && PREF.manias !== false) h += `<div class="nota" style="margin:-4px 0 6px 14px;text-align:left">🎭 ${n} ${MANIAS[n].t}</div>`;
      }
      h += `<div class="nota">🟢 Fácil · 🟡 Normal · 🔴 Difícil · 🧠 Experta${leyendaIAs()}</div></div></div>`;
      continue;
    }
    if (o.porRival) {
      const noms = PREF.nombres.split(',').map(x => x.trim()).filter(Boolean);
      const nv = PREF.niveles || [];
      h += '<div class="porrival">';
      for (let k = 0; k < PREF.jugadores - 1; k++) {
        const actual = nv[k] ?? PREF.nivel;
        h += `<div class="fr"><span class="conava">${avatarSVGmini(k + 1)}${noms[k] || 'Rival ' + (k + 1)}</span><div class="seg chico">${nivOpc().map(([v, l]) => `<button data-rival="${k}" data-v="${v}" aria-pressed="${actual === v}" title="${NIVELES[v]}">${l}</button>`).join('')}</div></div>`;
      }
      h += `<div class="nota">🟢 Fácil · 🟡 Normal · 🔴 Difícil · 🧠 Experta${leyendaIAs()}</div></div></div>`;
      continue;
    }
    if (o.vis) {
      const muestra = [{ s: 0, r: 1 }, { s: 1, r: 12 }, { s: 2, r: 7 }];
      const opcion = (v, l) => { const g = PREF.naipes; PREF.naipes = v; const cs = muestra.map(c => htmlCarta(c)).join(''); PREF.naipes = g;
        return `<button data-k="naipes" data-v='"${v}"' aria-pressed="${PREF.naipes === v}" class="naipe"><span class="trio">${cs}</span>${l}</button>`; };
      h += `<div class="seg">${opcion('clasicas', 'Clásicos')}${opcion('castellana', 'Castellana')}${opcion('dibujadas', 'Sencillos')}</div></div>`;
      continue;
    }
    if (o.txt) h += `<input data-k="${o.k}" value="${String(PREF[o.k]).replace(/"/g, '&quot;')}">`;
    else h += `<div class="seg">${o.op.map(([v, l]) => `<button data-k="${o.k}" data-v='${JSON.stringify(v)}' aria-pressed="${PREF[o.k] === v}">${l}</button>`).join('')}</div>`;
    if (o.k === 'baraja' && PREF.baraja === 40 && PREF.jugadores === 5) h += '<div class="nota">Con 5 jugadores y 40 cartas apenas queda mazo: mejor la de 48.</div>';
    h += '</div>';
  }
  $('opciones').innerHTML = h + '</div>';
  $('opciones').querySelectorAll('button').forEach(b => b.onclick = () => {
    if (b.dataset.iaprueba) return probarIA(+b.dataset.iaprueba);
    if (b.dataset.avatar) { PREF.avatar = b.dataset.avatar; PREF.perfilHecho = true; }
    else if (b.dataset.sentar) {
      const n = b.dataset.sentar, falta = PREF.jugadores - 1;
      let r = rivalesSentados().slice(0, falta);
      if (r.includes(n)) r = r.filter(x => x !== n);
      else if (r.length >= falta) { aviso(`Ya hay ${falta} en la mesa: levanta antes a alguien`); return; }
      else r.push(n);
      PREF.rivales = r;
    }
    else if (b.dataset.nivelde) { PREF.nivelDe = Object.assign({}, PREF.nivelDe, { [b.dataset.nivelde]: +b.dataset.v }); }
    else if (b.dataset.rival !== undefined) { const nv = (PREF.niveles || []).slice(); for (let k = 0; k < 4; k++) if (nv[k] == null) nv[k] = PREF.nivel; nv[+b.dataset.rival] = +b.dataset.v; PREF.niveles = nv; }
    else { PREF[b.dataset.k] = JSON.parse(b.dataset.v); if (b.dataset.k === 'nivel') { PREF.niveles = null; PREF.nivelDe = {}; } }
    LS.set('mc-ajustes2', PREF); aplicarTema(); pintarAjustes();
    if (b.dataset.k === 'sonido' && PREF.sonido > 0) { sonar('carta'); if (PREF.sonido === 2) setTimeout(() => hablar('Matilde', '¿Quién juga?'), 300); }
  });
  $('opciones').querySelectorAll('input').forEach(i => { if (i.dataset.ia) { i.oninput = () => { const nv = +i.dataset.ia; LS.set(IAS[nv].K, Object.assign(iaCfg(nv), { [i.dataset.campo]: i.value.trim() })); }; i.onchange = () => pintarAjustes(); return; } i.oninput = () => { PREF[i.dataset.k] = i.value; if (i.dataset.k === 'nombre') PREF.perfilHecho = true; LS.set('mc-ajustes2', PREF); }; i.onchange = () => pintarAjustes(); });
}
$('bReset').onclick = () => { PREF = Object.assign({}, DEF); LS.set('mc-ajustes2', PREF); pintarAjustes(); aviso('Ajustes de siempre puestos'); };
$('bSaldo').onclick = () => { CART.saldo = SALDO0; guardarCartera(); if (enCuenta()) { window.marcarReinicio('mon'); window.__cuenta = null; subirNube(); } aviso('Monedero a 10,00 €'); };
$('bAjustes').onclick = () => ir('ajustes');
$('bReglas').onclick = () => ir('reglas');

