import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@od-erp/store';
import { commonService } from '@od-erp/api-client';
import { setCurrentDate, setWhiteLabelConfig, setLoading, setEntityPreferences, setMessDashboardData } from '@od-erp/store/src/slices/configSlice'; // deep import for now if index doesn't export
import { setSessionList } from '@od-erp/store/src/slices/sessionSlice';

export const useAppInitialization = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, preferences } = useAppSelector((state) => state.auth);
    const { currentDate, messDashboardData } = useAppSelector((state) => state.config);
    const { sessionList, entityId } = useAppSelector((state) => state.session);
    const { entityPreferences, whiteLabelConfig } = useAppSelector((state) => state.config);

    useEffect(() => {
        const initializeApp = async () => {
            // Only initialize if authenticated
            if (isAuthenticated) {
                // Only set loading if critical data (currentDate) is missing
                if (!currentDate) dispatch(setLoading(true));

                try {
                    const promises = [];

                    // 1. Get Current Date
                    if (!currentDate) {
                        promises.push(commonService.getCurrentDate().then(res => {
                            if (res && res.currentDate) {
                                dispatch(setCurrentDate(res.currentDate));
                            }
                        }));
                    }

                    // 2. Fetch Entity Specific Data
                    // Use entityId from session (set during login) or fallback to preferences
                    const targetEntityId = entityId || preferences?.defaultEntityId;

                    if (targetEntityId) {
                        // Guard: Only fetch if sessionList is empty
                        if (!sessionList || sessionList.length === 0) {
                            promises.push(commonService.getSessionList(targetEntityId).then(res => {
                                if (Array.isArray(res)) {
                                    dispatch(setSessionList(res));
                                }
                            }));
                        }

                        // 3. Entity Website Config (firebase service in Angular)
                        // This seems distinct from whiteLabeling in the user request, but often related.
                        // We fetch it if not present.
                        if (!whiteLabelConfig) {
                            promises.push(commonService.getEntityWebsiteConfig(targetEntityId).then(res => {
                                // Dispatch config
                                if (res) {
                                    // Note: We might want separate store field for this if distinct from whiteLabelConfig
                                    // but for now reusing or just ensuring call is made.
                                    // If this is strictly website config, we might need a new action.
                                    // Assuming for now it maps to whiteLabelConfig or similar.
                                    dispatch(setWhiteLabelConfig(res));
                                }
                            }));
                        }

                        // Guard: Only fetch if entityPreferences is missing
                        if (!entityPreferences) {
                            promises.push(commonService.getEntityPreferences(targetEntityId).then(res => {
                                if (res) {
                                    dispatch(setEntityPreferences(res));
                                }
                            }));
                        }
                    } else {
                        console.warn('useAppInitialization: No Entity ID found (session or preferences), skipping entity data fetch.');
                    }

                    // 4. White Labelling By URL (Always call on init if needed)
                    // The user specifically requested: api/getWhiteLabellingByURL -> src/app/app.component.ts
                    // This might overlap with getEntityWebsiteConfig, but we'll call it as requested.
                    const currentUrl = window.location.hostname;
                    promises.push(commonService.getWhiteLabellingByURL(currentUrl).then(res => {
                        if (res) {
                            // If this returns white label config, we update it.
                            // It might overwrite getEntityWebsiteConfig result if both map to same store.
                            // We'll prioritize this as it's URL based (tenant specific).
                            dispatch(setWhiteLabelConfig(res));
                        }
                    }));

                    // 5. Mess Management Dashboard (Always call on init)
                    if (!messDashboardData) {
                        promises.push(commonService.getMessDashboard().then(res => {
                            if (res) {
                                dispatch(setMessDashboardData(res));
                            }
                        }));
                    }


                    await Promise.all(promises);

                } catch (error) {
                    console.error('App Initialization Failed:', error);
                } finally {
                    dispatch(setLoading(false));
                }
            }
        };

        initializeApp();
    }, [isAuthenticated, dispatch, currentDate, sessionList, preferences, entityId, entityPreferences, whiteLabelConfig]);
};

