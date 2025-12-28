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
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: [],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string; permissions?: string[] }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.permissions = action.payload.permissions || action.payload.user.permissions || [];
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.permissions = [];
            state.isAuthenticated = false;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
