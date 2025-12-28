import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@od-erp/store';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

// Placeholder pages
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { AdmissionPage } from './pages/AdmissionPage';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="admission/*" element={<AdmissionPage />} />
                            <Route path="fee/*" element={<div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Fee Module</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                            <Route path="academic/*" element={<div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Academic Module</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                            <Route path="exam/*" element={<div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Exam/COE Module</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                            <Route path="hrm/*" element={<div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">HRM Module</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                            <Route path="back-office/*" element={<div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Back Office</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                            <Route path="templates/*" element={<div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Document Templates</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </Provider>
    );
};

export default App;
