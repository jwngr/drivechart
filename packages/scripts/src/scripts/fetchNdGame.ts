import {prefixError} from '@shared/lib/errorUtils.shared';
import {logger} from '@shared/services/logger.shared';
import {cfbdService} from '@src/services/cfbd.scripts';

const gameEventsResult = await cfbdService.getGameEventsByTeam({
  seasonType: 'regular',
  year: 2024,
  week: 1,
  team: 'Notre Dame',
});

if (!gameEventsResult.success) {
  logger.error(prefixError(gameEventsResult.error, 'Error fetching game events for ND game'));
  process.exit(1);
}

const gameEvents = gameEventsResult.value;

logger.log(`Found ${gameEvents.length} game events for ND game`);

// gameEvents.forEach((gameEvent, i) => {
//   logger.log(`PLAY #${i + 1}: ${JSON.stringify(gameEvent.gameEventId)} (${gameEvent.type})`);
// });

logger.log(JSON.stringify(gameEvents));
