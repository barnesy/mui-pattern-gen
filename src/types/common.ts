/**
 * Common type definitions used throughout the application
 */

// Generic object type for when structure is truly unknown
export type UnknownObject = Record<string, unknown>;

// Props type for components that accept any props
export type AnyProps = Record<string, unknown>;

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;
export type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;

// Form types
export interface FormValue {
  [key: string]: string | number | boolean | FormValue | FormValue[];
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

// Sort types
export type SortDirection = 'asc' | 'desc';
export interface SortParams {
  field: string;
  direction: SortDirection;
}

// Filter types
export interface FilterParam {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | boolean;
}

// Component state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Style types
export type StyleValue = string | number | undefined;
export type StyleObject = Record<string, StyleValue | StyleObject>;

// Theme types
export type ThemeMode = 'light' | 'dark';

// Utility types
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
