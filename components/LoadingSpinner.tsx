
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string; // Tailwind color class e.g., 'text-purple-500'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
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
    <div 
      className={`animate-spin rounded-full border-2 border-transparent border-t-current border-b-current ${sizeClasses[size]} ${color} ${className}`}
      style={{ borderTopColor: 'currentColor', borderBottomColor: 'currentColor', borderLeftColor: 'transparent', borderRightColor: 'transparent' }} // Ensures only top/bottom borders get current color for spinner effect
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
