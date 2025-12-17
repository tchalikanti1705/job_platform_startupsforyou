import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Tracker from './pages/Tracker';
import Startups from './pages/Startups';
import Insights from './pages/Insights';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Router component that handles routing
function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
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
