import { ChevronDown } from 'lucide-react';

export default function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  className = '',
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false
}) {
  // Size configurations
  const sizeConfig = {
    small: {
      padding: 'px-3 py-2',
      textSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    medium: {
      padding: 'px-4 py-2.5',
      textSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    large: {
      padding: 'px-5 py-3',
      textSize: 'text-base',
      iconSize: 'w-5 h-5'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full ${currentSize.padding} ${currentSize.textSize}
            border border-gray-200 rounded-xl
            focus:ring-2 focus:ring-[#161b33] focus:border-transparent
            transition-all bg-white
            appearance-none cursor-pointer
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
            hover:border-gray-300
          `}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => {
            // Support both object {value, label} and string
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown 
          className={`
            absolute right-3 top-1/2 -translate-y-1/2
            ${currentSize.iconSize} text-gray-400 pointer-events-none
          `}
        />
      </div>
    </div>
  );
}


