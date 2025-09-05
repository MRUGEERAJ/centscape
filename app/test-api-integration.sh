#!/bin/bash

echo "🚀 Testing API Integration..."
echo "================================"

# Test if the server is running
echo "📡 Checking if server is running on localhost:3000..."
if curl -s --max-time 5 http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Server is running!"
else
    echo "❌ Server is not running. Please start your Node.js server first."
    echo "   Run: node server.js (or whatever your server file is named)"
    exit 1
fi

# Test the API endpoint with a sample URL
echo ""
echo "🧪 Testing API endpoint with sample URL..."
SAMPLE_URL="https://www.flipkart.com/boat-20000-mah-22-5-w-power-bank/p/itm907b56fc7696a"

echo "📤 Sending request to: $SAMPLE_URL"

RESPONSE=$(curl -s -X POST http://localhost:3000/api/preview \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$SAMPLE_URL\"}" \
  --max-time 25)

if [ $? -eq 0 ]; then
    echo "✅ API request successful!"
    echo ""
    echo "📋 Response preview:"
    echo "$RESPONSE" | jq -r '.data.title' 2>/dev/null || echo "Response received but not JSON"
    echo ""
    echo "🎉 Your API integration is working!"
    echo ""
    echo "💡 Now you can:"
    echo "   1. Start your React Native app: npm start"
    echo "   2. Go to the Add screen"
    echo "   3. Paste any product URL"
    echo "   4. See real product data!"
else
    echo "❌ API request failed"
    echo "Response: $RESPONSE"
fi
