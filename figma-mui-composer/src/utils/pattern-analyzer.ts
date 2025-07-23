import * as fs from 'fs';
import * as path from 'path';

export interface PatternInfo {
  name: string;
  category: string;
  props: PropInfo[];
  hasConfig: boolean;
  muiComponents: string[];
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

// Analyze a pattern file to extract MUI component usage
export function analyzePatternFile(filePath: string): PatternInfo | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.tsx');
    const category = path.basename(path.dirname(filePath));
    
    // Extract MUI imports
    const muiImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"]/g;
    const muiComponents: string[] = [];
    let match;
    
    while ((match = muiImportRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(imp => imp.trim());
      muiComponents.push(...imports);
    }
    
    // Extract props interface
    const propsRegex = new RegExp(`export\\s+interface\\s+${fileName}Props\\s*{([^}]+)}`, 's');
    const propsMatch = content.match(propsRegex);
    const props: PropInfo[] = [];
    
    if (propsMatch) {
      const propsContent = propsMatch[1];
      const propLines = propsContent.split('\n').filter(line => line.includes(':'));
      
      propLines.forEach(line => {
        const [namePart, typePart] = line.split(':');
        if (namePart && typePart) {
          const name = namePart.trim().replace('?', '');
          const required = !namePart.includes('?');
          const type = typePart.trim().replace(';', '');
          
          props.push({ name, type, required });
        }
      });
    }
    
    // Check for config file
    const configPath = filePath.replace('.tsx', '.config.ts');
    const hasConfig = fs.existsSync(configPath);
    
    return {
      name: fileName,
      category,
      props,
      hasConfig,
      muiComponents: [...new Set(muiComponents)] // Remove duplicates
    };
  } catch (error) {
    console.error(`Error analyzing pattern ${filePath}:`, error);
    return null;
  }
}

// Convert pattern to Figma-compatible definition
export function patternToFigmaDefinition(patternInfo: PatternInfo): any {
  // This is a simplified conversion - would need more sophisticated parsing
  // for real implementation
  return {
    name: patternInfo.name,
    type: 'frame',
    layout: 'vertical',
    padding: 16,
    spacing: 8,
    children: patternInfo.muiComponents.map(component => ({
      type: `mui:${component}`,
      props: {}
    }))
  };
}

// Scan all patterns in the project
export function scanAllPatterns(baseDir: string): PatternInfo[] {
  const patterns: PatternInfo[] = [];
  const categories = ['auth', 'cards', 'forms', 'navigation', 'lists', 'dashboards'];
  
  categories.forEach(category => {
    const categoryPath = path.join(baseDir, 'src', 'patterns', category);
    
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath);
      
      files.forEach(file => {
        if (file.endsWith('.tsx') && !file.includes('.test.') && file !== 'index.ts') {
          const filePath = path.join(categoryPath, file);
          const patternInfo = analyzePatternFile(filePath);
          
          if (patternInfo) {
            patterns.push(patternInfo);
          }
        }
      });
    }
  });
  
  return patterns;
}