import { BLUR_BACKGROUNDS } from '@/constants/designSystem';

interface BlurBackgroundProps {
  variant: 'page' | 'modal' | 'card';
  className?: string;
}

export function BlurBackground({ variant, className = '' }: BlurBackgroundProps) {
  const backgrounds = BLUR_BACKGROUNDS[variant];
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {backgrounds.map((bgClass, index) => (
        <div
          key={index}
          className={bgClass}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}