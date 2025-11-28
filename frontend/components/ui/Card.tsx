import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => {
    const baseStyles = 'bg-white rounded-md border border-gudbro-gray-light overflow-hidden';
    
    const variants = {
      default: 'shadow-sm',
      elevated: 'shadow-md',
      interactive: 'shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer'
    };
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`px-6 py-4 border-b border-gudbro-gray-light ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`px-6 py-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`px-6 py-4 border-t border-gudbro-gray-light bg-gudbro-gray-light/30 ${className}`} {...props}>
    {children}
  </div>
);
