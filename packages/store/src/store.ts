import { configureStore, CombineReducers } from '@reduxjs/toolkit';

// Placeholder reducer until we have real slices
const rootReducer = {
    dummy: (state = {}) => state,
};

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const createStore = (preloadedState?: RootState) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
    });
};
