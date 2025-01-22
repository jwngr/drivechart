import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {ZodSchema} from 'zod';

/**
 * Parses a value using a Zod schema and returns a `SuccessResult` with the parsed value if
 * successful, or an `ErrorResult` if the value is invalid.
 */
export function parseZodResult<T>(zodSchema: ZodSchema<T>, value: unknown): Result<T> {
  const zodResult = zodSchema.safeParse(value);

  if (!zodResult.success) {
    const keysWithErrors = Object.keys(zodResult.error.format()).filter((key) => key !== '_errors');
    const errorMessage = keysWithErrors
      .map((key, i) => {
        const errors = zodResult.error.issues[i].message;
        return `${key} (${errors})`;
      })
      .join(', ');
    return makeErrorResult(
      new Error(`Error parsing value with Zod: ${errorMessage}`, {cause: zodResult.error})
    );
  }

  return makeSuccessResult(zodResult.data);
}
