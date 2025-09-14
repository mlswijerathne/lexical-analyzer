import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  // Base classes
  const baseClasses = 'rounded-lg font-medium flex items-center justify-center transition-all duration-200';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }[size];
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Variant classes (including hover and active states)
  const variantClasses = {
    primary: `bg-[#0e639c] text-white hover:bg-[#1177bd] active:bg-[#0d5689] hover:shadow-md 
              disabled:bg-[#0e639c]/50 disabled:hover:bg-[#0e639c]/50 disabled:shadow-none`,
    secondary: `bg-[#2d2d2d] text-[#d4d4d4] hover:bg-[#3a3a3a] active:bg-[#252525] hover:shadow-md 
                border border-[#333] disabled:bg-[#2d2d2d]/60 disabled:hover:bg-[#2d2d2d]/60 disabled:shadow-none`,
    success: `bg-[#388a34] text-white hover:bg-[#46a340] active:bg-[#2d7329] hover:shadow-md 
              disabled:bg-[#388a34]/50 disabled:hover:bg-[#388a34]/50 disabled:shadow-none`,
    danger: `bg-[#F14C4C] text-white hover:bg-[#f36868] active:bg-[#d43c3c] hover:shadow-md 
            disabled:bg-[#F14C4C]/50 disabled:hover:bg-[#F14C4C]/50 disabled:shadow-none`,
  }[variant];
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  
  // Icon spacing
  const iconLeftSpacing = iconLeft ? 'gap-2' : '';
  const iconRightSpacing = iconRight ? 'gap-2' : '';
  const iconSpacing = (iconLeft || iconRight) ? (iconLeft && iconRight ? 'gap-2' : (iconLeftSpacing || iconRightSpacing)) : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${widthClasses} ${variantClasses} ${disabledClasses} ${iconSpacing} ${className}`}
      disabled={disabled}
      {...props}
    >
      {iconLeft && iconLeft}
      {children}
      {iconRight && iconRight}
    </button>
  );
}
