import type {Play} from '@shared/types/plays.types';
import {playsService} from '@sharedClient/services/plays.client';
import {useEffect, useState} from 'react';

interface UsePlaysState {
  readonly plays: readonly Play[] | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const INITIAL_USE_PLAYS_STATE: UsePlaysState = {
  plays: null,
  isLoading: true,
  error: null,
};

export function usePlays(): UsePlaysState {
  const [playsState, setPlaysState] = useState(INITIAL_USE_PLAYS_STATE);

  useEffect(() => {
    const go = async () => {
      const playsResult = await playsService.getForGame();
      if (playsResult.success) {
        setPlaysState({
          plays: playsResult.value,
          isLoading: false,
          error: null,
        });
      } else {
        setPlaysState({
          plays: null,
          isLoading: false,
          error: playsResult.error,
        });
      }
    };
    void go();
  }, []);

  return playsState;
}
