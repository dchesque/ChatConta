import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';

interface ButtonLoadingProps extends ButtonProps {
  loading: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const ButtonLoading = forwardRef<HTMLButtonElement, ButtonLoadingProps>(({
  loading,
  loadingText,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  className,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <Button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        "relative transition-all duration-200",
        loading && "cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </Button>
  );
});

ButtonLoading.displayName = 'ButtonLoading';