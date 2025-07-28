/**
 * Supported sub-component types that can be individually selected and edited
 */
export type SubComponentType =
  | 'LabelValuePair'
  | 'Button'
  | 'Chip'
  | 'Typography'
  | 'Icon'
  | 'Avatar'
  | 'Badge'
  | 'Card'
  | 'ListItem'
  | 'MenuItem'
  | 'Tab'
  | 'AccordionSummary'
  | 'TableCell'
  | 'GridItem';

/**
 * Type guard to check if a string is a valid SubComponentType
 */
export function isValidSubComponentType(type: string): type is SubComponentType {
  const validTypes: SubComponentType[] = [
    'LabelValuePair',
    'Button',
    'Chip',
    'Typography',
    'Icon',
    'Avatar',
    'Badge',
    'Card',
    'ListItem',
    'MenuItem',
    'Tab',
    'AccordionSummary',
    'TableCell',
    'GridItem',
  ];

  return validTypes.includes(type as SubComponentType);
}

/**
 * Sub-component types that have configuration files
 */
export const SUB_COMPONENT_TYPES_WITH_CONFIG: SubComponentType[] = [
  'LabelValuePair',
  'Button',
  'Chip',
];
