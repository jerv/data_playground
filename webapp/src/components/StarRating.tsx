import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: number;
  disabled?: boolean;
  hideText?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange = () => {},
  max = 5,
  size = 24,
  disabled = false,
  hideText = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleMouseOver = (index: number) => {
    if (!disabled) {
      setHoverValue(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const handleClick = (index: number) => {
    if (!disabled) {
      onChange(index);
    }
  };

  // Custom SVG star component
  const Star = ({ filled }: { filled: boolean }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? "text-yellow-400" : "text-gray-300"}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, index) => {
        const ratingValue = index + 1;
        const isActive = (hoverValue !== null ? ratingValue <= hoverValue : ratingValue <= value);
        
        return (
          <div
            key={index}
            className={`${!disabled ? 'cursor-pointer' : 'cursor-default'} p-1 transition-colors`}
            onMouseOver={() => handleMouseOver(ratingValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(ratingValue)}
          >
            <Star filled={isActive} />
          </div>
        );
      })}
      {!hideText && <span className="ml-2 text-sm text-gray-600">{value || 0} of {max}</span>}
    </div>
  );
};

export default StarRating; 