import { Middleware } from '@reduxjs/toolkit';
import { applyTheme } from '@od-erp/utils';
import { setTheme, setPrimaryColor, setThemeConfig } from '../slices/uiSlice';

export const themeMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);

    // Listen for theme changes
    if (
        setTheme.match(action) ||
        setPrimaryColor.match(action) ||
        setThemeConfig.match(action)
    ) {
        const state = store.getState();
        const themeConfig = {
            mode: state.ui.theme,
            primaryColor: state.ui.primaryColor,
        };

        // Apply theme to DOM and save to cookies
        applyTheme(themeConfig);
    }

    return result;
};
