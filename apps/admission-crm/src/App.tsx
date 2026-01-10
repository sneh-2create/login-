import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdmissionSummaryReport from './pages/admissionSummaryReport/admissionSummaryReport';
import VacantSeatsReport from './pages/vacantSeatsReport/vacantSeatsReport';
import PrintVacantSeatsReport from './pages/vacantSeatsReport/printVacantSeatsReport';
import CounselorTagReport from './pages/counselorTagReport';
import PrintCounselorTagReport from './pages/counselorTagReport/printCounselorTagReport';
import SourceWiseReport from './pages/sourceWiseReport';
import PrintSourceWiseReport from './pages/sourceWiseReport/printSourceWiseReport';
import CourseWiseTagReport from './pages/courseWiseTagReport/courseWiseTagReport';
import PrintCourseWiseTagReport from './pages/courseWiseTagReport/printCourseWiseTagReport';
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
                    <Route path="/courseWiseTagReport" element={<CourseWiseTagReport />} />
                    <Route path="/print/courseWiseTagReport" element={<PrintCourseWiseTagReport />} />
                    <Route path="/" element={<Navigate to="/admissionSummaryReports" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
