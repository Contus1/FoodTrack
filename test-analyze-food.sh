#!/bin/bash
# Test-Skript für die analyze-food Edge Function

echo "🧪 Teste analyze-food Function..."
echo ""

# Erstelle ein Test-JSON mit einem kleinen Test-Bild
# (Falls du ein echtes Bild testen willst, ersetze IMAGE_PATH)

IMAGE_PATH="$1"

if [ -z "$IMAGE_PATH" ]; then
  echo "❌ Fehler: Kein Bild angegeben"
  echo ""
  echo "Usage: ./test-analyze-food.sh /pfad/zu/bild.jpg"
  echo ""
  echo "Beispiel:"
  echo "  ./test-analyze-food.sh ~/Desktop/pizza.jpg"
  exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
  echo "❌ Fehler: Bild nicht gefunden: $IMAGE_PATH"
  exit 1
fi

echo "📷 Konvertiere Bild zu Base64..."
BASE64_IMAGE=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

echo "📤 Sende Request an Supabase..."
echo ""

curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"imageBase64\": \"$BASE64_IMAGE\"}" \
  https://aajdpudedskgkrpjgcnp.functions.supabase.co/analyze-food

echo ""
echo ""
echo "✅ Test abgeschlossen!"
