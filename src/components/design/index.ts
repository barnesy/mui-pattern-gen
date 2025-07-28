/**
 * Schema-first design system components
 */

// Core components
export { SchemaComponent, SchemaComponentTree, useComponentInstance } from './SchemaComponent';
export type { SchemaComponentProps } from './SchemaComponent';

export { DesignModeWrapper } from './DesignModeWrapper';
export type { DesignModeWrapperProps } from './DesignModeWrapper';

export { DesignPanel } from './DesignPanel';
export type { DesignPanelProps } from './DesignPanel';

export { SchemaPropsForm, SchemaPropsInline } from './SchemaPropsForm';
export type { SchemaPropsFormProps } from './SchemaPropsForm';

export { DataSourceConfig } from './DataSourceConfig';
export type { DataSourceConfigProps } from './DataSourceConfig';

export { ComponentInfo } from './ComponentInfo';
export type { ComponentInfoProps } from './ComponentInfo';

// Re-export store for convenience
export { useDesignStore } from '../../stores/designStore';
export type { ComponentInstance } from '../../stores/designStore';
