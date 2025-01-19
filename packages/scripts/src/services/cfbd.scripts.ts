import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {Play} from '@shared/types/plays.types';
import {AsyncResult} from '@shared/types/result.types';
import dotenv from 'dotenv';

// Load environment variables from .env file.
dotenv.config();

const CFBD_API_HOST = 'https://api.collegefootballdata.com';

class CFBDService {
  constructor(private readonly apiKey: string) {}

  public async getPlayByPlay(gameId: string): AsyncResult<readonly Play[]> {
    const url = `${CFBD_API_HOST}/plays?gameId=${gameId}`;
    const response = await requestGet<readonly Play[]>(url);
    return prefixResultIfError(response, 'Error fetching play by play from CFBD');
  }

  public async getPlaysByTeam(args: {
    readonly seasonType: 'regular' | 'postseason' | 'both';
    readonly year: number;
    readonly week: number;
    readonly team: string;
  }): AsyncResult<readonly Play[]> {
    const {seasonType, year, week, team} = args;
    const url = `${CFBD_API_HOST}/plays`;
    const response = await requestGet<readonly Play[]>(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      params: {
        seasonType,
        year: year.toString(),
        week: week.toString(),
        team: team,
      },
    });
    return prefixResultIfError(response, 'Error fetching plays by team from CFBD');
  }
}

if (!process.env.COLLEGE_FOOTBALL_DATA_API_KEY) {
  throw new Error('COLLEGE_FOOTBALL_DATA_API_KEY must be set in the .env file');
}

export const cfbdService = new CFBDService(process.env.COLLEGE_FOOTBALL_DATA_API_KEY);
