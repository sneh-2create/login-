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
export * from './excelTemplate';
export * from './feeMaster';




