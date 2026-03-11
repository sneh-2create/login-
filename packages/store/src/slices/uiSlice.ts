import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode, PrimaryColor, ThemeConfig } from '@od-erp/types';
import { DEFAULT_THEME } from '@od-erp/constants';

export interface UIState {
    sidebarCollapsed: boolean;
    theme: ThemeMode;
    primaryColor: PrimaryColor;
    notifications: Array<{
        id: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        timestamp: number;
    }>;
}

const initialState: UIState = {
    sidebarCollapsed: true,  // Default to collapsed
    theme: DEFAULT_THEME.MODE,
    primaryColor: DEFAULT_THEME.COLOR,
    notifications: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.sidebarCollapsed = action.payload;
        },
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.theme = action.payload;
        },
        setPrimaryColor: (state, action: PayloadAction<PrimaryColor>) => {
            state.primaryColor = action.payload;
        },
        setThemeConfig: (state, action: PayloadAction<ThemeConfig>) => {
            state.theme = action.payload.mode;
            state.primaryColor = action.payload.primaryColor;
        },
        addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
            state.notifications.push({
                ...action.payload,
                id: Date.now().toString(),
                timestamp: Date.now(),
            });
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const {
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    setPrimaryColor,
    setThemeConfig,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions;
export default uiSlice.reducer;
