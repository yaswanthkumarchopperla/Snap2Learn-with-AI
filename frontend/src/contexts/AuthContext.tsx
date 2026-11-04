import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  collegeBranch: string;
  isGuest: boolean;
  token?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginAsGuest: () => Promise<void>;
  sendOtp: (email: string, name?: string) => Promise<string>;
  verifyOtp: (email: string, otp: string, name?: string) => Promise<void>;
  loginWithEmail: (email: string, password?: string) => Promise<void>;
  signupWithEmail: (email: string, password?: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginAsGuest: async () => {},
  sendOtp: async () => '',
  verifyOtp: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: () => {},
});

const DEMO_GUEST_USER: UserProfile = {
  id: 'guest-aiml-2026',
  email: 'student@aiml.college.edu',
  displayName: 'First-Year CSE-AIML Student',
  collegeBranch: 'CSE (AI & ML)',
  isGuest: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('snap2learn_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_GUEST_USER;
      }
    }
    return DEMO_GUEST_USER;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('snap2learn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('snap2learn_user');
      localStorage.removeItem('snap2learn_token');
    }
  }, [user]);

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      try {
        const res = await api.guestLogin();
        if (res.token) {
          localStorage.setItem('snap2learn_token', res.token);
        }
        setUser({
          id: res.user.id,
          email: res.user.email,
          displayName: res.user.name,
          collegeBranch: res.user.college_branch || 'CSE (AI & ML)',
          isGuest: true,
          token: res.token,
        });
      } catch {
        setUser(DEMO_GUEST_USER);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (email: string, name?: string): Promise<string> => {
    setIsLoading(true);
    try {
      const res = await api.sendOtp(email, name);
      return res.message;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string, name?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(email, otp, name);
      if (res.token) {
        localStorage.setItem('snap2learn_token', res.token);
      }
      const verifiedUser: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.name,
        collegeBranch: res.user.college_branch || 'CSE (AI & ML)',
        isGuest: false,
        token: res.token,
      };
      setUser(verifiedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string) => {
    await sendOtp(email);
  };

  const signupWithEmail = async (email: string, _password?: string, name?: string) => {
    await sendOtp(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('snap2learn_user');
    localStorage.removeItem('snap2learn_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAsGuest,
        sendOtp,
        verifyOtp,
        loginWithEmail,
        signupWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
