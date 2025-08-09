/**
 * Design System Constants
 * Central source for consistent styling across the platform
 * Use these constants instead of ad-hoc Tailwind classes
 */

// Color Palette Constants
export const COLORS = {
  // Primary Brand Colors
  primary: {
    50: 'text-primary-50 bg-primary-50 border-primary-50',
    100: 'text-primary-100 bg-primary-100 border-primary-100',
    200: 'text-primary-200 bg-primary-200 border-primary-200',
    300: 'text-primary-300 bg-primary-300 border-primary-300',
    400: 'text-primary-400 bg-primary-400 border-primary-400',
    500: 'text-primary-500 bg-primary-500 border-primary-500',
    600: 'text-primary-600 bg-primary-600 border-primary-600',
    700: 'text-primary-700 bg-primary-700 border-primary-700',
    800: 'text-primary-800 bg-primary-800 border-primary-800',
    900: 'text-primary-900 bg-primary-900 border-primary-900',
  },
  
  // Secondary Colors
  secondary: {
    50: 'text-secondary-50 bg-secondary-50 border-secondary-50',
    600: 'text-secondary-600 bg-secondary-600 border-secondary-600',
    700: 'text-secondary-700 bg-secondary-700 border-secondary-700',
  },
  
  // Semantic Colors
  success: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-orange-600 bg-orange-50 border-orange-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
} as const;

// Component Base Classes
export const COMPONENTS = {
  // Cards
  CARD_BASE: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
  CARD_COMPACT: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  CARD_ELEVATED: 'bg-white rounded-xl border border-gray-200 shadow-lg',
  
  // Buttons
  BTN_PRIMARY: 'bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200',
  BTN_SECONDARY: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors duration-200',
  BTN_OUTLINE: 'border border-gray-300 hover:bg-white text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors duration-200',
  BTN_GHOST: 'hover:bg-white text-gray-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200',
  BTN_DANGER: 'bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200',
  
  // Form Elements
  INPUT_BASE: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200',
  SELECT_BASE: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white',
  TEXTAREA_BASE: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none',
  
  // Layout
  CONTAINER_BASE: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
  SECTION_SPACING: 'py-8 md:py-12',
  
  // Typography
  HEADING_PRIMARY: 'text-3xl font-bold text-gray-900',
  HEADING_SECONDARY: 'text-2xl font-semibold text-gray-900',
  HEADING_TERTIARY: 'text-xl font-semibold text-gray-900',
  TEXT_BODY: 'text-gray-600',
  TEXT_MUTED: 'text-gray-500',
  TEXT_ACCENT: 'text-primary-600',
  
  // Grid Layouts
  GRID_RESPONSIVE: 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  GRID_LISTINGS: 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  
  // Loading States
  SKELETON_BASE: 'animate-pulse bg-gray-200 rounded',
  LOADING_SPINNER: 'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
  
  // Interactive States
  HOVER_SCALE: 'hover:scale-105 transition-transform duration-200',
  HOVER_LIFT: 'hover:-translate-y-1 transition-transform duration-200',
  FOCUS_RING: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
} as const;

// Spacing Constants
export const SPACING = {
  XS: 'gap-2',
  SM: 'gap-4',
  MD: 'gap-6',
  LG: 'gap-8',
  XL: 'gap-12',
} as const;

// Breakpoint Constants
export const BREAKPOINTS = {
  SM: 'sm:',
  MD: 'md:',
  LG: 'lg:',
  XL: 'xl:',
  '2XL': '2xl:',
} as const;

// Animation Constants
export const ANIMATIONS = {
  SLIDE_UP: 'transform transition-all duration-300 ease-out',
  FADE_IN: 'opacity-0 animate-fade-in',
  BOUNCE_IN: 'animate-bounce-in',
  SCALE_IN: 'transform scale-95 transition-transform duration-200',
} as const;

// Z-Index Scale
export const Z_INDEX = {
  DROPDOWN: 'z-10',
  MODAL: 'z-40',
  TOAST: 'z-50',
  TOOLTIP: 'z-60',
} as const;

// Utility Functions
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Component Variant Builders
export const buildButtonClass = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary'): string => {
  const variants = {
    primary: COMPONENTS.BTN_PRIMARY,
    secondary: COMPONENTS.BTN_SECONDARY,
    outline: COMPONENTS.BTN_OUTLINE,
    ghost: COMPONENTS.BTN_GHOST,
    danger: COMPONENTS.BTN_DANGER,
  };
  return variants[variant];
};

export const buildCardClass = (variant: 'base' | 'compact' | 'elevated' = 'base'): string => {
  const variants = {
    base: COMPONENTS.CARD_BASE,
    compact: COMPONENTS.CARD_COMPACT,
    elevated: COMPONENTS.CARD_ELEVATED,
  };
  return variants[variant];
};