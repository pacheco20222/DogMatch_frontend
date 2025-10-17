import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './ui/LoadingScreen';

const AuthInitializer = ({ children }) => {
  const { initialize, loading, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  if (!initialized || loading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return children;
};

export default AuthInitializer;
