import { Routes, Route, Navigate } from 'react-router-dom';
import AdmissionSummaryReport from './pages/admissionSummaryReport/admissionSummaryReport';
import PrintAdmissionSummaryReport from './pages/admissionSummaryReport/printAdmissionSummaryReport';
import VacantSeatsReport from './pages/vacantSeatsReport/vacantSeatsReport';
import PrintVacantSeatsReport from './pages/vacantSeatsReport/printVacantSeatsReport';
import CounselorTagReport from './pages/counselorTagReport';
import PrintCounselorTagReport from './pages/counselorTagReport/printCounselorTagReport';
import SourceWiseReport from './pages/sourceWiseReport/sourceWiseReport';
import PrintSourceWiseReport from './pages/sourceWiseReport/printSourceWiseReport';
import CourseWiseTagReport from './pages/courseWiseTagReport/courseWiseTagReport';
import PrintCourseWiseTagReport from './pages/courseWiseTagReport/printCourseWiseTagReport';
import NepSubjectReport from './pages/nepSubjectReport/nepSubjectReport';
import PrintNepSubjectReport from './pages/nepSubjectReport/printNepSubjectReport';
import CounselorProductivityReport from './pages/counselorProductivityReport/counselorProductivityReport';
import PrintCounselorProductivityReport from './pages/counselorProductivityReport/printCounselorProductivityReport';
import AdmissionLeadLogs from './pages/admissionLeadLogs/admissionLeadLogs';
import AdmissionFollowUps from './pages/admissionFollowUps/admissionFollowUps';
import AdmissionLeads from './pages/admissionLeads/admissionLeads';
import AdmissionStudentData from './pages/admissionStudentData/admissionStudentData';
import AdmissionTransactionPage from './pages/admissionTransaction/admissionTransaction';
import DailyCollectionReportPage from './pages/dailyCollectionReport/dailyCollectionReport';
import PrintDailyCollectionReport from './pages/dailyCollectionReport/printDailyCollectionReport';
import PrintAdmissionTransaction from './pages/admissionTransaction/printAdmissionTransaction';
import PrintAdmissionStudentData from './pages/admissionStudentData/printAdmissionStudentData';
import { QueryClientProvider, queryClient } from '@od-erp/query';

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Routes>
                <Route path="/admissionSummaryReports" element={<AdmissionSummaryReport />} />
                <Route path="/print/admissionSummaryReport" element={<PrintAdmissionSummaryReport />} />
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
                <Route path="/print/admissionStudentData" element={<PrintAdmissionStudentData />} />
                <Route path="/transaction" element={<AdmissionTransactionPage />} />
                <Route path="/print/admissionTransaction" element={<PrintAdmissionTransaction />} />
                <Route path="/dailyCollectionReport" element={<DailyCollectionReportPage />} />
                <Route path="/print/dailyCollectionReport" element={<PrintDailyCollectionReport />} />
                <Route path="/" element={<Navigate to="/admissionSummaryReports" replace />} />
            </Routes>
        </QueryClientProvider>
    );
}

export default App;
