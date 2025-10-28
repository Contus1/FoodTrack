/**
 * Image Optimization Utilities
 * Compress and resize images before upload to improve performance
 */

/**
 * Compress an image file before upload
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    outputFormat = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create new file with compressed blob
            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now()
            });
            
            console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
            resolve(compressedFile);
          },
          outputFormat,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate thumbnail URL from Supabase storage URL
 * Uses Supabase's image transformation API
 * @param {string} url - Original image URL
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '';
  
  const {
    width = 400,
    height = 400,
    quality = 75,
    format = 'webp'
  } = options;
  
  // Check if URL is from Supabase storage
  if (url.includes('/storage/v1/object/public/')) {
    // Add transformation parameters
    // Note: This requires Supabase Pro plan with image transformations enabled
    // For free tier, images load as-is
    const transformParams = `width=${width}&height=${height}&quality=${quality}&format=${format}`;
    
    // Insert transformation parameters before the filename
    return url.replace('/public/', `/public/render/image/authenticated/${transformParams}/`);
  }
  
  return url;
};

/**
 * Create a placeholder/blur data URL while image loads
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @returns {string} - Data URL for placeholder
 */
export const createPlaceholder = (width = 400, height = 300) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/png');
};

/**
 * Preload an image
 * @param {string} src - Image URL to preload
 * @returns {Promise<void>}
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Check if image should be compressed based on file size
 * @param {File} file - Image file
 * @param {number} threshold - Size threshold in MB
 * @returns {boolean}
 */
export const shouldCompress = (file, threshold = 1) => {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > threshold;
};
