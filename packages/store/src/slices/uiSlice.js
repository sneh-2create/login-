import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    sidebarCollapsed: false,
    theme: 'light',
    notifications: [],
};
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.push({
                ...action.payload,
                id: Date.now().toString(),
                timestamp: Date.now(),
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});
export const { toggleSidebar, setSidebarCollapsed, setTheme, addNotification, removeNotification, clearNotifications, } = uiSlice.actions;
export default uiSlice.reducer;
