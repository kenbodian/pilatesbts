import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { WaiverForm } from './components/WaiverForm';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

type AppState = 'landing' | 'auth' | 'auth-signin' | 'waiver' | 'dashboard' | 'admin';

function App() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>('landing');
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
      } catch (error) {
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
      } catch (error) {
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

    if (appState === 'landing') return; // Stay on landing until passcode entered

    if (!user) {
      setAppState('auth');
    } else if (isAdmin) {
      setAppState('admin');
    } else if (!hasWaiver) {
      setAppState('waiver');
    } else {
      setAppState('dashboard');
    }
  }, [user, hasWaiver, isAdmin, loading, checkingWaiver, checkingAdmin, appState]);

  const handlePasscodeSuccess = () => {
    if (!user) {
      setAppState('auth');
    } else if (isAdmin) {
      setAppState('admin');
    } else if (!hasWaiver) {
      setAppState('waiver');
    } else {
      setAppState('dashboard');
    }
  };

  const handleWaiverComplete = () => {
    setHasWaiver(true);
    setAppState('dashboard');
  };

  const handleBackToLanding = () => {
    setAppState('landing');
  };

  const handleGoToAuth = () => {
    setAppState('auth-signin');
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

  switch (appState) {
    case 'landing':
      return (
        <LandingPage
          onPasscodeSuccess={handlePasscodeSuccess}
          hasUser={!!user}
          onSkipToApp={user ? handlePasscodeSuccess : handleGoToAuth}
        />
      );
    case 'auth':
      return <AuthPage onBack={handleBackToLanding} />;
    case 'auth-signin':
      return <AuthPage onBack={handleBackToLanding} signInOnly />;
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
      return (
        <LandingPage
          onPasscodeSuccess={handlePasscodeSuccess}
          hasUser={!!user}
          onSkipToApp={user ? handlePasscodeSuccess : handleGoToAuth}
        />
      );
  }
}

export default App;