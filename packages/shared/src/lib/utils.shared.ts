import type {Func, UUID} from '@shared/types/utils.types';
import {v4 as uuidv4} from 'uuid';

/**
 * Throws an error if the provided value is not of type `never`. This is useful for exhaustive
 * switch statements.
 */
export function assertNever(x: never): never {
  // TODO: Add logging. Or a global error handler.
  // eslint-disable-next-line no-restricted-syntax
  throw new Error(`Unexpected object: ${x}`);
}

/**
 * Filters out all null values from the provided array.
 */
export function filterNull<T>(arr: Array<T | null>): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * Filters out all undefined values from the provided array.
 */
export function filterUndefined<T>(arr: Array<T | undefined>): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * Partitions an array into two arrays based on the provided predicate.
 */
export function partition<T, U>(arr: Array<T | U>, predicate: Func<T | U, boolean>): [T[], U[]] {
  return arr.reduce(
    (acc, item) => {
      if (predicate(item)) {
        acc[0].push(item as T);
      } else {
        acc[1].push(item as U);
      }
      return acc;
    },
    [[], []] as [T[], U[]]
  );
}

/**
 * Generates a random v4 UUID.
 */
export function makeUuid<T = UUID>(): T {
  return uuidv4() as T;
}
