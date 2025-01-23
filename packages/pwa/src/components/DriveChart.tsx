import {usePlays} from '@sharedClient/hooks/plays.hooks';
import type React from 'react';

export const DriveChart: React.FC = () => {
  const {plays, isLoading, error} = usePlays();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center border-4 border-red-500">
      <p className="text-3xl font-bold underline">Drive chart</p>
      <div className="flex flex-col items-center justify-center">
        {plays?.map((play) => <div key={play.playId}>{play.type}</div>)}
      </div>
    </div>
  );
};
