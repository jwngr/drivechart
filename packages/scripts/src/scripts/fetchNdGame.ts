import {prefixError} from '@shared/lib/errorUtils.shared';
import {logger} from '@shared/services/logger.shared';
import {cfbdService} from '@src/services/cfbd.scripts';

const playsResult = await cfbdService.getPlaysByTeam({
  seasonType: 'regular',
  year: 2024,
  week: 1,
  team: 'Notre Dame',
});

if (!playsResult.success) {
  logger.error(prefixError(playsResult.error, 'Error fetching plays for ND game'));
  process.exit(1);
}

const plays = playsResult.value;

logger.log(`Found ${plays.length} plays for ND game`);

plays.forEach((play, i) => {
  logger.log(`PLAY #${i + 1}: ${JSON.stringify(play.playId)} (${play.type})`);
});
