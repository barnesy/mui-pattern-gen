/**
 * Maps pattern variants to appropriate demo data types
 * This ensures each variant showcases its intended use case
 */

import { PatternVariant } from '../types/PatternVariant';

export interface VariantDemoMapping {
  pattern: string;
  variantData: Record<string, string>;
}

/**
 * Default demo data mappings for common patterns
 */
export const defaultVariantDemoMappings: VariantDemoMapping[] = [
  {
    pattern: 'DataDisplayCard',
    variantData: {
      stats: 'revenue',      // Stats variant shows revenue data
      list: 'users',         // List variant shows user data
      table: 'sales',        // Table variant shows sales data
      workflow: 'workflow',  // Workflow variant shows workflow data
      mixed: 'revenue'       // Mixed variant shows revenue data
    }
  },
  {
    pattern: 'LabelValuePair',
    variantData: {
      default: 'metric',
      compact: 'simple',
      minimal: 'text',
      detailed: 'full'
    }
  },
  {
    pattern: 'PageHeader',
    variantData: {
      default: 'standard',
      compact: 'simple',
      minimal: 'basic',
      detailed: 'full'
    }
  }
];

/**
 * Get demo data type for a specific pattern and variant
 */
export function getDemoDataForVariant(
  patternName: string,
  variant: string
): string | undefined {
  const mapping = defaultVariantDemoMappings.find(
    m => m.pattern === patternName
  );
  
  if (!mapping) return undefined;
  
  return mapping.variantData[variant];
}

/**
 * Check if a pattern has variant demo mappings
 */
export function hasVariantDemoMapping(patternName: string): boolean {
  return defaultVariantDemoMappings.some(m => m.pattern === patternName);
}

/**
 * Get all demo data types for a pattern
 */
export function getAllDemoDataTypes(patternName: string): string[] {
  const mapping = defaultVariantDemoMappings.find(
    m => m.pattern === patternName
  );
  
  if (!mapping) return [];
  
  return [...new Set(Object.values(mapping.variantData))];
}