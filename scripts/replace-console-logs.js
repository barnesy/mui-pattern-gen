#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to match console statements
const consolePatterns = [
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.debug(',
    importNeeded: true,
  },
  {
    pattern: /console\.info\(/g,
    replacement: 'logger.info(',
    importNeeded: true,
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn(',
    importNeeded: true,
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error(',
    importNeeded: true,
  },
  {
    pattern: /console\.debug\(/g,
    replacement: 'logger.debug(',
    importNeeded: true,
  },
];

// Files to skip
const skipFiles = [
  'logger.ts',
  'logger.test.ts',
  'replace-console-logs.js',
  '.test.',
  '.spec.',
  'setup.ts',
];

function shouldSkipFile(filePath) {
  return skipFiles.some((skip) => filePath.includes(skip));
}

function addLoggerImport(content, filePath) {
  // Check if logger is already imported
  if (content.includes("from '../services/logger'") || content.includes("from './services/logger'")) {
    return content;
  }

  // Calculate relative path to logger
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(__dirname, '../src/services/logger.ts');
  const relativePath = path.relative(fileDir, loggerPath).replace(/\\/g, '/').replace('.ts', '');

  // Add import at the top of the file
  const importStatement = `import { logger } from '${relativePath}';\n`;

  // Find the right place to insert the import
  const lines = content.split('\n');
  let importIndex = 0;

  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      importIndex = i + 1;
    } else if (importIndex > 0 && !lines[i].trim()) {
      // Continue if empty line after imports
      continue;
    } else if (importIndex > 0) {
      // Non-import line found after imports
      break;
    }
  }

  lines.splice(importIndex, 0, importStatement);
  return lines.join('\n');
}

function replaceConsoleInFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasChanges = false;
  let needsImport = false;

  // Replace console statements
  consolePatterns.forEach(({ pattern, replacement, importNeeded }) => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      hasChanges = true;
      if (importNeeded) {
        needsImport = true;
      }
    }
  });

  if (hasChanges) {
    if (needsImport) {
      newContent = addLoggerImport(newContent, filePath);
    }
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('🔍 Searching for console statements...\n');

  // Find all TypeScript and JavaScript files
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
  });

  let updatedCount = 0;

  files.forEach((file) => {
    if (replaceConsoleInFile(file)) {
      updatedCount++;
    }
  });

  console.log(`\n✨ Done! Updated ${updatedCount} files.`);
  
  if (updatedCount > 0) {
    console.log('\n📝 Note: Please review the changes and fix any import paths if needed.');
    console.log('   You may need to adjust the context parameter for better logging.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { replaceConsoleInFile };