import {useGameEvents} from '@sharedClient/hooks/gameEvents.hooks';
import type React from 'react';

export const DriveChart: React.FC = () => {
  const {gameEvents, isLoading, error} = useGameEvents();

  if (isLoading || !gameEvents) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (gameEvents.length === 0) {
    return <div>No game events found</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center border-4 border-red-500">
      <p className="text-3xl font-bold underline">Drive chart</p>
      <div className="flex flex-col items-center justify-center">
        {gameEvents?.map((gameEvent) => <div key={gameEvent.gameEventId}>{gameEvent.type}</div>)}
      </div>
    </div>
  );
};
