import React, { useCallback } from "react";

const StarRating = ({
  value = 0,
  onRatingChange,
  readonly = false,
  size = "md",
}) => {
  const handleStarClick = useCallback(
    (rating) => {
      if (!readonly && onRatingChange) {
        onRatingChange(rating);
      }
    },
    [readonly, onRatingChange],
  );

  // Rating scale from 1-10
  const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="w-full">
      {/* Current Rating Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-light text-black">{value}</span>
          <span className="text-lg font-light text-gray-400">/10</span>
        </div>
      </div>

      {/* Rating Scale */}
      <div className="space-y-2">
        {/* Labels */}
        <div className="flex justify-between text-xs font-light text-gray-400 px-1 mb-1">
          <span>Poor</span>
          <span>Excellent</span>
        </div>

        {/* Interactive Scale */}
        <div className="relative h-12 sm:h-14 bg-white rounded-full border border-gray-200 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-yellow-50 via-amber-50 to-emerald-50" />

          {/* Selected fill */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-300 ease-out"
            style={{ width: `${(value / 10) * 100}%` }}
          />

          {/* Rating buttons */}
          <div className="relative h-full flex items-center justify-between px-1 sm:px-2 gap-0.5 sm:gap-1">
            {ratings.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleStarClick(rating)}
                disabled={readonly}
                className={`
                  relative z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all duration-200
                  flex items-center justify-center font-medium text-xs sm:text-sm flex-shrink-0
                  ${readonly ? "cursor-default" : "cursor-pointer touch-manipulation active:scale-90"}
                  ${
                    rating === value
                      ? "bg-black text-white scale-110 shadow-lg"
                      : rating < value
                        ? "bg-white/80 text-gray-700 hover:bg-white hover:scale-105"
                        : "bg-white/50 text-gray-400 hover:bg-white/80 hover:text-gray-600 hover:scale-105"
                  }
                `}
                aria-label={`Rate ${rating} out of 10`}
                title={`${rating}/10`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Quick description */}
        <div className="text-center mt-3">
          <p className="text-sm font-light text-gray-500">
            {value <= 3 && "Not great"}
            {value > 3 && value <= 5 && "Could be better"}
            {value > 5 && value <= 7 && "Pretty good"}
            {value > 7 && value < 10 && "Really great!"}
            {value === 10 && "Absolutely perfect! ✨"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StarRating;
