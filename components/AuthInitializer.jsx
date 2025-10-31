import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './ui/LoadingScreen';

const AuthInitializer = ({ children }) => {
  const { initialize, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  // Only block rendering while the auth system is performing its initial
  // check (reading tokens + validating profile). Don't use the shared
  // `loading` flag here because it is toggled for other auth operations
  // (login/register/refresh) and would incorrectly cover the app with the
  // "Initializing..." UI during normal auth calls.
  if (!initialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  return children;
};

export default AuthInitializer;
