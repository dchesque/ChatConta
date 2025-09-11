import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BlurBackground } from '@/components/ui/BlurBackground';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  showBlurBackground?: boolean;
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
}

export function PageContainer({ 
  children, 
  className,
  showBlurBackground = true,
  maxWidth = '7xl'
}: PageContainerProps) {
  const maxWidthClasses = {
    'full': 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl', 
    '5xl': 'max-w-5xl'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background abstratos */}
      {showBlurBackground && <BlurBackground variant="page" />}
      
      {/* Container principal com padding responsivo e max-width */}
      <div className={cn(
        'relative z-10 mx-auto px-4 py-4',
        'lg:px-8 lg:py-8',
        maxWidthClasses[maxWidth],
        className
      )}>
        {children}
      </div>
    </div>
  );
}