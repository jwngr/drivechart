import type React from 'react';
import {StrictMode} from 'react';

export const App: React.FC = () => {
  return (
    <StrictMode>
      {/* <ErrorBoundary fallback={(error) => <ErrorScreen error={error} />}> */}
      <p className="text-3xl font-bold underline">Hello world</p>
      {/* </ErrorBoundary> */}
    </StrictMode>
  );
};
