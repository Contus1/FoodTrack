// Supabase Edge Function to analyze food images using Google Gemini API

// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// Your tag categories from AddEntry.js
const TAG_CATEGORIES = {
  Cuisines: [
    "Italian", "Chinese", "Japanese", "Mexican", "Indian", "Thai", "French",
    "Greek", "Korean", "Vietnamese", "American", "Mediterranean", "Spanish",
    "Turkish", "Middle Eastern"
  ],
  Flavors: [
    "Spicy", "Sweet", "Savory", "Sour", "Bitter", "Umami", "Salty",
    "Tangy", "Smoky", "Creamy", "Rich", "Fresh"
  ],
  Dietary: [
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb",
    "High-Protein", "Organic", "Halal", "Kosher"
  ],
  "Meal Type": [
    "Breakfast", "Brunch", "Lunch", "Dinner", "Snack", "Dessert",
    "Appetizer", "Main Course", "Side Dish"
  ],
  "Cooking Method": [
    "Grilled", "Fried", "Baked", "Steamed", "Roasted", "Raw",
    "Stir-Fried", "Slow-Cooked", "BBQ", "Deep-Fried"
  ],
  Protein: [
    "Chicken", "Beef", "Pork", "Seafood", "Fish", "Lamb",
    "Tofu", "Eggs", "Beans", "Cheese"
  ],
  Occasion: [
    "Date Night", "Family Meal", "Casual", "Fine Dining", "Street Food",
    "Fast Food", "Home Cooked", "Restaurant", "Food Truck", "Takeout"
  ],
  Popular: [
    "Comfort Food", "Healthy", "Indulgent", "Light", "Filling",
    "Refreshing", "Exotic", "Traditional", "Fusion", "Trendy"
  ]
};

serve(async (req: Request) => {
  // CORS headers - Allow all headers for DigitalOcean compatibility
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get image data from request
    const { imageBase64 } = await req.json();

    console.log('Received request, imageBase64 length:', imageBase64?.length || 0);

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Calling Gemini API...');

    // Prepare prompt for Gemini
    const prompt = `Analyze this food image and provide a detailed response in JSON format.

Your task:
1. Identify the exact dish name (be specific, e.g., "Chicken Schnitzel with Fries" not just "Chicken")
2. Select 5-8 relevant tags from the following categories:

${Object.entries(TAG_CATEGORIES).map(([category, tags]) => 
  `${category}: ${tags.join(", ")}`
).join("\n")}

Return ONLY a valid JSON object with this exact structure:
{
  "dish_name": "exact name of the dish",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- Be specific with dish names
- Use ONLY tags from the categories above
- Choose 5-8 most relevant tags
- Mix tags from different categories
- No explanations, just the JSON object`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }],
        generation_config: {
        temperature: 0.4,
        top_k: 32,
        top_p: 1,
        max_output_tokens: 500,
        }

      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error - Status:", response.status);
      console.error("Gemini API error - Body:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to analyze image",
          status: response.status,
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Gemini API response received successfully');
    const data = await response.json();
    console.log('Gemini data parsed:', JSON.stringify(data).substring(0, 200));
    
    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: "No response from Gemini" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let result;
    try {
      // Remove markdown code blocks if present
      const cleanedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", generatedText);
      return new Response(
        JSON.stringify({ 
          error: "Invalid response format from AI",
          raw: generatedText 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate result structure
    if (!result.dish_name || !Array.isArray(result.tags)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid AI response structure",
          result 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return successful result
    return new Response(
      JSON.stringify({
        success: true,
        dish_name: result.dish_name,
        tags: result.tags
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    console.error("Error in analyze-food function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
