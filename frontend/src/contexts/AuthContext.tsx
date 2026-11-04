import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  collegeBranch: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginAsGuest: () => {},
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
    // Default to Guest Demo mode so user can immediately use all features
    return DEMO_GUEST_USER;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('snap2learn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('snap2learn_user');
    }
  }, [user]);

  const loginAsGuest = () => {
    setUser(DEMO_GUEST_USER);
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate/perform Supabase client or local session authentication
      await new Promise((r) => setTimeout(r, 600));
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Please enter a valid email and minimum 6-character password');
      }
      const loggedIn: UserProfile = {
        id: `usr-${btoa(email).slice(0, 8)}`,
        email,
        displayName: email.split('@')[0],
        collegeBranch: 'CSE-AIML',
        isGuest: false,
      };
      setUser(loggedIn);
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Please enter a valid email and minimum 6-character password');
      }
      const newUser: UserProfile = {
        id: `usr-${btoa(email).slice(0, 8)}`,
        email,
        displayName: name || email.split('@')[0],
        collegeBranch: 'CSE-AIML',
        isGuest: false,
      };
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAsGuest,
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
