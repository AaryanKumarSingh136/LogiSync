import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '../types';
import api from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<string>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'logisync_token';

function toAuthUser(data: any): AuthUser {
  return {
    sub: data.id, email: data.email, name: data.full_name, role: data.role,
    groups: [data.role], assigned_port_id: data.assigned_port_id,
    must_change_password: data.must_change_password,
    vehicle_number: data.vehicle_number ?? null, vehicle_type: data.vehicle_type ?? null,
    mobile_number: data.mobile_number ?? null,
  } as AuthUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    try {
      const { data } = await api.get('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } });
      setUser(toAuthUser(data));
      setToken(t);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => { if (token && !user) refreshMe(); }, [token, user, refreshMe]);

  const login = useCallback(async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    // Clear any stale session (e.g. previous fleet_manager) before authenticating
    // so the UI never renders the old role while the new /me resolves.
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    try {
      const { data } = await api.post('/api/auth/login', { identifier, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      await refreshMe();
      // fetch fresh since refreshMe is async
      const me = await api.get('/api/auth/me', { headers: { Authorization: `Bearer ${data.access_token}` } });
      const u = toAuthUser(me.data);
      setUser(u);
      return me.data.role as string;
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Login failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshMe]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return <AuthContext.Provider value={{ user, token, isLoading, error, login, logout, refreshMe }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
