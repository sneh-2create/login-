
import { useAppSelector } from '../hooks';

// Define the shape of the raw menu item from config
export interface ConfigMenuItem {
    title: string;
    icon?: string;
    page?: string;
    root?: boolean;
    alignment?: string;
    bullet?: string;
    admPermission?: string;
    entPermission?: string;
    submenu?: ConfigMenuItem[];
}

export const useMenu = () => {
    const { menuConfig, entityPreferences } = useAppSelector((state) => state.config);
    const { permissions, user } = useAppSelector((state) => state.auth);

    // Transform logic
    const getFilteredMenu = (): ConfigMenuItem[] => {
        if (!menuConfig) return [];

        let rawItems: ConfigMenuItem[] = [];
        // Determine which section to use based on user role/type
        // For now assuming 'admin' or 'entity' based on existence of entityPreferences
        // In real app, check user.role or userType
        if (user?.role === 'superadmin') {
            rawItems = menuConfig.adminAside?.items || [];
        } else if (entityPreferences) { // If logged in as entity
            rawItems = menuConfig.entityAside?.items || [];
        }

        return transformMenuItems(rawItems);
    };

    const transformMenuItems = (items: ConfigMenuItem[]): ConfigMenuItem[] => {
        let updatedItems: ConfigMenuItem[] = [];

        for (const item of items) {
            // 1. Check Permissions
            let hasPermission = true;
            if (item.entPermission) {
                hasPermission = permissions.includes(item.entPermission);
            } else if (item.admPermission) {
                hasPermission = permissions.includes(item.admPermission);
            }

            if (!hasPermission) continue;

            // 2. Clone item to avoid mutating store
            const newItem = { ...item };

            // 3. Rename Title based on Preferences
            if (entityPreferences?.displayNames) {
                newItem.title = renameTitle(newItem.title, entityPreferences.displayNames);
            }

            // 4. Process Submenu
            if (newItem.submenu && newItem.submenu.length > 0) {
                newItem.submenu = transformMenuItems(newItem.submenu);
            }

            // 5. Version Check (Attendance) - simplified for now
            if (newItem.title === 'Attendance' && entityPreferences?.studentAttendanceVersion !== 'old') continue;
            if (newItem.title === 'Attendance New' && entityPreferences?.studentAttendanceVersion !== 'new') continue;

            updatedItems.push(newItem);
        }
        return updatedItems;
    };

    const renameTitle = (title: string, displayNames: any): string => {
        // Simple exact match replacement or lookup
        // Based on Angular logic:
        const map: { [key: string]: string } = {
            'Events': displayNames.event,
            'Partner Institutes': displayNames.partnerInstitute,
            'Class': displayNames.course,
            // Add more as needed
        };
        return map[title] || title;
    };

    return {
        menuItems: getFilteredMenu(),
        isLoading: !menuConfig
    };
};
