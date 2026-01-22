import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { WaiverForm } from './components/WaiverForm';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { handleError, logError } from './utils/errorHandling';

type AppState = 'auth' | 'waiver' | 'dashboard' | 'admin';

function App() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>('auth');
  const [hasWaiver, setHasWaiver] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingUserData, setCheckingUserData] = useState(false);

  // Combined user data check - runs both queries in parallel
  useEffect(() => {
    const checkUserData = async () => {
      if (!user) {
        setAppState('auth');
        setIsAdmin(false);
        setHasWaiver(false);
        return;
      }

      setCheckingUserData(true);

      try {
        // Run both queries in parallel for better performance
        const [adminResult, waiverResult] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('waivers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        // Check admin status
        const adminStatus = adminResult.data?.role === 'admin' && !adminResult.error;
        setIsAdmin(adminStatus);

        // Check waiver status (admins don't need waivers)
        const waiverStatus = !!waiverResult.data && !waiverResult.error;
        setHasWaiver(waiverStatus);

        // Determine app state
        if (adminStatus) {
          setAppState('admin');
        } else if (!waiverStatus) {
          setAppState('waiver');
        } else {
          setAppState('dashboard');
        }
      } catch (error: unknown) {
        const appError = handleError(error);
        logError(appError, 'App.checkUserData');
        setIsAdmin(false);
        setHasWaiver(false);
        setAppState('auth');
      } finally {
        setCheckingUserData(false);
      }
    };

    checkUserData();
  }, [user]);

  const handleWaiverComplete = () => {
    setHasWaiver(true);
    setAppState('dashboard');
  };

  if (loading || checkingUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (appState) {
      case 'auth':
        return <AuthPage />;
      case 'waiver':
        return (
          <WaiverForm
            onComplete={handleWaiverComplete}
            userEmail={user?.email || ''}
          />
        );
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'dashboard':
        return <Dashboard user={user} />;
      default:
        return <AuthPage />;
    }
  };

  return <ErrorBoundary>{renderContent()}</ErrorBoundary>;
}

export default App;