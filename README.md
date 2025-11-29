# Blockchain Ecosystem Desktop App

Eine plattformübergreifende Desktop-Anwendung für das Blockchain Ecosystem mit Mining, Wallet und P2P-Messaging.

## 🚀 Schnellstart

### Voraussetzungen

- Node.js (v18 oder höher)
- npm

### Installation

```bash
cd blockchain-ecosystem-app
npm install
```

### App im Entwicklungsmodus starten

```bash
npm run dev
```

Dies startet:
1. Den Backend-Server (Express + P2P) auf Port 3001
2. Den Frontend-Dev-Server (Vite) auf Port 5173
3. Die Electron-App mit einem nativen Fenster

### App für macOS bauen

```bash
npm run build:mac
```

Die fertige `.dmg` Datei findest du in `dist/`.

### App für Windows bauen

```bash
npm run build:win
```

Die fertige `.exe` Datei findest du in `dist/`.

**Hinweis:** Windows-Builds können nur auf Windows-Systemen oder mit Cross-Compilation erstellt werden.

## 📁 Projektstruktur

```
blockchain-ecosystem-app/
├── electron/              # Electron-spezifischer Code
│   ├── main.js           # Hauptprozess (startet Backend + Frontend)
│   └── preload.js        # Preload-Skript
├── backend/              # Backend-Code (TypeScript)
│   ├── Block.ts
│   ├── Blockchain.ts
│   ├── Transaction.ts
│   ├── api.ts
│   ├── p2p.ts
│   └── main.ts
├── frontend/             # Frontend-Code (React + Vite)
│   ├── src/
│   ├── public/
│   └── index.html
├── package.json          # Hauptkonfiguration
└── dist/                 # Build-Ausgabe (nach npm run build:mac/win)
```

## 🛠️ Verfügbare Scripts

- `npm run dev` - Startet die App im Entwicklungsmodus
- `npm run build` - Baut Backend und Frontend
- `npm run build:mac` - Erstellt macOS-Installer (.dmg)
- `npm run build:win` - Erstellt Windows-Installer (.exe)
- `npm run build:all` - Erstellt Installer für beide Plattformen

## ✨ Features

- ✅ **Mining**: Automatisches Mining neuer Blöcke
- ✅ **Wallet**: Wallet-Verwaltung mit Token-Balance
- ✅ **Messenger**: Wallet-zu-Wallet Messaging
- ✅ **P2P-Netzwerk**: Dezentrales Peer-to-Peer Netzwerk
- ✅ **Cross-Platform**: Läuft auf macOS und Windows

## 🐛 Troubleshooting

### Port bereits belegt

Falls Port 3001 oder 5173 bereits belegt ist, beende die laufenden Prozesse:

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Backend startet nicht

Stelle sicher, dass alle Dependencies installiert sind:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Electron-Fenster bleibt weiß

Warte ein paar Sekunden - das Backend und Frontend brauchen Zeit zum Starten. Öffne die DevTools (Cmd+Option+I) um Fehler zu sehen.

## 📦 Distribution

Nach dem Build findest du die fertigen Installer in:

- **macOS**: `dist/Blockchain Ecosystem-1.0.0.dmg`
- **Windows**: `dist/Blockchain Ecosystem Setup 1.0.0.exe`

Diese können direkt an Benutzer verteilt werden - keine Installation von Node.js oder npm erforderlich!

## 🔧 Entwicklung

Die App läuft im Entwicklungsmodus mit Hot-Reload:
- Frontend-Änderungen werden automatisch neu geladen
- Backend-Änderungen erfordern einen Neustart der App

## 📝 Lizenz

ISC
