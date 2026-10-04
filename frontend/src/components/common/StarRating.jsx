import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onChange = () => {},
  size = 'md', // sm, md, lg, xl
  showValue = false,
  totalReviews = null,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const currentRating = interactive ? hoverRating || rating : rating;

  return (
    <div className="inline-flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-0.5">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentRating;
          const isHalf = !interactive && starValue - 0.5 <= currentRating && starValue > currentRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-115 transition-transform duration-150 focus:outline-none'
                  : 'cursor-default'
              } p-0.5`}
              aria-label={`Rate ${starValue} stars out of ${maxStars}`}
            >
              <Star
                className={`${starSize} transition-colors duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : isHalf
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-slate-300 fill-slate-100 hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-semibold text-slate-800 ml-1">
          {rating ? Number(rating).toFixed(1) : '0.0'}
          {totalReviews !== null && (
            <span className="text-xs font-normal text-slate-500 ml-1">
              ({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
