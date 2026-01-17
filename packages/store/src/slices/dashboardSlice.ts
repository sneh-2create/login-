import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    dashboardCounts,
    activeStudentData,
    onlineFeePaymentData,
    communicationReportData,
    userEntityData,
    entityModuleCount,
    entityLocationCount
} from '@od-erp/types';

export interface DashboardState {
    counts: dashboardCounts | null;
    activeStudents: activeStudentData[];
    userEntityData: userEntityData[];
    onlinePayments: onlineFeePaymentData[];
    communicationReport: communicationReportData[];
    entityModuleCounts: entityModuleCount[];
    entityLocationCounts: entityLocationCount[];

    // Filters
    activeStudentDateRange: { start: string; end: string };
    userEntityDateRange: { start: string; end: string };
    onlinePaymentDateRange: { start: string; end: string };
    communicationDateRange: { start: string; end: string };
    selectedLocation: string;
}

const initialState: DashboardState = {
    counts: null,
    activeStudents: [],
    userEntityData: [],
    onlinePayments: [],
    communicationReport: [],
    entityModuleCounts: [],
    entityLocationCounts: [],

    activeStudentDateRange: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    },
    userEntityDateRange: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    },
    onlinePaymentDateRange: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    },
    communicationDateRange: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    },
    selectedLocation: 'state'
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setCounts: (state, action: PayloadAction<dashboardCounts>) => {
            state.counts = action.payload;
        },
        setActiveStudents: (state, action: PayloadAction<activeStudentData[]>) => {
            state.activeStudents = action.payload;
        },
        setUserEntityData: (state, action: PayloadAction<userEntityData[]>) => {
            state.userEntityData = action.payload;
        },
        setOnlinePayments: (state, action: PayloadAction<onlineFeePaymentData[]>) => {
            state.onlinePayments = action.payload;
        },
        setCommunicationReport: (state, action: PayloadAction<communicationReportData[]>) => {
            state.communicationReport = action.payload;
        },
        setEntityModuleCounts: (state, action: PayloadAction<entityModuleCount[]>) => {
            state.entityModuleCounts = action.payload;
        },
        setEntityLocationCounts: (state, action: PayloadAction<entityLocationCount[]>) => {
            state.entityLocationCounts = action.payload;
        },
        setActiveStudentDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
            state.activeStudentDateRange = action.payload;
        },
        setUserEntityDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
            state.userEntityDateRange = action.payload;
        },
        setOnlinePaymentDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
            state.onlinePaymentDateRange = action.payload;
        },
        setCommunicationDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
            state.communicationDateRange = action.payload;
        },
        setSelectedLocation: (state, action: PayloadAction<string>) => {
            state.selectedLocation = action.payload;
        },
        resetDashboard: () => initialState
    }
});

export const {
    setCounts,
    setActiveStudents,
    setUserEntityData,
    setOnlinePayments,
    setCommunicationReport,
    setEntityModuleCounts,
    setEntityLocationCounts,
    setActiveStudentDateRange,
    setUserEntityDateRange,
    setOnlinePaymentDateRange,
    setCommunicationDateRange,
    setSelectedLocation,
    resetDashboard
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
