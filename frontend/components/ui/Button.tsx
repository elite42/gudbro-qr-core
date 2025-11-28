import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, children, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gudbro-red focus-visible:ring-offset-2';
    
    const variants = {
      primary: 'bg-gudbro-red text-white hover:bg-[#B00828] active:bg-[#9A0722]',
      secondary: 'bg-gudbro-yellow text-gudbro-black hover:bg-[#E09D14] active:bg-[#C88D12]',
      outline: 'border-2 border-gudbro-red text-gudbro-red hover:bg-gudbro-red hover:text-white',
      ghost: 'text-gudbro-red hover:bg-gudbro-gray-light'
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]'
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
