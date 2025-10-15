import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { saveTokens, getTokens, clearTokens } from './storage';
import { apiFetch } from '../api/client';

export const AuthContext = createContext({
  user: null,
  accessToken: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { access } = await getTokens();
      if (access) {
        setAccessToken(access);
        try {
          const me = await apiFetch('/api/auth/me', { token: access });
          setUser(me?.user || me);
        } catch {
          await clearTokens();
          setAccessToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async ({ email, password, twoFactorCode }) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password, two_factor_code: twoFactorCode },
    });
    // Expecting: { access_token, refresh_token, user }
    await saveTokens({ access: data.access_token, refresh: data.refresh_token });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const refresh = async () => {
    const { refresh: refreshToken } = await getTokens();
    if (!refreshToken) throw new Error('No refresh token');
    const data = await apiFetch('/api/auth/refresh', {
      method: 'POST',
      body: {},
      token: refreshToken,
    });
    await saveTokens({ access: data.access_token });
    setAccessToken(data.access_token);
    return data.access_token;
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
    setAccessToken(null);
  };

  const value = useMemo(
    () => ({ user, accessToken, loading, login, logout, refresh }),
    [user, accessToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};