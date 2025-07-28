import { describe, it, expect } from 'vitest';
import { deepEqual, shallowEqual } from './deepEqual';

describe('deepEqual', () => {
  it('should return true for identical primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('test', 'test')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('test', 'test2')).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('should return false for different types', () => {
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual(true, 1)).toBe(false);
    // Arrays and objects both have typeof 'object', so need to check differently
    expect(deepEqual([], null)).toBe(false);
    expect(deepEqual('string', {})).toBe(false);
  });

  it('should handle arrays correctly', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEqual([], [])).toBe(true);
  });

  it('should handle nested arrays', () => {
    expect(
      deepEqual(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 2],
          [3, 4],
        ]
      )
    ).toBe(true);
    expect(
      deepEqual(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 2],
          [3, 5],
        ]
      )
    ).toBe(false);
  });

  it('should handle objects correctly', () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({}, {})).toBe(true);
  });

  it('should handle nested objects', () => {
    expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
    expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
  });

  it('should handle mixed nested structures', () => {
    const obj1 = {
      a: [1, 2, { b: 3 }],
      c: { d: [4, 5], e: 'test' },
    };
    const obj2 = {
      a: [1, 2, { b: 3 }],
      c: { d: [4, 5], e: 'test' },
    };
    const obj3 = {
      a: [1, 2, { b: 4 }],
      c: { d: [4, 5], e: 'test' },
    };
    expect(deepEqual(obj1, obj2)).toBe(true);
    expect(deepEqual(obj1, obj3)).toBe(false);
  });

  it('should handle reference equality for same object', () => {
    const obj = { a: 1, b: { c: 2 } };
    expect(deepEqual(obj, obj)).toBe(true);

    const arr = [1, 2, 3];
    expect(deepEqual(arr, arr)).toBe(true);
  });
});

describe('shallowEqual', () => {
  it('should return true for identical references', () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it('should return true for objects with same first-level properties', () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(shallowEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('should return false for objects with different first-level properties', () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('should return false for null or undefined comparisons', () => {
    expect(shallowEqual(null, { a: 1 })).toBe(false);
    expect(shallowEqual({ a: 1 }, null)).toBe(false);
    expect(shallowEqual(undefined, { a: 1 })).toBe(false);
    expect(shallowEqual({ a: 1 }, undefined)).toBe(false);
    expect(shallowEqual(null, undefined)).toBe(false);
  });

  it('should return true for identical primitives due to reference equality', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual('test', 'test')).toBe(true);
    expect(shallowEqual(true, true)).toBe(true);
  });

  it('should return false for different non-object values', () => {
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual('test', 'test2')).toBe(false);
    expect(shallowEqual(true, false)).toBe(false);
  });

  it('should not compare nested objects deeply', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { b: 1 } };
    // Even though nested objects have same values, they are different references
    expect(shallowEqual(obj1, obj2)).toBe(false);

    // But if nested object is same reference, it should be true
    const nested = { b: 1 };
    expect(shallowEqual({ a: nested }, { a: nested })).toBe(true);
  });

  it('should handle empty objects', () => {
    expect(shallowEqual({}, {})).toBe(true);
  });

  it('should handle arrays as objects', () => {
    // Arrays with same values but different references should be false
    // because shallowEqual compares by reference for array elements
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];
    expect(shallowEqual(arr1, arr2)).toBe(true); // Arrays are objects, so it compares indices

    // Different arrays should not be equal
    expect(shallowEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false);

    // Same reference should be true
    const arr = [1, 2, 3];
    expect(shallowEqual(arr, arr)).toBe(true);
  });
});
