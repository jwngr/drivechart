import {CFBDService} from '@shared/services/cfbd.shared';
import dotenv from 'dotenv';

// Load environment variables from .env file.
dotenv.config();

if (!process.env.COLLEGE_FOOTBALL_DATA_API_KEY) {
  // Throw since this is a critical, unrecoverable error.
  // eslint-disable-next-line no-restricted-syntax
  throw new Error('COLLEGE_FOOTBALL_DATA_API_KEY must be set in the .env file');
}

export const cfbdService = new CFBDService(process.env.COLLEGE_FOOTBALL_DATA_API_KEY);
