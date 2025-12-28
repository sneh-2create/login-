import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@od-erp/store';
import { commonService } from '@od-erp/api-client';
import { setCurrentDate, setWhiteLabelConfig, setLoading, setEntityPreferences } from '@od-erp/store/src/slices/configSlice'; // deep import for now if index doesn't export
import { setSessionList } from '@od-erp/store/src/slices/sessionSlice';

export const useAppInitialization = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, preferences } = useAppSelector((state) => state.auth);
    const { currentDate } = useAppSelector((state) => state.config);
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

                        // Guard: Only fetch if whiteLabelConfig is missing
                        if (!whiteLabelConfig) {
                            promises.push(commonService.getEntityWebsiteConfig(targetEntityId).then(res => {
                                // Dispatch config
                                if (res) {
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

