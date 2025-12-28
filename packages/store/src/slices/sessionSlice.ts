import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SessionState {
    entityId: string | null;
    entityName: string | null;
    entityType: string | null;
    academicSession: string | null;
    admissionSession: string | null;
}

const initialState: SessionState = {
    entityId: null,
    entityName: null,
    entityType: null,
    academicSession: null,
    admissionSession: null,
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
        clearSession: (state) => {
            state.entityId = null;
            state.entityName = null;
            state.entityType = null;
            state.academicSession = null;
            state.admissionSession = null;
        },
    },
});

export const { setEntity, setAcademicSession, setAdmissionSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
