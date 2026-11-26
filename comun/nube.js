// Mi Chinchorro — Firebase (módulo): se carga solo cuando hace falta
// (troceado del antiguo index.html: se carga en el mismo orden que antes, ver index.html)

// Firebase: se carga solo cuando hace falta (y nunca impide jugar sin internet)
const CFG = {
  apiKey: "AIzaSyDoIPykr9tW7qSAVVniWAGuhnxCzm3-oak",
  authDomain: "michinchorro.firebaseapp.com",
  projectId: "michinchorro",
  storageBucket: "michinchorro.firebasestorage.app",
  messagingSenderId: "167915556831",
  appId: "1:167915556831:web:1e55307f16f38d15677e6a"
};
const B = 'https://www.gstatic.com/firebasejs/13.4.0/';
let fb = null, usuario = null, cargando = null;
function cargar() {
  if (cargando) return cargando;
  cargando = (async () => {
    const [app, auth, fs] = await Promise.all([import(B + 'firebase-app.js'), import(B + 'firebase-auth.js'), import(B + 'firebase-firestore.js')]);
    const a = app.initializeApp(CFG);
    const au = auth.getAuth(a); au.languageCode = 'es';
    fb = { auth, fs, au, db: fs.getFirestore(a) };
    await new Promise(res => auth.onAuthStateChanged(au, u => { usuario = u; window.dispatchEvent(new CustomEvent('nube')); if (u) subir().catch(() => {}); res(); }));
    return fb;
  })();
  cargando.catch(() => { cargando = null; });
  return cargando;
}
async function entrar() { const f = await cargar(); const p = new f.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); await f.auth.signInWithPopup(f.au, p); }
async function salir() { const f = await cargar(); await f.auth.signOut(f.au); try { localStorage.removeItem('mc-nube'); } catch (e) {} }
// Cada aparato (móvil, PC…) guarda sus propias cuentas; en la nube se suman todas
function miAparato() {
  let id = null; try { id = localStorage.getItem('mc-aparato'); } catch (e) {}
  if (!id) { id = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); try { localStorage.setItem('mc-aparato', id); } catch (e) {} }
  return id;
}
async function subir() {
  if (!usuario || !fb) return;
  const ref = fb.fs.doc(fb.db, 'jugadores', usuario.uid), yo = miAparato();
  let previo = null; try { const s = await fb.fs.getDoc(ref); previo = s.exists() ? s.data() : null; } catch (e) {}
  const doc = window.mezclarCuenta(previo, yo);
  await fb.fs.setDoc(ref, Object.assign(doc, { actualizado: fb.fs.serverTimestamp() }));
  window.__cuenta = doc.aparatos; window.dispatchEvent(new CustomEvent('cuenta'));
}
async function records() {
  const f = await cargar(); if (!usuario) throw new Error('sin sesión');
  const s = await f.fs.getDocs(f.fs.query(f.fs.collection(f.db, 'jugadores'), f.fs.limit(300)));
  return s.docs.map(x => Object.assign({ id: x.id }, x.data()));
}
// Mesas online por Firestore (mismo «idioma» que la red de pruebas)
const red = {
  async crear(c, d) { const f = fb, r = f.fs.doc(f.db, 'mesas', c); const s = await f.fs.getDoc(r); if (s.exists()) throw new Error('existe'); await f.fs.setDoc(r, d); },
  async leer(c) { const s = await fb.fs.getDoc(fb.fs.doc(fb.db, 'mesas', c)); return s.exists() ? s.data() : null; },
  escuchar(c, cb) { return fb.fs.onSnapshot(fb.fs.doc(fb.db, 'mesas', c), s => cb(s.exists() ? s.data() : null), e => console.warn('mesa', e)); },
  async publicar(c, d) { await fb.fs.updateDoc(fb.fs.doc(fb.db, 'mesas', c), d); },
  async sentar(c, uid, d) { await fb.fs.setDoc(fb.fs.doc(fb.db, 'mesas', c, 'sentados', uid), d); },
  escucharSentados(c, cb) { return fb.fs.onSnapshot(fb.fs.collection(fb.db, 'mesas', c, 'sentados'), s => cb(s.docs.map(x => Object.assign({ uid: x.id }, x.data()))), e => console.warn('sentados', e)); },
  async mano(c, uid, cartas) { await fb.fs.setDoc(fb.fs.doc(fb.db, 'mesas', c, 'manos', uid), { cartas }); },
  escucharMano(c, uid, cb) { return fb.fs.onSnapshot(fb.fs.doc(fb.db, 'mesas', c, 'manos', uid), s => { if (s.exists()) cb(s.data().cartas); }, e => console.warn('mano', e)); },
  async misMesas(uid) { const f = fb.fs, q = f.query(f.collection(fb.db, 'mesas'), f.where('miembros', 'array-contains', uid)); const s = await f.getDocs(q); return s.docs.map(x => Object.assign({ codigo: x.id }, x.data())); },
  async guardarPriv(c, d) { await fb.fs.setDoc(fb.fs.doc(fb.db, 'mesas', c, 'privado', 'estado'), d); },
  async leerPriv(c) { const s = await fb.fs.getDoc(fb.fs.doc(fb.db, 'mesas', c, 'privado', 'estado')); return s.exists() ? s.data() : null; },
  async levantar(c, uid) { await fb.fs.deleteDoc(fb.fs.doc(fb.db, 'mesas', c, 'sentados', uid)); },
  async borrarMesa(c) {
    const f = fb.fs, r = f.doc(fb.db, 'mesas', c), s = await f.getDoc(r); if (!s.exists()) return;
    const m = s.data(), uids = new Set((m.miembros || []).concat((m.publico && m.publico.jugadores || []).map(j => j.uid).filter(Boolean)));
    const borra = ref => f.deleteDoc(ref).catch(() => {});
    const sent = await f.getDocs(f.collection(fb.db, 'mesas', c, 'sentados')).catch(() => null);
    if (sent) sent.docs.forEach(x => uids.add(x.id));
    const acc = await f.getDocs(f.collection(fb.db, 'mesas', c, 'acciones')).catch(() => null);
    await Promise.all([borra(f.doc(fb.db, 'mesas', c, 'privado', 'estado'))]
      .concat([...uids].map(u => borra(f.doc(fb.db, 'mesas', c, 'manos', u))))
      .concat([...uids].map(u => borra(f.doc(fb.db, 'mesas', c, 'sentados', u))))
      .concat(acc ? acc.docs.map(x => borra(x.ref)) : []));
    await f.deleteDoc(r);
  },
  async accion(c, d) { await fb.fs.addDoc(fb.fs.collection(fb.db, 'mesas', c, 'acciones'), d); },
  escucharAcciones(c, cb) { return fb.fs.onSnapshot(fb.fs.collection(fb.db, 'mesas', c, 'acciones'), s => { s.docChanges().forEach(ch => { if (ch.type === 'added') { cb(ch.doc.data()); fb.fs.deleteDoc(ch.doc.ref).catch(() => {}); } }); }, e => console.warn('acciones', e)); }
};
async function subirJugadas(lista) {
  if (!usuario || !fb) throw new Error('sin sesión');
  const b = fb.fs.writeBatch(fb.db), ap = miAparato();
  for (const r of lista) b.set(fb.fs.doc(fb.fs.collection(fb.db, 'jugadas')), Object.assign({}, r, { uid: usuario.uid, ap, subido: fb.fs.serverTimestamp() }));
  await b.commit();
}
async function bajarJugadas(desdeMs, n) {
  if (!usuario || !fb) throw new Error('sin sesión');
  const f = fb.fs, q = f.query(f.collection(fb.db, 'jugadas'), f.where('subido', '>', f.Timestamp.fromMillis(desdeMs || 0)), f.orderBy('subido'), f.limit(n || 500));
  const s = await f.getDocs(q);
  return s.docs.map(x => { const d = x.data(); d.subidoMs = d.subido && d.subido.toMillis ? d.subido.toMillis() : 0; return d; });
}
window.Nube = { cargar, entrar, salir, subir, records, subirJugadas, bajarJugadas, get usuario() { return usuario; }, get red() { return fb ? red : null; } };
try { if (localStorage.getItem('mc-nube') === '1' && navigator.onLine) cargar().catch(() => {}); } catch (e) {}
