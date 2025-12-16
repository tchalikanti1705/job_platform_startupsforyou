import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import '@/App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Tracker from './pages/Tracker';
import Startups from './pages/Startups';
import Insights from './pages/Insights';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Router component that handles auth callback detection
function AppRouter() {
  const location = useLocation();
  
  // Check for session_id in URL fragment synchronously
  // This must be checked BEFORE rendering normal routes
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected Routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <ProtectedRoute>
            <JobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracker"
        element={
          <ProtectedRoute>
            <Tracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/startups"
        element={
          <ProtectedRoute>
            <Startups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <Insights />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;
