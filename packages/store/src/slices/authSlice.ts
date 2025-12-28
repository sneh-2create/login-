import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeId?: string;
    permissions?: string[];
}


export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    permissions: string[];
    preferences: any | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: [],
    preferences: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string; permissions?: string[]; preferences?: any }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.permissions = action.payload.permissions || action.payload.user.permissions || [];
            state.preferences = action.payload.preferences || null;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.permissions = [];
            state.preferences = null;
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
    },
});

export const { setCredentials, logout, updateUser, updatePreferences } = authSlice.actions;
export default authSlice.reducer;
