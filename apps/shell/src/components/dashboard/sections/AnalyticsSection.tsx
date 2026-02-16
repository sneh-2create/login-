import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useAnalyticsDashboardData } from '@od-erp/query';
import { AnalyticsCard } from '../analytics/AnalyticsCard';
import { AnalyticsSidebar } from '../analytics/AnalyticsSidebar';
import {
    Users,
    GraduationCap,
    Briefcase,
    Building2,
    Calendar,
    Utensils,
    UserCheck,
    Presentation
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const AnalyticsSection: React.FC = () => {
    const { permissions, entityDetails, user } = useAppSelector((state: any) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    // Entity Group logic (Mocked for now based on typical structure, usually in local storage or auth state)
    // In migration, we need to know where entityGroup comes from. Angular uses localStorage 'entityGroup'.
    // We'll try to find it in the user object or use the current entity as a fallback.
    // For now, let's assume specific entities are available via a context or we default to current.
    // Ideally, this should be fetched or available in the store.

    // FALLBACK: Use current entity if specific group list is not available
    const availableEntities = (user as any)?.entityGroup || [{ entityId, name: entityDetails?.displayName || 'Current Institute' }];

    const hasPermission = (perm: string) => permissions?.includes(perm);
    const canViewDashboard = hasPermission('analyticsDashboard');
    const canViewModule = hasPermission('analyticsModule');

    const [selectedEntities, setSelectedEntities] = useState<string[]>([entityId]);
    const [preFilledSeats, setPreFilledSeats] = useState(false);

    // Initial selection
    useEffect(() => {
        if (availableEntities.length > 0 && selectedEntities.length === 0) {
            // Default to current entity or all? Angular defaults to current.
            setSelectedEntities([entityId]);
        }
    }, [entityId]);

    const { data, isLoading, isFetching } = useAnalyticsDashboardData(
        entityId, // The service call might rely on this for context, but the *filters* determine the data scope
        session,
        {
            entityList: selectedEntities,
            preFilledSeats
        },
        (canViewDashboard || canViewModule) && !!entityId && !!session && selectedEntities.length > 0
    );

    const handleEntityChange = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedEntities(prev => [...prev, id]);
        } else {
            setSelectedEntities(prev => prev.filter(e => e !== id));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedEntities(availableEntities.map((e: any) => e.entityId || e.id));
        } else {
            setSelectedEntities([]);
        }
    };

    if (!(canViewDashboard || canViewModule)) {
        return (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">You do not have permission to view the Analytics Dashboard.</p>
            </div>
        );
    }

    const {
        admissionData = { totalAdmissions: 0, totalSeats: 0 },
        registrationData = { totalRegistrations: 0, totalSeats: 0 },
        placementData = { totalDrives: 0, totalPlaced: 0 },
        totalPartnerInstitutes = 0,
        totalPartnerCompanies = 0,
        totalSeminars = 0,
        totalResourcePerson = 0,
        totalEvents = 0
    } = data || {};

    const cards = [
        {
            count: registrationData.totalRegistrations,
            label: `Registrations For ${registrationData.totalSeats} seats`,
            icon: Users,
            color: '#FFFFFF',
            bgColor: '#FFBC5B' // Orange equivalent
        },
        {
            count: admissionData.totalAdmissions,
            label: `Admissions For ${admissionData.totalSeats} seats`,
            icon: GraduationCap,
            color: '#FFFFFF',
            bgColor: '#646E78' // Grey equivalent
        },
        {
            count: placementData.totalPlaced,
            label: `Student Placed in ${placementData.totalDrives} Drive`,
            icon: Briefcase,
            color: '#FFFFFF',
            bgColor: '#FFBC5B'
        },
        {
            count: totalPartnerCompanies,
            label: 'Partner Companies',
            icon: Building2,
            color: '#FFFFFF',
            bgColor: '#A569BD' // Different color for variety
        },
        {
            count: totalEvents,
            label: 'Event Organised',
            icon: Calendar,
            color: '#FFFFFF',
            bgColor: '#3A3347' // Dark
        },
        {
            count: totalPartnerInstitutes,
            label: 'Feeding Institutes',
            icon: Utensils, // Icon choice for feeding
            color: '#FFFFFF',
            bgColor: '#FFBC5B'
        },
        {
            count: totalResourcePerson,
            label: 'Resource Person',
            icon: UserCheck,
            color: '#FFFFFF',
            bgColor: '#3A3347'
        },
        {
            count: totalSeminars,
            label: 'Total Seminars',
            icon: Presentation,
            color: '#FFFFFF',
            bgColor: '#FFBC5B'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
                {/* Sidebar */}
                <div className="md:col-span-4 lg:col-span-3">
                    <AnalyticsSidebar
                        entities={availableEntities}
                        selectedEntities={selectedEntities}
                        onEntityChange={handleEntityChange}
                        onSelectAll={handleSelectAll}
                        preFilledSeats={preFilledSeats}
                        onPreFilledSeatsChange={setPreFilledSeats}
                        isLoading={isLoading || isFetching}
                    />
                </div>

                {/* Main Content */}
                <div className="md:col-span-8 lg:col-span-9">
                    {/* Show loading overlay only if initial load */}
                    {isLoading && !data ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cards.map((card, index) => (
                                <AnalyticsCard
                                    key={index}
                                    count={card.count}
                                    label={card.label}
                                    icon={card.icon}
                                    color={card.color}
                                    bgColor={card.bgColor}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
