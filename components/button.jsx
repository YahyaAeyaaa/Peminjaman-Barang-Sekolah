 'use client';

import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  radius = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  className = '',
  bgColor,
  hoverColor,
  textColor = 'white',
  ...props
}) => {
  // Variant styles
  const variants = {
    primary: 'text-white border-transparent',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent',
    outline: 'bg-transparent hover:bg-gray-100 border-gray-300 border',
    ghost: 'bg-transparent hover:bg-gray-100 border-transparent',
  };

  // Size styles
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // Radius styles
  const radiuses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 outline-none focus:outline-none focus:ring-0';
  
  const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none';
  
  const widthStyle = fullWidth ? 'w-full' : '';

  // Custom color styles
  const customColorStyles = bgColor ? {
    backgroundColor: bgColor,
    color: textColor,
  } : {};

  const handleMouseEnter = (e) => {
    if (hoverColor && bgColor) {
      e.currentTarget.style.backgroundColor = hoverColor;
    }
  };

  const handleMouseLeave = (e) => {
    if (bgColor) {
      e.currentTarget.style.backgroundColor = bgColor;
    }
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${bgColor ? '' : variants[variant]}
        ${sizes[size]}
        ${radiuses[radius]}
        ${widthStyle}
        ${disabledStyles}
        ${className}
      `}
      style={customColorStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;