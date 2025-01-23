import type {GameEvent} from '@shared/types/gameEvents.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {AsyncResult} from '@shared/types/result.types';
import ndOsuGameEvents from '@sharedClient/resources/ndOsuGameEvents.json';

const typedGameEvents = ndOsuGameEvents as unknown as readonly GameEvent[];

class ClientGameEventsService {
  async getForGame(): AsyncResult<readonly GameEvent[]> {
    return makeSuccessResult(typedGameEvents);
  }
}

export const gameEventsService = new ClientGameEventsService();
