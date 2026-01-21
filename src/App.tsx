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
  const [checkingWaiver, setCheckingWaiver] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      setCheckingAdmin(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsAdmin(data?.role === 'admin' && !error);
      } catch (error: unknown) {
        const appError = handleError(error);
        logError(appError, 'App.checkAdminStatus');
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Check if user has completed waiver
  useEffect(() => {
    const checkWaiver = async () => {
      if (!user || isAdmin) return; // Admins don't need waivers

      setCheckingWaiver(true);
      try {
        const { data, error } = await supabase
          .from('waivers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        setHasWaiver(!!data && !error);
      } catch (error: unknown) {
        const appError = handleError(error);
        logError(appError, 'App.checkWaiver');
        setHasWaiver(false);
      } finally {
        setCheckingWaiver(false);
      }
    };

    checkWaiver();
  }, [user, isAdmin]);

  // Handle app state transitions
  useEffect(() => {
    if (loading || checkingWaiver || checkingAdmin) return;

    if (!user) {
      setAppState('auth');
    } else if (isAdmin) {
      setAppState('admin');
    } else if (!hasWaiver) {
      setAppState('waiver');
    } else {
      setAppState('dashboard');
    }
  }, [user, hasWaiver, isAdmin, loading, checkingWaiver, checkingAdmin]);

  const handleWaiverComplete = () => {
    setHasWaiver(true);
    setAppState('dashboard');
  };

  if (loading || checkingWaiver || checkingAdmin) {
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