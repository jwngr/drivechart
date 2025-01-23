import {prefixErrorResult, syncTryAll} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {filterNull} from '@shared/lib/utils.shared';
import {parseCfbdPlay, parsePlayFromCfbdPlay} from '@shared/schemas/cfdb.schema';
import type {Play} from '@shared/types/plays.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

const CFBD_API_HOST = 'https://api.collegefootballdata.com';

export class CFBDService {
  constructor(private readonly apiKey: string) {}

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

    if (!response.success) {
      return prefixErrorResult(response, 'Error fetching plays by team from CFBD');
    }

    const rawPlayResponses = response.value;
    if (!Array.isArray(rawPlayResponses)) {
      return makeErrorResult(new Error('Play by play response is not an array'));
    }

    const parseCfbdPlayResults = rawPlayResponses.map(parseCfbdPlay);
    const parsedCfbdPlayResponsesResult = syncTryAll(parseCfbdPlayResults);
    if (!parsedCfbdPlayResponsesResult.success) {
      return prefixErrorResult(
        parsedCfbdPlayResponsesResult,
        'Error parsing raw response from CFBD'
      );
    }

    const parsedCfbdPlayResponses = parsedCfbdPlayResponsesResult.value;

    const parsePlayResults = parsedCfbdPlayResponses.map(parsePlayFromCfbdPlay);
    const parsedPlayResponsesResult = syncTryAll(parsePlayResults);
    if (!parsedPlayResponsesResult.success) {
      return prefixErrorResult(parsedPlayResponsesResult, 'Error parsing plays from CFBD');
    }

    const parsedPlays = filterNull(parsedPlayResponsesResult.value);
    return makeSuccessResult(parsedPlays);
  }
}
