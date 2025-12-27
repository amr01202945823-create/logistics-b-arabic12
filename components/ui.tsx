import React, { useState, useRef, useEffect } from 'react';
import { StarIcon } from './icons';

// Skeleton Component for loading states
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-border/50 rounded ${className}`} />
);

// A flexible Button component
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'outline', size?: 'default' | 'sm' | 'lg' }> = ({ children, className, variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg border border-transparent",
    secondary: "bg-btn-secondary-bg text-btn-secondary-text hover:bg-btn-secondary-hover border border-border hover:border-primary/20",
    ghost: "hover:bg-primary-light/10 text-text-base hover:text-primary bg-transparent",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary-light/10",
  };
  const sizeClasses = {
    default: "px-5 py-2.5 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Card components
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`bg-surface card-shadow rounded-xl overflow-hidden border border-border transition-all duration-300 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-5 border-b border-border/50 ${className}`}>
        {children}
    </div>
);

export const CardContent: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-5 ${className}`}>
        {children}
    </div>
);

// Form elements
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input
    className={`flex h-11 w-full rounded-lg border border-border bg-background py-2 px-4 text-sm placeholder-text-muted text-text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-lg border border-border bg-background py-2 px-4 text-sm placeholder-text-muted text-text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// A Modal component with solid background (no glass effect)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative bg-surface rounded-xl shadow-2xl w-full mx-4 border border-border overflow-hidden animate-slide-up ${sizeClasses[size]}`} onClick={e => e.stopPropagation()}>
        {showHeader && (
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
              <h3 className="text-lg font-bold text-text-heading">{title}</h3>
              <button onClick={onClose} className="text-text-muted hover:text-text-heading transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

// A Spinner for loading states
export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin h-5 w-5 text-current ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Custom Dropdown component
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
        className="flex items-center justify-between h-11 w-full rounded-lg border border-border bg-surface py-2 px-4 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className={`w-4 h-4 ml-2 text-text-muted transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full bg-surface shadow-2xl rounded-lg border border-border max-h-60 overflow-y-auto animate-fade-in ring-1 ring-black/5" role="listbox">
            {options.map(option => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                className={`px-4 py-2.5 text-sm hover:bg-primary-light/20 cursor-pointer transition-colors ${value === option.value ? 'font-semibold text-primary bg-primary-light/20' : 'text-text-base'}`}
                onClick={() => {
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
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
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
        className={`transition-transform duration-200 ${!readOnly ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${isFilled ? 'text-accent' : 'text-gray-300'}`}
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