// Advanced Recommendation Engine for Personalized Food Suggestions
export class FoodRecommendationEngine {
  constructor() {
    // Comprehensive cuisine profiles with expanded characteristics
    this.cuisineProfiles = {
      chinese: {
        flavors: ["savory", "sweet", "umami", "tangy"],
        spiceLevel: 2,
        ingredients: ["noodles", "rice", "pork", "chicken", "seafood", "vegetables", "soy sauce", "ginger"],
        cookingMethods: ["stir-fry", "steamed", "fried", "braised"],
        similar: ["thai", "vietnamese", "korean", "japanese"],
        dishKeywords: ["fried rice", "noodles", "dumpling", "wonton", "chow mein", "kung pao", "sweet sour"],
        complexity: 3,
      },
      mexican: {
        flavors: ["spicy", "savory", "tangy", "fresh"],
        spiceLevel: 4,
        ingredients: ["cheese", "beans", "corn", "meat", "avocado", "tomato", "chili", "cilantro"],
        cookingMethods: ["grilled", "fried", "roasted", "fresh"],
        similar: ["spanish", "peruvian", "colombian", "tex-mex"],
        dishKeywords: ["taco", "burrito", "enchilada", "quesadilla", "guacamole", "salsa", "fajita"],
        complexity: 2,
      },
      indian: {
        flavors: ["spicy", "aromatic", "complex", "creamy", "tangy"],
        spiceLevel: 4,
        ingredients: ["rice", "lentils", "vegetables", "yogurt", "curry", "naan", "paneer", "chicken"],
        cookingMethods: ["curry", "tandoor", "fried", "simmered"],
        similar: ["pakistani", "nepali", "sri lankan", "bangladeshi"],
        dishKeywords: ["curry", "biryani", "tandoori", "tikka", "masala", "naan", "samosa", "dal"],
        complexity: 4,
      },
      italian: {
        flavors: ["savory", "herbal", "rich", "tangy"],
        spiceLevel: 1,
        ingredients: ["pasta", "cheese", "tomato", "olive oil", "basil", "garlic", "meat"],
        cookingMethods: ["sautéed", "baked", "boiled", "grilled"],
        similar: ["mediterranean", "greek", "french"],
        dishKeywords: ["pasta", "pizza", "risotto", "lasagna", "carbonara", "parmigiana", "tiramisu"],
        complexity: 2,
      },
      japanese: {
        flavors: ["umami", "delicate", "fresh", "clean"],
        spiceLevel: 1,
        ingredients: ["rice", "fish", "seafood", "seaweed", "soy sauce", "miso", "vegetables"],
        cookingMethods: ["raw", "grilled", "fried", "steamed"],
        similar: ["korean", "chinese", "vietnamese"],
        dishKeywords: ["sushi", "ramen", "tempura", "teriyaki", "udon", "sashimi", "miso"],
        complexity: 3,
      },
      thai: {
        flavors: ["spicy", "sweet", "tangy", "aromatic", "fresh"],
        spiceLevel: 4,
        ingredients: ["rice", "noodles", "coconut", "lemongrass", "chili", "fish sauce", "basil"],
        cookingMethods: ["stir-fry", "curry", "grilled", "soup"],
        similar: ["vietnamese", "cambodian", "laotian", "chinese"],
        dishKeywords: ["pad thai", "curry", "tom yum", "papaya salad", "spring roll"],
        complexity: 3,
      },
      vietnamese: {
        flavors: ["fresh", "herbal", "light", "balanced"],
        spiceLevel: 2,
        ingredients: ["noodles", "herbs", "seafood", "vegetables", "fish sauce", "lime", "rice paper"],
        cookingMethods: ["soup", "grilled", "fresh", "steamed"],
        similar: ["thai", "cambodian", "laotian", "chinese"],
        dishKeywords: ["pho", "banh mi", "spring roll", "bun", "vermicelli"],
        complexity: 2,
      },
      middle_eastern: {
        flavors: ["aromatic", "savory", "tangy", "herbal"],
        spiceLevel: 3,
        ingredients: ["rice", "meat", "vegetables", "herbs", "chickpeas", "tahini", "olive oil"],
        cookingMethods: ["grilled", "roasted", "stewed", "fried"],
        similar: ["turkish", "lebanese", "moroccan", "persian"],
        dishKeywords: ["hummus", "falafel", "shawarma", "kebab", "tabbouleh", "pita"],
        complexity: 3,
      },
      korean: {
        flavors: ["spicy", "fermented", "savory", "sweet"],
        spiceLevel: 4,
        ingredients: ["rice", "kimchi", "meat", "vegetables", "gochujang", "sesame", "soy sauce"],
        cookingMethods: ["grilled", "stir-fry", "fermented", "stewed"],
        similar: ["japanese", "chinese", "vietnamese"],
        dishKeywords: ["kimchi", "bibimbap", "bulgogi", "korean bbq", "japchae"],
        complexity: 3,
      },
      french: {
        flavors: ["refined", "creamy", "savory", "buttery"],
        spiceLevel: 2,
        ingredients: ["cheese", "cream", "wine", "herbs", "butter", "meat"],
        cookingMethods: ["sautéed", "braised", "roasted", "baked"],
        similar: ["belgian", "swiss", "italian"],
        dishKeywords: ["croissant", "coq au vin", "ratatouille", "quiche", "crème brûlée"],
        complexity: 4,
      },
      mediterranean: {
        flavors: ["fresh", "tangy", "herbal", "light"],
        spiceLevel: 2,
        ingredients: ["olive oil", "vegetables", "seafood", "cheese", "lemon", "herbs"],
        cookingMethods: ["grilled", "roasted", "fresh", "baked"],
        similar: ["greek", "spanish", "moroccan", "italian"],
        dishKeywords: ["salad", "grilled fish", "olive", "hummus", "feta"],
        complexity: 2,
      },
      german: {
        flavors: ["hearty", "savory", "comfort", "rich"],
        spiceLevel: 1,
        ingredients: ["meat", "potatoes", "bread", "cheese", "sausage", "cabbage"],
        cookingMethods: ["roasted", "braised", "fried", "smoked"],
        similar: ["austrian", "czech", "polish"],
        dishKeywords: ["schnitzel", "bratwurst", "sauerkraut", "pretzel"],
        complexity: 2,
      },
    };

    // Expanded dish database with more intelligence
    this.dishDatabase = {
      chinese: [
        { name: "Kung Pao Chicken", spice: 3, profile: ["spicy", "savory", "nutty"], ingredients: ["chicken", "peanuts", "chili"] },
        { name: "Sweet & Sour Pork", spice: 1, profile: ["sweet", "tangy", "savory"], ingredients: ["pork", "pineapple", "bell pepper"] },
        { name: "Mapo Tofu", spice: 4, profile: ["spicy", "numbing", "savory"], ingredients: ["tofu", "pork", "szechuan pepper"] },
        { name: "Fried Rice", spice: 1, profile: ["savory", "umami"], ingredients: ["rice", "egg", "vegetables"] },
        { name: "Dumplings", spice: 1, profile: ["savory", "comforting"], ingredients: ["meat", "vegetables", "wrapper"] },
      ],
      mexican: [
        { name: "Tacos al Pastor", spice: 3, profile: ["spicy", "savory", "tangy"], ingredients: ["pork", "pineapple", "chili"] },
        { name: "Enchiladas", spice: 2, profile: ["spicy", "cheesy", "savory"], ingredients: ["tortilla", "cheese", "sauce"] },
        { name: "Quesadillas", spice: 1, profile: ["cheesy", "savory"], ingredients: ["tortilla", "cheese"] },
        { name: "Chiles Rellenos", spice: 3, profile: ["spicy", "cheesy", "rich"], ingredients: ["poblano", "cheese", "egg"] },
        { name: "Guacamole", spice: 1, profile: ["fresh", "creamy", "tangy"], ingredients: ["avocado", "lime", "cilantro"] },
      ],
      indian: [
        { name: "Butter Chicken", spice: 2, profile: ["creamy", "rich", "aromatic"], ingredients: ["chicken", "tomato", "cream"] },
        { name: "Biryani", spice: 3, profile: ["aromatic", "complex", "savory"], ingredients: ["rice", "meat", "spices"] },
        { name: "Palak Paneer", spice: 2, profile: ["creamy", "herbal", "mild"], ingredients: ["spinach", "paneer", "spices"] },
        { name: "Tandoori Chicken", spice: 3, profile: ["spicy", "smoky", "aromatic"], ingredients: ["chicken", "yogurt", "spices"] },
        { name: "Samosas", spice: 2, profile: ["savory", "crunchy", "spiced"], ingredients: ["potato", "peas", "pastry"] },
      ],
      italian: [
        { name: "Carbonara", spice: 0, profile: ["creamy", "savory", "rich"], ingredients: ["pasta", "egg", "bacon", "cheese"] },
        { name: "Margherita Pizza", spice: 0, profile: ["fresh", "savory", "cheesy"], ingredients: ["dough", "tomato", "mozzarella", "basil"] },
        { name: "Lasagna", spice: 0, profile: ["rich", "savory", "cheesy"], ingredients: ["pasta", "meat", "cheese", "tomato"] },
        { name: "Risotto", spice: 0, profile: ["creamy", "savory", "delicate"], ingredients: ["rice", "broth", "cheese"] },
        { name: "Parmigiana", spice: 0, profile: ["savory", "cheesy", "herbal"], ingredients: ["eggplant", "tomato", "cheese"] },
      ],
      japanese: [
        { name: "Tonkotsu Ramen", spice: 1, profile: ["umami", "rich", "comforting"], ingredients: ["noodles", "pork", "broth", "egg"] },
        { name: "Sushi Platter", spice: 0, profile: ["fresh", "delicate", "clean"], ingredients: ["fish", "rice", "seaweed"] },
        { name: "Chicken Teriyaki", spice: 0, profile: ["sweet", "savory", "glazed"], ingredients: ["chicken", "teriyaki sauce"] },
        { name: "Tempura", spice: 0, profile: ["crispy", "light", "delicate"], ingredients: ["seafood", "vegetables", "batter"] },
        { name: "Katsu Curry", spice: 2, profile: ["savory", "crispy", "comforting"], ingredients: ["pork", "curry", "rice"] },
      ],
      thai: [
        { name: "Pad Thai", spice: 2, profile: ["sweet", "tangy", "savory"], ingredients: ["noodles", "shrimp", "peanuts", "tamarind"] },
        { name: "Green Curry", spice: 4, profile: ["spicy", "creamy", "aromatic"], ingredients: ["coconut", "curry paste", "meat"] },
        { name: "Tom Yum Soup", spice: 3, profile: ["spicy", "sour", "aromatic"], ingredients: ["shrimp", "lemongrass", "chili"] },
        { name: "Papaya Salad", spice: 3, profile: ["spicy", "tangy", "fresh"], ingredients: ["papaya", "chili", "lime"] },
        { name: "Massaman Curry", spice: 2, profile: ["sweet", "savory", "aromatic"], ingredients: ["coconut", "potato", "peanuts"] },
      ],
      vietnamese: [
        { name: "Pho Bo", spice: 1, profile: ["aromatic", "fresh", "comforting"], ingredients: ["beef", "noodles", "broth", "herbs"] },
        { name: "Banh Mi", spice: 1, profile: ["fresh", "savory", "crunchy"], ingredients: ["baguette", "pork", "pickles", "herbs"] },
        { name: "Spring Rolls", spice: 0, profile: ["fresh", "light", "healthy"], ingredients: ["rice paper", "shrimp", "vegetables", "herbs"] },
        { name: "Bun Bo Hue", spice: 3, profile: ["spicy", "aromatic", "rich"], ingredients: ["beef", "noodles", "lemongrass"] },
        { name: "Com Tam", spice: 1, profile: ["savory", "grilled", "balanced"], ingredients: ["rice", "pork chop", "egg"] },
      ],
      middle_eastern: [
        { name: "Chicken Shawarma", spice: 2, profile: ["aromatic", "savory", "tangy"], ingredients: ["chicken", "spices", "yogurt"] },
        { name: "Falafel Plate", spice: 1, profile: ["savory", "herbal", "crispy"], ingredients: ["chickpeas", "herbs", "spices"] },
        { name: "Hummus & Pita", spice: 0, profile: ["creamy", "nutty", "mild"], ingredients: ["chickpeas", "tahini", "lemon"] },
        { name: "Lamb Kebabs", spice: 2, profile: ["savory", "smoky", "aromatic"], ingredients: ["lamb", "spices", "vegetables"] },
        { name: "Tabbouleh", spice: 0, profile: ["fresh", "herbal", "tangy"], ingredients: ["bulgur", "parsley", "tomato", "lemon"] },
      ],
      korean: [
        { name: "Bibimbap", spice: 2, profile: ["savory", "spicy", "balanced"], ingredients: ["rice", "vegetables", "egg", "gochujang"] },
        { name: "Korean BBQ", spice: 2, profile: ["savory", "smoky", "rich"], ingredients: ["beef", "marinade", "lettuce"] },
        { name: "Kimchi Stew", spice: 4, profile: ["spicy", "fermented", "comforting"], ingredients: ["kimchi", "pork", "tofu"] },
        { name: "Japchae", spice: 1, profile: ["sweet", "savory", "delicate"], ingredients: ["noodles", "vegetables", "sesame"] },
        { name: "Bulgogi", spice: 1, profile: ["sweet", "savory", "tender"], ingredients: ["beef", "soy", "sugar"] },
      ],
      french: [
        { name: "Coq au Vin", spice: 0, profile: ["rich", "savory", "wine"], ingredients: ["chicken", "wine", "mushrooms"] },
        { name: "Duck Confit", spice: 0, profile: ["rich", "savory", "crispy"], ingredients: ["duck", "fat", "herbs"] },
        { name: "Ratatouille", spice: 0, profile: ["herbal", "fresh", "savory"], ingredients: ["vegetables", "herbs", "olive oil"] },
        { name: "Quiche Lorraine", spice: 0, profile: ["creamy", "savory", "rich"], ingredients: ["egg", "cream", "bacon"] },
        { name: "Crème Brûlée", spice: 0, profile: ["sweet", "creamy", "rich"], ingredients: ["cream", "egg", "sugar"] },
      ],
      mediterranean: [
        { name: "Greek Salad", spice: 0, profile: ["fresh", "tangy", "light"], ingredients: ["tomato", "cucumber", "feta", "olive"] },
        { name: "Grilled Sea Bass", spice: 0, profile: ["fresh", "light", "herbal"], ingredients: ["fish", "lemon", "herbs"] },
        { name: "Moussaka", spice: 1, profile: ["savory", "rich", "comforting"], ingredients: ["eggplant", "meat", "béchamel"] },
        { name: "Paella", spice: 1, profile: ["savory", "aromatic", "seafood"], ingredients: ["rice", "seafood", "saffron"] },
        { name: "Bruschetta", spice: 0, profile: ["fresh", "tangy", "herbal"], ingredients: ["bread", "tomato", "basil"] },
      ],
      german: [
        { name: "Wiener Schnitzel", spice: 0, profile: ["crispy", "savory", "comforting"], ingredients: ["veal", "breadcrumbs"] },
        { name: "Bratwurst", spice: 1, profile: ["savory", "smoky", "hearty"], ingredients: ["sausage", "spices"] },
        { name: "Sauerbraten", spice: 1, profile: ["tangy", "savory", "rich"], ingredients: ["beef", "vinegar", "spices"] },
        { name: "Pretzel", spice: 0, profile: ["salty", "doughy", "comforting"], ingredients: ["dough", "salt"] },
        { name: "Currywurst", spice: 2, profile: ["spicy", "tangy", "savory"], ingredients: ["sausage", "curry", "ketchup"] },
      ],
    };

    // Flavor profile keywords for deep analysis
    this.flavorKeywords = {
      spicy: ["spicy", "hot", "chili", "jalapeño", "sriracha", "curry", "pepper", "picante"],
      sweet: ["sweet", "honey", "sugar", "caramel", "chocolate", "dessert", "pastry", "cake"],
      savory: ["savory", "umami", "meat", "soy", "broth", "roasted", "grilled"],
      tangy: ["tangy", "sour", "citrus", "lemon", "lime", "vinegar", "pickled"],
      creamy: ["creamy", "cream", "cheese", "butter", "rich", "smooth"],
      fresh: ["fresh", "crisp", "light", "raw", "salad", "herbs"],
      aromatic: ["aromatic", "fragrant", "spiced", "herbs", "garlic"],
    };
  }

  generateRecommendations(userProfile) {
    const recommendations = {
      cuisines: [],
      dishes: [],
      tips: [],
      reasoning: {},
    };

    // Deep analysis of user's preferences with weighted scoring
    const analysis = this.analyzeUserProfile(userProfile);

    // Generate cuisine recommendations with intelligent scoring
    recommendations.cuisines = this.recommendCuisines(analysis);

    // Generate dish recommendations based on detailed flavor matching
    recommendations.dishes = this.recommendDishes(analysis, recommendations.cuisines);

    // Generate personalized tips based on eating patterns
    recommendations.tips = this.generateTips(analysis);

    // Store reasoning for transparency
    recommendations.reasoning = analysis;

    return recommendations;
  }

  analyzeUserProfile(userProfile) {
    const { entries, tagFrequency, avgRating, cuisineRatings } = userProfile;

    // Extract comprehensive user preferences
    const flavorProfile = this.extractFlavorProfile(entries);
    const spicePreference = this.calculateSpicePreference(entries);
    const ingredientPreferences = this.extractIngredientPreferences(entries);
    const cuisineAffinities = this.calculateCuisineAffinities(entries, cuisineRatings);
    const varietyScore = this.calculateVarietyScore(entries, cuisineRatings);
    const qualityThreshold = avgRating;
    const triedCuisines = Object.keys(cuisineRatings);
    const dishComplexityPreference = this.calculateComplexityPreference(entries);
    const ratingDistribution = this.analyzeRatingDistribution(entries);

    return {
      flavorProfile,
      spicePreference,
      ingredientPreferences,
      cuisineAffinities,
      varietyScore,
      qualityThreshold,
      triedCuisines,
      dishComplexityPreference,
      ratingDistribution,
      avgRating,
      totalEntries: entries.length,
    };
  }

  // Advanced flavor profile extraction with weighted analysis
  extractFlavorProfile(entries) {
    const flavorScores = {};
    
    entries.forEach((entry) => {
      const weight = entry.rating / 5; // Higher ratings = stronger preference signal
      const dishName = (entry.dish_name || "").toLowerCase();
      const tags = (entry.tags || []).map(t => t.toLowerCase());
      const allText = [dishName, ...tags].join(" ");

      // Score each flavor based on keyword matches
      Object.entries(this.flavorKeywords).forEach(([flavor, keywords]) => {
        const matches = keywords.filter(keyword => allText.includes(keyword)).length;
        flavorScores[flavor] = (flavorScores[flavor] || 0) + (matches * weight);
      });
    });

    // Normalize and return top flavors
    const total = Object.values(flavorScores).reduce((sum, score) => sum + score, 0);
    const normalized = {};
    Object.entries(flavorScores).forEach(([flavor, score]) => {
      normalized[flavor] = total > 0 ? Math.round((score / total) * 100) : 0;
    });

    return normalized;
  }

  // Calculate spice preference with nuanced scoring
  calculateSpicePreference(entries) {
    if (entries.length === 0) return 2.5;

    let totalSpiceScore = 0;
    let spicyEntries = 0;

    entries.forEach((entry) => {
      const dishName = (entry.dish_name || "").toLowerCase();
      const tags = (entry.tags || []).map(t => t.toLowerCase());
      const allText = [dishName, ...tags].join(" ");

      const spiceKeywords = ["spicy", "hot", "chili", "jalapeño", "curry", "pepper", "szechuan"];
      const spiceMatches = spiceKeywords.filter(keyword => allText.includes(keyword)).length;

      if (spiceMatches > 0) {
        spicyEntries++;
        // Weight by rating: high rating on spicy food = strong spice preference
        totalSpiceScore += (entry.rating / 5) * spiceMatches;
      }
    });

    const spiceRatio = spicyEntries / entries.length;
    const avgSpiceRating = spicyEntries > 0 ? totalSpiceScore / spicyEntries : 0;

    // Combine ratio and rating for final score (0-5 scale)
    return Math.min(5, Math.round((spiceRatio * 3 + avgSpiceRating * 2) * 10) / 10);
  }

  // Extract ingredient preferences from dish names and tags
  extractIngredientPreferences(entries) {
    const ingredients = {};
    const commonIngredients = [
      "chicken", "beef", "pork", "lamb", "fish", "seafood", "shrimp",
      "tofu", "cheese", "egg", "noodles", "rice", "pasta", "bread",
      "vegetables", "mushroom", "avocado", "tomato", "potato"
    ];

    entries.forEach((entry) => {
      const dishName = (entry.dish_name || "").toLowerCase();
      const tags = (entry.tags || []).map(t => t.toLowerCase());
      const allText = [dishName, ...tags].join(" ");
      const weight = entry.rating / 5;

      commonIngredients.forEach((ingredient) => {
        if (allText.includes(ingredient)) {
          ingredients[ingredient] = (ingredients[ingredient] || 0) + weight;
        }
      });
    });

    // Return top 5 ingredients
    return Object.entries(ingredients)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ing]) => ing);
  }

  // Calculate affinity scores for each cuisine based on actual eating patterns
  calculateCuisineAffinities(entries, cuisineRatings) {
    const affinities = {};

    // Analyze which cuisines appear in dish names/tags
    entries.forEach((entry) => {
      const dishName = (entry.dish_name || "").toLowerCase();
      const tags = (entry.tags || []).map(t => t.toLowerCase());
      const allText = [dishName, ...tags].join(" ");
      const weight = entry.rating / 5;

      Object.entries(this.cuisineProfiles).forEach(([cuisine, profile]) => {
        const keywordMatches = profile.dishKeywords.filter(keyword => 
          allText.includes(keyword)
        ).length;

        if (keywordMatches > 0) {
          affinities[cuisine] = (affinities[cuisine] || 0) + (keywordMatches * weight);
        }
      });
    });

    return affinities;
  }

  // Calculate variety-seeking behavior
  calculateVarietyScore(entries, cuisineRatings) {
    const uniqueCuisines = Object.keys(cuisineRatings).length;
    const entriesPerCuisine = entries.length / Math.max(uniqueCuisines, 1);
    
    // High variety = trying many cuisines with few entries each
    // Low variety = sticking to few cuisines repeatedly
    return uniqueCuisines >= 4 ? "high" : uniqueCuisines >= 2 ? "medium" : "low";
  }

  // Calculate preference for dish complexity
  calculateComplexityPreference(entries) {
    // Simple heuristic: multi-word dishes = more complex
    const avgWords = entries.reduce((sum, entry) => {
      const words = (entry.dish_name || "").split(" ").length;
      return sum + words;
    }, 0) / entries.length;

    return avgWords > 3 ? "complex" : avgWords > 2 ? "medium" : "simple";
  }

  // Analyze rating distribution to understand user's rating behavior
  analyzeRatingDistribution(entries) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach(entry => {
      const rating = Math.round(entry.rating);
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return distribution;
  }

  recommendCuisines(analysis) {
    const {
      flavorProfile,
      spicePreference,
      ingredientPreferences,
      cuisineAffinities,
      triedCuisines,
      varietyScore,
      qualityThreshold,
    } = analysis;

    const recommendations = [];

    // Score each cuisine with multi-dimensional analysis
    Object.entries(this.cuisineProfiles).forEach(([cuisine, profile]) => {
      // Skip cuisines already extensively tried
      if (triedCuisines.includes(cuisine)) return;

      let score = 0;
      const reasons = [];

      // 1. Flavor profile matching (30% weight)
      let flavorMatchScore = 0;
      profile.flavors.forEach((flavor) => {
        if (flavorProfile[flavor]) {
          flavorMatchScore += flavorProfile[flavor];
        }
      });
      score += (flavorMatchScore / 100) * 30;

      const topFlavors = Object.entries(flavorProfile)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([flavor]) => flavor);
      
      const matchingFlavors = profile.flavors.filter(f => topFlavors.includes(f));
      if (matchingFlavors.length > 0) {
        reasons.push(`You love ${matchingFlavors.join(" & ")} flavors`);
      }

      // 2. Spice level matching (25% weight)
      const spiceDiff = Math.abs(profile.spiceLevel - spicePreference);
      const spiceScore = Math.max(0, (5 - spiceDiff) / 5);
      score += spiceScore * 25;

      if (spiceDiff <= 1) {
        reasons.push("Perfect spice level match");
      } else if (spiceDiff <= 1.5) {
        reasons.push("Good spice level fit");
      }

      // 3. Ingredient matching (20% weight)
      const ingredientMatches = ingredientPreferences.filter(ing =>
        profile.ingredients.some(profIng => profIng.includes(ing) || ing.includes(profIng))
      ).length;
      score += (ingredientMatches / Math.max(ingredientPreferences.length, 1)) * 20;

      if (ingredientMatches > 0) {
        reasons.push(`Features ${ingredientPreferences[0]} you enjoy`);
      }

      // 4. Cuisine transition logic (15% weight) - recommend similar to what they like
      const similarCuisineBonus = profile.similar.filter(sim => 
        cuisineAffinities[sim] && cuisineAffinities[sim] > 1
      ).length;
      score += similarCuisineBonus * 5;

      if (similarCuisineBonus > 0) {
        reasons.push("Natural next step from your favorites");
      }

      // 5. Variety seeker bonus (10% weight)
      if (varietyScore === "high") {
        score += 10;
      } else if (varietyScore === "medium" && profile.complexity >= 3) {
        score += 5;
        reasons.push("Expands your culinary horizons");
      }

      recommendations.push({
        cuisine,
        score,
        reasons: reasons.slice(0, 2), // Keep top 2 reasons
        confidence: Math.min(Math.round(score), 95),
      });
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((rec) => ({
        name: this.formatCuisineName(rec.cuisine),
        key: rec.cuisine,
        reasons: rec.reasons,
        confidence: rec.confidence,
      }));
  }

  recommendDishes(analysis, cuisineRecommendations) {
    const {
      flavorProfile,
      spicePreference,
      ingredientPreferences,
      qualityThreshold,
    } = analysis;

    const dishes = [];

    // Get dishes from top recommended cuisines
    cuisineRecommendations.slice(0, 3).forEach((cuisineRec) => {
      const cuisineDishes = this.dishDatabase[cuisineRec.key] || [];
      
      // Score each dish based on user's flavor profile
      const scoredDishes = cuisineDishes.map(dish => {
        let score = 0;

        // Flavor profile matching
        dish.profile.forEach(flavor => {
          score += (flavorProfile[flavor] || 0) / 100;
        });

        // Spice level matching
        const spiceDiff = Math.abs(dish.spice - spicePreference);
        score += Math.max(0, (5 - spiceDiff) / 5);

        // Ingredient matching
        const ingredientMatches = ingredientPreferences.filter(ing =>
          dish.ingredients.some(dishIng => dishIng.includes(ing) || ing.includes(dishIng))
        ).length;
        score += ingredientMatches * 0.5;

        return { ...dish, score, cuisine: cuisineRec.name };
      });

      // Get top 2 dishes from this cuisine
      const topDishes = scoredDishes
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      topDishes.forEach(dish => {
        const reasons = [];
        
        // Generate specific reasons based on matching factors
        const topUserFlavors = Object.entries(flavorProfile)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([f]) => f);
        
        const matchingProfiles = dish.profile.filter(p => topUserFlavors.includes(p));
        if (matchingProfiles.length > 0) {
          reasons.push(`Matches your ${matchingProfiles[0]} preference`);
        } else {
          reasons.push("Recommended based on your taste");
        }

        dishes.push({
          name: dish.name,
          cuisine: dish.cuisine,
          reasons: reasons,
          score: dish.score,
        });
      });
    });

    // Return top 3 dishes overall
    return dishes
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ name, cuisine, reasons }) => ({
        name,
        cuisine,
        reasons,
      }));
  }

  generateTips(analysis) {
    const {
      flavorProfile,
      spicePreference,
      varietyScore,
      qualityThreshold,
      totalEntries,
      triedCuisines,
    } = analysis;

    const tips = [];

    // Get dominant flavor
    const dominantFlavor = Object.entries(flavorProfile)
      .sort(([, a], [, b]) => b - a)[0];

    // Spice-based tips
    if (spicePreference >= 3.5) {
      tips.push(
        `You have a strong preference for spicy food (${spicePreference}/5). Korean, Thai, and Indian cuisines would be perfect matches!`
      );
    } else if (spicePreference <= 1.5) {
      tips.push(
        `You prefer milder flavors (${spicePreference}/5). Try Italian, Japanese, or Mediterranean cuisines for gentle, refined tastes.`
      );
    }

    // Variety tips
    if (varietyScore === "high") {
      tips.push(
        `You're an adventurous eater with ${triedCuisines.length}+ cuisines explored! Try fusion restaurants that blend your favorites.`
      );
    } else if (varietyScore === "low" && totalEntries >= 10) {
      tips.push(
        `You've found your favorites! Branch out to similar cuisines - they're likely to become new favorites too.`
      );
    }

    // Quality tips
    if (qualityThreshold >= 4.2) {
      tips.push(
        `You're a quality seeker (${qualityThreshold.toFixed(1)} avg rating). Seek out chef-driven restaurants and tasting menus in your recommended cuisines.`
      );
    }

    // Flavor-specific tips
    if (dominantFlavor && dominantFlavor[1] > 30) {
      const [flavor, percentage] = dominantFlavor;
      tips.push(
        `${flavor.charAt(0).toUpperCase() + flavor.slice(1)} flavors dominate ${percentage}% of your favorites. Explore regional variations of dishes with this profile!`
      );
    }

    return tips.slice(0, 2);
  }

  formatCuisineName(cuisine) {
    return cuisine
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

export default FoodRecommendationEngine;
