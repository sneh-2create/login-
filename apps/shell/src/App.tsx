import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@od-erp/store';
import { LoadingState } from '@od-erp/ui';

const Layout = lazy(() => import('./components/Layout').then(module => ({ default: module.Layout })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute').then(module => ({ default: module.ProtectedRoute })));
const PublicRoute = lazy(() => import('./components/PublicRoute').then(module => ({ default: module.PublicRoute })));

// Placeholder pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
const AdmissionPage = lazy(() => import('./pages/AdmissionPage').then(module => ({ default: module.AdmissionPage })));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then(module => ({ default: module.SuperAdminDashboard })));

// Module Pages
const FeePage = lazy(() => import('./pages/FeePage').then(module => ({ default: module.FeePage })));
const AcademicPage = lazy(() => import('./pages/AcademicPage').then(module => ({ default: module.AcademicPage })));
const ExamPage = lazy(() => import('./pages/ExamPage').then(module => ({ default: module.ExamPage })));
const HRMPage = lazy(() => import('./pages/HRMPage').then(module => ({ default: module.HRMPage })));
const BackOfficePage = lazy(() => import('./pages/BackOfficePage').then(module => ({ default: module.BackOfficePage })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then(module => ({ default: module.TemplatesPage })));


const App: React.FC = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingState />} persistor={persistor}>
                <Suspense fallback={<LoadingState />}>
                    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <Routes>
                            {/* Public Route (Redirects to dashboard if logged in) */}
                            <Route element={<PublicRoute />}>
                                <Route path="/login" element={<Login />} />
                            </Route>

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="dashboard" element={<SuperAdminDashboard />} />
                                    <Route path="entity/dashboard" element={<Dashboard />} />
                                    <Route path="admission/*" element={<AdmissionPage />} />
                                    <Route path="fee/*" element={<FeePage />} />
                                    <Route path="academic/*" element={<AcademicPage />} />
                                    <Route path="exam/*" element={<ExamPage />} />
                                    <Route path="hrm/*" element={<HRMPage />} />
                                    <Route path="back-office/*" element={<BackOfficePage />} />
                                    <Route path="templates/*" element={<TemplatesPage />} />
                                    <Route path="*" element={<NotFound />} />
                                </Route>
                            </Route>
                        </Routes>
                    </Router>
                </Suspense>
            </PersistGate>
        </Provider>
    );
};

export default App;
