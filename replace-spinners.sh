#!/bin/bash
# Skript zum automatischen Ersetzen aller Spinner mit LoadingSpinner Komponente

echo "🔄 Ersetze alle Loading Spinner mit custom LoadingSpinner..."

# Liste der Dateien die geändert werden sollen
FILES=(
  "src/pages/Profile.js"
  "src/pages/Insights.js"
  "src/pages/RecommendationsPage.js"
  "src/pages/UserProfile.js"
  "src/components/OptimizedImage.js"
  "src/components/SocialFeed.js"
  "src/components/FriendsManager.js"
  "src/components/FoodDNAMatcher.js"
  "src/components/LocationAutocomplete.js"
  "src/components/DishAutocomplete.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Bearbeite: $file"
    
    # Füge Import hinzu falls noch nicht vorhanden
    if ! grep -q "LoadingSpinner" "$file"; then
      # Finde die letzte import Zeile und füge danach ein
      sed -i '' '/^import.*from/a\
import LoadingSpinner from "./LoadingSpinner";
' "$file" 2>/dev/null || sed -i '' '/^import.*from/a\
import LoadingSpinner from "../components/LoadingSpinner";
' "$file" 2>/dev/null
    fi
  else
    echo "⚠️  Datei nicht gefunden: $file"
  fi
done

echo ""
echo "✨ Fertig! Bitte überprüfe die Änderungen und ersetze manuell:"
echo "   <div className=\"... animate-spin ...\"></div>"
echo "   durch:"
echo "   <LoadingSpinner size=\"sm|md|lg|xl\" />"
echo ""
echo "Sizes:"
echo "  sm = 16px (für kleine Buttons)"
echo "  md = 32px (default)"
echo "  lg = 64px (für Seiten-Loading)"
echo "  xl = 96px (für Haupt-Loading)"
