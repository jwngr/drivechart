import type {
  EndOfPeriodGameEvent,
  ExtraPointAttemptGameEvent,
  FieldGoalAttemptGameEvent,
  FieldPosition,
  GameClock,
  GameEvent,
  KickoffGameEvent,
  PassAttemptGameEvent,
  PreSnapPenaltyGameEvent,
  PuntGameEvent,
  RushGameEvent,
  TimeoutGameEvent,
  TwoPointConversionAttemptGameEvent,
} from '@shared/types/gameEvents.types';
import {GameEventType, makeGameEventId} from '@shared/types/gameEvents.types';

export function makeFieldPosition(args: Partial<FieldPosition> = {}): FieldPosition {
  return {
    possessionTeam: args.possessionTeam ?? 'ND',
    yardLine: args.yardLine ?? 50,
    down: args.down ?? 1,
    distanceToFirstDown: args.distanceToFirstDown ?? 10,
  };
}

const START_OF_FIRST_PERIOD_CLOCK: GameClock = {period: 1, secondsRemaining: 900};

export function makeRushGameEvent(
  args: Partial<Omit<RushGameEvent, 'gameEventId' | 'type'>> = {}
): RushGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.Rush,
    clock: args.clock ?? START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: args.fieldPosition ?? makeFieldPosition(),
    turnover: args.turnover ?? null,
    penalties: args.penalties ?? [],
    scoring: args.scoring ?? null,
    rusher: args.rusher ?? 'Mock Rusher',
    yardsGained: args.yardsGained ?? 1,
    isFumble: args.isFumble ?? false,
  };
}

export function makePassAttemptGameEvent(
  args: Partial<Omit<PassAttemptGameEvent, 'gameEventId' | 'type'>> = {}
): PassAttemptGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.PassAttempt,
    clock: args.clock ?? START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: args.fieldPosition ?? makeFieldPosition(),
    turnover: args.turnover ?? null,
    penalties: args.penalties ?? [],
    scoring: args.scoring ?? null,
    passer: args.passer ?? 'Mock Passer',
    receiver: args.receiver ?? 'Mock Receiver',
    yardsGained: args.yardsGained ?? 1,
    isComplete: args.isComplete ?? false,
    isInterception: args.isInterception ?? false,
    isFumbleAfterCatch: args.isFumbleAfterCatch ?? false,
  };
}

export function makeKickoffGameEvent(
  args: Partial<Omit<KickoffGameEvent, 'gameEventId' | 'type'>> = {}
): KickoffGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.Kickoff,
    clock: START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: args.fieldPosition ?? makeFieldPosition(),
    turnover: args.turnover ?? null,
    penalties: args.penalties ?? [],
    scoring: args.scoring ?? null,
    kicker: args.kicker ?? 'Mock Kicker',
    yardLine: args.yardLine ?? 50,
    returnYards: args.returnYards ?? 0,
    isTouchback: args.isTouchback ?? false,
    isOutOfBounds: args.isOutOfBounds ?? false,
  };
}

export function makePuntGameEvent(
  args: Partial<Omit<PuntGameEvent, 'gameEventId' | 'type'>> = {}
): PuntGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.Punt,
    clock: START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: makeFieldPosition(),
    turnover: args.turnover ?? null,
    penalties: args.penalties ?? [],
    scoring: args.scoring ?? null,
    punter: args.punter ?? 'Mock Punter',
    yardLine: args.yardLine ?? 50,
    returnYards: args.returnYards ?? 0,
    isTouchback: args.isTouchback ?? false,
    isBlocked: args.isBlocked ?? false,
    returnTeam: args.returnTeam ?? 'Mock Return Team',
  };
}

export function makeFieldGoalAttemptGameEvent(
  args: Partial<Omit<FieldGoalAttemptGameEvent, 'gameEventId' | 'type'>> = {}
): FieldGoalAttemptGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.FieldGoalAttempt,
    clock: START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: makeFieldPosition(),
    turnover: args.turnover ?? null,
    penalties: args.penalties ?? [],
    scoring: args.scoring ?? null,
    kicker: args.kicker ?? 'Mock Kicker',
    yardLine: args.yardLine ?? 50,
    isGood: args.isGood ?? false,
    isBlocked: args.isBlocked ?? false,
    isReturned: args.isReturned ?? false,
    returnTeam: args.returnTeam ?? 'Mock Return Team',
    returnYards: args.returnYards ?? 0,
  };
}

export function makeExtraPointAttemptGameEvent(
  args: Partial<Omit<ExtraPointAttemptGameEvent, 'gameEventId' | 'type'>> = {}
): ExtraPointAttemptGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.ExtraPointAttempt,
    clock: START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: makeFieldPosition(),
    turnover: args.turnover ?? null,
    penalties: args.penalties ?? [],
    scoring: args.scoring ?? null,
    kicker: args.kicker ?? 'Mock Kicker',
    isGood: args.isGood ?? false,
    isBlocked: args.isBlocked ?? false,
    isReturned: args.isReturned ?? false,
    returnTeam: args.returnTeam ?? 'Mock Return Team',
    returnYards: args.returnYards ?? 0,
  };
}

export function makeTwoPointConversionAttemptGameEvent(
  args: Partial<Omit<TwoPointConversionAttemptGameEvent, 'gameEventId' | 'type'>> = {}
): TwoPointConversionAttemptGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.TwoPointConversionAttempt,
    clock: START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: args.fieldPosition ?? makeFieldPosition(),
    turnover: args.turnover ?? null,
    penalties: args.penalties ?? [],
    scoring: args.scoring ?? null,
    isSuccessful: args.isSuccessful ?? false,
    isInterception: args.isInterception ?? false,
    isFumble: args.isFumble ?? false,
    returnTeam: args.returnTeam ?? 'Mock Return Team',
    returnYards: args.returnYards ?? 0,
    isReturnTouchdown: args.isReturnTouchdown ?? false,
  };
}

export function makePreSnapPenaltyGameEvent(
  args: Partial<Omit<PreSnapPenaltyGameEvent, 'gameEventId' | 'type'>> = {}
): PreSnapPenaltyGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.PreSnapPenalty,
    clock: args.clock ?? START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: args.fieldPosition ?? makeFieldPosition(),
    player: args.player ?? 'Mock Player',
    yardage: args.yardage ?? 10,
  };
}

export function makeEndOfPeriodGameEvent(
  args: Partial<
    Omit<EndOfPeriodGameEvent, 'gameEventId' | 'type' | 'clock'> & {period: 1 | 2 | 3 | 4 | 5}
  > = {}
): EndOfPeriodGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.EndOfPeriod,
    clock: {period: args.period ?? 1, secondsRemaining: 0},
    fieldPosition: args.fieldPosition ?? makeFieldPosition(),
  };
}

export function makeTimeoutGameEvent(
  args: Partial<Omit<TimeoutGameEvent, 'gameEventId' | 'type'>> = {}
): TimeoutGameEvent {
  return {
    gameEventId: makeGameEventId(),
    type: GameEventType.Timeout,
    clock: args.clock ?? START_OF_FIRST_PERIOD_CLOCK,
    fieldPosition: args.fieldPosition ?? makeFieldPosition(),
    team: args.team ?? 'Mock Team',
  };
}

export function getGameEventTypes(events: GameEvent[]): GameEventType[] {
  return events.map((event) => event.type);
}
