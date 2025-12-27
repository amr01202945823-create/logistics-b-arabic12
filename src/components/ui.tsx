
import React, { useState, useRef, useEffect } from 'react';
import { StarIcon } from './icons';

// Skeleton Component for loading states
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

// A flexible Button component
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger', size?: 'default' | 'sm' | 'lg' | 'icon' }> = ({ children, className, variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 border border-transparent hover:-translate-y-0.5",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 border border-transparent"
  };
  
  const sizeClasses = {
    default: "px-5 py-2.5 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-8 py-4 text-base",
    icon: "p-2",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Card components
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-6 border-b border-slate-100 dark:border-slate-800 ${className}`}>
        {children}
    </div>
);

export const CardContent: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

// Form elements
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input
    className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-sm placeholder:text-slate-400 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea
    className={`flex min-h-[100px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm placeholder:text-slate-400 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-y ${className}`}
    {...props}
  />
);

// Modal component
export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  title?: string; 
  size?: 'default' | 'lg' | 'xl';
  showHeader?: boolean;
}> = ({ isOpen, onClose, children, title, size = 'default', showHeader = true }) => {
  if (!isOpen) return null;
  const sizeClasses = {
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all animate-scale-in ${sizeClasses[size]}`} onClick={e => e.stopPropagation()}>
        {showHeader && (
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
        )}
        <div className={showHeader ? "p-6 max-h-[80vh] overflow-y-auto custom-scrollbar" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Spinner component
export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin h-5 w-5 text-current ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Dropdown component
export const Dropdown: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className={`w-4 h-4 ml-2 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <ul className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto animate-fade-in custom-scrollbar" role="listbox">
            {options.map(option => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors ${value === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export const StarRating: React.FC<{
  rating: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ rating, onRate, readOnly = false, size = 'md', className = '' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const stars = Array(5).fill(0).map((_, i) => {
    const starValue = i + 1;
    const isFilled = starValue <= (hoverRating || rating);

    const handleClick = () => {
      if (!readOnly && onRate) {
        onRate(starValue);
      }
    };

    const handleMouseEnter = () => {
      if (!readOnly) {
        setHoverRating(starValue);
      }
    };

    return (
      <button
        key={i}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className={`transition-all duration-200 p-0.5 ${!readOnly ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${isFilled ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
        disabled={readOnly}
      >
        <StarIcon filled={isFilled} className={sizeClasses[size]} />
      </button>
    );
  });

  return (
    <div
      className={`flex items-center ${className}`}
      onMouseLeave={() => {
        if (!readOnly) setHoverRating(0);
      }}
    >
      {stars}
    </div>
  );
};
