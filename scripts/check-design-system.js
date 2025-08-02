#!/usr/bin/env node

/**
 * Design System Guard Script
 * Prevents unauthorized style changes that could break design consistency
 */

const fs = require('fs');
const path = require('path');

// Protected files that should only be changed with explicit approval
const PROTECTED_FILES = [
  'tailwind.config.ts',
  'client/src/styles/constants.ts',
  'client/src/index.css',
];

// Common style violations to catch
const STYLE_VIOLATIONS = [
  // Hardcoded colors instead of using design tokens
  {
    pattern: /bg-\w+-\d{3}/g,
    message: 'Use design system colors from @/styles/constants instead of hardcoded Tailwind colors',
    allowlist: ['bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200']
  },
  
  // Direct color hex codes
  {
    pattern: /#[0-9a-fA-F]{3,6}/g,
    message: 'Use design system color tokens instead of hex codes'
  },
  
  // Inconsistent border radius
  {
    pattern: /rounded-\w+/g,
    message: 'Use consistent border radius from design system',
    allowlist: ['rounded-lg', 'rounded-xl', 'rounded-full', 'rounded-md']
  },
  
  // Ad-hoc shadows
  {
    pattern: /shadow-(?!sm|md|lg|xl|card|card-hover)\w+/g,
    message: 'Use design system shadow tokens'
  }
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  
  STYLE_VIOLATIONS.forEach(({ pattern, message, allowlist = [] }) => {
    const matches = content.match(pattern) || [];
    
    matches.forEach(match => {
      if (!allowlist.includes(match)) {
        violations.push({
          file: filePath,
          violation: match,
          message,
          line: content.split('\n').findIndex(line => line.includes(match)) + 1
        });
      }
    });
  });
  
  return violations;
}

function main() {
  const files = process.argv.slice(2);
  let totalViolations = 0;
  
  files.forEach(file => {
    // Skip checking protected files unless explicitly allowed
    if (PROTECTED_FILES.some(protectedFile => file.includes(protectedFile))) {
      console.log(`⚠️  Protected file: ${file}`);
      console.log('   Design system files should only be changed with explicit approval');
      return;
    }
    
    // Only check relevant file types
    if (!/\.(ts|tsx|js|jsx|css|scss)$/.test(file)) {
      return;
    }
    
    if (!fs.existsSync(file)) {
      return;
    }
    
    const violations = checkFile(file);
    
    if (violations.length > 0) {
      console.log(`\n❌ Style violations in ${file}:`);
      violations.forEach(({ violation, message, line }) => {
        console.log(`   Line ${line}: "${violation}" - ${message}`);
        totalViolations++;
      });
    }
  });
  
  if (totalViolations > 0) {
    console.log(`\n🚨 Found ${totalViolations} design system violations`);
    console.log('💡 Import constants from @/styles/constants and use buildButtonClass(), buildCardClass(), etc.');
    console.log('📖 See design system documentation in client/src/styles/constants.ts');
    process.exit(1);
  } else {
    console.log('✅ Design system compliance check passed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, STYLE_VIOLATIONS };