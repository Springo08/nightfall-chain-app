# 🚀 App Starten - Anleitung

## Problem: Grauer Bildschirm?

Falls du einen grauen Bildschirm siehst, liegt das daran, dass die App versucht zu laden, bevor der Server bereit ist.

## Lösung: App neu starten

1. **Schließe die Electron-App** (falls sie noch läuft)

2. **Starte die App:**
   ```bash
   cd blockchain-ecosystem-app
   npm run dev
   ```

3. **Warte 5-10 Sekunden** bis du diese Meldungen siehst:
   ```
   Backend: Listening on port: 3002
   Frontend: VITE ready in XXX ms
   Frontend: ➜ Local: http://localhost:5175/
   ```

4. **Die Electron-App öffnet sich automatisch**

## Wallet Setup beim ersten Start

Beim **ersten Start** siehst du:
- 🎉 Welcome Screen
- 📝 Deine 12-Wörter Seed Phrase
- ⚠️ Backup-Warnung
- ✅ Bestätigungs-Checkbox

**Wichtig:** Schreibe die 12 Wörter auf!

## Wallet bereits vorhanden?

Falls du **kein Wallet Setup** siehst, hast du bereits ein Wallet.

### Wallet löschen und neu erstellen:

1. **Öffne die Browser DevTools** in der Electron-App:
   - macOS: `Cmd + Option + I`
   - Windows: `Ctrl + Shift + I`

2. **Gehe zur Console** und tippe:
   ```javascript
   localStorage.clear()
   ```

3. **Drücke Enter**

4. **Lade die App neu:**
   - macOS: `Cmd + R`
   - Windows: `Ctrl + R`

5. **Jetzt erscheint das Wallet Setup!**

## Häufige Probleme

### Port bereits belegt

```bash
# Töte alle laufenden Prozesse
lsof -ti:3002 | xargs kill -9
lsof -ti:5175 | xargs kill -9
```

### Backend startet nicht

Stelle sicher, dass du im richtigen Ordner bist:
```bash
cd blockchain-ecosystem-app
npm run dev
```

### Electron-Fenster bleibt grau

Warte 10 Sekunden und lade die Seite neu:
- macOS: `Cmd + R`
- Windows: `Ctrl + R`

## Nach dem Setup

Nach dem Wallet Setup siehst du:
- 💼 Deine Wallet-Adresse
- 💰 Deine Balance
- ⛏️ Mining Controls
- 💬 Messages
- 💸 Transactions

Viel Erfolg! 🚀
