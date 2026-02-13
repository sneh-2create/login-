import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { setCredentials, useAppDispatch, useAppSelector } from '@od-erp/store';

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3000/login' : 'https://login.oderp.in/login');

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
                    let fetchedEntityPreferences = null;
                    let fetchedUserPreferences = null;
                    let fetchedWebsiteConfig: any = null;

                    if (entityId) {
                        try {
                            console.log(`[AuthGuard] Fetching data for Entity: ${entityId}`);
                            // Dynamic import to avoid circular dependencies if any
                            const { commonService } = await import('@od-erp/api-client');

                            // Parallel fetch
                            const [entityPrefs, userPrefs, websiteConfig] = await Promise.all([
                                commonService.getEntityPreferences(entityId),
                                commonService.getUserPreferences().catch(err => {
                                    console.warn('[AuthGuard] Failed to fetch user preferences:', err);
                                    return null;
                                }),
                                commonService.getEntityWebsiteConfig(entityId).catch(err => {
                                    console.warn('[AuthGuard] Failed to fetch website config:', err);
                                    return null;
                                })
                            ]);

                            fetchedEntityPreferences = entityPrefs;
                            fetchedUserPreferences = userPrefs;
                            fetchedWebsiteConfig = websiteConfig;

                            console.log('[AuthGuard] Preferences/Config Fetched:', { entity: fetchedEntityPreferences, user: fetchedUserPreferences, website: fetchedWebsiteConfig });

                            if (fetchedEntityPreferences) {
                                const { setEntityPreferences } = await import('@od-erp/store');
                                dispatch(setEntityPreferences(fetchedEntityPreferences));
                            }
                        } catch (prefError) {
                            console.warn('[AuthGuard] Failed to fetch preferences:', prefError);
                        }
                    }

                    // 3. Hydrate Permissions & Entity via Re-Login (Workaround)
                    let finalPermissions = decoded.permissions || [];
                    let finalEntityDetails = undefined;

                    const loginMobile = Cookies.get('login_mobile');
                    const loginPassword = Cookies.get('login_password');

                    if (loginMobile && loginPassword) {
                        try {
                            console.log('[AuthGuard] Re-authenticating with stored credentials to fetch full profile...');
                            const { authService } = await import('@od-erp/api-client');
                            const loginResponse = await authService.login({ mobile: loginMobile, password: loginPassword });

                            if (loginResponse) {
                                console.log('[AuthGuard] Re-login successful. Hydrating from fresh response.');

                                // Extract Permissions
                                if (loginResponse.permissions && Array.isArray(loginResponse.permissions)) {
                                    console.log('[AuthGuard] Permissions found:', loginResponse.permissions);
                                    finalPermissions = loginResponse.permissions;
                                } else {
                                    console.warn('[AuthGuard] No permissions array in login response:', loginResponse);
                                }

                                // Extract Preferences from Login Response (Overlap with User Prefs)
                                if (loginResponse.preferences) {
                                    console.log('[AuthGuard] Preferences found in login response');
                                    fetchedUserPreferences = loginResponse.preferences;
                                }

                                // Extract Entity Details
                                if (loginResponse.entity) {
                                    finalEntityDetails = {
                                        id: loginResponse.entity._id,
                                        logo: loginResponse.entity.logo,
                                        displayName: loginResponse.entity.displayName || loginResponse.entity.name,
                                        type: loginResponse.entity.entityType,
                                        qac: String(loginResponse.entity.qac), // Ensure string
                                        activeSession: loginResponse.entity.activeSession,
                                        entityPreferences: loginResponse.entity.entityPreferences,
                                        primaryColour: loginResponse.entity.primaryColour || loginResponse.entity.primaryColor || fetchedWebsiteConfig?.primaryColor || fetchedWebsiteConfig?.primaryColour,
                                        secondaryColour: loginResponse.entity.secondaryColour || loginResponse.entity.secondaryColor || fetchedWebsiteConfig?.secondaryColor || fetchedWebsiteConfig?.secondaryColour
                                    };
                                }

                                console.log('[AuthGuard] Final Preferences:', fetchedUserPreferences);
                                console.log('[AuthGuard] Final Entity Details:', finalEntityDetails);
                            }
                        } catch (reLoginError) {
                            console.error('[AuthGuard] Re-login failed:', reLoginError);
                            // Fallback to token data if re-login fails
                        }
                    } else {
                        console.warn('[AuthGuard] No stored credentials found for re-login. Using Token data only.');
                    }

                    // Fallback: If re-login failed or didn't happen, use Token Data for Entity ID
                    if (!finalEntityDetails && entityId) {
                        console.log('[AuthGuard] Using Token Data for Entity Details fallback');
                        finalEntityDetails = {
                            id: entityId,
                            displayName: decoded.entityName || 'Entity',
                            // Add minimal required fields or defaults
                            logo: '',
                            type: 'School', // Default
                            qac: 'false',
                            activeSession: '',
                            entityPreferences: null,
                            primaryColour: fetchedWebsiteConfig?.primaryColor || fetchedWebsiteConfig?.primaryColour,
                            secondaryColour: fetchedWebsiteConfig?.secondaryColor || fetchedWebsiteConfig?.secondaryColour
                        };
                    }

                    const credentials = {
                        user: {
                            id: decoded.id || decoded.userId || decoded.sub || decoded._id,
                            name: decoded.name || decoded.username || decoded.email || 'User',
                            email: decoded.email || '',
                            role: userRole,
                            userType: userRole,
                            employeeId: decoded.employeeId,
                            permissions: finalPermissions,
                            entityGroup: decoded.entityGroup || []
                        },
                        token: token,
                        preferences: fetchedUserPreferences,
                        entityDetails: finalEntityDetails
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
