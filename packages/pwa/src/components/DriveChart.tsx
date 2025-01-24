import {getDrives} from '@shared/lib/drives.shared';
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

  const drives = getDrives(gameEvents);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Drive Chart</h1>
      <div className="flex flex-col items-stretch w-full space-y-4">
        {drives?.map((drive, index) => (
          <div
            key={drive[0].gameEventId}
            className="flex flex-col bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <div className="text-lg font-semibold mb-2 text-blue-600">Drive #{index + 1}</div>
            <div className="space-y-2">
              {drive.map((gameEvent) => (
                <div
                  key={gameEvent.gameEventId}
                  className="px-3 py-2 bg-gray-50 rounded-md text-gray-700"
                >
                  {gameEvent.type}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
