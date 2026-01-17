import React, { useState, useEffect } from 'react';
import { useSession } from '@od-erp/store';
import { useAppSelector } from '@od-erp/store';
import { cn } from '@od-erp/ui';

// Section Placeholders - To be replaced with actual implementations or Module MFEs
import {
    StudentOverviewSection,
    FeeSection,
    AdmissionSection,
    AttendanceSection,
    AnalyticsSection,
    ExaminationSection,
    EmployeeSection,
    HODSection,
    CommunicationSection,
    LibrarySection,
    ProfileSection,
    MessSection
} from '../components/dashboard/sections/placeholders';
import { CalendarSection } from '../components/dashboard/sections/calendarSection';
import { QuickLinksSection } from '../components/dashboard/sections/quickLinksSection';
import { TabConfig } from '@od-erp/types';

import { DASHBOARD_TABS_METADATA } from '@od-erp/constants';

const TAB_COMPONENTS: Record<string, React.FC> = {
    quick_links: QuickLinksSection,
    overview: StudentOverviewSection,
    fee: FeeSection,
    admission: AdmissionSection,
    attendance: AttendanceSection,
    examination: ExaminationSection,
    employee: EmployeeSection,
    hod: HODSection,
    communication: CommunicationSection,
    analytics: AnalyticsSection,
    library: LibrarySection,
    profile: ProfileSection,
    calendar: CalendarSection,
    mess: MessSection,
};

const allTabs: TabConfig[] = DASHBOARD_TABS_METADATA.map(meta => ({
    ...meta,
    component: TAB_COMPONENTS[meta.id] || (() => <div>Component Not Found</div>)
}));

export const Dashboard: React.FC = () => {
    const { session: { user } } = useSession();
    const permissions = useAppSelector((state) => state.auth.permissions);

    // Filter tabs based on permissions
    // If permissions array is empty (or dev mode), we might want to show all or none. 
    // Legacy app checks if permissions.includes(value).
    // For Dev convenience, if user is 'admin' or permissions is empty, we might want to show defaults?
    // But strictly following legacy:

    const visibleTabs = allTabs.filter(tab => permissions.includes(tab.permission));

    // Fallback for development if no permissions are set yet (e.g. fresh login without specific permissions mock)
    // You can remove this fallback later.
    const effectiveTabs = visibleTabs.length > 0 ? visibleTabs : allTabs;

    const [activeTab, setActiveTab] = useState(effectiveTabs[0]?.id || '');

    useEffect(() => {
        if (effectiveTabs.length > 0 && !effectiveTabs.find(t => t.id === activeTab)) {
            setActiveTab(effectiveTabs[0].id);
        }
    }, [effectiveTabs, activeTab]);

    const ActiveComponent = effectiveTabs.find(t => t.id === activeTab)?.component || (() => <div>Section not found</div>);

    if (effectiveTabs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Please ask admin to set Dashboard preferences</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        <span className="text-gray-500 font-normal">Hello,</span> {user?.name || 'User'}
                    </h1>
                    <p className="text-gray-500 mt-1">Nice to have you back, what an exciting day!</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
                <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                    {effectiveTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                                activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
                <ActiveComponent />
            </div>
        </div>
    );
};
