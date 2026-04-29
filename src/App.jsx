import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import GuidanceProvider from '@/lib/GuidanceContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import RequireAuth from './components/shared/RequireAuth';

// Lazy load heavy routes
const Forums = lazy(() => import('./pages/Forums'));
const Profile = lazy(() => import('./pages/Profile'));
const Donate = lazy(() => import('./pages/Donate'));
const About = lazy(() => import('./pages/About'));
const Social = lazy(() => import('./pages/Social'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const Legal = lazy(() => import('./pages/Legal'));
const Live = lazy(() => import('./pages/Live'));
const Bible = lazy(() => import('./pages/Bible'));
const BiblePlansMain = lazy(() => import('./pages/BiblePlansMain'));
const Moderation = lazy(() => import('./pages/Moderation'));
const Discovery = lazy(() => import('./pages/Discovery'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Games = lazy(() => import('./pages/Games.jsx'));
const Prayer = lazy(() => import('./pages/Prayer'));
const Inventory = lazy(() => import('./pages/Inventory'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  const LoadingFallback = (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/forums" element={<RequireAuth><Suspense fallback={LoadingFallback}><Forums /></Suspense></RequireAuth>} />
        <Route path="/donate" element={<RequireAuth><Suspense fallback={LoadingFallback}><Donate /></Suspense></RequireAuth>} />
        <Route path="/about" element={<RequireAuth><Suspense fallback={LoadingFallback}><About /></Suspense></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><Suspense fallback={LoadingFallback}><Social /></Suspense></RequireAuth>} />
        <Route path="/admin/content" element={<RequireAuth><Suspense fallback={LoadingFallback}><AdminContent /></Suspense></RequireAuth>} />
        <Route path="/legal" element={<RequireAuth><Suspense fallback={LoadingFallback}><Legal /></Suspense></RequireAuth>} />
        <Route path="/live" element={<RequireAuth><Suspense fallback={LoadingFallback}><Live /></Suspense></RequireAuth>} />
        <Route path="/bible" element={<RequireAuth><Suspense fallback={LoadingFallback}><Bible /></Suspense></RequireAuth>} />
        <Route path="/bible-plans" element={<RequireAuth><Suspense fallback={LoadingFallback}><BiblePlansMain /></Suspense></RequireAuth>} />
        <Route path="/bible-plans/:planId" element={<RequireAuth><Suspense fallback={LoadingFallback}><BiblePlansMain /></Suspense></RequireAuth>} />
        <Route path="/bible-plans/:planId/:view" element={<RequireAuth><Suspense fallback={LoadingFallback}><BiblePlansMain /></Suspense></RequireAuth>} />
        <Route path="/moderation" element={<RequireAuth><Suspense fallback={LoadingFallback}><Moderation /></Suspense></RequireAuth>} />
        <Route path="/discover" element={<RequireAuth><Suspense fallback={LoadingFallback}><Discovery /></Suspense></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><Suspense fallback={LoadingFallback}><AdminPanel /></Suspense></RequireAuth>} />
        <Route path="/games" element={<RequireAuth><Suspense fallback={LoadingFallback}><Games /></Suspense></RequireAuth>} />
        <Route path="/prayer" element={<RequireAuth><Suspense fallback={LoadingFallback}><Prayer /></Suspense></RequireAuth>} />
        <Route path="/inventory" element={<RequireAuth><Suspense fallback={LoadingFallback}><Inventory /></Suspense></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Suspense fallback={LoadingFallback}><Profile /></Suspense></RequireAuth>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <ThemeProvider>
      <GuidanceProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </GuidanceProvider>
    </ThemeProvider>
  )
}

export default App