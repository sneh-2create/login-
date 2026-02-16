import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            refetchOnWindowFocus: false,
        },
    },
});

export * from '@tanstack/react-query';
export * from './admission';
export * from './session';
export * from './admissionStudentData';
export * from './admissionTransaction';
export * from './dailyCollectionReport';
export * from './dailyCollectionReport';
export * from './useStudentTimeline';
export * from './useAttendanceDashboard';
export * from './useEmployeeDashboard';
export * from './useAdmissionDashboard';
export * from './useHodDashboard';
export * from './useCommunicationDashboard';
export * from './useAnalyticsDashboard';
export * from './useMessDashboard';
export * from './useCalendar';
export * from './useProfile';
export * from './useExaminationDashboard';
export * from './useAppliedLeaves';
export * from './useLibraryDashboard';
export * from './excelTemplate';
export * from './feeMaster';
export * from './useCommunication';
export * from './faq';
export * from './common';
export * from './hooks/admission/useAdmissionTemplates';
export * from './hooks/admission/useAdmissionStudentData';





