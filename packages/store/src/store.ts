import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import uiReducer from './slices/uiSlice';
import configReducer from './slices/configSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        session: sessionReducer,
        ui: uiReducer,
        config: configReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
