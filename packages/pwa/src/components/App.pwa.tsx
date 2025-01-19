import type React from 'react';
import {StrictMode} from 'react';

export const App: React.FC = () => {
  return (
    <StrictMode>
      {/* <ErrorBoundary fallback={(error) => <ErrorScreen error={error} />}> */}
      <p>Hello world</p>
      {/* </ErrorBoundary> */}
    </StrictMode>
  );
};
