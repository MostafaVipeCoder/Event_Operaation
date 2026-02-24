import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy Loaded Components
const Dashboard = lazy(() => import('./components/Dashboard'));
const AgendaViewer = lazy(() => import('./components/AgendaViewer'));
const EventBuilder = lazy(() => import('./components/EventBuilder'));
const CompaniesPage = lazy(() => import('./components/CompaniesPage'));
const EventDashboard = lazy(() => import('./components/EventDashboard'));
const ExpertManager = lazy(() => import('./components/ExpertManager'));
const StartupManager = lazy(() => import('./components/StartupManager'));
const SubmissionManager = lazy(() => import('./components/SubmissionManager'));
const StartupViewer = lazy(() => import('./components/StartupViewer'));
const ExpertViewer = lazy(() => import('./components/ExpertViewer'));
const CompanyPortal = lazy(() => import('./components/CompanyPortal'));
const ExpertPortal = lazy(() => import('./components/ExpertPortal'));
const FormEditor = lazy(() => import('./components/FormEditor'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const EventVisualManager = lazy(() => import('./components/EventVisualManager'));
const SelectionProcessManager = lazy(() => import('./components/SelectionProcessManager'));

import PublicLayout from './components/PublicLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Modern Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-6 font-manrope">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={24} />
    </div>
    <div className="mt-6 text-center">
      <p className="text-lg font-black text-slate-800 tracking-tight">Loading Portal</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Please wait a moment</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/companies" element={
              <ProtectedRoute>
                <CompaniesPage />
              </ProtectedRoute>
            } />

            {/* Event Hub */}
            <Route path="/event/:eventId" element={
              <ProtectedRoute>
                <EventDashboard />
              </ProtectedRoute>
            } />

            <Route path="/event/:eventId/forms" element={
              <ProtectedRoute>
                <FormEditor />
              </ProtectedRoute>
            } />

            <Route path="/event/:eventId/visuals" element={
              <ProtectedRoute>
                <EventVisualManager />
              </ProtectedRoute>
            } />

            {/* Modules */}
            <Route path="/event/:eventId/agenda" element={
              <ProtectedRoute>
                <BuilderWrapper />
              </ProtectedRoute>
            } />

            <Route path="/event/:eventId/experts" element={
              <ProtectedRoute>
                <ExpertManager />
              </ProtectedRoute>
            } />

            <Route path="/event/:eventId/startups" element={
              <ProtectedRoute>
                <StartupManager />
              </ProtectedRoute>
            } />

            <Route path="/event/:eventId/submissions" element={
              <ProtectedRoute>
                <SubmissionManager />
              </ProtectedRoute>
            } />

            <Route path="/event/:eventId/selection" element={
              <ProtectedRoute>
                <SelectionProcessManager />
              </ProtectedRoute>
            } />

            {/* Public Portal */}
            <Route element={<PublicLayout />}>
              <Route path="/agenda/:eventId" element={<ViewerWrapper />} />
              <Route path="/view/:eventId/experts" element={<ExpertViewer />} />
              <Route path="/view/:eventId/startups" element={<StartupViewer />} />
            </Route>

            {/* Registration Portals (No Authentication Required, No Layout/Nav) */}
            <Route path="/events/:eventId/register/company" element={<CompanyPortal />} />
            <Route path="/events/:eventId/register/expert" element={<ExpertPortal />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

// Wrappers to handle params
function BuilderWrapper() {
  const { eventId } = useParams();
  return <EventBuilder event={{ event_id: eventId }} onBack={() => window.history.back()} />;
}

function ViewerWrapper() {
  const { eventId } = useParams();
  return <AgendaViewer eventId={eventId} />;
}


export default App;