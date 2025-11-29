# 🚀 Schnellstart - Blockchain Ecosystem App

## App starten (Entwicklungsmodus)

```bash
# 1. In den App-Ordner wechseln
cd blockchain-ecosystem-app

# 2. Dependencies installieren (nur beim ersten Mal)
npm install

# 3. App starten
npm run dev
```

Die App öffnet sich automatisch in einem nativen Fenster!

## App bauen (für Distribution)

### Für macOS:
```bash
npm run build:mac
```
→ Fertige `.dmg` Datei in `dist/`

### Für Windows:
```bash
npm run build:win
```
→ Fertige `.exe` Datei in `dist/`

## Was passiert beim Start?

1. ✅ Backend-Server startet auf Port 3001
2. ✅ P2P-Server startet auf Port 6001
3. ✅ Frontend lädt auf Port 5173
4. ✅ Electron-Fenster öffnet sich

## Probleme?

**Port bereits belegt:**
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Dependencies fehlen:**
```bash
npm install
```

Das war's! 🎉
