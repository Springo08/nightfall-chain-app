# ngrok Setup Guide

## Was ist ngrok?
ngrok erstellt einen sicheren Tunnel von deinem Mac ins Internet. Deine lokale Blockchain wird dann über eine öffentliche URL erreichbar.

## Installation

### Schritt 1: ngrok herunterladen
```bash
# Mit Homebrew (empfohlen)
brew install ngrok/ngrok/ngrok

# ODER manuell von https://ngrok.com/download
```

### Schritt 2: Account erstellen (KOSTENLOS)
1. Gehe zu https://dashboard.ngrok.com/signup
2. Erstelle einen kostenlosen Account
3. Kopiere deinen Authtoken von https://dashboard.ngrok.com/get-started/your-authtoken

### Schritt 3: Authtoken konfigurieren
```bash
ngrok config add-authtoken DEIN_TOKEN_HIER
```

## Verwendung

### Manuell starten (NICHT NÖTIG)
```bash
# Nur HTTP Port (3002) - P2P läuft über WebSocket
ngrok http 3002
```

### Mit unserem Script (EINFACHER!)
```bash
cd blockchain-ecosystem-app
./start-with-ngrok.sh
```

**Hinweis:** Wir verwenden nur HTTP, da TCP-Tunnel eine Kreditkarte erfordern. P2P läuft über WebSocket (wss://) durch den HTTP-Tunnel.

## Was passiert?

Nach dem Start siehst du URLs wie:
```
HTTP: https://abc123.ngrok.io
P2P (WebSocket): wss://abc123.ngrok.io
```

Diese URL kannst du an andere weitergeben, damit sie sich mit deiner Blockchain verbinden können!

## Kosten

**Free Plan:**
- ✅ Unbegrenzte Nutzung
- ✅ HTTPS URLs
- ❌ URL ändert sich bei jedem Neustart

**Paid Plan ($8/Monat):**
- ✅ Feste URL (z.B. `meine-blockchain.ngrok.io`)
- ✅ Mehrere Tunnel gleichzeitig

Für den Anfang reicht der Free Plan völlig aus!

## Troubleshooting

**"command not found: ngrok"**
→ Installation wiederholen mit Homebrew

**"ERR_NGROK_108"**
→ Authtoken fehlt, Schritt 3 wiederholen

**Tunnel funktioniert nicht**
→ Prüfe ob die App auf Port 3002 läuft: `lsof -i :3002`
