import { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage } from './components/AuthPage';
import { WaiverForm } from './components/WaiverForm';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallBanner } from './components/InstallBanner';
import { PublicHomePage } from './components/PublicHomePage';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { handleError, logError } from './utils/errorHandling';

type MemberView = 'waiver' | 'dashboard' | 'admin';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function MemberArea() {
  const { user, loading } = useAuth();
  const [memberView, setMemberView] = useState<MemberView | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingUserData, setCheckingUserData] = useState(false);

  useEffect(() => {
    const checkUserData = async () => {
      if (!user) {
        setMemberView(null);
        setIsAdmin(false);
        return;
      }

      setCheckingUserData(true);

      try {
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

        const adminStatus = adminResult.data?.role === 'admin' && !adminResult.error;
        const waiverStatus = !!waiverResult.data && !waiverResult.error;

        setIsAdmin(adminStatus);

        if (adminStatus) {
          setMemberView('admin');
        } else if (!waiverStatus) {
          setMemberView('waiver');
        } else {
          setMemberView('dashboard');
        }
      } catch (error: unknown) {
        const appError = handleError(error);
        logError(appError, 'App.checkUserData');
        setMemberView(null);
        setIsAdmin(false);
      } finally {
        setCheckingUserData(false);
      }
    };

    checkUserData();
  }, [user]);

  const handleWaiverComplete = () => {
    // Admins previewing the intake form go back to the admin dashboard
    setMemberView(isAdmin ? 'admin' : 'dashboard');
  };

  const backToAdmin = isAdmin ? () => setMemberView('admin') : undefined;

  if (loading || checkingUserData) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (memberView === 'waiver') {
    return (
      <>
        <WaiverForm
          onComplete={handleWaiverComplete}
          userEmail={user.email || ''}
          previewMode={isAdmin}
          onBackToAdmin={backToAdmin}
        />
        <InstallBanner />
      </>
    );
  }

  return (
    <>
      {memberView === 'admin' ? (
        <AdminDashboard
          user={user}
          onViewSite={() => setMemberView('dashboard')}
          onViewIntakeForm={() => setMemberView('waiver')}
        />
      ) : (
        <Dashboard user={user} isAdmin={isAdmin} onBackToAdmin={backToAdmin} />
      )}
      <InstallBanner />
    </>
  );
}

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <AuthPage />;
}

function HomeRoute() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  return <PublicHomePage />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/app" element={<MemberArea />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
