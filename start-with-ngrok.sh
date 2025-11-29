#!/bin/bash

echo "🚀 Starting Blockchain with ngrok..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo "Please install it with: brew install ngrok/ngrok/ngrok"
    echo "Or follow the guide in NGROK_SETUP.md"
    exit 1
fi

# Kill any existing ngrok processes
pkill -f ngrok

# Start ngrok for HTTP port (3002) in background
echo "📡 Starting ngrok tunnel for HTTP (port 3002)..."
ngrok http 3002 --log=stdout > ngrok-http.log &
NGROK_PID=$!

# Wait for ngrok to start
echo "⏳ Waiting for ngrok to initialize..."
sleep 5

# Get the public URL from ngrok API
HTTP_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$HTTP_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "Check ngrok-http.log for errors"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

# Convert HTTPS URL to WSS for WebSocket
P2P_URL=$(echo $HTTP_URL | sed 's/https:/wss:/')

echo ""
echo "✅ ngrok tunnel established:"
echo "   HTTP: $HTTP_URL"
echo "   P2P (WebSocket): $P2P_URL"
echo ""
echo "💡 Share this URL with others to connect to your node!"
echo ""

# Export URLs as environment variables
export PUBLIC_HTTP_URL="$HTTP_URL"
export PUBLIC_P2P_URL="$P2P_URL"

# Start the blockchain app
echo "🔗 Starting blockchain application..."
npm run dev

# Cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $NGROK_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM
