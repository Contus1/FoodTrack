// Recommendation engine for food suggestions
export class FoodRecommendationEngine {
  constructor() {
    // Cuisine profiles with characteristics
    this.cuisineProfiles = {
      chinese: {
        flavors: ["savory", "sweet", "umami"],
        spiceLevel: 2,
        ingredients: ["noodles", "rice", "seafood", "vegetables"],
        cookingMethods: ["stir-fry", "steamed", "fried"],
        similar: ["thai", "vietnamese", "korean"],
      },
      mexican: {
        flavors: ["spicy", "savory", "tangy"],
        spiceLevel: 4,
        ingredients: ["cheese", "beans", "corn", "meat"],
        cookingMethods: ["grilled", "fried", "roasted"],
        similar: ["spanish", "peruvian", "colombian"],
      },
      indian: {
        flavors: ["spicy", "aromatic", "complex"],
        spiceLevel: 4,
        ingredients: ["rice", "lentils", "vegetables", "yogurt"],
        cookingMethods: ["curry", "tandoor", "fried"],
        similar: ["pakistani", "nepali", "sri lankan"],
      },
      vietnamese: {
        flavors: ["fresh", "herbal", "light"],
        spiceLevel: 2,
        ingredients: ["noodles", "herbs", "seafood", "vegetables"],
        cookingMethods: ["soup", "grilled", "fresh"],
        similar: ["thai", "cambodian", "laotian"],
      },
      middle_eastern: {
        flavors: ["aromatic", "savory", "tangy"],
        spiceLevel: 3,
        ingredients: ["rice", "meat", "vegetables", "herbs"],
        cookingMethods: ["grilled", "roasted", "stewed"],
        similar: ["turkish", "lebanese", "moroccan"],
      },
      mediterranean: {
        flavors: ["fresh", "tangy", "herbal"],
        spiceLevel: 2,
        ingredients: ["olive oil", "vegetables", "seafood", "cheese"],
        cookingMethods: ["grilled", "roasted", "fresh"],
        similar: ["greek", "spanish", "moroccan"],
      },
      german: {
        flavors: ["hearty", "savory", "comfort"],
        spiceLevel: 1,
        ingredients: ["meat", "potatoes", "bread", "cheese"],
        cookingMethods: ["roasted", "braised", "fried"],
        similar: ["austrian", "czech", "polish"],
      },
      french: {
        flavors: ["refined", "creamy", "savory"],
        spiceLevel: 2,
        ingredients: ["cheese", "cream", "wine", "herbs"],
        cookingMethods: ["sautéed", "braised", "roasted"],
        similar: ["belgian", "swiss", "spanish"],
      },
    };

    // Dish recommendations by cuisine
    this.dishRecommendations = {
      chinese: [
        "Kung Pao Chicken",
        "Sweet & Sour Pork",
        "Fried Rice",
        "Dumplings",
        "Hot Pot",
      ],
      mexican: [
        "Tacos al Pastor",
        "Enchiladas",
        "Quesadillas",
        "Guacamole",
        "Chiles Rellenos",
      ],
      indian: [
        "Butter Chicken",
        "Biryani",
        "Dal Curry",
        "Samosas",
        "Tandoori Chicken",
      ],
      vietnamese: ["Pho", "Banh Mi", "Spring Rolls", "Bun Bo Hue", "Com Tam"],
      middle_eastern: ["Hummus", "Shawarma", "Falafel", "Tabbouleh", "Kebabs"],
      mediterranean: [
        "Greek Salad",
        "Paella",
        "Moussaka",
        "Bruschetta",
        "Grilled Fish",
      ],
      german: [
        "Schnitzel",
        "Bratwurst",
        "Sauerkraut",
        "Pretzel",
        "Sauerbraten",
      ],
      french: [
        "Coq au Vin",
        "Ratatouille",
        "Croissant",
        "Bouillabaisse",
        "Crème Brûlée",
      ],
    };
  }

  generateRecommendations(userProfile) {
    const recommendations = {
      cuisines: [],
      dishes: [],
      tips: [],
      reasoning: {},
    };

    // Analyze user's preferences
    const analysis = this.analyzeUserProfile(userProfile);

    // Generate cuisine recommendations
    recommendations.cuisines = this.recommendCuisines(analysis);

    // Generate dish recommendations
    recommendations.dishes = this.recommendDishes(
      analysis,
      recommendations.cuisines,
    );

    // Generate personalized tips
    recommendations.tips = this.generateTips(analysis);

    // Store reasoning for transparency
    recommendations.reasoning = analysis;

    return recommendations;
  }

  analyzeUserProfile(userProfile) {
    const { entries, tagFrequency, avgRating, cuisineRatings } = userProfile;

    // Extract user preferences
    const preferredFlavors = this.extractPreferredFlavors(tagFrequency);
    const spicePreference = this.calculateSpicePreference(entries);
    const varietySeeker = this.calculateVarietyPreference(cuisineRatings);
    const qualitySeeker = avgRating >= 4;
    const triedCuisines = Object.keys(cuisineRatings);

    return {
      preferredFlavors,
      spicePreference,
      varietySeeker,
      qualitySeeker,
      triedCuisines,
      avgRating,
      totalEntries: entries.length,
    };
  }

  extractPreferredFlavors(tagFrequency) {
    const flavorTags = [
      "spicy",
      "creamy",
      "sweet",
      "savory",
      "tangy",
      "fresh",
      "aromatic",
    ];
    return flavorTags
      .filter((flavor) => tagFrequency[flavor] > 0)
      .sort((a, b) => (tagFrequency[b] || 0) - (tagFrequency[a] || 0))
      .slice(0, 3);
  }

  calculateSpicePreference(entries) {
    if (entries.length === 0) return 2.5;

    const avgRating =
      entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;
    const spicyCount = entries.filter(
      (entry) =>
        entry.tags &&
        entry.tags.some((tag) => tag.toLowerCase().includes("spicy")),
    ).length;

    const spiceRatio = spicyCount / entries.length;
    return Math.round((avgRating + spiceRatio * 2) * 10) / 10;
  }

  calculateVarietyPreference(cuisineRatings) {
    return Object.keys(cuisineRatings).length >= 3;
  }

  recommendCuisines(analysis) {
    const { preferredFlavors, spicePreference, triedCuisines, varietySeeker } =
      analysis;

    const recommendations = [];

    // Score each cuisine based on user preferences
    Object.entries(this.cuisineProfiles).forEach(([cuisine, profile]) => {
      if (triedCuisines.includes(cuisine)) return; // Skip already tried cuisines

      let score = 0;

      // Flavor matching
      const flavorMatches = preferredFlavors.filter((flavor) =>
        profile.flavors.includes(flavor),
      ).length;
      score += flavorMatches * 3;

      // Spice level matching
      const spiceDiff = Math.abs(profile.spiceLevel - spicePreference);
      score += (5 - spiceDiff) * 2;

      // Variety bonus for variety seekers
      if (
        varietySeeker &&
        profile.similar.some((sim) => !triedCuisines.includes(sim))
      ) {
        score += 2;
      }

      recommendations.push({
        cuisine,
        score,
        reasons: this.generateCuisineReasons(cuisine, profile, analysis),
      });
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((rec) => ({
        name: this.formatCuisineName(rec.cuisine),
        key: rec.cuisine,
        reasons: rec.reasons,
        confidence: Math.min(rec.score * 10, 95),
      }));
  }

  generateCuisineReasons(cuisine, profile, analysis) {
    const reasons = [];

    // Flavor reasons
    const matchingFlavors = analysis.preferredFlavors.filter((flavor) =>
      profile.flavors.includes(flavor),
    );
    if (matchingFlavors.length > 0) {
      reasons.push(`You love ${matchingFlavors.join(" & ")} flavors`);
    }

    // Spice level reasons
    if (Math.abs(profile.spiceLevel - analysis.spicePreference) <= 1) {
      reasons.push(`Perfect spice level match`);
    }

    // Ingredient reasons
    const userIngredients = ["noodles", "cheese", "seafood", "vegetables"];
    const matchingIngredients = userIngredients.filter((ing) =>
      profile.ingredients.includes(ing),
    );
    if (matchingIngredients.length > 0) {
      reasons.push(`Features ${matchingIngredients[0]} you enjoy`);
    }

    return reasons.slice(0, 2);
  }

  recommendDishes(analysis, cuisineRecommendations) {
    const dishes = [];

    cuisineRecommendations.slice(0, 2).forEach((cuisineRec) => {
      const cuisineDishes = this.dishRecommendations[cuisineRec.key] || [];
      const selectedDishes = cuisineDishes.slice(0, 2).map((dish) => ({
        name: dish,
        cuisine: cuisineRec.name,
        reasons: [
          `Popular ${cuisineRec.name} dish`,
          "Matches your taste profile",
        ],
      }));
      dishes.push(...selectedDishes);
    });

    return dishes.slice(0, 3);
  }

  generateTips(analysis) {
    const tips = [];

    // Spice level tips
    if (analysis.spicePreference >= 3.5) {
      tips.push(
        `🌶️ Since you love spicy food (${analysis.spicePreference}/5), try Mexican or Indian cuisine for your next adventure!`,
      );
    } else if (analysis.spicePreference <= 2) {
      tips.push(
        `😌 Since you prefer milder flavors (${analysis.spicePreference}/5), Mediterranean or French cuisine might be perfect!`,
      );
    }

    // Variety tips
    if (analysis.varietySeeker) {
      tips.push(
        `🌍 You're an adventurous eater! Try fusion cuisines that combine your favorite flavors.`,
      );
    } else if (analysis.triedCuisines.length <= 2) {
      tips.push(
        `🚀 Ready to expand your horizons? Start with cuisines similar to what you already love.`,
      );
    }

    // Quality tips
    if (analysis.qualitySeeker) {
      tips.push(
        `⭐ You have high standards (${analysis.avgRating} avg rating)! Look for highly-rated restaurants in these cuisines.`,
      );
    }

    // Flavor-specific tips
    if (analysis.preferredFlavors.includes("creamy")) {
      tips.push(
        `🥛 Love creamy dishes? Try Thai curries or Italian pasta - they'll be right up your alley!`,
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
