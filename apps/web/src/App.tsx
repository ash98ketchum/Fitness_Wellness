import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LoadingSequence from './pages/LoadingSequence';
import ExpertReport from './pages/ExpertReport';
import Planner from './pages/Planner';
import MealDetail from './pages/MealDetail';
import { Chatbot } from './components/Chatbot';
import { Splash } from './components/Splash';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease-in' }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/loading" element={<ProtectedRoute><LoadingSequence /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
          <Route path="/meal/:id" element={<ProtectedRoute><MealDetail /></ProtectedRoute>} />
          <Route path="/expert-report" element={<ProtectedRoute><ExpertReport /></ProtectedRoute>} />
        </Routes>
        <Chatbot />
      </AuthProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
