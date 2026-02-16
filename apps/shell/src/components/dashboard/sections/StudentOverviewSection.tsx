import { useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@od-erp/api-client';
import { useNavigate } from 'react-router-dom';
import { Eye, UserX, Flag, HelpCircle } from 'lucide-react';
import { StudentStatusCard } from '../widgets/StudentStatusCard';
import { StudentStatisticsCard } from '../widgets/StudentStatisticsCard';
import { InactiveRemarksCard } from '../widgets/InactiveRemarksCard';
import { StatusSummaryCard } from '../widgets/StatusSummaryCard';
import { StudentStrengthChart } from '../widgets/StudentStrengthChart';
import { StudentDoughnutChart } from '../widgets/StudentDoughnutChart';
import { BirthdayListCard } from '../widgets/BirthdayListCard';
import { OverviewSideWidget } from '../widgets/OverviewSideWidget';
import { StudentStatisticsComparisonChart } from '../widgets/StudentStatisticsComparisonChart';

export const StudentOverviewSection = () => {
    const { permissions, entityDetails } = useAppSelector((state: any) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';
    const navigate = useNavigate();

    const hasPermission = useMemo(() => {
        return permissions?.includes('overviewDashboard');
    }, [permissions]);

    const { data: sisData, isLoading } = useQuery({
        queryKey: ['sisDashboard', entityId, session],
        queryFn: () => dashboardService.getSISDashboard(entityId, session),
        enabled: !!entityId && !!session && hasPermission,
        staleTime: 5 * 60 * 1000,
    });

    if (!hasPermission) return null;

    const currentSessionData = sisData?.headCount?.currentSession?.[0] || {
        totalStudents: 0, boys: 0, girls: 0, others: 0,
        inactiveStudents: 0, inactiveBoys: 0, inactiveGirls: 0, inactiveOthers: 0,
        percentageBoys: 0, percentageGirls: 0, percentageOthers: 0,
        appStudents: 0, dormantStudents: 0,
        incorrectMobileStudents: 0
    };

    const previousSessionData = sisData?.headCount?.previousSession?.[0] || {
        totalStudents: 0, boys: 0, girls: 0, others: 0,
        inactiveStudents: 0, inactiveBoys: 0, inactiveGirls: 0, inactiveOthers: 0
    };

    const activeStudentData = {
        total: currentSessionData.totalStudents,
        boys: currentSessionData.boys,
        girls: currentSessionData.girls,
        others: currentSessionData.others,
        percentageBoys: currentSessionData.percentageBoys,
        percentageGirls: currentSessionData.percentageGirls,
        percentageOthers: currentSessionData.percentageOthers
    };

    const inactiveStudentData = {
        total: currentSessionData.inactiveStudents,
        boys: currentSessionData.inactiveBoys,
        girls: currentSessionData.inactiveGirls,
        others: currentSessionData.inactiveOthers,
        percentageBoys: currentSessionData.inactiveBoys * 5,
        percentageGirls: currentSessionData.inactiveGirls * 5,
        percentageOthers: currentSessionData.inactiveOthers * 5
    };

    // Extras Data
    const awakeDormantData = sisData?.awakeDormantCount?.[0] || { awakeStudents: 0, dormantStudents: 0, todayActivations: 0 };
    const inactiveReasons = sisData?.inactiveReason || [];
    const unresolvedQueries = sisData?.unresolvedODPayQueries || 0;
    const studentStrengthData = sisData?.groupByCourse || [];

    // New Data
    const socialCategoryData = sisData?.groupBySocialCategory || [];
    const religionData = sisData?.groupByReligion || [];
    const birthdayStudents = sisData?.birthDayStudents || [];

    const handleCardClick = (path: string, state?: any) => {
        navigate(path, { state });
    };

    const handleExportReport = (params: any) => {
        navigate('/student/exportReport', { state: params });
    };

    return (
        <div className="mt-8 animate-in fade-in duration-500 space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Student Overview</h3>

            {/* Main Overview Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StudentStatusCard
                    title="Active Student"
                    data={activeStudentData}
                    type="active"
                    loading={isLoading}
                />

                <StudentStatisticsCard
                    currentMeasure={currentSessionData}
                    previousMeasure={previousSessionData}
                    loading={isLoading}
                />

                <StudentStatusCard
                    title="Inactive Student"
                    data={inactiveStudentData}
                    type="inactive"
                    loading={isLoading}
                />
            </div>

            {/* Extras Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Inactive Remarks */}
                <div className="lg:col-span-1 h-full">
                    <InactiveRemarksCard remarks={inactiveReasons} />
                </div>

                {/* Status Summaries */}
                <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
                    {/* Awake Students */}
                    <StatusSummaryCard
                        title="Awake Students"
                        count={awakeDormantData.awakeStudents}
                        icon={Eye}
                        color="text-yellow-600"
                        bgColor="bg-yellow-100"
                        onClick={() => handleExportReport({ active: true })}
                    />

                    {/* Dormant Students */}
                    <StatusSummaryCard
                        title="Dormant Students"
                        count={awakeDormantData.dormantStudents}
                        icon={UserX}
                        color="text-pink-600"
                        bgColor="bg-pink-100"
                        onClick={() => handleExportReport({ active: false })}
                    />

                    {/* Today's Activations */}
                    <StatusSummaryCard
                        title="Today's Admission Activations"
                        count={awakeDormantData.todayActivations}
                        icon={Flag}
                        color="text-blue-600"
                        bgColor="bg-blue-100"
                    />

                    {/* Unresolved Queries */}
                    <StatusSummaryCard
                        title="Unresolved Queries"
                        count={unresolvedQueries}
                        icon={HelpCircle}
                        color="text-purple-600"
                        bgColor="bg-purple-100"
                        onClick={() => handleCardClick('/studentQueries')}
                    />
                </div>
            </div>

            {/* Student Strength Chart */}
            <div className="w-full h-[400px]">
                <StudentStrengthChart data={studentStrengthData} loading={isLoading} />
            </div>

            {/* Doughnut Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="h-[400px]">
                    <StudentDoughnutChart
                        title="Social Category Wise Student Strength"
                        data={socialCategoryData}
                        dataKey="socialCategory"
                        loading={isLoading}
                    />
                </div>
                <div className="h-[400px]">
                    <StudentDoughnutChart
                        title="Religion Wise Student Strength"
                        data={religionData}
                        dataKey="religion"
                        loading={isLoading}
                    />
                </div>
            </div>

            {/* Birthdays and Overview Widget */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 h-full">
                    <BirthdayListCard
                        students={birthdayStudents}
                        loading={isLoading}
                        showBatch={entityDetails?.entityPreferences?.showBatch}
                    />
                </div>
                <div className="lg:col-span-1 h-full">
                    <OverviewSideWidget
                        appStudents={currentSessionData.appStudents || 0}
                        dormantStudents={currentSessionData.dormantStudents || 0}
                        incorrectMobile={currentSessionData.incorrectMobileStudents || 0}
                        loading={isLoading}
                        onAppClick={() => handleExportReport({ appStatus: true })}
                        onDormantClick={() => handleExportReport({ active: false })}
                    />
                </div>
            </div>

            {/* Student Statistics Comparison Chart */}
            <div className="w-full h-[400px]">
                <StudentStatisticsComparisonChart
                    currentSessionData={currentSessionData}
                    previousSessionData={previousSessionData}
                    loading={isLoading}
                />
            </div>
        </div>
    );
};
