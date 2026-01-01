import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { setCredentials, useAppDispatch, useAppSelector } from '@od-erp/store';

const LOGIN_URL = 'http://localhost:3000/login'; // TODO: Move to env var

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { entityPreferences } = useAppSelector((state) => state.config);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('token');

            if (!token) {
                // ... redirect ...
                console.warn('No token found in Standalone Mode. Redirecting to Shell Login...');
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `${LOGIN_URL}?redirect=${returnUrl}`;
                return;
            }

            // Hydrate User if missing OR Entity Preferences are missing (for standalone mode)
            if (!user || !user.id || !user.role || !entityPreferences) {
                try {
                    console.log('%c[AuthGuard] Hydrating session from Token...', 'color: blue; font-weight: bold;');

                    // Decode Token
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const decoded: any = JSON.parse(jsonPayload);
                    console.log('%c[AuthGuard] Token Decoded:', 'color: green', decoded);

                    if (!decoded) {
                        throw new Error('Invalid Token');
                    }

                    // Map Decoded Token to User Structure
                    // Adjust fields based on your actual JWT structure
                    // Log shows: { entityName, entity, name, mobile, password, entityGroup, userType: 'od2', ... }

                    const userRole = decoded.userType || decoded.role || 'od1'; // Ensure role is captured

                    // 2. Fetch Entity Preferences if Entity ID exists
                    const entityId = decoded.entity || decoded.entityId;
                    let fetchedPreferences = null;

                    if (entityId) {
                        try {
                            console.log(`[AuthGuard] Fetching preferences for Entity: ${entityId}`);
                            // Dynamic import to avoid circular dependencies if any
                            const { commonService } = await import('@od-erp/api-client');
                            fetchedPreferences = await commonService.getEntityPreferences(entityId);
                            console.log('[AuthGuard] Preferences Fetched:', fetchedPreferences);

                            if (fetchedPreferences) {
                                const { setEntityPreferences } = await import('@od-erp/store');
                                dispatch(setEntityPreferences(fetchedPreferences));
                            }
                        } catch (prefError) {
                            console.warn('[AuthGuard] Failed to fetch preferences:', prefError);
                        }
                    }

                    // 3. Hydrate Permissions via API if missing in Token (Cross-Port / Full Profile Fetch)
                    let finalPermissions = decoded.permissions || [];
                    console.log('[AuthGuard] Permissions from Token:', finalPermissions);

                    if (finalPermissions.length === 0) {
                        console.warn('[AuthGuard] Permissions missing in Token. Using Hardcoded Fallback (Dev Mode)...');
                        // Fallback for 'od2' or development
                        if (userRole === 'od2' || userRole === 'admin') {
                            finalPermissions = [
                                'viewSuperAdminDashboard',
                                'viewEntityDashboard',
                                'profileDashboard',
                                'admissionModule',
                                'studentModule',
                                'feeModule',
                                'accountingModule',
                                'viewExpenseManagementList',
                                'attendanceModule',
                                'examinationModule',
                                'viewFeedbackMaster',
                                'viewSchoolDiaryList',
                                'learningManagementModule',
                                'viewLessonPlanList',
                                'hrmModule',
                                'viewUser',
                                'libraryModule',
                                'communicationModule',
                                'viewTransportReport',
                                'hostelModule',
                                'viewAdvancedList',
                                'analyticsModule',
                                'viewBulkUpdate',
                                'viewSharePointList',
                                'viewSocialMediaList',
                                'naacModule',
                                'viewGalleryList'
                            ];
                            console.log('[AuthGuard] Applied Hardcoded Permissions:', finalPermissions);
                        }
                    }

                    const credentials = {
                        user: {
                            id: decoded.id || decoded.userId || decoded.sub || decoded._id, // Add _id backup
                            name: decoded.name || decoded.username || decoded.email || 'User',
                            email: decoded.email || '',
                            role: userRole,
                            userType: userRole,
                            employeeId: decoded.employeeId,
                            permissions: finalPermissions
                        },
                        token: token,
                        preferences: fetchedPreferences, // Pass here if needed by auth slice, though we set setEntityPreferences separately
                        entityDetails: undefined
                    };

                    console.log('[AuthGuard] Dispatching credentials to store:', credentials);
                    dispatch(setCredentials(credentials));

                    // Force Sidebar Config update if missing
                    // This ensures the sidebar re-renders with the new permission/role
                    // import { setMenuConfig } from '@od-erp/store';
                    // import { menuConfig } from '@od-erp/constants';
                    // dispatch(setMenuConfig(menuConfig)); 

                } catch (error) {
                    console.error('%c[AuthGuard] Failed to hydrate session', 'color: red; font-weight: bold;', error);
                    // Force logout if token is invalid/cant be decoded
                    // Cookies.remove('token');
                    // window.location.href = LOGIN_URL;
                }
            } else {
                console.log('[AuthGuard] User already exists in store:', user);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [dispatch, user]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-gray-500">Loading Session...</div>;
    }

    // Double check token to avoid flash
    const token = Cookies.get('token');
    if (!token) return null;

    return <>{children}</>;
};
