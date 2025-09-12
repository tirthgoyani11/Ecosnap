import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useInView(options: UseInViewOptions = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        
        if (inView && !hasBeenViewed) {
          setHasBeenViewed(true);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -10% 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, hasBeenViewed]);

  return { 
    ref, 
    isInView: options.triggerOnce ? hasBeenViewed : isInView,
    hasBeenViewed
  };
}

export function useStaggeredAnimation(count: number, delay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const { ref, isInView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (isInView && visibleItems.length === 0) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * delay);
      }
    }
  }, [isInView, count, delay, visibleItems.length]);

  return { ref, visibleItems, isInView };
}

export function useAnimationClass(
  animationClass: string, 
  options: UseInViewOptions = {}
) {
  const { ref, isInView } = useInView(options);
  const className = isInView ? animationClass : 'opacity-0';
  
  return { ref, className, isVisible: isInView };
}

// Predefined animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  scaleIn: 'animate-scale-in',
  fadeInDelay: 'animate-fade-in-delay',
  fadeInDelay2: 'animate-fade-in-delay-2',
  floatSlow: 'animate-float-slow',
  floatFast: 'animate-float-fast',
  spinSlow: 'animate-spin-slow'
};
