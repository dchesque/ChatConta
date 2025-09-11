import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalPremiumProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  className?: string;
  showCloseButton?: boolean;
}

export function ModalPremium({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = '2xl',
  children,
  footer,
  loading = false,
  className,
  showCloseButton = true
}: ModalPremiumProps) {
  // Controlar scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    'full': 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 lg:p-4">
      <div 
        className={cn(
          // Base styles
          "bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl",
          "w-full max-h-[90vh] flex flex-col",
          
          // Responsividade
          "lg:rounded-2xl lg:max-h-[90vh]",
          "max-lg:h-full max-lg:max-h-full max-lg:rounded-none max-lg:p-0",
          
          // Tamanho
          sizeClasses[size],
          
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - SEMPRE flex-shrink-0 */}
        <div className={cn(
          "flex items-center justify-between p-6 border-b border-gray-200/50 flex-shrink-0",
          "lg:p-6",
          "max-lg:sticky max-lg:top-0 max-lg:bg-white/95 max-lg:backdrop-blur-xl max-lg:z-10"
        )}>
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                {React.cloneElement(icon as React.ReactElement, {
                  className: "w-5 h-5 text-white"
                })}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-800 truncate">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          {showCloseButton && (
            <button 
              onClick={onClose}
              disabled={loading}
              className={cn(
                "p-2 hover:bg-gray-100/80 rounded-lg transition-colors flex-shrink-0",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content - SEMPRE flex-1 overflow-y-auto */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn(
            "p-6",
            "lg:p-6",
            "max-lg:pb-6"
          )}>
            {children}
          </div>
        </div>

        {/* Footer - SEMPRE flex-shrink-0 quando existe */}
        {footer && (
          <div className={cn(
            "p-6 border-t border-gray-200/50 bg-gray-50/50 flex-shrink-0",
            "lg:p-6 lg:rounded-b-2xl",
            "max-lg:sticky max-lg:bottom-0 max-lg:bg-white/95 max-lg:backdrop-blur-xl max-lg:z-10"
          )}>
            {footer}
          </div>
        )}
        
      </div>
    </div>
  );
}