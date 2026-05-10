/**
 * Shared app shell — matches:
 *   .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
 * Use for header, footer, and full-width sections so columns line up.
 */
export const APP_SHELL_CONTAINER_CLASS =
  'mx-auto w-full max-w-[1200px] px-6';

/**
 * Header row: logo | centered search | Sign In — flex, no absolute layout.
 * Slightly narrower max width than main shell (max-w-6xl) with responsive padding.
 */
export const HEADER_SHELL_ROW_CLASS =
  'mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6';
