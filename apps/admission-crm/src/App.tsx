import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdmissionSummaryReport from './pages/AdmissionSummaryReport/AdmissionSummaryReport';
import VacantSeatsReport from './pages/VacantSeatsReport/VacantSeatsReport';
import PrintVacantSeatsReport from './pages/VacantSeatsReport/PrintVacantSeatsReport';
import CounselorTagReport from './pages/CounselorTagReport';
import PrintCounselorTagReport from './pages/CounselorTagReport/PrintCounselorTagReport';
import SourceWiseReport from './pages/SourceWiseReport';
import PrintSourceWiseReport from './pages/SourceWiseReport/PrintSourceWiseReport';
import { QueryClientProvider, queryClient } from '@od-erp/query';

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter basename="/admission">
                <Routes>
                    <Route path="/admissionSummaryReports" element={<AdmissionSummaryReport />} />
                    <Route path="/vacentSeats" element={<VacantSeatsReport />} />
                    <Route path="/counselorTagReport" element={<CounselorTagReport />} />
                    <Route path="/print/vacantSeats" element={<PrintVacantSeatsReport />} />
                    <Route path="/print/counselorTagReport" element={<PrintCounselorTagReport />} />
                    <Route path="/sourceWiseReport" element={<SourceWiseReport />} />
                    <Route path="/print/sourceWiseReport" element={<PrintSourceWiseReport />} />
                    <Route path="/" element={<Navigate to="/admissionSummaryReports" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
