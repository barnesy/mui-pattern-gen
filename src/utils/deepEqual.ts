/**
 * Deep equality comparison for objects
 * Optimized for comparing prop values in React components
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {return true;}

  if (a == null || b == null) {return false;}

  if (typeof a !== typeof b) {return false;}

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {return false;}
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {return false;}
    }
    return true;
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);

    if (keysA.length !== keysB.length) {return false;}

    for (const key of keysA) {
      if (!keysB.includes(key)) {return false;}
      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
        {return false;}
    }

    return true;
  }

  // Primitive values
  return a === b;
}

/**
 * Shallow equality comparison for objects
 * Only checks first level of properties
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) {return true;}

  if (a == null || b == null) {return false;}

  if (typeof a !== 'object' || typeof b !== 'object') {return false;}

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) {return false;}

  for (const key of keysA) {
    if (!keysB.includes(key)) {return false;}
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) {return false;}
  }

  return true;
}
