#!/usr/bin/env python3
"""
Automatisches Ersetzen aller animate-spin Spinner mit LoadingSpinner Komponente
"""
import re
import os

FILES_TO_UPDATE = [
    "src/components/OptimizedImage.js",
    "src/components/SocialFeed.js",
    "src/components/FriendsManager.js",
    "src/components/FoodDNAMatcher.js",
    "src/components/LocationAutocomplete.js",
    "src/components/DishAutocomplete.js",
    "src/pages/Profile.js",
    "src/pages/UserProfile.js",
    "src/pages/AddEntry.js",
    "src/pages/Insights.js",
    "src/pages/RecommendationsPage.js",
]

# Verschiedene Spinner-Patterns
SPINNER_PATTERNS = [
    # Pattern 1: Border spinner
    (
        r'<div className="[^"]*w-(\d+) h-\1[^"]*animate-spin[^"]*"[^>]*></div>',
        lambda m: f'<LoadingSpinner size="{get_size(m.group(1))}" />'
    ),
    # Pattern 2: SVG spinner mit animate-spin
    (
        r'<svg[^>]*className="[^"]*w-(\d+) h-\1[^"]*animate-spin[^"]*"[^>]*>.*?</svg>',
        lambda m: f'<LoadingSpinner size="{get_size(m.group(1))}" />'
    ),
]

def get_size(width_str):
    """Konvertiert Tailwind width zu LoadingSpinner size"""
    width = int(width_str)
    if width <= 4:
        return "sm"
    elif width <= 8:
        return "md"
    elif width <= 16:
        return "lg"
    else:
        return "xl"

def add_import_if_missing(content, filepath):
    """Fügt LoadingSpinner Import hinzu falls nicht vorhanden"""
    if "LoadingSpinner" in content:
        return content
    
    # Bestimme den richtigen Import-Pfad
    if "/components/" in filepath:
        import_line = 'import LoadingSpinner from "./LoadingSpinner";'
    else:
        import_line = 'import LoadingSpinner from "../components/LoadingSpinner";'
    
    # Finde die letzte import Zeile
    lines = content.split("\n")
    last_import_idx = 0
    for i, line in enumerate(lines):
        if line.strip().startswith("import "):
            last_import_idx = i
    
    # Füge Import nach letztem import ein
    lines.insert(last_import_idx + 1, import_line)
    return "\n".join(lines)

def replace_spinners_in_file(filepath):
    """Ersetzt alle Spinner in einer Datei"""
    if not os.path.exists(filepath):
        print(f"⚠️  Datei nicht gefunden: {filepath}")
        return False
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    replacements = 0
    
    # Ersetze alle Spinner-Patterns
    for pattern, replacement in SPINNER_PATTERNS:
        content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
        replacements += count
    
    # Füge Import hinzu wenn Ersetzungen gemacht wurden
    if replacements > 0:
        content = add_import_if_missing(content, filepath)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"✅ {filepath}: {replacements} Spinner ersetzt")
        return True
    else:
        print(f"ℹ️  {filepath}: Keine Spinner gefunden")
        return False

def main():
    print("🔄 Ersetze alle Loading Spinner mit LoadingSpinner Komponente...")
    print()
    
    total_files = 0
    total_replacements = 0
    
    for filepath in FILES_TO_UPDATE:
        if replace_spinners_in_file(filepath):
            total_files += 1
    
    print()
    print(f"✨ Fertig! {total_files} Dateien aktualisiert")
    print()
    print("⚠️  HINWEIS: Bitte überprüfe die Änderungen und passe ggf. die Größen an:")
    print("   - sm: Kleine Buttons/Icons")
    print("   - md: Standard (default)")
    print("   - lg: Größere Bereiche")
    print("   - xl: Haupt-Loading-Screen")

if __name__ == "__main__":
    main()
