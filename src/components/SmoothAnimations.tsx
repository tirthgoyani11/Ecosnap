import { useSpring, animated, useTrail, useInView } from '@react-spring/web';
import { ReactNode, useRef } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

interface SlideInProps extends FadeInProps {
  direction?: 'up' | 'down' | 'left' | 'right';
}

interface StaggeredProps {
  children: ReactNode[];
  delay?: number;
}

// Smooth fade in animation
export function SmoothFadeIn({ 
  children, 
  delay = 0, 
  duration = 800,
  className = '' 
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: inView ? 1 : 0 },
    delay,
    config: { duration, tension: 200, friction: 25 }
  });

  return (
    <animated.div ref={ref} style={springs} className={className}>
      {children}
    </animated.div>
  );
}

// Smooth slide in animation
export function SmoothSlideIn({ 
  children, 
  delay = 0, 
  duration = 600,
  direction = 'up',
  className = '' 
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(40px)';
      case 'down': return 'translateY(-40px)';
      case 'left': return 'translateX(40px)';
      case 'right': return 'translateX(-40px)';
      default: return 'translateY(40px)';
    }
  };

  const springs = useSpring({
    from: { 
      opacity: 0,
      transform: getTransform()
    },
    to: { 
      opacity: inView ? 1 : 0,
      transform: inView ? 'translate(0px)' : getTransform()
    },
    delay,
    config: { duration, tension: 280, friction: 30 }
  });

  return (
    <animated.div ref={ref} style={springs} className={className}>
      {children}
    </animated.div>
  );
}

// Staggered animation for multiple elements
export function SmoothStagger({ 
  children, 
  delay = 100 
}: StaggeredProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const trail = useTrail(children.length, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { 
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0px)' : 'translateY(20px)'
    },
    config: { tension: 280, friction: 30 }
  });

  return (
    <div ref={ref}>
      {trail.map((style, index) => (
        <animated.div key={index} style={style}>
          {children[index]}
        </animated.div>
      ))}
    </div>
  );
}

// Smooth scale animation
export function SmoothScale({ 
  children, 
  delay = 0, 
  duration = 500,
  className = '' 
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const springs = useSpring({
    from: { 
      opacity: 0,
      transform: 'scale(0.95)'
    },
    to: { 
      opacity: inView ? 1 : 0,
      transform: inView ? 'scale(1)' : 'scale(0.95)'
    },
    delay,
    config: { duration, tension: 260, friction: 20 }
  });

  return (
    <animated.div ref={ref} style={springs} className={className}>
      {children}
    </animated.div>
  );
}

// Floating animation for background elements
export function SmoothFloat({ 
  children, 
  className = '',
  intensity = 1 
}: { 
  children: ReactNode; 
  className?: string; 
  intensity?: number;
}) {
  const springs = useSpring({
    from: { transform: `translateY(0px)` },
    to: async (next) => {
      while (true) {
        await next({ transform: `translateY(-${10 * intensity}px)` });
        await next({ transform: `translateY(${10 * intensity}px)` });
      }
    },
    config: { duration: 3000, tension: 20, friction: 10 }
  });

  return (
    <animated.div style={springs} className={className}>
      {children}
    </animated.div>
  );
}

// Button hover animation
export function SmoothButton({ 
  children, 
  className = '',
  onClick
}: { 
  children: ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  const [springs, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }
  }));

  return (
    <animated.div
      style={springs}
      className={className}
      onClick={onClick}
      onMouseEnter={() => api.start({ scale: 1.05 })}
      onMouseLeave={() => api.start({ scale: 1 })}
      onMouseDown={() => api.start({ scale: 0.98 })}
      onMouseUp={() => api.start({ scale: 1.05 })}
    >
      {children}
    </animated.div>
  );
}
