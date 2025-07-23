#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read theme data from stdin or command line argument
let themeData = '';

if (process.argv[2]) {
  // If data is passed as argument
  themeData = process.argv[2];
} else {
  // Read from stdin
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    themeData += chunk;
  });
  process.stdin.on('end', () => {
    processThemeData(themeData);
  });
}

if (process.argv[2]) {
  processThemeData(themeData);
}

function processThemeData(data) {
  try {
    const themeFiles = JSON.parse(data);
    
    // Write each file
    const files = [
      { path: 'src/theme/palette.ts', content: themeFiles.palette },
      { path: 'src/theme/darkPalette.ts', content: themeFiles.darkPalette },
      { path: 'src/theme/typography.ts', content: themeFiles.typography },
      { path: 'src/theme/theme.ts', content: themeFiles.theme }
    ];
    
    files.forEach(file => {
      const filePath = path.join(process.cwd(), file.path);
      fs.writeFileSync(filePath, file.content, 'utf8');
      console.log(`✓ Updated ${file.path}`);
    });
    
    console.log('\n✅ Theme files updated successfully!');
    console.log('The page will reload to apply the new theme.');
    
  } catch (error) {
    console.error('❌ Error updating theme files:', error.message);
    process.exit(1);
  }
}