import {getDrives} from '@shared/lib/drives.shared';
import {
  getGameEventTypes,
  makeEndOfPeriodGameEvent,
  makeFieldGoalAttemptGameEvent,
  makeFieldPosition,
  makeKickoffGameEvent,
  makePassAttemptGameEvent,
  makeRushGameEvent,
} from '@shared/lib/testHelpers';
import type {GameClock, GameEvent} from '@shared/types/gameEvents.types';
import {GameEventType, makeGameEventId, ScoringType} from '@shared/types/gameEvents.types';

const START_OF_FIRST_PERIOD_CLOCK: GameClock = {period: 1, secondsRemaining: 900};

describe('getDrives', () => {
  it('should split game events into drives based on drive-ending plays', () => {
    const mockEvents: GameEvent[] = [
      makeKickoffGameEvent(),
      makeRushGameEvent(),
      makeFieldGoalAttemptGameEvent(),
      makeKickoffGameEvent(),
      makeRushGameEvent(),
      makePassAttemptGameEvent(),
      makeFieldGoalAttemptGameEvent(),
    ];

    const drives = getDrives(mockEvents);

    expect(drives).toHaveLength(2);
    expect(getGameEventTypes(drives[0])).toEqual([
      GameEventType.Kickoff,
      GameEventType.Rush,
      GameEventType.FieldGoalAttempt,
    ]);
    expect(getGameEventTypes(drives[1])).toEqual([
      GameEventType.Kickoff,
      GameEventType.Rush,
      GameEventType.PassAttempt,
      GameEventType.FieldGoalAttempt,
    ]);
  });

  it('should handle empty game events array', () => {
    const drives = getDrives([]);
    expect(drives).toHaveLength(0);
  });

  it('should end drives at end of 2nd, 4th, and 5th periods', () => {
    const mockEvents: GameEvent[] = [
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent(1),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent(2),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent(3),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent(4),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent(5),
    ];

    const drives = getDrives(mockEvents);
    expect(drives).toHaveLength(3);
    expect(getGameEventTypes(drives[0])).toEqual([
      GameEventType.Rush,
      GameEventType.EndOfPeriod,
      GameEventType.Rush,
      GameEventType.EndOfPeriod,
    ]);
    expect(getGameEventTypes(drives[1])).toEqual([
      GameEventType.Rush,
      GameEventType.EndOfPeriod,
      GameEventType.Rush,
      GameEventType.EndOfPeriod,
    ]);
    expect(getGameEventTypes(drives[2])).toEqual([GameEventType.Rush, GameEventType.EndOfPeriod]);
  });

  it('should end drive on scoring plays', () => {
    const mockEvents: GameEvent[] = [
      {
        gameEventId: makeGameEventId(),
        clock: START_OF_FIRST_PERIOD_CLOCK,
        fieldPosition: makeFieldPosition(),
        turnover: null,
        penalties: [],
        scoring: null,
        type: GameEventType.Rush,
        rusher: 'Runner',
        yardsGained: 5,
        isFumble: false,
      },
      {
        gameEventId: makeGameEventId(),
        clock: START_OF_FIRST_PERIOD_CLOCK,
        fieldPosition: makeFieldPosition(),
        turnover: null,
        penalties: [],
        scoring: {type: ScoringType.FieldGoal, points: 3},
        type: GameEventType.FieldGoalAttempt,
        kicker: 'Kicker',
        yardLine: 37,
        isGood: true,
        isBlocked: false,
        isReturned: false,
        returnTeam: 'Team B',
        returnYards: 0,
      },
      {
        gameEventId: makeGameEventId(),
        clock: START_OF_FIRST_PERIOD_CLOCK,
        fieldPosition: makeFieldPosition(),
        turnover: null,
        penalties: [],
        scoring: null,
        type: GameEventType.Rush,
        rusher: 'Runner',
        yardsGained: 5,
        isFumble: false,
      },
    ];

    const drives = getDrives(mockEvents);
    expect(drives).toHaveLength(2);
    expect(getGameEventTypes(drives[0])).toEqual([
      GameEventType.Rush,
      GameEventType.FieldGoalAttempt,
    ]);
    expect(getGameEventTypes(drives[1])).toEqual([GameEventType.Rush]);
  });
});
