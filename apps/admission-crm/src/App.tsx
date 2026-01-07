import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdmissionSummaryReport from './pages/AdmissionSummaryReport/AdmissionSummaryReport';
import VacantSeatsReport from './pages/VacantSeatsReport/VacantSeatsReport';
import PrintVacantSeatsReport from './pages/VacantSeatsReport/PrintVacantSeatsReport';
import CounselorTagReport from './pages/CounselorTagReport';
import PrintCounselorTagReport from './pages/CounselorTagReport/PrintCounselorTagReport';

function App() {
    return (
        <BrowserRouter basename="/admission">
            <Routes>
                <Route path="/admissionSummaryReports" element={<AdmissionSummaryReport />} />
                <Route path="/vacentSeats" element={<VacantSeatsReport />} />
                <Route path="/counselorTagReport" element={<CounselorTagReport />} />
                <Route path="/print/vacantSeats" element={<PrintVacantSeatsReport />} />
                <Route path="/print/counselorTagReport" element={<PrintCounselorTagReport />} />
                <Route path="/" element={<Navigate to="/admissionSummaryReports" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
