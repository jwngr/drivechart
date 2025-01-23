import {DriveChart} from '@src/components/DriveChart';
import type React from 'react';
import {StrictMode} from 'react';

export const App: React.FC = () => {
  return (
    <StrictMode>
      <DriveChart />
    </StrictMode>
  );
};
