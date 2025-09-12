import { ReactNode } from 'react';
import { useAnimationClass, useStaggeredAnimation, animations } from '@/hooks/useAnimations';

interface AnimatedElementProps {
  children: ReactNode;
  animation?: keyof typeof animations;
  className?: string;
  delay?: number;
}

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  delay?: number;
}

// Main animated wrapper component
export function AnimatedElement({ 
  children, 
  animation = 'fadeInUp',
  className = '',
  delay = 0
}: AnimatedElementProps) {
  const animationClass = animations[animation];
  const { ref, className: animatedClass } = useAnimationClass(animationClass);

  const style = delay > 0 ? { 
    animationDelay: `${delay}ms`,
    opacity: 0 
  } : undefined;

  return (
    <div 
      ref={ref} 
      className={`${animatedClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Staggered grid component for multiple elements
export function StaggeredGrid({ 
  children, 
  className = '',
  delay = 100 
}: StaggeredGridProps) {
  const { ref, visibleItems } = useStaggeredAnimation(children.length, delay);

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`transition-all duration-500 ${
            visibleItems.includes(index) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Hero section with smooth entrance
export function AnimatedHero({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <AnimatedElement animation="fadeIn" className={className}>
      {children}
    </AnimatedElement>
  );
}

// Feature cards with stagger effect
export function AnimatedFeatures({ children, className = '' }: { children: ReactNode[]; className?: string }) {
  return (
    <StaggeredGrid className={className} delay={150}>
      {children}
    </StaggeredGrid>
  );
}

// Button with smooth hover effect
export function AnimatedButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'default'
}: { 
  children: ReactNode; 
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'glass' | 'premium';
}) {
  const baseClasses = 'smooth-hover cursor-pointer transform transition-all duration-200 ease-out';
  const variantClasses = {
    default: 'hover:scale-105 hover:shadow-lg',
    glass: 'hover:scale-102 hover:bg-white/20',
    premium: 'hover:scale-105 hover:shadow-xl hover:shadow-primary/25'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Floating elements for background
export function FloatingElement({ 
  children, 
  className = '',
  speed = 'slow' 
}: { 
  children: ReactNode; 
  className?: string;
  speed?: 'slow' | 'fast';
}) {
  const animationClass = speed === 'slow' ? animations.floatSlow : animations.floatFast;
  
  return (
    <div className={`${animationClass} ${className}`}>
      {children}
    </div>
  );
}
