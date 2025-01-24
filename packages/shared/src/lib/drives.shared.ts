import {assertNever} from '@shared/lib/utils.shared';
import type {Drive, GameEvent} from '@shared/types/gameEvents.types';
import {GameEventType} from '@shared/types/gameEvents.types';

/**
 * Returns whether or not a game event ends the current drive.
 */
export function isEndOfDrive(gameEvent: GameEvent): boolean {
  switch (gameEvent.type) {
    case GameEventType.Kickoff:
    case GameEventType.Rush:
    case GameEventType.PassAttempt:
      // TODO: Check for turnovers.
      return false;
    case GameEventType.EndOfPeriod:
      // TODO: Investigate why not getting a 4th event of this type.
      // The 2nd and 4th regulation periods and all overtime periods (5+) end the current drive.
      return gameEvent.clock.period !== 1 && gameEvent.clock.period !== 3;
    case GameEventType.ExtraPointAttempt:
    case GameEventType.TwoPointConversionAttempt:
      // These plays occurs after a touchdown and always end a drive.
      return true;
    case GameEventType.FieldGoalAttempt:
      // TODO: Confirm how fake field goals are handled, or field goal attempts with penalties.
      return true;
    case GameEventType.Punt:
      // TODO: See if fake punts which result in a first down are handled correctly.
      return true;
    case GameEventType.Penalty:
    case GameEventType.Timeout:
      // Some events have no effect on when a drive ends.
      return false;
    default:
      assertNever(gameEvent);
  }
}

/**
 * Converts a flat list of game events into a list of drives.
 */
export function getDrives(gameEvents: readonly GameEvent[]): Drive[] {
  const drives: Drive[] = [];

  let currentDrive: Drive = [];
  let previousGameEvent: GameEvent | null = null;

  for (const gameEvent of gameEvents) {
    if (previousGameEvent && isEndOfDrive(previousGameEvent)) {
      drives.push(currentDrive);
      currentDrive = [];
    }

    currentDrive.push(gameEvent);
    previousGameEvent = gameEvent;
  }

  if (currentDrive.length > 0) {
    drives.push(currentDrive);
  }

  return drives;
}
