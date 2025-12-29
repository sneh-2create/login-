
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EntityDisplayNames {
    event: string;
    partnerInstitute: string;
    sharePoint: string;
    course: string;
    greenSheet: string;
    schoolDiary: string;
    issuedBooks: string;
    seminar: string;
    classTest: string;
    rollNo: string;
    regNo: string;
    lesson: string;
    homework: string;
}

export interface EntityPreferences {
    displayNames: EntityDisplayNames;
    studentAttendanceVersion: 'old' | 'new' | 'version3';
    colourTheme: string;
}

export interface ConfigState {
    menuConfig: any; // Using any for complex nested structure for now
    entityPreferences: EntityPreferences | null;
    currentDate: string | null;
    whiteLabelConfig: any | null;
    messDashboardData: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: ConfigState = {
    menuConfig: null,
    entityPreferences: null,
    currentDate: null,
    whiteLabelConfig: null,
    messDashboardData: null,
    loading: false,
    error: null,
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setMenuConfig: (state, action: PayloadAction<any>) => {
            state.menuConfig = action.payload;
        },
        setEntityPreferences: (state, action: PayloadAction<EntityPreferences>) => {
            state.entityPreferences = action.payload;
        },
        setCurrentDate: (state, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        },
        setWhiteLabelConfig: (state, action: PayloadAction<any>) => {
            state.whiteLabelConfig = action.payload;
        },
        setMessDashboardData: (state, action: PayloadAction<any>) => {
            state.messDashboardData = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setMenuConfig, setEntityPreferences, setCurrentDate, setWhiteLabelConfig, setMessDashboardData, setLoading, setError } = configSlice.actions;
export default configSlice.reducer;
