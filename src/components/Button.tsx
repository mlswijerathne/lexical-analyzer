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
    primary: `btn-primary disabled:opacity-50 disabled:cursor-not-allowed`,
    secondary: `btn-secondary disabled:opacity-50 disabled:cursor-not-allowed`,
    success: `bg-[var(--accent-success)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--accent-success)_80%,white)] 
              disabled:opacity-50 disabled:cursor-not-allowed`,
    danger: `bg-[var(--accent-error)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--accent-error)_80%,white)] 
            disabled:opacity-50 disabled:cursor-not-allowed`,
  }[variant];
  
  // Disabled classes
  const disabledClasses = disabled ? '' : 'cursor-pointer';
  
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
