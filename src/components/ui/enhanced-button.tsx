import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  brandColor?: string;
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, brandColor = '#3b82f6', children, ...props }, ref) => {
    const colorValue = brandColor.startsWith('#') ? brandColor : `#${brandColor}`;
    
    return (
      <Button
        ref={ref}
        className={cn(
          'transition-all duration-200 font-medium',
          'hover:shadow-lg hover:scale-105 active:scale-95',
          'focus:ring-2 focus:ring-offset-2',
          className
        )}
        style={{
          backgroundColor: colorValue,
          borderColor: colorValue,
          color: 'white',
          '--tw-ring-color': colorValue + '40'
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = adjustBrightness(colorValue, -20);
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = colorValue;
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}