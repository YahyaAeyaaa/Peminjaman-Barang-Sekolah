import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  size = 'md',
  radius = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  bgColor,
  borderColor,
  focusColor = '#db6f4b',
  textColor,
  ...props
}) => {
  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
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

  const baseStyles = 'w-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const errorStyles = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:ring-opacity-50';
  
  const disabledStyles = disabled 
    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
    : 'bg-white';

  const widthStyle = fullWidth ? 'w-full' : '';

  const customStyles = {
    ...(bgColor && { backgroundColor: bgColor }),
    ...(textColor && { color: textColor }),
    ...(borderColor && !error && { borderColor: borderColor }),
  };

  const focusStyles = {
    '--focus-color': focusColor,
  };

  return (
    <div className={`${widthStyle} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            ${baseStyles}
            ${sizes[size]}
            ${radiuses[radius]}
            ${errorStyles}
            ${disabledStyles}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
          style={{
            ...customStyles,
            ...focusStyles,
            ...(focusColor && { '--tw-ring-color': focusColor }),
          }}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;