import React, { useState, useEffect } from "react";

/**
 * Custom Loading Spinner Component
 * Zeigt ein rotierendes Easter Egg Bild anstatt eines langweiligen Spinners
 * Wechselt zufällig zwischen Pizza-Emoji 🍕 und thumbs.png
 * 
 * Props:
 * - size: "sm" | "md" | "lg" | "xl" (default: "md")
 * - className: zusätzliche Tailwind Klassen
 */
const LoadingSpinner = ({ size = "md", className = "" }) => {
  // Zufällig zwischen Emoji und Bild wählen (wird nur 1x beim Mount entschieden)
  const [useEmoji] = useState(() => Math.random() > 0.5);

  // Größen-Mapping
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`inline-block ${className}`}>
      {useEmoji ? (
        // Option 1: Pizza Emoji 🍕
        <div
          className={`${sizeClass} flex items-center justify-center animate-spin-slow`}
          style={{
            fontSize: size === "xl" ? "4rem" : size === "lg" ? "2.5rem" : size === "md" ? "1.5rem" : "1rem",
          }}
        >
          🍕
        </div>
      ) : (
        // Option 2: thumbs.png
        <img
          src="/thumbs.png"
          alt="Loading..."
          className={`${sizeClass} object-contain animate-spin-slow`}
        />
      )}
    </div>
  );
};

export default LoadingSpinner;
