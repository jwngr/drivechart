import {getDrives} from '@shared/lib/drives.shared';
import {
  getGameEventTypes,
  makeEndOfPeriodGameEvent,
  makeFieldGoalAttemptGameEvent,
  makeKickoffGameEvent,
  makePassAttemptGameEvent,
  makeRushGameEvent,
} from '@shared/lib/gameEvents.shared';
import type {GameEvent} from '@shared/types/gameEvents.types';
import {GameEventType} from '@shared/types/gameEvents.types';

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
      makeEndOfPeriodGameEvent({period: 1}),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent({period: 2}),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent({period: 3}),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent({period: 4}),
      makeRushGameEvent(),
      makeEndOfPeriodGameEvent({period: 5}),
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
      makeRushGameEvent(),
      makeFieldGoalAttemptGameEvent(),
      makeRushGameEvent(),
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
