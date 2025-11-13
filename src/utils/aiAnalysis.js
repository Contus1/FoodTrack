/**
 * AI Analysis utilities for food image recognition
 * Uses Google Gemini API via Supabase Edge Function
 */

/**
 * Convert a File/Blob to base64 string
 * @param {File|Blob} file - The image file to convert
 * @returns {Promise<string>} Base64 encoded string (without data URL prefix)
 */
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Analyze food image using Gemini AI
 * @param {File|Blob} imageFile - The image file to analyze
 * @param {object} supabase - Supabase client instance
 * @returns {Promise<{dish_name: string, tags: string[]}>} Analysis result
 */
export const analyzeFoodImage = async (imageFile, supabase) => {
  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);
    
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: {
        imageBase64: base64Image
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to analyze image');
    }
    
    if (!data.success) {
      throw new Error(data.error || 'AI analysis failed');
    }
    
    return {
      dish_name: data.dish_name,
      tags: data.tags
    };
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};
