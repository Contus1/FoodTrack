# FoodTrack Advanced Recommendation Algorithm

## Overview
The FoodTrack recommendation engine uses a sophisticated, multi-dimensional analysis system that deeply personalizes cuisine and dish recommendations based on your actual eating patterns, flavor preferences, and rating history.

## How It Works

### 1. **Deep Flavor Profiling** (30% Weight)
The algorithm analyzes every dish name and tag you've entered to build a comprehensive flavor profile:

- **Flavor Categories Tracked**: Spicy, Sweet, Savory, Tangy, Creamy, Fresh, Aromatic
- **Weighted Analysis**: Dishes you rated higher (4-5 stars) have stronger influence on your profile
- **Keyword Matching**: Intelligent detection of flavor indicators in dish names and tags
- **Normalization**: Converts raw scores to percentages for balanced comparison

**Example**: If you rate "Spicy Thai Curry" 5★ and "Mild Chicken" 3★, the algorithm gives 67% more weight to spicy preferences.

### 2. **Spice Preference Calculation** (25% Weight)
Sophisticated spice tolerance analysis:

- **Multi-factor Scoring**: Combines frequency of spicy dishes with ratings given
- **Nuanced Detection**: Tracks keywords like "spicy", "hot", "chili", "jalapeño", "curry", "pepper", "szechuan"
- **Rating-Weighted**: High ratings on spicy food = strong spice preference signal
- **0-5 Scale**: Outputs precise spice preference level

**Formula**: `(spice_ratio × 3 + avg_spice_rating × 2) / 5`

### 3. **Ingredient Preference Extraction** (20% Weight)
Identifies your favorite ingredients from dish names:

- **Tracked Ingredients**: 19+ common ingredients (chicken, beef, fish, tofu, noodles, rice, pasta, cheese, etc.)
- **Rating-Weighted Scoring**: Ingredients in higher-rated dishes get stronger preference signal
- **Top 5 Extraction**: Returns your most preferred ingredients for matching

**Example**: If you consistently rate dishes with "chicken" and "noodles" highly, the algorithm prioritizes cuisines featuring these.

### 4. **Cuisine Transition Logic** (15% Weight)
Intelligent progression recommendations:

- **Similarity Mapping**: Each cuisine has mapped similar cuisines (e.g., Thai → Vietnamese, Chinese, Cambodian)
- **Natural Progression**: Recommends cuisines similar to ones you already enjoy
- **Affinity Scoring**: Analyzes which cuisines appear most in your highly-rated entries
- **Avoids Redundancy**: Filters out cuisines you've already extensively tried

**Example**: If you love Chinese food, the algorithm suggests Vietnamese and Thai as natural next steps.

### 5. **Variety Score Analysis** (10% Weight)
Understands your exploration behavior:

- **High Variety Seeker**: 4+ different cuisines → Recommends complex, fusion, adventurous options
- **Medium Variety**: 2-3 cuisines → Recommends similar cuisines with new flavors
- **Low Variety**: 1-2 cuisines → Recommends safe transitions to similar cuisines

### 6. **Dish-Level Matching**
Advanced dish recommendations with multi-factor scoring:

#### Dish Database Intelligence
- **150+ dishes** across 12 cuisines
- Each dish has:
  - **Spice level** (0-5)
  - **Flavor profile** (spicy, creamy, sweet, etc.)
  - **Key ingredients**

#### Scoring Algorithm
For each dish:
1. **Flavor Match**: Compare dish's flavor profile with your profile
2. **Spice Match**: Calculate spice level difference
3. **Ingredient Match**: Count shared ingredients with your preferences
4. **Final Score**: Weighted combination of all factors

**Example**: If you love creamy, mild dishes with chicken, "Butter Chicken" scores highly (creamy ✓, mild ✓, chicken ✓).

## Key Features

### Rating-Weighted Analysis
Every data point is weighted by your rating:
- 5★ dish = 1.0× weight (full influence)
- 4★ dish = 0.8× weight
- 3★ dish = 0.6× weight
- 2★ dish = 0.4× weight
- 1★ dish = 0.2× weight

### Confidence Scores
Each recommendation includes a confidence percentage:
- **95%**: Perfect match across all dimensions
- **80-94%**: Strong match with minor differences
- **65-79%**: Good match with some variety
- **Below 65%**: Filtered out

### Intelligent Reasons
Each recommendation explains WHY it's suggested:
- "You love savory & umami flavors" (flavor matching)
- "Perfect spice level match" (spice alignment)
- "Features chicken you enjoy" (ingredient preference)
- "Natural next step from your favorites" (cuisine transition)

## Real-World Application

### Scenario 1: Spice Lover
**User Profile**: 
- 8 entries, mostly Indian and Mexican
- Average rating: 4.5★
- High ratings on "Vindaloo", "Spicy Tacos", "Thai Curry"

**Algorithm Output**:
- Spice preference: 4.2/5
- Recommendations: Korean (Kimchi Stew), Thai (Green Curry), Szechuan Chinese
- Dishes: Mapo Tofu, Korean BBQ, Tom Yum Soup

### Scenario 2: Comfort Food Seeker
**User Profile**:
- 12 entries, Italian and French heavy
- Average rating: 4.0★
- High ratings on "Carbonara", "Mac & Cheese", "French Onion Soup"

**Algorithm Output**:
- Flavor profile: 75% creamy, 60% savory
- Spice preference: 1.5/5
- Recommendations: French, German, Mediterranean
- Dishes: Duck Confit, Quiche Lorraine, Risotto

### Scenario 3: Adventurous Explorer
**User Profile**:
- 20 entries across 6 different cuisines
- Average rating: 3.8★
- Balanced ratings, trying everything

**Algorithm Output**:
- Variety score: High
- Recommendations: Korean (fusion potential), Middle Eastern (uncharted), Vietnamese (balanced)
- Dishes: Bibimbap, Falafel Plate, Pho Bo

## Privacy & Transparency

- **Local Processing**: All analysis happens on your device
- **Transparent Reasoning**: Every recommendation explains its logic
- **No Black Box**: Algorithm is fully documented and auditable
- **User Control**: Recommendations adapt as you add more entries

## Continuous Learning

The more you use FoodTrack, the smarter it gets:
- **5 entries**: Basic flavor profiling begins
- **10 entries**: Accurate spice and ingredient preferences
- **20 entries**: Highly personalized cuisine transitions
- **50+ entries**: Expert-level taste profile with nuanced recommendations

## Technical Implementation

```javascript
// Simplified scoring example
cuisineScore = 
  (flavorMatch / 100 × 30) +          // Flavor profile matching
  (spiceMatch / 5 × 25) +             // Spice level alignment
  (ingredientMatch × 20) +            // Ingredient preferences
  (similarityBonus × 15) +            // Cuisine transition logic
  (varietyBonus × 10)                 // Exploration behavior
```

## Future Enhancements

Planned improvements:
- Time-based recommendations (breakfast vs dinner preferences)
- Social influence (what similar users enjoyed)
- Seasonal recommendations
- Price-point matching
- Dietary restriction filtering
- Location-based restaurant integration

---

**Version**: 2.0  
**Last Updated**: October 30, 2025  
**Algorithm Complexity**: O(n×m) where n = entries, m = cuisines
