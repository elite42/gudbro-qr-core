# PWA Setup Guide - Module 9 Hub Aggregator

## 📱 Funzionalità PWA

### Completato ✅
- Service Worker (cache strategy)
- Manifest.json
- Offline fallback page
- Install prompt
- Add to Home Screen
- Theme color adaptation
- Meta tags PWA
- Connection status monitoring

### Cache Strategy
- **API calls:** Network First (fresh data priority)
- **Hub pages:** Network First (dynamic content)
- **Assets (images/fonts/CSS/JS):** Cache First (performance)
- **Offline:** Fallback to cached version or offline.html

### Features
- 📥 Install prompt automatico
- 🏠 Add to Home Screen
- 📴 Funziona offline (cached pages)
- ⚡ Velocità: assets cached localmente
- 🔔 Push notifications ready (disabilitato)
- 🔄 Background sync ready (disabilitato)

---

## 🎨 Icone PWA

### Requisiti
Creare icone nelle seguenti dimensioni in `/frontend/public/icons/`:

```
icons/
├── icon-72.png     (72x72)
├── icon-96.png     (96x96)
├── icon-128.png    (128x128)
├── icon-144.png    (144x144)
├── icon-152.png    (152x152)
├── icon-192.png    (192x192)   ← Importante
├── icon-384.png    (384x384)
├── icon-512.png    (512x512)   ← Importante
├── badge-72.png    (72x72)     ← Per notifiche
└── shortcut-create.png (96x96) ← Shortcut
```

### Generazione Automatica

**Opzione 1: ImageMagick**
```bash
# Parti da un'immagine 512x512 (icon-master.png)
convert icon-master.png -resize 72x72 icon-72.png
convert icon-master.png -resize 96x96 icon-96.png
convert icon-master.png -resize 128x128 icon-128.png
convert icon-master.png -resize 144x144 icon-144.png
convert icon-master.png -resize 152x152 icon-152.png
convert icon-master.png -resize 192x192 icon-192.png
convert icon-master.png -resize 384x384 icon-384.png
cp icon-master.png icon-512.png
```

**Opzione 2: Online Tool**
- https://www.pwabuilder.com/imageGenerator
- Upload icon 512x512
- Download zip con tutte le dimensioni

**Opzione 3: Script Node.js**
```bash
npm install sharp
node generate-icons.js
```

```javascript
// generate-icons.js
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('icon-master.png')
    .resize(size, size)
    .toFile(`public/icons/icon-${size}.png`);
});
```

### Design Guidelines
- **Background:** Solido o trasparente
- **Padding:** 10% border per safe zone
- **Formato:** PNG con alpha channel
- **Colori:** Match theme (manifest.json theme_color)
- **Maskable:** icon-192 e icon-512 devono supportare maskable (no testo vicino ai bordi)

---

## 🚀 Deploy PWA

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Configura HTTPS
PWA richiede HTTPS (eccetto localhost).

**Opzione A: CloudFlare**
- Automatic HTTPS
- CDN included
- Free tier

**Opzione B: Let's Encrypt**
```bash
sudo certbot --nginx -d yourdomain.com
```

### 3. Headers Nginx
```nginx
# Serve manifest.json
location /manifest.json {
  add_header Content-Type application/manifest+json;
  add_header Cache-Control "public, max-age=31536000";
}

# Serve service worker (no cache)
location /sw.js {
  add_header Content-Type application/javascript;
  add_header Cache-Control "public, max-age=0";
  add_header Service-Worker-Allowed "/";
}

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 4. Test PWA
```bash
# Lighthouse audit
npx lighthouse https://yourdomain.com --view

# Checklist
# ✅ HTTPS
# ✅ manifest.json accessibile
# ✅ Service Worker registrato
# ✅ Icons 192x192 e 512x512 presenti
# ✅ Offline fallback funziona
# ✅ Add to Home Screen prompt appare
```

---

## 📊 Performance Targets

| Metrica | Target | Current |
|---------|--------|---------|
| First Load | <3s | TBD |
| Cache Hit Rate | >80% | TBD |
| Offline Success | 100% (cached) | ✅ |
| Install Rate | >20% | TBD |
| Lighthouse PWA | >90 | TBD |

---

## 🧪 Testing

### Desktop (Chrome)
1. Apri DevTools → Application
2. Service Workers → Verifica registrazione
3. Manifest → Verifica icone
4. Storage → Verifica cache
5. Offline → Testa funzionalità

### Mobile (Android Chrome)
1. Visita hub page
2. Menu → "Add to Home screen"
3. Verifica icona su home
4. Apri app → Testa fullscreen
5. Disabilita rete → Verifica offline

### iOS Safari
1. Visita hub page
2. Share → "Add to Home Screen"
3. Verifica icona su home
4. Apri app → Testa standalone mode

---

## 🔧 Troubleshooting

**Install prompt non appare:**
- Verifica HTTPS
- Controlla manifest.json accessibile
- Verifica icone 192 e 512 esistono
- Check DevTools console per errori SW

**Service Worker non registra:**
- Verifica HTTPS (non funziona su HTTP)
- Check path /sw.js corretto
- Verifica scope SW
- Clear cache e riprova

**Offline non funziona:**
- Verifica cache popolata (visita page online prima)
- Check offline.html esiste
- Verifica SW fetch handler

**Icone non visualizzate:**
- Verifica path corretto in manifest.json
- Check dimensioni corrette
- Verifica formato PNG
- Test maskable icons

---

## 📈 Analytics PWA

Traccia metriche PWA:
```javascript
// In analytics
{
  "pwa_installed": true/false,
  "display_mode": "standalone" | "browser",
  "install_prompt_shown": true/false,
  "install_accepted": true/false,
  "offline_usage": count
}
```

---

## 🔄 Updates

**Service Worker Update Strategy:**
1. User visita page
2. SW checks per update
3. Se nuovo SW disponibile → prompt user
4. User accetta → reload page
5. Nuovo SW attivo

**Force Update:**
```javascript
// In sw.js, cambia CACHE_NAME
const CACHE_NAME = 'hub-aggregator-v2'; // was v1
```

---

## 🌐 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Manifest | ✅ | ✅ | ⚠️ Limited | ✅ |
| Add to Home | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ❌ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |

---

**Status:** Production Ready  
**Version:** 1.0  
**Last Updated:** 2025-10-30
