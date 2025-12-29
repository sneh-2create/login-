import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    menuConfig: null,
    entityPreferences: null,
    currentDate: null,
    whiteLabelConfig: null,
    messDashboardData: null,
    loading: false,
    error: null,
};
const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setMenuConfig: (state, action) => {
            state.menuConfig = action.payload;
        },
        setEntityPreferences: (state, action) => {
            state.entityPreferences = action.payload;
        },
        setCurrentDate: (state, action) => {
            state.currentDate = action.payload;
        },
        setWhiteLabelConfig: (state, action) => {
            state.whiteLabelConfig = action.payload;
        },
        setMessDashboardData: (state, action) => {
            state.messDashboardData = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { setMenuConfig, setEntityPreferences, setCurrentDate, setWhiteLabelConfig, setMessDashboardData, setLoading, setError } = configSlice.actions;
export default configSlice.reducer;
