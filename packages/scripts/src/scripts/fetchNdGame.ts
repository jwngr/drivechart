import {logger} from '@shared/services/logger.shared';

import {cfbdService} from '../services/cfbd.scripts';

const playsResult = await cfbdService.getPlaysByTeam({
  seasonType: 'regular',
  year: 2024,
  week: 1,
  team: 'Notre Dame',
});

if (!playsResult.success) {
  console.error('Error fetching plays for ND:', playsResult.error);
  process.exit(1);
}

const plays = playsResult.value;

logger.log(`Found ${plays.length} plays for ND game`);

let i = 0;
plays.forEach((play) => {
  console.log(`${i++} - ${JSON.stringify(play)}`);
});
