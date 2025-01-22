import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {logger} from '@shared/services/logger.shared';
import type {PenaltyContext, Play, PlayId} from '@shared/types/plays.types';
import {PlayType, ScoringType} from '@shared/types/plays.types';
import {makeErrorResult, makeSuccessResult, type Result} from '@shared/types/result.types';
import {z} from 'zod';

const cfbdPlayIdSchema = z.string();

const cfbdClockSchema = z.object({
  minutes: z.number(),
  seconds: z.number(),
});

export const cfbdPlaySchema = z.object({
  id: cfbdPlayIdSchema,
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
  play_type: z.string(),
  play_text: z.string(),
  ppa: z.string().nullable(),
  wallclock: z.string(),
});

export type CfbdPlay = z.infer<typeof cfbdPlaySchema>;

export const parseCfbdPlay = (play: unknown): Result<CfbdPlay> => {
  const parseResult = parseZodResult(cfbdPlaySchema, play);
  return prefixResultIfError(parseResult, 'Failed to parse CFBD play');
};

/** Parses a play ID from a CFBD response. */
function parseCfbdPlayId(unknownPlayId: unknown): Result<PlayId> {
  const parseResult = parseZodResult(cfbdPlayIdSchema, unknownPlayId);
  if (!parseResult.success) {
    return prefixErrorResult(parseResult, 'Error parsing PlayId');
  }
  return makeSuccessResult(parseResult.value as PlayId);
}

export function parsePlayFromCfbdPlay(play: CfbdPlay): Result<Play | null> {
  const playIdResult = parseCfbdPlayId(play.id);
  if (!playIdResult.success) return playIdResult;

  // Parse base play information
  const basePlay = {
    playId: playIdResult.value,
    clock: {
      quarter: play.period,
      secondsRemaining: play.clock.minutes * 60 + play.clock.seconds,
    },
    down: play.down as 1 | 2 | 3 | 4 | null,
    distanceToFirstDown: play.distance,
    yardLine: play.yard_line,
    possessionTeam: play.offense,
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
  const playTypeText = play.play_type.toUpperCase();
  const playText = play.play_text.toUpperCase();

  // Helper to extract player name from play text
  function extractPlayerName(pattern: RegExp): string {
    const match = play.play_text.match(pattern);
    return match?.[1] ?? 'Unknown Player';
  }

  switch (playTypeText) {
    case 'RUSH':
    case 'RUSHING TOUCHDOWN':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.Run,
        rusher: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) rush/i),
        yardsGained: play.yards_gained,
        isFumble: playText.includes('FUMBLE'),
      });

    case 'PASS':
    case 'PASS RECEPTION':
    case 'PASS INCOMPLETION':
    case 'PASS INTERCEPTION RETURN':
    case 'SACK':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.Pass,
        passer: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) pass/i),
        receiver: extractPlayerName(/(?:complete|incomplete) to ([A-Z]+(?:\s[A-Z]+)*)/i),
        isComplete: !playText.includes('INCOMPLETE'),
        yardsGained: play.yards_gained,
        isInterception: playText.includes('INTERCEPTED'),
        isFumbleAfterCatch: playText.includes('FUMBLE'),
      });

    case 'PUNT':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.Punt,
        punter: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) punt/i),
        yardLine: play.yard_line,
        returnYards: 0, // Would need to parse play text for this
        isTouchback: playText.includes('TOUCHBACK'),
        isBlocked: playText.includes('BLOCKED'),
        returnTeam: play.defense,
      });

    case 'KICKOFF':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.Kickoff,
        kicker: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) kickoff/i),
        yardLine: play.yard_line,
        returnYards: 0, // Would need to parse play text for this
        isTouchback: playText.includes('TOUCHBACK'),
        isOutOfBounds: playText.includes('OUT OF BOUNDS'),
      });

    case 'FIELD GOAL':
    case 'FIELD GOAL GOOD':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.FieldGoalAttempt,
        kicker: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) field goal/i),
        yardLine: play.yard_line,
        isGood: !playText.includes('NO GOOD') && !playText.includes('MISSED'),
        isBlocked: playText.includes('BLOCKED'),
        isReturned: playText.includes('RETURN'),
        returnTeam: play.defense,
        returnYards: 0, // Would need to parse play text for this
      });

    case 'EXTRA POINT':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.ExtraPointAttempt,
        kicker: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) extra point/i),
        isGood: !playText.includes('NO GOOD') && !playText.includes('MISSED'),
        isBlocked: playText.includes('BLOCKED'),
        isReturned: playText.includes('RETURN'),
        returnTeam: play.defense,
        returnYards: 0, // Would need to parse play text for this
      });

    case 'TWO POINT CONVERSION':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.TwoPointConversionAttempt,
        isSuccessful: playText.includes('SUCCESS'),
        isInterception: playText.includes('INTERCEPTED'),
        isFumble: playText.includes('FUMBLE'),
        returnTeam: play.defense,
        returnYards: 0, // Would need to parse play text for this
        isReturnTouchdown: playText.includes('TOUCHDOWN'),
      });

    case 'PENALTY':
      return makeSuccessResult({
        ...basePlay,
        type: PlayType.Penalty,
        player: extractPlayerName(/([A-Z]+(?:\s[A-Z]+)*) penalty/i),
        yardage: play.yards_gained,
      });

    case 'END PERIOD':
    case 'END OF HALF':
    case 'END OF GAME':
    case 'TIMEOUT':
    case 'FUMBLE RECOVERY (OWN)':
    case 'KICKOFF RETURN (OFFENSE)':
      logger.warn('Skipping play:', play);
      return makeSuccessResult(null);

    default:
      return makeErrorResult(new Error(`Unknown play type: ${playTypeText}`));
  }
}
