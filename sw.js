// Mi Chinchorro: guarda la app para jugar sin internet
const CACHE = 'michinchorro-v38';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'naipes/01b.jpg', 'naipes/01c.jpg', 'naipes/01e.jpg', 'naipes/01o.jpg', 'naipes/02b.jpg', 'naipes/02c.jpg', 'naipes/02e.jpg', 'naipes/02o.jpg', 'naipes/03b.jpg', 'naipes/03c.jpg', 'naipes/03e.jpg', 'naipes/03o.jpg', 'naipes/04b.jpg', 'naipes/04c.jpg', 'naipes/04e.jpg', 'naipes/04o.jpg', 'naipes/05b.jpg', 'naipes/05c.jpg', 'naipes/05e.jpg', 'naipes/05o.jpg', 'naipes/06b.jpg', 'naipes/06c.jpg', 'naipes/06e.jpg', 'naipes/06o.jpg', 'naipes/07b.jpg', 'naipes/07c.jpg', 'naipes/07e.jpg', 'naipes/07o.jpg', 'naipes/08b.jpg', 'naipes/08c.jpg', 'naipes/08e.jpg', 'naipes/08o.jpg', 'naipes/09b.jpg', 'naipes/09c.jpg', 'naipes/09e.jpg', 'naipes/09o.jpg', 'naipes/10b.jpg', 'naipes/10c.jpg', 'naipes/10e.jpg', 'naipes/10o.jpg', 'naipes/11b.jpg', 'naipes/11c.jpg', 'naipes/11e.jpg', 'naipes/11o.jpg', 'naipes/12b.jpg', 'naipes/12c.jpg', 'naipes/12e.jpg', 'naipes/12o.jpg',
  'naipes-castellana/01o.svg', 'naipes-castellana/01c.svg', 'naipes-castellana/01b.svg', 'naipes-castellana/01e.svg', 'naipes-castellana/02o.svg', 'naipes-castellana/02c.svg', 'naipes-castellana/02b.svg', 'naipes-castellana/02e.svg', 'naipes-castellana/03o.svg', 'naipes-castellana/03c.svg', 'naipes-castellana/03b.svg', 'naipes-castellana/03e.svg', 'naipes-castellana/04o.svg', 'naipes-castellana/04c.svg', 'naipes-castellana/04b.svg', 'naipes-castellana/04e.svg', 'naipes-castellana/05o.svg', 'naipes-castellana/05c.svg', 'naipes-castellana/05b.svg', 'naipes-castellana/05e.svg', 'naipes-castellana/06o.svg', 'naipes-castellana/06c.svg', 'naipes-castellana/06b.svg', 'naipes-castellana/06e.svg', 'naipes-castellana/07o.svg', 'naipes-castellana/07c.svg', 'naipes-castellana/07b.svg', 'naipes-castellana/07e.svg', 'naipes-castellana/08o.svg', 'naipes-castellana/08c.svg', 'naipes-castellana/08b.svg', 'naipes-castellana/08e.svg', 'naipes-castellana/09o.svg', 'naipes-castellana/09c.svg', 'naipes-castellana/09b.svg', 'naipes-castellana/09e.svg', 'naipes-castellana/10o.svg', 'naipes-castellana/10c.svg', 'naipes-castellana/10b.svg', 'naipes-castellana/10e.svg', 'naipes-castellana/11o.svg', 'naipes-castellana/11c.svg', 'naipes-castellana/11b.svg', 'naipes-castellana/11e.svg', 'naipes-castellana/12o.svg', 'naipes-castellana/12c.svg', 'naipes-castellana/12b.svg', 'naipes-castellana/12e.svg', 'naipes-castellana/comodin.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Primero la red (para recibir mejoras); si no hay conexión, lo guardado
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // solo lo de la propia web: Google/Firebase van siempre por internet
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
