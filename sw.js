// Service worker do Vou Ser Presidente: abre rápido e funciona mesmo com internet ruim.
const V = 'vsp-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.hostname.endsWith('supabase.co')) return; // dados do jogo sempre ao vivo
  // página: rede primeiro (pega a versão nova), cache se estiver sem internet
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('/', cp)); return res; }).catch(() => caches.match('/'))); return; }
  // bibliotecas, fontes e ícones: cache primeiro e atualiza por trás
  if (/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.hostname) || u.origin === location.origin) {
    e.respondWith(caches.match(r).then(hit => { const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => hit); return hit || net; }));
  }
});
