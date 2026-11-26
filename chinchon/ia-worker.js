// Mi Chinchorro — la Experta piensa aquí, en otro hilo, para que la pantalla no se congele.
// Carga el mismo motor que la página y decide la tirada con una copia del estado de la partida.
importScripts('reglas.js', 'bots.js');
onmessage = e => {
  const { n } = e.data;
  try { postMessage(Object.assign({ n, ok: true }, tiradaDesdeOtroHilo(e.data))); }
  catch (err) { postMessage({ n, ok: false, err: String(err && err.message || err) }); }
};
