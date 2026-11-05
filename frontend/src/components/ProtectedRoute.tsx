import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg animate-pulse mb-4">
          <div className="w-full h-full bg-[#080B18] rounded-[14px] flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-secondary animate-bounce" />
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">Snap2Learn AI</p>
        <p className="text-xs text-foreground-muted mt-1">Verifying secure student session...</p>
      </div>
    );
  }

  // Redirect to authentication page if no active authenticated user session exists
  if (!user || user.isGuest) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

