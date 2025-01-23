import type {Play} from '@shared/types/plays.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {AsyncResult} from '@shared/types/result.types';
import ndOsuPlays from '@sharedClient/resources/ndOsuGamePlays.json';

const typedPlays = ndOsuPlays as unknown as readonly Play[];

class ClientPlaysService {
  async getForGame(): AsyncResult<readonly Play[]> {
    return makeSuccessResult(typedPlays);
  }
}

export const playsService = new ClientPlaysService();
