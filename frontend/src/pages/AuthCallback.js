import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { exchangeSession } = useAuthStore();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      // Get session_id from URL fragment
      const hash = window.location.hash;
      const sessionId = new URLSearchParams(hash.substring(1)).get('session_id');

      if (!sessionId) {
        console.error('No session_id found');
        navigate('/login');
        return;
      }

      // Exchange session_id for our session
      const result = await exchangeSession(sessionId);

      // Clear the URL fragment
      window.history.replaceState(null, '', window.location.pathname);

      if (result.success) {
        if (result.user.onboarding_completed) {
          navigate('/home', { state: { user: result.user } });
        } else {
          navigate('/onboarding', { state: { user: result.user } });
        }
      } else {
        navigate('/login');
      }
    };

    processAuth();
  }, [exchangeSession, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
