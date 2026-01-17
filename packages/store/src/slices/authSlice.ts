import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { user, entityDetails, authState } from '@od-erp/types';

const initialState: authState = {
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: [],
    preferences: null,
    entityDetails: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: user; token: string; permissions?: string[]; preferences?: any; entityDetails?: entityDetails }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.permissions = action.payload.permissions || action.payload.user.permissions || [];
            state.preferences = action.payload.preferences || null;
            state.entityDetails = action.payload.entityDetails || null;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.permissions = [];
            state.preferences = null;
            state.entityDetails = null;
            state.isAuthenticated = false;
        },
        updateUser: (state, action: PayloadAction<Partial<user>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        updatePreferences: (state, action: PayloadAction<any>) => {
            state.preferences = action.payload;
        },
        updateEntityDetails: (state, action: PayloadAction<Partial<entityDetails>>) => {
            if (state.entityDetails) {
                state.entityDetails = { ...state.entityDetails, ...action.payload };
            }
        }
    },
});

export const { setCredentials, logout, updateUser, updatePreferences, updateEntityDetails } = authSlice.actions;
export default authSlice.reducer;
