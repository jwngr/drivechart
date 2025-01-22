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
    const formattedError = zodResult.error.format();
    const errorMessage = Object.entries(formattedError)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        if (value && '_errors' in value) {
          const errors = value._errors.join(', ');
          return `${key} (${errors})`;
        }
        return `${key} (${value})`;
      })
      .join(', ');
    return makeErrorResult(
      new Error(`Error parsing value with Zod: ${errorMessage}`, {cause: zodResult.error})
    );
  }

  return makeSuccessResult(zodResult.data);
}
