import supabase from './supabaseClient';

/**
 * Get or create a dish by name
 * @param {string} dishName - The name of the dish
 * @param {string} cuisineType - Optional cuisine type
 * @returns {Promise<{id: string, name: string}>} - The dish object
 */
export const getOrCreateDish = async (dishName, cuisineType = null) => {
  try {
    const normalizedName = dishName.trim().toLowerCase();
    
    // First, try to find existing dish
    const { data: existingDish, error: findError } = await supabase
      .from('dishes')
      .select('*')
      .eq('normalized_name', normalizedName)
      .single();
    
    if (existingDish) {
      return existingDish;
    }
    
    // If not found, create new dish
    const { data: newDish, error: createError } = await supabase
      .from('dishes')
      .insert({
        name: dishName.trim(),
        normalized_name: normalizedName,
        cuisine_type: cuisineType
      })
      .select()
      .single();
    
    if (createError) {
      // If unique constraint error, try to fetch again (race condition)
      if (createError.code === '23505') {
        const { data: retryDish, error: retryError } = await supabase
          .from('dishes')
          .select('*')
          .eq('normalized_name', normalizedName)
          .single();
        
        if (retryError) throw retryError;
        return retryDish;
      }
      throw createError;
    }
    
    return newDish;
  } catch (error) {
    console.error('Error getting or creating dish:', error);
    throw error;
  }
};

/**
 * Get community rating for a dish
 * @param {string} dishId - The dish ID
 * @returns {Promise<{avgRating: number, totalRatings: number}>}
 */
export const getDishCommunityRating = async (dishId) => {
  try {
    const { data, error } = await supabase
      .from('dish_stats')
      .select('avg_rating, total_ratings')
      .eq('dish_id', dishId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return {
      avgRating: data?.avg_rating ? parseFloat(data.avg_rating) : null,
      totalRatings: data?.total_ratings || 0
    };
  } catch (error) {
    console.error('Error getting dish community rating:', error);
    return { avgRating: null, totalRatings: 0 };
  }
};

/**
 * Get community ratings for multiple dishes
 * @param {string[]} dishIds - Array of dish IDs
 * @returns {Promise<Map<string, {avgRating: number, totalRatings: number}>>}
 */
export const getBulkDishCommunityRatings = async (dishIds) => {
  try {
    const { data, error } = await supabase
      .from('dish_stats')
      .select('dish_id, avg_rating, total_ratings')
      .in('dish_id', dishIds);
    
    if (error) throw error;
    
    const ratingsMap = new Map();
    data?.forEach(stat => {
      ratingsMap.set(stat.dish_id, {
        avgRating: stat.avg_rating ? parseFloat(stat.avg_rating) : null,
        totalRatings: stat.total_ratings || 0
      });
    });
    
    return ratingsMap;
  } catch (error) {
    console.error('Error getting bulk dish community ratings:', error);
    return new Map();
  }
};

/**
 * Search dishes by name
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} - Array of dishes
 */
export const searchDishes = async (query, limit = 10) => {
  try {
    const normalizedQuery = query.trim().toLowerCase();
    
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .ilike('normalized_name', `%${normalizedQuery}%`)
      .order('name')
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error searching dishes:', error);
    return [];
  }
};

/**
 * Get popular dishes (most rated)
 * @param {number} limit - Max results
 * @returns {Promise<Array>} - Array of popular dishes with stats
 */
export const getPopularDishes = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('dish_stats')
      .select('*')
      .order('total_ratings', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting popular dishes:', error);
    return [];
  }
};
