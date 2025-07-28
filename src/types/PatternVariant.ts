/**
 * Common pattern variant type (patterns can define their own variants)
 */
export type PatternVariant = string;

/**
 * Spacing configuration for pattern appearance
 */
export interface SpacingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Pattern appearance configuration
 */
export interface PatternAppearance {
  padding?: SpacingConfig;
  margin?: SpacingConfig;
}

/**
 * Variant configuration for a pattern
 */
export interface VariantConfig<V extends string = PatternVariant> {
  variants: V[];
  defaultVariant: V;
  variantDemoData?: Record<V, string>;
}

/**
 * Base props that all variant-aware patterns should include
 */
export interface VariantAwareProps {
  variant?: PatternVariant  ;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
}

/**
 * Helper to get spacing CSS values
 */
export const getSpacingValue = (spacing?: SpacingConfig): string | undefined => {
  if (!spacing) {return undefined;}
  return `${spacing.top}px ${spacing.right}px ${spacing.bottom}px ${spacing.left}px`;
};

/**
 * Example spacing values for common variant names
 * Patterns can define their own variant-specific spacing
 */
export const exampleVariantSpacing: Record<string, { padding: SpacingConfig }> = {
  default: {
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
  },
  compact: {
    padding: { top: 8, right: 8, bottom: 8, left: 8 },
  },
  minimal: {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  detailed: {
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
  },
};
