import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'vegan' | 'allergen' | 'info' | 'alert' | 'default';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', children, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full whitespace-nowrap';
    
    const variants = {
      vegan: 'bg-vegan text-white',
      allergen: 'bg-allergen text-white',
      info: 'bg-info text-white',
      alert: 'bg-alert text-white',
      default: 'bg-gudbro-gray-light text-gudbro-black'
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base'
    };
    
    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
