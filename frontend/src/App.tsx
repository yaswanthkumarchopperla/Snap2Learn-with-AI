import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AutosaveProvider } from './contexts/AutosaveContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { ExplainPage } from './pages/ExplainPage';
import { ChatPage } from './pages/ChatPage';
import { QuizPage } from './pages/QuizPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotesPage } from './pages/NotesPage';
import { SettingsPage } from './pages/SettingsPage';

// Default entry root router: routes authenticated students to /dashboard, unauthenticated visitors to Framer MCP LandingPage
const RootEntryRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-neutral-400">Loading Framer MCP...</p>
      </div>
    );
  }

  return user && !user.isGuest ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <LandingPage />
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AutosaveProvider>
          <BrowserRouter>
            <Routes>
            {/* Default entry point: LandingPage for visitors, Dashboard for authenticated */}
            <Route path="/" element={<RootEntryRedirect />} />

            {/* Framer MCP Landing Page Direct Routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/mcp" element={<LandingPage />} />

            {/* Authentication (Login & Register via Brevo Email OTP) */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Student Workspace Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scanner"
              element={
                <ProtectedRoute>
                  <ScannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/explain"
              element={
                <ProtectedRoute>
                  <ExplainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <FlashcardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback to Default Entry Point */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AutosaveProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
