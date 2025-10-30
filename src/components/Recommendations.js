import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FoodRecommendationEngine } from "../utils/recommendationEngine";
import { useEntries } from "../context/EntriesContext";

// Mock restaurant data for monetization (will be replaced with real API later)
const MOCK_RESTAURANTS = {
  spicy: [
    { name: "Masala House", cuisine: "Indian", address: "Kreuzberg, Berlin", price: "€€", rating: 4.7, tags: ["Spicy", "Authentic", "Vegetarian Options"] },
    { name: "El Fuego", cuisine: "Mexican", address: "Mitte, Berlin", price: "€€", rating: 4.5, tags: ["Spicy", "Tacos", "Cocktails"] },
    { name: "Thai Chili", cuisine: "Thai", address: "Prenzlauer Berg, Berlin", price: "€", rating: 4.6, tags: ["Spicy", "Curry", "Fresh"] },
  ],
  sweet: [
    { name: "Patisserie Belle", cuisine: "French", address: "Charlottenburg, Berlin", price: "€€€", rating: 4.8, tags: ["Desserts", "Pastries", "Elegant"] },
    { name: "Sugar Rush Café", cuisine: "American", address: "Friedrichshain, Berlin", price: "€€", rating: 4.4, tags: ["Pancakes", "Waffles", "Brunch"] },
    { name: "Dolce Vita", cuisine: "Italian", address: "Mitte, Berlin", price: "€€", rating: 4.6, tags: ["Gelato", "Tiramisu", "Cozy"] },
  ],
  savory: [
    { name: "Steakhouse Berlin", cuisine: "Steakhouse", address: "Charlottenburg, Berlin", price: "€€€", rating: 4.7, tags: ["Meat", "Premium", "Wine"] },
    { name: "Ramen Ya", cuisine: "Japanese", address: "Kreuzberg, Berlin", price: "€€", rating: 4.5, tags: ["Ramen", "Authentic", "Quick"] },
    { name: "Burger Meister", cuisine: "Burgers", address: "Kreuzberg, Berlin", price: "€", rating: 4.6, tags: ["Burgers", "Casual", "Local"] },
  ],
  healthy: [
    { name: "Green Leaf", cuisine: "Vegan", address: "Mitte, Berlin", price: "€€", rating: 4.6, tags: ["Vegan", "Organic", "Bowls"] },
    { name: "Fresh & Fit", cuisine: "Healthy", address: "Prenzlauer Berg, Berlin", price: "€€", rating: 4.5, tags: ["Salads", "Smoothies", "Gluten-Free"] },
    { name: "The Juice Bar", cuisine: "Juice Bar", address: "Friedrichshain, Berlin", price: "€", rating: 4.4, tags: ["Juices", "Açaí", "Raw"] },
  ],
};

const SponsoredRestaurants = ({ userProfile }) => {
  const restaurants = useMemo(() => {
    if (!userProfile || !userProfile.tagFrequency) return [];

    // Analyze user's flavor preferences
    const flavorTags = userProfile.tagFrequency;
    let selectedCategory = "savory"; // default

    // Determine primary taste profile
    const spicyTerms = ["spicy", "hot", "chili", "thai", "indian", "mexican", "szechuan"];
    const sweetTerms = ["sweet", "dessert", "cake", "chocolate", "pastry"];
    const healthyTerms = ["healthy", "vegan", "vegetarian", "salad", "organic"];
    
    const spicyScore = spicyTerms.reduce((sum, term) => sum + (flavorTags[term] || 0), 0);
    const sweetScore = sweetTerms.reduce((sum, term) => sum + (flavorTags[term] || 0), 0);
    const healthyScore = healthyTerms.reduce((sum, term) => sum + (flavorTags[term] || 0), 0);

    if (spicyScore > sweetScore && spicyScore > healthyScore) {
      selectedCategory = "spicy";
    } else if (sweetScore > spicyScore && sweetScore > healthyScore) {
      selectedCategory = "sweet";
    } else if (healthyScore > spicyScore && healthyScore > sweetScore) {
      selectedCategory = "healthy";
    }

    return MOCK_RESTAURANTS[selectedCategory] || MOCK_RESTAURANTS.savory;
  }, [userProfile]);

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900 text-sm">Restaurants Near You</h4>
          <p className="text-xs text-gray-500 mt-0.5">Handpicked based on your taste</p>
        </div>
        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
          Sponsored
        </span>
      </div>

      <div className="space-y-2">
        {restaurants.map((restaurant, index) => (
          <div
            key={index}
            className="p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h5 className="font-medium text-gray-900 text-sm">
                    {restaurant.name}
                  </h5>
                  <span className="text-xs text-gray-500">{restaurant.price}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
                  <span>{restaurant.cuisine}</span>
                  <span className="text-gray-300">•</span>
                  <span>{restaurant.address}</span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center">
                    <span className="text-yellow-500 mr-0.5">★</span>
                    {restaurant.rating}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {restaurant.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Recommendations = () => {
  const navigate = useNavigate();
  const { entries } = useEntries();

  const discoveryData = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    // Prepare user profile for the recommendation engine
    const cuisineRatings = {};
    const tagFrequency = {};
    let totalRating = 0;

    entries.forEach((entry) => {
      totalRating += entry.rating || 0;

      // Process tags
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          tagFrequency[lowerTag] = (tagFrequency[lowerTag] || 0) + 1;

          // Identify cuisines
          const cuisineKeywords = [
            "italian",
            "chinese",
            "mexican",
            "indian",
            "japanese",
            "french",
            "thai",
            "american",
            "korean",
            "vietnamese",
            "mediterranean",
            "greek",
            "spanish",
            "lebanese",
            "turkish",
            "moroccan",
            "brazilian",
            "argentinian",
            "peruvian",
          ];
          const cuisine = cuisineKeywords.find((keyword) =>
            lowerTag.includes(keyword),
          );

          if (cuisine) {
            if (!cuisineRatings[cuisine]) {
              cuisineRatings[cuisine] = { total: 0, count: 0, avg: 0 };
            }
            cuisineRatings[cuisine].total += entry.rating || 0;
            cuisineRatings[cuisine].count++;
            cuisineRatings[cuisine].avg =
              cuisineRatings[cuisine].total / cuisineRatings[cuisine].count;
          }
        });
      }
    });

    const avgRating = totalRating / entries.length;

    const userProfile = {
      entries,
      tagFrequency,
      avgRating,
      cuisineRatings,
    };

    const engine = new FoodRecommendationEngine();
    const recommendations = engine.generateRecommendations(userProfile);
    
    return {
      ...recommendations,
      userProfile, // Include the userProfile for the restaurant widget
    };
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
          <h3 className="text-xl font-light text-gray-900 mb-3">
            Start Your Culinary Journey
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add a few food entries to get personalized recommendations based on
            your taste preferences!
          </p>
          <button
            onClick={() => navigate("/add")}
            className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Add Your First Dish
          </button>
        </div>
      </div>
    );
  }

  if (!discoveryData) return null;

  return (
    <div className="space-y-4">
      {/* Cuisine Recommendations - TOP */}
      {discoveryData.cuisines && discoveryData.cuisines.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="mb-3">
            <h4 className="font-medium text-gray-900 text-sm">Explore New Cuisines</h4>
            <p className="text-xs text-gray-500 mt-0.5">Based on your preferences</p>
          </div>
          <div className="space-y-2">
            {discoveryData.cuisines.slice(0, 3).map((cuisine, index) => (
              <div
                key={cuisine.key || index}
                className="p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors group cursor-pointer"
                onClick={() => navigate("/add")}
              >
                <div className="flex items-start justify-between mb-1">
                  <h5 className="font-medium text-gray-900 text-sm">
                    {cuisine.name}
                  </h5>
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                    {cuisine.confidence}% match
                  </span>
                </div>
                {cuisine.reasons && cuisine.reasons.length > 0 && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {cuisine.reasons.slice(0, 2).join(" • ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dish Recommendations */}
      {discoveryData.dishes && discoveryData.dishes.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="mb-3">
            <h4 className="font-medium text-gray-900 text-sm">Perfect Dishes for You</h4>
            <p className="text-xs text-gray-500 mt-0.5">Flavor matched</p>
          </div>
          <div className="space-y-2">
            {discoveryData.dishes.slice(0, 3).map((dish, index) => (
              <div
                key={index}
                className="p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors group cursor-pointer"
                onClick={() => navigate("/add")}
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-medium text-gray-900 text-sm">
                    {dish.name}
                  </h5>
                  <span className="text-xs text-gray-500">
                    {dish.cuisine}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {dish.reasons && dish.reasons.length > 0
                    ? dish.reasons[0]
                    : "Matches your taste profile"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsored Restaurants - BOTTOM */}
      <SponsoredRestaurants userProfile={discoveryData.userProfile} />
    </div>
  );
};

export default Recommendations;
