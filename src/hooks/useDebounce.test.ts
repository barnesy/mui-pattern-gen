import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // Make rapid changes
    rerender({ value: 'change1', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'change2', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'final', delay: 500 });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should only have the final value
    expect(result.current).toBe('final');
  });

  it('should handle different data types', () => {
    // Test with number
    const { result: numberResult } = renderHook(() => useDebounce(42, 300));
    expect(numberResult.current).toBe(42);

    // Test with object
    const testObj = { foo: 'bar' };
    const { result: objectResult } = renderHook(() => useDebounce(testObj, 300));
    expect(objectResult.current).toBe(testObj);

    // Test with array
    const testArr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(testArr, 300));
    expect(arrayResult.current).toBe(testArr);
  });

  it('should update when delay changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 1000 },
    });

    // Change value and delay
    rerender({ value: 'updated', delay: 200 });

    // Fast forward by new delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 0 },
    });

    rerender({ value: 'updated', delay: 0 });

    // Should update almost immediately
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // Trigger a change
    rerender({ value: 'updated', delay: 500 });

    // Unmount before timeout completes
    unmount();

    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});
