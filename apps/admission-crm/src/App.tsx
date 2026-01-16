import { Routes, Route, Navigate } from 'react-router-dom';
import AdmissionSummaryReport from './pages/AdmissionSummaryReport/AdmissionSummaryReport';
import VacantSeatsReport from './pages/VacantSeatsReport/VacantSeatsReport';
import PrintVacantSeatsReport from './pages/VacantSeatsReport/PrintVacantSeatsReport';
import CounselorTagReport from './pages/CounselorTagReport';
import PrintCounselorTagReport from './pages/CounselorTagReport/PrintCounselorTagReport';
import SourceWiseReport from './pages/SourceWiseReport/SourceWiseReport';
import PrintSourceWiseReport from './pages/SourceWiseReport/PrintSourceWiseReport';
import CourseWiseTagReport from './pages/courseWiseTagReport/courseWiseTagReport';
import PrintCourseWiseTagReport from './pages/courseWiseTagReport/printCourseWiseTagReport';
import NepSubjectReport from './pages/NepSubjectReport/NepSubjectReport';
import PrintNepSubjectReport from './pages/NepSubjectReport/PrintNepSubjectReport';
import CounselorProductivityReport from './pages/CounselorProductivityReport/CounselorProductivityReport';
import PrintCounselorProductivityReport from './pages/CounselorProductivityReport/PrintCounselorProductivityReport';
import AdmissionLeadLogs from './pages/AdmissionLeadLogs/AdmissionLeadLogs';
import AdmissionFollowUps from './pages/AdmissionFollowUps/AdmissionFollowUps';
import AdmissionLeads from './pages/AdmissionLeads/AdmissionLeads';
import AdmissionStudentData from './pages/AdmissionStudentData/AdmissionStudentData';
import AdmissionTransactionPage from './pages/AdmissionTransaction/AdmissionTransaction';
import DailyCollectionReportPage from './pages/DailyCollectionReport/DailyCollectionReport';
import { QueryClientProvider, queryClient } from '@od-erp/query';

function App() {
    return (
        <QueryClientProvider client={queryClient}>
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
                <Route path="/nepSubjectReport" element={<NepSubjectReport />} />
                <Route path="/print/nepSubjectReport" element={<PrintNepSubjectReport />} />
                <Route path="/counselorProductivityReport" element={<CounselorProductivityReport />} />
                <Route path="/print/counselorProductivityReport" element={<PrintCounselorProductivityReport />} />
                <Route path="/admissionLeadLogs" element={<AdmissionLeadLogs />} />
                <Route path="/followUps" element={<AdmissionFollowUps />} />
                <Route path="/admissionLeads" element={<AdmissionLeads />} />
                <Route path="/studentData" element={<AdmissionStudentData />} />
                <Route path="/transaction" element={<AdmissionTransactionPage />} />
                <Route path="/dailyCollectionReport" element={<DailyCollectionReportPage />} />
                <Route path="/" element={<Navigate to="/admissionSummaryReports" replace />} />
            </Routes>
        </QueryClientProvider>
    );
}

export default App;
