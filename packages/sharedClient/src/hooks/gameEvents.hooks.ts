import type {GameEvent} from '@shared/types/gameEvents.types';
import {gameEventsService} from '@sharedClient/services/gameEvents.client';
import {useEffect, useRef, useState} from 'react';

interface UseGameEventsState {
  readonly gameEvents: readonly GameEvent[] | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const INITIAL_USE_GAME_EVENTS_STATE: UseGameEventsState = {
  gameEvents: null,
  isLoading: true,
  error: null,
};

export function useGameEvents(): UseGameEventsState {
  const isMounted = useRef(true);
  const [gameEventsState, setGameEventsState] = useState(INITIAL_USE_GAME_EVENTS_STATE);

  useEffect(() => {
    const go = async () => {
      const gameEventsResult = await gameEventsService.getForGame();

      if (!isMounted.current) return;

      if (gameEventsResult.success) {
        setGameEventsState({
          gameEvents: gameEventsResult.value,
          isLoading: false,
          error: null,
        });
      } else {
        setGameEventsState({
          gameEvents: null,
          isLoading: false,
          error: gameEventsResult.error,
        });
      }
    };

    void go();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return gameEventsState;
}
