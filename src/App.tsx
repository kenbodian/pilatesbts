import { useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { AuthPage } from './components/AuthPage';
import { WaiverForm } from './components/WaiverForm';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallBanner } from './components/InstallBanner';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { handleError, logError } from './utils/errorHandling';

interface MemberStatus {
  isAdmin: boolean;
  hasWaiver: boolean;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-foam flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sea mx-auto mb-4"></div>
        <p className="text-ink-2">Loading...</p>
      </div>
    </div>
  );
}

/** The login page. Everything else on the site sits behind it. */
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

function AdminRoute({ user }: { user: User }) {
  const navigate = useNavigate();
  return (
    <AdminDashboard
      user={user}
      onViewSite={() => navigate('/app/site')}
      onViewIntakeForm={() => navigate('/app/intake')}
    />
  );
}

function SiteRoute({ user, isAdmin }: { user: User; isAdmin: boolean }) {
  const navigate = useNavigate();
  return (
    <Dashboard
      user={user}
      isAdmin={isAdmin}
      onBackToAdmin={isAdmin ? () => navigate('/app/admin') : undefined}
    />
  );
}

function IntakeRoute({
  user,
  isAdmin,
  onWaiverComplete,
}: {
  user: User;
  isAdmin: boolean;
  onWaiverComplete: () => void;
}) {
  const navigate = useNavigate();
  return (
    <WaiverForm
      userEmail={user.email || ''}
      previewMode={isAdmin}
      onBackToAdmin={isAdmin ? () => navigate('/app/admin') : undefined}
      onComplete={() => {
        onWaiverComplete();
        // Admins previewing the intake form go back to the admin dashboard
        navigate(isAdmin ? '/app/admin' : '/app/site', { replace: true });
      }}
    />
  );
}

/**
 * Signed-in area. Loads the user's role and waiver status once, then routes:
 *   /app         -> admin dashboard, member site, or intake form by status
 *   /app/admin   -> admin dashboard (admins only)
 *   /app/site    -> member site (members need a waiver first; admins always)
 *   /app/intake  -> intake / waiver form (read-only preview for admins)
 */
function MemberArea() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<MemberStatus | null>(null);
  const [checkingUserData, setCheckingUserData] = useState(false);

  useEffect(() => {
    const checkUserData = async () => {
      if (!user) {
        setStatus(null);
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

        setStatus({
          isAdmin: adminResult.data?.role === 'admin' && !adminResult.error,
          hasWaiver: !!waiverResult.data && !waiverResult.error,
        });
      } catch (error: unknown) {
        const appError = handleError(error);
        logError(appError, 'App.checkUserData');
        // Fall back to the safest view: a regular member who still needs a waiver
        setStatus({ isAdmin: false, hasWaiver: false });
      } finally {
        setCheckingUserData(false);
      }
    };

    checkUserData();
  }, [user]);

  if (loading || checkingUserData || (user && !status)) {
    return <LoadingScreen />;
  }

  if (!user || !status) {
    return <Navigate to="/" replace />;
  }

  const { isAdmin, hasWaiver } = status;
  const markWaiverComplete = () =>
    setStatus((current) => (current ? { ...current, hasWaiver: true } : current));

  const landing = isAdmin ? '/app/admin' : hasWaiver ? '/app/site' : '/app/intake';

  return (
    <>
      <Routes>
        <Route index element={<Navigate to={landing} replace />} />
        <Route
          path="admin"
          element={isAdmin ? <AdminRoute user={user} /> : <Navigate to={landing} replace />}
        />
        <Route
          path="site"
          element={
            isAdmin || hasWaiver ? (
              <SiteRoute user={user} isAdmin={isAdmin} />
            ) : (
              <Navigate to="/app/intake" replace />
            )
          }
        />
        <Route
          path="intake"
          element={<IntakeRoute user={user} isAdmin={isAdmin} onWaiverComplete={markWaiverComplete} />}
        />
        <Route path="*" element={<Navigate to={landing} replace />} />
      </Routes>
      <InstallBanner />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/app/*" element={<MemberArea />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
