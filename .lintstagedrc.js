module.exports = {
  // TypeScript and TSX files
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // JavaScript and JSX files  
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // JSON files
  '*.json': [
    'prettier --write',
  ],
  
  // CSS and SCSS files
  '*.{css,scss}': [
    'prettier --write',
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write',
  ],
  
  // Enforce design system constants usage
  '**/*.{ts,tsx,js,jsx}': [
    // Custom script to check for unauthorized style changes
    'node scripts/check-design-system.js',
  ],
};