# 🗺️ Interactive Food Journey Map - Implementation

## Übersicht

Die Leaflet-Karte zeigt jetzt **jeden einzelnen Eintrag mit Ort** auf einer interaktiven Weltkarte. User können sehen, wo sie was gegessen haben, mit allen Details zu jedem Gericht.

## Features

### 1. **Intelligente Marker**
- ✅ **Farbcodierte Marker** nach Rating:
  - 🟢 Grün = Rating 4-5 ⭐
  - 🟡 Gelb = Rating 3-4 ⭐
  - 🔴 Rot = Rating <3 ⭐
- ✅ **Custom Icon** mit 🍽️ Emoji
- ✅ **Pin-Design** (Tropfenform mit weißem Rand und Schatten)

### 2. **Interaktive Popups**
Beim Klick auf einen Marker erscheint ein schönes Popup mit:
- 📸 **Foto des Gerichts** (falls vorhanden)
- 🍴 **Name des Gerichts**
- 📍 **Ort**
- ⭐ **Rating**
- 🏷️ **Top 3 Tags**
- 🔗 **"View Details" Button** → Navigiert zum Eintrag

### 3. **Automatisches Geocoding**
Die Karte findet automatisch Koordinaten für Orte:

#### Statische Koordinaten (50+ Städte)
Vordefiniert für schnellen Zugriff:
- **Deutschland**: Berlin, München, Hamburg, Frankfurt, Köln, Düsseldorf, Stuttgart
- **Europa**: London, Paris, Rom, Madrid, Barcelona, Amsterdam, Wien, Prag, Budapest
- **USA**: New York, Los Angeles, Chicago, San Francisco, Miami, Seattle, Boston
- **Asien**: Tokyo, Beijing, Shanghai, Seoul, Singapore, Bangkok, Dubai
- **Rest**: Sydney, Melbourne, Toronto, Mexico City, São Paulo, Rio de Janeiro

#### Dynamisches Geocoding
Falls ein Ort nicht in der Liste ist:
- ✅ **Nominatim API** (OpenStreetMap) für beliebige Orte
- ✅ **Rate-Limiting** (1 Sekunde zwischen Anfragen)
- ✅ **Caching** (einmal gefundene Koordinaten werden gespeichert)
- ✅ **Batch-Processing** (max. 5 Orte auf einmal)

### 4. **Smarte Karten-Features**

#### Auto-Zoom & Positioning
- 🎯 **Automatisches Zentrieren** auf die Essens-Locations
- 🔍 **Auto-Zoom** um alle Marker zu zeigen
- 📍 **Intelligenter Fallback**: Deutschland-Zentrum wenn keine Locations

#### UI-Elemente
- 🏷️ **Counter-Badge** oben links: "📍 X locations"
- 🎨 **Legende** unten rechts: Rating-Farbschlüssel
- ℹ️ **Info-Text** unter der Karte: Klick-Hinweis und Location-Count

### 5. **Mobile-Optimiert**
- ✅ Touch-Gesten (Zoom, Pan, Tap)
- ✅ Responsive Popups
- ✅ Optimierte Marker-Größen
- ✅ Scroll-Zoom aktiviert

## Technische Details

### Komponenten-Struktur

```javascript
SimpleMap Component
├── entries prop → Array of food entries
├── geocodedLocations state → Cache für API-Requests
├── entriesWithLocations → Gefilterte Entries mit Koordinaten
└── MapContainer (Leaflet)
    ├── TileLayer (OpenStreetMap)
    ├── FitBounds (Auto-Zoom Component)
    ├── Markers (Custom Icons)
    │   └── Popups (Entry Details)
    ├── Legend (Bottom-Right)
    └── Counter Badge (Top-Left)
```

### Datenfluss

```
1. User erstellt Entry mit Location → Supabase
2. EntriesContext lädt alle Entries
3. Insights Page übergibt entries zu SimpleMap
4. SimpleMap filtert Entries mit Location
5. Koordinaten werden gesucht:
   ├── Statische Liste (schnell)
   └── Nominatim API (falls neu)
6. Marker werden auf Karte platziert
7. User klickt Marker → Popup mit Details
8. "View Details" → Navigation zu Entry
```

### Performance-Optimierungen

#### useMemo Hooks
- `entriesWithLocations`: Nur neu berechnen wenn entries/geocoding ändert
- `centerPosition`: Durchschnitts-Koordinate nur bei Änderung

#### Lazy Loading
- Geocoding nur für sichtbare Locations
- Max. 5 API-Requests gleichzeitig
- 1 Sekunde Delay zwischen Requests

#### Caching
- Einmal geocodete Orte werden im State gespeichert
- Keine redundanten API-Calls

## Verwendung

### In Insights.js

```javascript
import SimpleMap from "../components/SimpleMap";

// In Component:
<SimpleMap entries={entries} />
```

### Props

| Prop | Typ | Beschreibung |
|------|-----|--------------|
| `entries` | Array | Food entries mit location field |

### Entry-Format

Jeder Entry sollte haben:
```javascript
{
  id: string,
  dish_name: string,
  location: string,      // Stadt/Ort (z.B. "Berlin", "New York")
  rating: number,        // 0-5
  photo_url: string?,    // Optional
  tags: string[]?,       // Optional
}
```

## Location-Format

### Unterstützte Formate
```javascript
"Berlin"           // Stadt
"Berlin, Germany"  // Stadt, Land
"New York City"    // Vollständiger Name
"NYC"             // Abkürzung (falls in statischer Liste)
"München"         // Mit Umlauten
"Köln"            // Alternative Schreibweisen werden erkannt
```

### Best Practices
1. ✅ **Verwende Stadtnamen** (nicht Restaurants)
2. ✅ **Sei konsistent** bei Schreibweisen
3. ✅ **Nutze bekannte Städte** wenn möglich
4. ✅ **Vermeide zu spezifische Adressen** (Street-Level schwierig)

## Styling

### Custom CSS (in index.css)

```css
/* Custom Marker */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

/* Enhanced Popup */
.leaflet-popup-content-wrapper {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(12px);
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

/* Zoom Controls */
.leaflet-control-zoom {
  border-radius: 8px !important;
  overflow: hidden;
}
```

## Zukünftige Erweiterungen

### Geplante Features
- [ ] **Clustering** für viele Marker (MarkerCluster)
- [ ] **Filter** nach Rating/Cuisine/Date
- [ ] **Heatmap** für häufig besuchte Bereiche
- [ ] **Routen** zwischen Locations zeichnen
- [ ] **Zeitliche Animation** (Food Journey Timeline)
- [ ] **Export** als GPX/KML für GPS-Geräte

### Mögliche Verbesserungen
- [ ] **Offline-Karten** für bessere Performance
- [ ] **Custom Tiles** (andere Map-Styles)
- [ ] **Street View Integration** (falls Restaurant-Adressen)
- [ ] **Nearby Recommendations** basierend auf Karte
- [ ] **Share Map View** (Link zu Kartenansicht)

## Troubleshooting

### Problem: Marker erscheinen nicht
**Lösung**: 
- Prüfe ob `entry.location` gesetzt ist
- Console: "Finding locations on map..." bedeutet Geocoding läuft
- Warte 5-10 Sekunden (API-Delay)

### Problem: Falsche Koordinaten
**Lösung**:
- Verwende spezifischere Ortsnamen
- Füge Stadt zur statischen Liste hinzu
- Format: "Stadt, Land" ist präziser

### Problem: Karte lädt nicht
**Lösung**:
- Prüfe Internet-Verbindung (OpenStreetMap Tiles)
- Console Errors checken
- Leaflet CSS korrekt geladen?

### Problem: Popup funktioniert nicht
**Lösung**:
- Prüfe ob Entry `id` vorhanden
- Navigation Route `/add?view={id}` muss existieren
- React Router korrekt konfiguriert?

## Dependencies

```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.x.x"
}
```

## API-Limits

### Nominatim (OpenStreetMap Geocoding)
- **Rate Limit**: 1 Request pro Sekunde
- **Usage Policy**: Kostenlos für moderate Nutzung
- **Attribution**: Erforderlich (automatisch in Karte)

**Hinweis**: Bei vielen neuen Locations kann Geocoding bis zu 1 Minute dauern (Rate Limiting).

## Beispiel-Flow

### User Journey
1. User fügt Eintrag hinzu: "Pasta Carbonara" in "Rom"
2. Eintrag wird gespeichert mit `location: "Rom"`
3. User geht zu Insights → "Food Journey Map"
4. Karte zeigt grünen Marker in Rom (Rating: 5⭐)
5. User klickt Marker → Popup mit Pasta-Foto und Details
6. User klickt "View Details" → Volle Ansicht des Eintrags

---

**Version**: 1.0  
**Datum**: 31. Oktober 2025  
**Status**: ✅ Produktiv
