import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {logger} from '@shared/services/logger.shared';
import type {GameEvent, PenaltyContext} from '@shared/types/gameEvents.types';
import {GameEventType, parseGameEventId, ScoringType} from '@shared/types/gameEvents.types';
import {makeSuccessResult, type Result} from '@shared/types/result.types';
import {z} from 'zod';

enum CfbdPlayType {
  Rush = 'Rush',
  PassReception = 'Pass Reception',
  PassIncompletion = 'Pass Incompletion',
  Kickoff = 'Kickoff',
  Punt = 'Punt',
  Penalty = 'Penalty',
  Timeout = 'Timeout',
  Sack = 'Sack',
  RushingTouchdown = 'Rushing Touchdown',
  PassingTouchdown = 'Passing Touchdown',
  EndPeriod = 'End Period',
  FieldGoalGood = 'Field Goal Good',
  PassInterceptionReturn = 'Pass Interception Return',
  EndOfHalf = 'End of Half',
  FumbleRecoveryOwn = 'Fumble Recovery (Own)',
  FumbleRecoveryOpponent = 'Fumble Recovery (Opponent)',
  FieldGoalMissed = 'Field Goal Missed',
  KickoffReturnOffense = 'Kickoff Return (Offense)',
  InterceptionReturnTouchdown = 'Interception Return Touchdown',
  BlockedFieldGoal = 'Blocked Field Goal',
  BlockedPunt = 'Blocked Punt',
  Safety = 'Safety',
  KickoffReturnTouchdown = 'Kickoff Return Touchdown',
  FumbleReturnTouchdown = 'Fumble Return Touchdown',
  Uncategorized = 'Uncategorized',
  Defensive2ptConversion = 'Defensive 2pt Conversion',
  BlockedPuntTouchdown = 'Blocked Punt Touchdown',
  MissedFieldGoalReturn = 'Missed Field Goal Return',
  PuntReturnTouchdown = 'Punt Return Touchdown',
  Placeholder = 'placeholder',
  MissedFieldGoalReturnTouchdown = 'Missed Field Goal Return Touchdown',
  TwoPointRush = 'Two Point Rush',
  EndOfGame = 'End of Game',
  Interception = 'Interception',
  BlockedFieldGoalTouchdown = 'Blocked Field Goal Touchdown',
  Pass = 'Pass',
  TwoPtConversion = '2pt Conversion',
  ExtraPointGood = 'Extra Point Good',
  ExtraPointMissed = 'Extra Point Missed',
  PassCompletion = 'Pass Completion',
  PassInterception = 'Pass Interception',
  Offensive1ptSafety = 'Offensive 1pt Safety',
  BlockedPAT = 'Blocked PAT',
  KickoffReturnDefense = 'Kickoff Return (Defense)',
  PuntReturn = 'Punt Return',
  TwoPointPass = 'Two Point Pass',
  EndOfRegulation = 'End of Regulation',
  StartOfPeriod = 'Start of Period',
}

export function isKickoffCfbdPlayType(playType: CfbdPlayType): boolean {
  switch (playType) {
    case CfbdPlayType.Kickoff:
    case CfbdPlayType.KickoffReturnOffense:
    case CfbdPlayType.KickoffReturnDefense:
    case CfbdPlayType.KickoffReturnTouchdown:
      return true;
    default:
      return false;
  }
}

const cfbdClockSchema = z.object({
  minutes: z.number(),
  seconds: z.number(),
});

export const cfbdPlaySchema = z.object({
  id: z.string(),
  drive_id: z.string(),
  game_id: z.number(),
  drive_number: z.number(),
  play_number: z.number(),
  offense: z.string(),
  offense_conference: z.string(),
  offense_score: z.number(),
  defense: z.string(),
  home: z.string(),
  away: z.string(),
  defense_conference: z.string(),
  defense_score: z.number(),
  period: z.number(),
  clock: cfbdClockSchema,
  offense_timeouts: z.number(),
  defense_timeouts: z.number(),
  yard_line: z.number(),
  yards_to_goal: z.number(),
  down: z.number().nullable(),
  distance: z.number(),
  yards_gained: z.number(),
  scoring: z.boolean(),
  play_type: z.nativeEnum(CfbdPlayType),
  play_text: z.string(),
  ppa: z.string().nullable(),
  wallclock: z.string(),
});

export type CfbdPlay = z.infer<typeof cfbdPlaySchema>;

export const parseCfbdPlay = (play: unknown): Result<CfbdPlay> => {
  const parseResult = parseZodResult(cfbdPlaySchema, play);
  return prefixResultIfError(parseResult, 'Failed to parse CFBD play');
};

export function parseGameEventFromCfbdPlay(play: CfbdPlay): Result<GameEvent | null> {
  const gameEventIdResult = parseGameEventId(play.id);
  if (!gameEventIdResult.success) return gameEventIdResult;

  const isKickoff = isKickoffCfbdPlayType(play.play_type);

  // Parse base game event information.
  const basePlay = {
    gameEventId: gameEventIdResult.value,
    clock: {
      period: play.period,
      secondsRemaining: play.clock.minutes * 60 + play.clock.seconds,
    },
    fieldPosition: {
      possessionTeam: play.offense,
      yardLine: play.yard_line,
      down: isKickoff ? null : (play.down as 1 | 2 | 3 | 4),
      distanceToFirstDown: isKickoff ? null : play.distance,
    },
    turnover: null, // Will need to parse play_text to determine this
    penalties: [] as PenaltyContext[], // Will need to parse play_text to determine this
    scoring: play.scoring
      ? {
          type: ScoringType.OffensiveTouchdown, // Default to TD, needs refinement
          points: 6, // Default to TD points, needs refinement
        }
      : null,
  } as const;

  // Normalize play type text for matching
  const playText = play.play_text.toUpperCase();

  // Helper to extract player name from play text
  function extractPlayerName(pattern: RegExp): string {
    const match = play.play_text.match(pattern);
    return match?.[1] ?? 'Unknown Player';
  }

  switch (play.play_type) {
    case CfbdPlayType.Rush:
    case CfbdPlayType.RushingTouchdown:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.Rush,
        rusher: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) rush/i),
        yardsGained: play.yards_gained,
        isFumble: playText.includes('FUMBLE'),
      });

    case CfbdPlayType.Pass:
    case CfbdPlayType.PassCompletion:
    case CfbdPlayType.PassReception:
    case CfbdPlayType.PassIncompletion:
    case CfbdPlayType.PassingTouchdown:
    case CfbdPlayType.Interception:
    case CfbdPlayType.PassInterception:
    case CfbdPlayType.PassInterceptionReturn:
    case CfbdPlayType.InterceptionReturnTouchdown:
    case CfbdPlayType.Sack:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.PassAttempt,
        passer: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) pass/i),
        receiver: extractPlayerName(/(?:complete|incomplete) to ([A-Z]+(?:\s[A-Z]+)*)/i),
        isComplete: !playText.includes('INCOMPLETE'),
        yardsGained: play.yards_gained,
        isInterception: playText.includes('INTERCEPTED'),
        isFumbleAfterCatch: playText.includes('FUMBLE'),
      });

    case CfbdPlayType.Punt:
    case CfbdPlayType.PuntReturn:
    case CfbdPlayType.BlockedPunt:
    case CfbdPlayType.BlockedPuntTouchdown:
    case CfbdPlayType.PuntReturnTouchdown:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.Punt,
        punter: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) punt/i),
        yardLine: play.yard_line,
        returnYards: 0, // Would need to parse play text for this
        isTouchback: playText.includes('TOUCHBACK'),
        isBlocked: playText.includes('BLOCKED'),
        returnTeam: play.defense,
      });

    case CfbdPlayType.Kickoff:
    case CfbdPlayType.KickoffReturnOffense:
    case CfbdPlayType.KickoffReturnDefense:
    case CfbdPlayType.KickoffReturnTouchdown:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.Kickoff,
        kicker: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) kickoff/i),
        yardLine: play.yard_line,
        returnYards: 0, // Would need to parse play text for this
        isTouchback: playText.includes('TOUCHBACK'),
        isOutOfBounds: playText.includes('OUT OF BOUNDS'),
      });

    case CfbdPlayType.FieldGoalGood:
    case CfbdPlayType.FieldGoalMissed:
    case CfbdPlayType.BlockedFieldGoal:
    case CfbdPlayType.MissedFieldGoalReturn:
    case CfbdPlayType.BlockedFieldGoalTouchdown:
    case CfbdPlayType.MissedFieldGoalReturnTouchdown:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.FieldGoalAttempt,
        kicker: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) field goal/i),
        yardLine: play.yard_line,
        isGood: !playText.includes('NO GOOD') && !playText.includes('MISSED'),
        isBlocked: playText.includes('BLOCKED'),
        isReturned: playText.includes('RETURN'),
        returnTeam: play.defense,
        returnYards: 0, // Would need to parse play text for this
      });

    case CfbdPlayType.ExtraPointGood:
    case CfbdPlayType.ExtraPointMissed:
    case CfbdPlayType.BlockedPAT:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.ExtraPointAttempt,
        kicker: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) extra point/i),
        isGood: !playText.includes('NO GOOD') && !playText.includes('MISSED'),
        isBlocked: playText.includes('BLOCKED'),
        isReturned: playText.includes('RETURN'),
        returnTeam: play.defense,
        returnYards: 0, // Would need to parse play text for this
      });

    case CfbdPlayType.TwoPtConversion:
    case CfbdPlayType.TwoPointRush:
    case CfbdPlayType.TwoPointPass:
    case CfbdPlayType.Defensive2ptConversion:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.TwoPointConversionAttempt,
        isSuccessful: playText.includes('SUCCESS'),
        isInterception: playText.includes('INTERCEPTED'),
        isFumble: playText.includes('FUMBLE'),
        returnTeam: play.defense,
        returnYards: 0, // Would need to parse play text for this
        isReturnTouchdown: playText.includes('TOUCHDOWN'),
      });

    case CfbdPlayType.Penalty:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.PreSnapPenalty,
        player: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) penalty/i),
        yardage: play.yards_gained,
      });

    case CfbdPlayType.StartOfPeriod:
    case CfbdPlayType.EndPeriod:
    case CfbdPlayType.EndOfHalf:
    case CfbdPlayType.EndOfRegulation:
    case CfbdPlayType.EndOfGame:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.EndOfPeriod,
      });

    case CfbdPlayType.Timeout:
      return makeSuccessResult({
        ...basePlay,
        type: GameEventType.Timeout,
        team: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) timeout/i),
      });

    case CfbdPlayType.FumbleRecoveryOwn:
      // TODO: Handle this.
      logger.warn('Skipping play:', play);
      return makeSuccessResult(null);

    case CfbdPlayType.FumbleRecoveryOpponent:
    case CfbdPlayType.FumbleReturnTouchdown:
    case CfbdPlayType.Safety:
    case CfbdPlayType.Offensive1ptSafety:
    case CfbdPlayType.Placeholder:
    case CfbdPlayType.Uncategorized:
      logger.warn('Skipping play:', play);
      return makeSuccessResult(null);

    default:
      assertNever(play.play_type);
  }
}
