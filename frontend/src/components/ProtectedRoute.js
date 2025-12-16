import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    // If user data was passed from AuthCallback, skip auth check
    if (location.state?.user) {
      setChecking(false);
      return;
    }

    if (!isAuthenticated) {
      const verify = async () => {
        await checkAuth();
        setChecking(false);
      };
      verify();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, checkAuth, location.state]);

  // Show loading while checking auth
  if (checking || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if onboarding is needed (only redirect from home, not from all protected routes)
  // This allows users to skip onboarding and access the app
  if (user && !user.onboarding_completed && location.pathname === '/home') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
