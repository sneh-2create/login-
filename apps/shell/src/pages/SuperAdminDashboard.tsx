import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { Loader2, Users, GraduationCap, UserSquare2, BookOpen } from 'lucide-react';
import { Title } from '@od-erp/ui';

// Shared Components
import {
    SummaryCard,
    DashboardSection,
    DataTable,
    DateRangeFilter,
    SelectInput
} from '@od-erp/ui';

// Logic & Data
import { useSuperAdminDashboard } from '../hooks/useSuperAdminDashboard';
import {
    activeStudentColumns,
    userEntityColumns,
    onlinePaymentColumns,
    communicationColumns,
    moduleCountColumns,
    locationCountColumns
} from '../components/Dashboard/Superadmin/columns';

export const SuperAdminDashboard: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);
    const navigate = useNavigate();

    // Redirect logic could also be in a hook or Higher Order Component, 
    // but simple enough to keep here for visibility of auth guard.
    useEffect(() => {
        if (user && user.userType !== 'od1') {
            navigate('/entity/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const {
        loading,
        counts,
        activeStudents,
        activeStudentDateRange,
        setActiveStudentDateRange,
        fetchActiveStudents,
        userEntityData,
        userEntityDateRange,
        setUserEntityDateRange,
        fetchUserEntityData,
        onlinePayments,
        onlinePaymentDateRange,
        setOnlinePaymentDateRange,
        fetchOnlinePayments,
        communicationReport,
        communicationDateRange,
        setCommunicationDateRange,
        fetchCommunicationReport,
        entityModuleCounts,
        entityLocationCounts,
        selectedLocation,
        setSelectedLocation,

        fetchEntityLocationCounts,
        refreshDashboard
    } = useSuperAdminDashboard();

    if (loading && !counts) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-[#1ca9c9]" /></div>;
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <Title as="h1" variant="pageTitle">Dashboard</Title>
                <button
                    onClick={refreshDashboard}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 border border-gray-200 shadow-sm transition-all text-sm font-medium disabled:opacity-50"
                >
                    <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SummaryCard title="Total Entities" value={counts?.totalEntities ?? 0} icon={Users} color="text-blue-600" />
                <SummaryCard title="Total Students" value={counts?.totalStudents ?? 0} icon={GraduationCap} color="text-green-600" />
                <SummaryCard title="Total Employees" value={counts?.totalEmployees ?? 0} icon={UserSquare2} color="text-purple-600" />
                <SummaryCard title="Total Books" value={counts?.totalBooks ?? 0} icon={BookOpen} color="text-orange-600" />
            </div>

            {/* Section 1: Active Students & User Entity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection
                    title="Active Students Data"
                    rightElement={
                        <DateRangeFilter
                            startDate={activeStudentDateRange.start}
                            endDate={activeStudentDateRange.end}
                            onStartChange={(d) => setActiveStudentDateRange({ ...activeStudentDateRange, start: d })}
                            onEndChange={(d) => setActiveStudentDateRange({ ...activeStudentDateRange, end: d })}
                            onGo={fetchActiveStudents}
                        />
                    }
                >
                    <DataTable
                        columns={activeStudentColumns}
                        data={activeStudents}
                        maxHeight="max-h-96"
                    />
                </DashboardSection>

                <DashboardSection
                    title="User Entity Data"
                    rightElement={
                        <DateRangeFilter
                            startDate={userEntityDateRange.start}
                            endDate={userEntityDateRange.end}
                            onStartChange={(d) => setUserEntityDateRange({ ...userEntityDateRange, start: d })}
                            onEndChange={(d) => setUserEntityDateRange({ ...userEntityDateRange, end: d })}
                            onGo={fetchUserEntityData}
                        />
                    }
                >
                    <DataTable
                        columns={userEntityColumns}
                        data={userEntityData}
                        maxHeight="max-h-96"
                    />
                </DashboardSection>
            </div>

            {/* Section 2: Online Fee & Communication */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection
                    title="Online Fee Payments"
                    rightElement={
                        <DateRangeFilter
                            startDate={onlinePaymentDateRange.start}
                            endDate={onlinePaymentDateRange.end}
                            onStartChange={(d) => setOnlinePaymentDateRange({ ...onlinePaymentDateRange, start: d })}
                            onEndChange={(d) => setOnlinePaymentDateRange({ ...onlinePaymentDateRange, end: d })}
                            onGo={fetchOnlinePayments}
                        />
                    }
                >
                    <DataTable
                        columns={onlinePaymentColumns}
                        data={onlinePayments}
                        maxHeight="max-h-96"
                    />
                </DashboardSection>

                <DashboardSection
                    title="Communication Report Data"
                    rightElement={
                        <DateRangeFilter
                            startDate={communicationDateRange.start}
                            endDate={communicationDateRange.end}
                            onStartChange={(d) => setCommunicationDateRange({ ...communicationDateRange, start: d })}
                            onEndChange={(d) => setCommunicationDateRange({ ...communicationDateRange, end: d })}
                            onGo={fetchCommunicationReport}
                        />
                    }
                >
                    <DataTable
                        columns={communicationColumns}
                        data={communicationReport}
                        maxHeight="max-h-96"
                    />
                </DashboardSection>
            </div>

            {/* Section 3: Entity Counts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection title="Entity Count Module Data">
                    <DataTable
                        columns={moduleCountColumns}
                        data={entityModuleCounts || []}
                        maxHeight="max-h-96"
                    />
                </DashboardSection>

                <DashboardSection
                    title="Entity Count By Location API"
                    rightElement={
                        <SelectInput
                            value={selectedLocation}
                            onChange={(e) => {
                                setSelectedLocation(e.target.value);
                                fetchEntityLocationCounts();
                            }}
                            options={[
                                { label: 'State', value: 'state' },
                                { label: 'City', value: 'city' }
                            ]}
                        />
                    }
                >
                    <DataTable
                        columns={locationCountColumns}
                        data={entityLocationCounts || []}
                        maxHeight="max-h-96"
                    />
                </DashboardSection>
            </div>
        </div>
    );
};
