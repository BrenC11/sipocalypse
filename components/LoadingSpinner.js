
import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '',
  color = 'text-white' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    React.createElement("div", {
      className: `animate-spin rounded-full border-2 border-transparent border-t-current border-b-current ${sizeClasses[size]} ${color} ${className}`,
      style: { borderTopColor: 'currentColor', borderBottomColor: 'currentColor', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
      role: "status",
      "aria-live": "polite"
    },
    React.createElement("span", { className: "sr-only" }, "Loading...")
    )
  );
};

export default LoadingSpinner;
