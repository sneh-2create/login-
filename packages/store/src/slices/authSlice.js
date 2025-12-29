import { createSlice } from '@reduxjs/toolkit';
const initialState = {
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
        setCredentials: (state, action) => {
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
        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        updatePreferences: (state, action) => {
            state.preferences = action.payload;
        },
        updateEntityDetails: (state, action) => {
            if (state.entityDetails) {
                state.entityDetails = { ...state.entityDetails, ...action.payload };
            }
        }
    },
});
export const { setCredentials, logout, updateUser, updatePreferences, updateEntityDetails } = authSlice.actions;
export default authSlice.reducer;
