import { logger } from '../services/logger';
import { ApiResponse } from '../types/common';

export interface AsyncHandlerOptions {
  context?: string;
  showErrorToUser?: boolean;
  fallbackValue?: unknown;
  retries?: number;
  retryDelay?: number;
}

/**
 * Wraps an async function with error handling and logging
 */
export async function asyncHandler<T>(
  fn: () => Promise<T>,
  options: AsyncHandlerOptions = {}
): Promise<ApiResponse<T>> {
  const {
    context = 'AsyncOperation',
    showErrorToUser = true,
    fallbackValue,
    retries = 0,
    retryDelay = 1000,
  } = options;

  let lastError: Error | null = null;
  let attempts = 0;

  while (attempts <= retries) {
    try {
      const data = await fn();
      return {
        data,
        success: true,
      };
    } catch (error) {
      attempts++;
      lastError = error instanceof Error ? error : new Error(String(error));

      logger.error(`Async operation failed (attempt ${attempts}/${retries + 1})`, context, {
        error: lastError.message,
        stack: lastError.stack,
      });

      if (attempts <= retries) {
        logger.info(`Retrying in ${retryDelay}ms...`, context);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All attempts failed
  const errorMessage = lastError?.message || 'Unknown error occurred';

  return {
    error: errorMessage,
    success: false,
    message: showErrorToUser ? errorMessage : 'An error occurred. Please try again.',
    data: fallbackValue as T | undefined,
  };
}

/**
 * Wraps an async function that returns void with error handling
 */
export async function asyncVoidHandler(
  fn: () => Promise<void>,
  options: AsyncHandlerOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const result = await asyncHandler(fn, options);
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Creates a debounced async handler
 */
export function createDebouncedAsyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delay: number = 300
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastPromise: Promise<unknown> | null = null;

  return ((...args: unknown[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const promise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });

    lastPromise = promise;
    return promise;
  }) as T;
}

/**
 * Wraps a React event handler with error handling
 */
export function createSafeEventHandler<T extends (...args: unknown[]) => void | Promise<void>>(
  handler: T,
  context?: string
): T {
  return ((...args: unknown[]) => {
    try {
      const result = handler(...args);
      if (result instanceof Promise) {
        result.catch((error) => {
          logger.error('Event handler error:', context || 'EventHandler', error);
        });
      }
    } catch (error) {
      logger.error('Event handler error:', context || 'EventHandler', error);
    }
  }) as T;
}
