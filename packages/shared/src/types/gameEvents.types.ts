import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeUuid} from '@shared/lib/utils.shared';
import {makeSuccessResult, type Result} from '@shared/types/result.types';
import {z} from 'zod';

/** Strongly-typed type for a game event's unique identifier. Prefer this over plain strings. */
export type GameEventId = string & {readonly __brand: 'GameEventIdBrand'};

const gameEventIdSchema = z.string();

/** Parses a {@link GameEventId} from an unknown value. */
export function parseGameEventId(unknownPlayId: unknown): Result<GameEventId> {
  const parseResult = parseZodResult(gameEventIdSchema, unknownPlayId);
  if (!parseResult.success) {
    return prefixErrorResult(parseResult, 'Error parsing GameEventId');
  }
  return makeSuccessResult(parseResult.value as GameEventId);
}

/** Creates a new {@link GameEventId}. */
export function makeGameEventId(): GameEventId {
  return makeUuid<GameEventId>();
}

export enum GameEventType {
  // Standard plays.
  Rush = 'RUSH',
  PassAttempt = 'PASS_ATTEMPT',

  // Kicking plays.
  Kickoff = 'KICKOFF',
  Punt = 'PUNT',
  FieldGoalAttempt = 'FIELD_GOAL_ATTEMPT',
  ExtraPointAttempt = 'EXTRA_POINT_ATTEMPT',

  // Other special plays.
  TwoPointConversionAttempt = 'TWO_POINT_CONVERSION_ATTEMPT',
  // TODO: Do I need this one?
  // FumbleRecovery = 'FUMBLE_RECOVERY',

  // Non-play events.
  PreSnapPenalty = 'PRE_SNAP_PENALTY',
  Timeout = 'TIMEOUT',
  EndOfPeriod = 'END_OF_PERIOD',
}

export interface GameClock {
  /** Period number. 1-4 for regulation, 5+ for overtime periods. */
  readonly period: number;
  /** Number of seconds remaining in the period. Maximum of 60 * 15 = 900. Minimum of 0 for untimed downs. */
  readonly secondsRemaining: number;
}

/** Down, distance, field position, and possession at the start of the play. */
export interface FieldPosition {
  /** Down number. `null` if not applicable (e.g., kickoff). */
  readonly down: 1 | 2 | 3 | 4 | null;
  /** Distance to first down. `null` if not applicable (e.g., kickoffs or goal-to-go situations). */
  readonly distanceToFirstDown: number | null;
  /** Yard line on the field, 0 is the offensive team's goal line. 100 is the defensive team's goal
   * line. */
  readonly yardLine: number;
  /** Name/abbreviation of the team with possession. */
  readonly possessionTeam: string;
}

interface BaseGameEvent {
  readonly gameEventId: GameEventId;
  readonly clock: GameClock;
  readonly fieldPosition: FieldPosition;
}

interface BasePlayGameEvent extends BaseGameEvent {
  /** Context for turnover. */
  readonly turnover: TurnoverContext | null;
  /** Penalties (if any). */
  readonly penalties: PenaltyContext[];
  /** Additional context for a scoring play. */
  readonly scoring: ScoringContext | null;
}

export enum TurnoverType {
  Fumble = 'FUMBLE',
  Interception = 'INTERCEPTION',
  Downs = 'DOWNS',
}

/** Additional context for a play with a turnover. */
interface TurnoverContext {
  readonly type: TurnoverType;
  /** Team that recovered the ball. */
  readonly recoveredBy: string;
  /** Yard line where the turnover occurred. */
  readonly yardLine: number;
  /** Yards gained on the turnover return. */
  readonly returnYards?: number;
  /** True if the turnover resulted in a touchdown. */
  readonly isTouchdown?: boolean;
}

export enum PenaltyType {
  Holding = 'HOLDING',
  Offside = 'OFFSIDE',
}

/** Additional context for a play with a penalty. */
export interface PenaltyContext {
  readonly type: PenaltyType;
  /** Team committing the penalty. */
  readonly team: string;
  /** Yards assessed for the penalty. */
  readonly yardage: number;
  /** True if penalties offset. */
  readonly isOffsetting: boolean;
  /** True if penalty was declined. */
  readonly isDeclined: boolean;
  /** True if penalty occurred during the play. */
  readonly occurredDuringPlay: boolean;
}

export enum ScoringType {
  // Offensive scoring plays.
  OffensiveTouchdown = 'OFFENSIVE_TOUCHDOWN',
  FieldGoal = 'FIELD_GOAL',
  ExtraPoint = 'EXTRA_POINT',
  TwoPointConversion = 'TWO_POINT_CONVERSION',

  // Defensive scoring plays.
  Safety = 'SAFETY',
  DefensiveTouchdown = 'DEFENSIVE_TOUCHDOWN',
  DefensiveExtraPointReturn = 'DEFENSIVE_EXTRA_POINT_RETURN',
}

/** Additional context for a play with a scoring play. */
interface ScoringContext {
  readonly type: ScoringType;
  /** True if kick or extra point was blocked. */
  readonly isBlocked?: boolean;
  /** True if blocked kick was returned for a score. */
  readonly isReturned?: boolean;
  /** Team that scored on the return. */
  readonly returnTeam?: string;
  /** Points scored (e.g., 2 for a safety or defensive return). */
  readonly points: number;
}

export interface RushGameEvent extends BasePlayGameEvent {
  readonly type: GameEventType.Rush;
  /** Player carrying the ball. */
  readonly rusher: string;
  /** Yards gained on the run. */
  readonly yardsGained: number;
  /** True if the ball was fumbled, even if recovered by the same team. */
  readonly isFumble: boolean;
}

export interface PassAttemptGameEvent extends BasePlayGameEvent {
  readonly type: GameEventType.PassAttempt;
  /** Player attempting the pass. */
  readonly passer: string;
  /** Player targeted / catching the pass. */
  readonly receiver: string;
  /** True if the pass was completed. */
  readonly isComplete: boolean;
  /** Yards gained if complete. */
  readonly yardsGained: number;
  /** True if the pass was intercepted. */
  readonly isInterception: boolean;
  /** True if a fumble occurred after the catch. */
  readonly isFumbleAfterCatch: boolean;
}

export interface PreSnapPenaltyGameEvent extends BaseGameEvent {
  readonly type: GameEventType.PreSnapPenalty;
  /** Player committing the penalty. */
  readonly player: string;
  /** Yardage of the penalty. */
  readonly yardage: number;
}

export interface KickoffGameEvent extends BasePlayGameEvent {
  readonly type: GameEventType.Kickoff;
  /** Player kicking off. */
  readonly kicker: string;
  /** Yard line where the ball was kicked. */
  readonly yardLine: number;
  /** Yards gained on the return. */
  readonly returnYards: number;
  /** True if the ball was a touchback. */
  readonly isTouchback: boolean;
  /** True if the kick went out of bounds. */
  readonly isOutOfBounds: boolean;
}

export interface FieldGoalAttemptGameEvent extends BasePlayGameEvent {
  readonly type: GameEventType.FieldGoalAttempt;
  /** Player attempting the field goal. */
  readonly kicker: string;
  /** Yard line where the kick was attempted. */
  readonly yardLine: number;
  /** True if the field goal was successful. */
  readonly isGood: boolean;
  /** True if the kick was blocked. */
  readonly isBlocked: boolean;
  /** True if blocked kick was returned. */
  readonly isReturned: boolean;
  /** Team that scored on the return. */
  readonly returnTeam: string;
  /** Yards gained on the return. */
  readonly returnYards: number;
}

export interface ExtraPointAttemptGameEvent extends BasePlayGameEvent {
  readonly type: GameEventType.ExtraPointAttempt;
  /** Player attempting the extra point. */
  readonly kicker: string;
  /** True if the extra point was successful. */
  readonly isGood: boolean;
  /** True if the kick was blocked. */
  readonly isBlocked: boolean;
  /** True if blocked kick was returned. */
  readonly isReturned: boolean;
  /** Team that scored on the return. */
  readonly returnTeam: string;
  /** Yards gained on the return. */
  readonly returnYards: number;
}

export interface TwoPointConversionAttemptGameEvent extends BasePlayGameEvent {
  readonly type: GameEventType.TwoPointConversionAttempt;
  /** True if the conversion was successful. */
  readonly isSuccessful: boolean;
  /** True if intercepted. */
  readonly isInterception: boolean;
  /** True if fumbled. */
  readonly isFumble: boolean;
  /** Team that returned a failed attempt. */
  readonly returnTeam: string;
  /** Yards gained on the return. */
  readonly returnYards: number;
  /** True if return resulted in a touchdown. */
  readonly isReturnTouchdown: boolean;
}

export interface PuntGameEvent extends BasePlayGameEvent {
  readonly type: GameEventType.Punt;
  /** Player punting the ball. */
  readonly punter: string;
  /** Yard line where the punt occurred. */
  readonly yardLine: number;
  /** Yards gained on the return. */
  readonly returnYards: number;
  /** True if the punt was a touchback. */
  readonly isTouchback: boolean;
  /** True if the punt was blocked. */
  readonly isBlocked: boolean;
  /** Team that scored on the return. */
  readonly returnTeam: string;
}

export interface TimeoutGameEvent extends BaseGameEvent {
  readonly type: GameEventType.Timeout;
  /** Team that called the timeout. */
  readonly team: string;
}

export interface EndOfPeriodGameEvent extends BaseGameEvent {
  readonly type: GameEventType.EndOfPeriod;
}

export type GameEvent =
  | RushGameEvent
  | PassAttemptGameEvent
  | KickoffGameEvent
  | PuntGameEvent
  | FieldGoalAttemptGameEvent
  | ExtraPointAttemptGameEvent
  | TwoPointConversionAttemptGameEvent
  | PreSnapPenaltyGameEvent
  | TimeoutGameEvent
  | EndOfPeriodGameEvent;

export type Drive = GameEvent[];
