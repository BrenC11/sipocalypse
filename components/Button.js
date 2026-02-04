
import React from 'react';
// import { ButtonProps } from '../types.js'; // Types are erased
import LoadingSpinner from './LoadingSpinner.js';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ease-in-out rounded-lg inline-flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-custom-lime hover:bg-lime-400 text-custom-pink font-comic shadow-md hover:shadow-lg focus:ring-custom-pink disabled:opacity-60 disabled:cursor-not-allowed",
    secondary: "bg-gray-600 hover:bg-gray-500 text-gray-100 font-comic shadow focus:ring-gray-400 disabled:opacity-60 disabled:cursor-not-allowed",
    outline: "bg-transparent border-2 border-custom-pink text-custom-pink font-comic hover:bg-custom-pink hover:text-white focus:ring-custom-pink disabled:border-gray-500 disabled:text-gray-500 disabled:cursor-not-allowed",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  let actualSpinnerColor = 'text-white';
  if (variant === 'primary') {
    actualSpinnerColor = 'text-custom-pink';
  } else if (variant === 'outline') {
    actualSpinnerColor = 'text-custom-pink';
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    React.createElement("button", {
      className: combinedClassName,
      disabled: disabled || isLoading,
      ...props
    },
    isLoading && React.createElement(LoadingSpinner, { size: "sm", className: "mr-2", color: actualSpinnerColor }),
    children
    )
  );
};

export default Button;
