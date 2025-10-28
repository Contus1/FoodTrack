import React, { useState, useEffect, useRef } from 'react';
import { createPlaceholder } from '../utils/imageOptimization';

/**
 * Optimized Image component with lazy loading and blur-up effect
 */
const OptimizedImage = ({ 
  src, 
  alt = '', 
  className = '', 
  thumbnailSrc = null,
  onLoad = null,
  priority = false,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(createPlaceholder());
  const [imageLoading, setImageLoading] = useState(true);
  const [isInView, setIsInView] = useState(priority); // If priority, load immediately
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const currentImg = imgRef.current; // Copy ref to avoid stale closure
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    );

    observer.observe(currentImg);

    return () => {
      observer.unobserve(currentImg);
    };
  }, [priority]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    
    // Load thumbnail first if available
    if (thumbnailSrc) {
      const thumb = new Image();
      thumb.onload = () => {
        setImageSrc(thumbnailSrc);
      };
      thumb.src = thumbnailSrc;
    }

    // Then load full image
    img.onload = () => {
      setImageSrc(src);
      setImageLoading(false);
      if (onLoad) onLoad();
    };

    img.onerror = () => {
      setImageLoading(false);
      console.error('Failed to load image:', src);
    };

    img.src = src;
  }, [src, thumbnailSrc, isInView, onLoad]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        {...props}
      />
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
