import React from 'react';

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onRatingChange(starValue)}
            className={`text-2xl transition-colors ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            ⭐
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
