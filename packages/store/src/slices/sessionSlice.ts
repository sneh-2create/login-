import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface sessionState {
    entityId: string | null;
    entityName: string | null;
    entityType: string | null;
    academicSession: string | null;
    admissionSession: string | null;
    sessionList: any[]; // List of available sessions
}

const initialState: sessionState = {
    entityId: null,
    entityName: null,
    entityType: null,
    academicSession: null,
    admissionSession: null,
    sessionList: [],
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setEntity: (state, action: PayloadAction<{ id: string; name: string; type: string }>) => {
            state.entityId = action.payload.id;
            state.entityName = action.payload.name;
            state.entityType = action.payload.type;
        },
        setAcademicSession: (state, action: PayloadAction<string>) => {
            state.academicSession = action.payload;
        },
        setAdmissionSession: (state, action: PayloadAction<string>) => {
            state.admissionSession = action.payload;
        },
        setSessionList: (state, action: PayloadAction<any[]>) => {
            // Assuming session list items have at least { name: string } or similar
            // Storing raw array for now as 'any[]', can refine types later
            state.sessionList = action.payload;
        },
        clearSession: (state) => {
            state.entityId = null;
            state.entityName = null;
            state.entityType = null;
            state.academicSession = null;
            state.admissionSession = null;
            state.sessionList = [];
        },
    },
});

export const { setEntity, setAcademicSession, setAdmissionSession, setSessionList, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
