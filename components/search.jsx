import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchComponent({
  value = '',
  onChange,
  placeholder = 'Cari sesuatu...',
  className = '',
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const [internalQuery, setInternalQuery] = useState('');

  // Use controlled or uncontrolled state
  const query = onChange ? value : internalQuery;

  // Size configurations
  const sizeConfig = {
    small: {
      containerPadding: 'px-3 py-2',
      iconSize: 'w-4 h-4',
      textSize: 'text-sm',
      inputPadding: 'px-2',
      clearButtonPadding: 'p-1',
      clearIconSize: 'w-3.5 h-3.5'
    },
    medium: {
      containerPadding: 'px-4 sm:px-6 py-3 sm:py-4',
      iconSize: 'w-5 h-5 sm:w-6 sm:h-6',
      textSize: 'text-sm sm:text-base',
      inputPadding: 'px-3 sm:px-4',
      clearButtonPadding: 'p-1.5 sm:p-2',
      clearIconSize: 'w-4 h-4 sm:w-5 sm:h-5'
    },
    large: {
      containerPadding: 'px-5 sm:px-7 py-4 sm:py-5',
      iconSize: 'w-6 h-6 sm:w-7 sm:h-7',
      textSize: 'text-base sm:text-lg',
      inputPadding: 'px-4 sm:px-5',
      clearButtonPadding: 'p-2 sm:p-2.5',
      clearIconSize: 'w-5 h-5 sm:w-6 sm:h-6'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  const handleClear = () => {
    if (onChange) {
      onChange('');
    } else {
      setInternalQuery('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Render component
  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative bg-white rounded-2xl border-2 border-slate-200 transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-xl">
        <div className={`flex items-center ${currentSize.containerPadding}`}>
          <Search className={`${currentSize.iconSize} text-slate-400 flex-shrink-0`} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const newValue = e.target.value;
              if (onChange) {
                onChange(newValue);
              } else {
                setInternalQuery(newValue);
              }
            }}
            placeholder={placeholder}
            className={`flex-1 ${currentSize.inputPadding} ${currentSize.textSize} text-slate-800 placeholder-slate-400 outline-none bg-transparent`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`${currentSize.clearButtonPadding} hover:bg-slate-100 rounded-full transition-colors flex-shrink-0`}
            >
              <X className={`${currentSize.clearIconSize} text-slate-400`} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}