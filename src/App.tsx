import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Container } from '@mui/material';
import { ThemeProvider } from './utils/ThemeContext';
import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Reference from './pages/Reference';
import LoginPage from './components/auth/LoginPage';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import Leaderboard from './components/Leaderboard';
import AccountSettings from './pages/AccountSettings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        {user && <Navigation />}
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/learn" element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            } />
            <Route path="/reference" element={
              <ProtectedRoute>
                <Reference />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
