import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===============================
// THEME-AWARE STYLING UTILITIES
// ===============================

export const themeClasses = {
  // Text contrast classes
  text: {
    high: 'text-high-contrast',
    medium: 'text-medium-contrast', 
    low: 'text-low-contrast',
    primary: 'text-primary',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    muted: 'text-muted-foreground',
  },

  // Background classes
  bg: {
    primary: 'bg-background',
    secondary: 'bg-secondary',
    muted: 'bg-muted',
    card: 'bg-card',
    popover: 'bg-popover',
    accent: 'bg-accent',
    destructive: 'bg-destructive',
    adaptive: 'bg-adaptive',
    adaptiveSubtle: 'bg-adaptive-subtle',
  },

  // Border classes
  border: {
    default: 'border-border',
    input: 'border-input',
    ring: 'ring-ring',
    adaptive: 'border-adaptive',
  },

  // Interactive states
  interactive: {
    hover: 'hover:bg-accent hover:text-accent-foreground',
    focus: 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    active: 'active:scale-95',
    disabled: 'disabled:pointer-events-none disabled:opacity-50',
  },

  // Mobile-optimized classes
  mobile: {
    touchTarget: 'min-h-[44px] min-w-[44px]',
    safeArea: 'pb-safe-bottom pt-safe-top pl-safe-left pr-safe-right',
    container: 'px-4 sm:px-6 lg:px-8',
    spacing: 'space-y-4 sm:space-y-6',
  },
};

// ===============================
// RESPONSIVE UTILITIES
// ===============================

export const responsiveUtils = {
  // Mobile-first grid
  grid: {
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    fill: 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]',
    fit: 'grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
  },

  // Responsive spacing
  spacing: {
    section: 'py-8 sm:py-12 lg:py-16',
    container: 'px-4 sm:px-6 lg:px-8',
    gap: 'gap-4 sm:gap-6 lg:gap-8',
  },

  // Typography scales
  text: {
    display: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold',
    title: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    heading: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    subheading: 'text-lg sm:text-xl font-medium',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm',
  },
};

// ===============================
// LAYOUT UTILITIES
// ===============================

export const layoutUtils = {
  // Common layouts
  centerContent: 'flex items-center justify-center',
  spaceBetween: 'flex items-center justify-between',
  column: 'flex flex-col',
  row: 'flex flex-row',

  // Container variations
  pageContainer: cn(
    'min-h-screen',
    responsiveUtils.spacing.container,
    'pb-16 sm:pb-0' // Account for mobile bottom nav
  ),

  sectionContainer: cn(
    'max-w-7xl mx-auto',
    responsiveUtils.spacing.container,
    responsiveUtils.spacing.section
  ),

  cardContainer: cn(
    'p-4 sm:p-6',
    responsiveUtils.spacing.gap
  ),
};
