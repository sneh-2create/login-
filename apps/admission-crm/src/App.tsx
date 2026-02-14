import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, queryClient } from '@od-erp/query';
import { LoadingState } from '@od-erp/ui';
import { ToastProvider } from '@od-erp/ui';

const AdmissionSummaryReport = lazy(() => import('./pages/AdmissionSummaryReport/AdmissionSummaryReport'));

const VacantSeatsReport = lazy(() => import('./pages/VacantSeatsReport/VacantSeatsReport'));
const PrintVacantSeatsReport = lazy(() => import('./pages/VacantSeatsReport/PrintVacantSeatsReport'));
const CounselorTagReport = lazy(() => import('./pages/CounselorTagReport/CounselorTagReport'));
const PrintCounselorTagReport = lazy(() => import('./pages/CounselorTagReport/PrintCounselorTagReport'));
const SourceWiseReport = lazy(() => import('./pages/SourceWiseReport/SourceWiseReport'));
const PrintSourceWiseReport = lazy(() => import('./pages/SourceWiseReport/PrintSourceWiseReport'));
const CourseWiseTagReport = lazy(() => import('./pages/CourseWiseTagReport/CourseWiseTagReport'));
const PrintCourseWiseTagReport = lazy(() => import('./pages/CourseWiseTagReport/PrintCourseWiseTagReport'));
const NepSubjectReport = lazy(() => import('./pages/NepSubjectReport/NepSubjectReport'));
const PrintNepSubjectReport = lazy(() => import('./pages/NepSubjectReport/PrintNepSubjectReport'));
const CounselorProductivityReport = lazy(() => import('./pages/CounselorProductivityReport/CounselorProductivityReport'));
const PrintCounselorProductivityReport = lazy(() => import('./pages/CounselorProductivityReport/PrintCounselorProductivityReport'));
const AdmissionLeadLogs = lazy(() => import('./pages/AdmissionLeadLogs/AdmissionLeadLogs'));
const AdmissionFollowUps = lazy(() => import('./pages/AdmissionFollowUps/AdmissionFollowUps'));
const AdmissionLeads = lazy(() => import('./pages/AdmissionLeads/AdmissionLeads'));
const AdmissionStudentData = lazy(() => import('./pages/AdmissionStudentData/AdmissionStudentData'));
const PrintAdmissionStudentData = lazy(() => import('./pages/AdmissionStudentData/PrintAdmissionStudentData'));
const AdmissionTransactionPage = lazy(() => import('./pages/AdmissionTransaction/AdmissionTransaction'));
const PrintAdmissionTransaction = lazy(() => import('./pages/AdmissionTransaction/PrintAdmissionTransaction'));
const DailyCollectionReportPage = lazy(() => import('./pages/DailyCollectionReport/DailyCollectionReport'));
const PrintDailyCollectionReport = lazy(() => import('./pages/DailyCollectionReport/PrintDailyCollectionReport'));
const PrintStudentTimeline = lazy(() => import('./pages/AdmissionStudentData/PrintStudentTimeline'));
const PrintAdmissionForm = lazy(() => import('./pages/AdmissionStudentData/PrintAdmissionForm'));
const VerifyDocuments = lazy(() => import('./pages/AdmissionStudentData/components/VerifyDocuments'));
const PrintAdmissionTransactionReceipt = lazy(() => import('./pages/AdmissionTransaction/PrintAdmissionTransactionReceipt'));
const StudentDataDetails = lazy(() => import('./pages/StudentDataDetails/StudentDataDetails'));

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <Suspense fallback={<LoadingState />}>
                    <Routes>
                        <Route path="admissionSummaryReports" element={<AdmissionSummaryReport />} />

                        <Route path="vacentSeats" element={<VacantSeatsReport />} />
                        <Route path="print/vacantSeats" element={<PrintVacantSeatsReport />} />
                        <Route path="counselorTagReport" element={<CounselorTagReport />} />
                        <Route path="print/counselorTagReport" element={<PrintCounselorTagReport />} />
                        <Route path="sourceWiseReport" element={<SourceWiseReport />} />
                        <Route path="print/sourceWiseReport" element={<PrintSourceWiseReport />} />
                        <Route path="courseWiseTagReport" element={<CourseWiseTagReport />} />
                        <Route path="print/courseWiseTagReport" element={<PrintCourseWiseTagReport />} />
                        <Route path="nepSubjectReport" element={<NepSubjectReport />} />
                        <Route path="print/nepSubjectReport" element={<PrintNepSubjectReport />} />
                        <Route path="counselorProductivityReport" element={<CounselorProductivityReport />} />
                        <Route path="print/counselorProductivityReport" element={<PrintCounselorProductivityReport />} />
                        <Route path="admissionLeadLogs" element={<AdmissionLeadLogs />} />
                        <Route path="followUps" element={<AdmissionFollowUps />} />
                        <Route path="admissionLeads" element={<AdmissionLeads />} />
                        <Route path="studentData" element={<AdmissionStudentData />} />
                        <Route path="student-data/:id" element={<StudentDataDetails />} />
                        <Route path="print/admission-student-data" element={<PrintAdmissionStudentData />} />
                        <Route path="transaction" element={<AdmissionTransactionPage />} />
                        <Route path="print/admissionTransaction" element={<PrintAdmissionTransaction />} />
                        <Route path="dailyCollectionReport" element={<DailyCollectionReportPage />} />
                        <Route path="print/dailyCollectionReport" element={<PrintDailyCollectionReport />} />
                        <Route path="print/open/studentTimeline" element={<PrintStudentTimeline />} />
                        <Route path="print/open/admissionForm" element={<PrintAdmissionForm />} />
                        <Route path="print/open/admissionTransactionReceipt/:id" element={<PrintAdmissionTransactionReceipt />} />
                        <Route path="verify-documents/:id" element={<VerifyDocuments />} />
                        <Route index element={<Navigate to="admissionSummaryReports" replace />} />
                    </Routes>
                </Suspense>
            </ToastProvider>
        </QueryClientProvider>
    );
}

export default App;
