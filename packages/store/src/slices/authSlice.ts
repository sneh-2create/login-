import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, EntityDetails, AuthState } from '@od-erp/types';

const initialState: AuthState = {
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
        setCredentials: (state, action: PayloadAction<{ user: User; token: string; permissions?: string[]; preferences?: any; entityDetails?: EntityDetails }>) => {
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
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        updatePreferences: (state, action: PayloadAction<any>) => {
            state.preferences = action.payload;
        },
        updateEntityDetails: (state, action: PayloadAction<Partial<EntityDetails>>) => {
            if (state.entityDetails) {
                state.entityDetails = { ...state.entityDetails, ...action.payload };
            }
        }
    },
});

export const { setCredentials, logout, updateUser, updatePreferences, updateEntityDetails } = authSlice.actions;
export default authSlice.reducer;
