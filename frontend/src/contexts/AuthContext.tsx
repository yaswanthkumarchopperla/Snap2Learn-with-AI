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
  sendOtp: (email: string, name?: string) => Promise<string>;
  verifyOtp: (email: string, otp: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  sendOtp: async () => '',
  verifyOtp: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate active JWT session on startup with backend
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedToken = localStorage.getItem('snap2learn_token');
      const storedUser = localStorage.getItem('snap2learn_user');

      if (!storedToken || !storedUser) {
        // No authenticated session
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        // Do not accept old or legacy guest demo sessions as authenticated
        if (parsedUser.isGuest) {
          throw new Error('Guest session not permitted');
        }

        // Verify token authenticity against backend
        const verifiedProfile = await api.getMe(storedToken);
        if (isMounted && verifiedProfile && !verifiedProfile.is_guest) {
          const validUser: UserProfile = {
            id: verifiedProfile.id,
            email: verifiedProfile.email,
            displayName: verifiedProfile.name,
            collegeBranch: verifiedProfile.college_branch || 'CSE (AI & ML)',
            isGuest: false,
            token: storedToken,
          };
          setUser(validUser);
          localStorage.setItem('snap2learn_user', JSON.stringify(validUser));
        } else {
          throw new Error('Invalid user profile');
        }
      } catch (err) {
        // If token is expired, invalid, or guest, clear session
        localStorage.removeItem('snap2learn_token');
        localStorage.removeItem('snap2learn_user');
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

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
      const authenticatedUser: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.name,
        collegeBranch: res.user.college_branch || 'CSE (AI & ML)',
        isGuest: false,
        token: res.token,
      };
      localStorage.setItem('snap2learn_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
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
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
