import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@od-erp/api-client';

import {
    DashboardCounts,
    ActiveStudentData,
    OnlineFeePaymentData,
    CommunicationReportData,
    UserEntityData,
    EntityModuleCount,
    EntityLocationCount
} from '@od-erp/types';

export const useSuperAdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<DashboardCounts | null>(null);

    // Data States
    const [activeStudents, setActiveStudents] = useState<ActiveStudentData[]>([]);
    const [userEntityData, setUserEntityData] = useState<UserEntityData[]>([]);
    const [onlinePayments, setOnlinePayments] = useState<OnlineFeePaymentData[]>([]);
    const [communicationReport, setCommunicationReport] = useState<CommunicationReportData[]>([]);
    const [entityModuleCounts, setEntityModuleCounts] = useState<EntityModuleCount[]>([]);
    const [entityLocationCounts, setEntityLocationCounts] = useState<EntityLocationCount[]>([]);

    // Filter States (Default to last 30 days)
    const [activeStudentDateRange, setActiveStudentDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [userEntityDateRange, setUserEntityDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [onlinePaymentDateRange, setOnlinePaymentDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [communicationDateRange, setCommunicationDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [selectedLocation, setSelectedLocation] = useState('state');

    const fetchActiveStudents = useCallback(async () => {
        try {
            const data = await dashboardService.getActiveStudents(
                new Date(activeStudentDateRange.start).getTime(),
                new Date(activeStudentDateRange.end).getTime()
            );
            setActiveStudents(data);
        } catch (e) { console.error(e); }
    }, [activeStudentDateRange]);

    const fetchUserEntityData = useCallback(async () => {
        try {
            const data = await dashboardService.getUserByEntity(
                new Date(userEntityDateRange.start).getTime(),
                new Date(userEntityDateRange.end).getTime()
            );
            setUserEntityData(data);
        } catch (e) { console.error(e); }
    }, [userEntityDateRange]);

    const fetchOnlinePayments = useCallback(async () => {
        try {
            const data = await dashboardService.getOnlineFeePayments(
                new Date(onlinePaymentDateRange.start).getTime(),
                new Date(onlinePaymentDateRange.end).getTime()
            );
            setOnlinePayments(data);
        } catch (e) { console.error(e); }
    }, [onlinePaymentDateRange]);

    const fetchCommunicationReport = useCallback(async () => {
        try {
            const data = await dashboardService.getCommunicationReport(
                new Date(communicationDateRange.start).getTime(),
                new Date(communicationDateRange.end).getTime()
            );
            setCommunicationReport(data);
        } catch (e) { console.error(e); }
    }, [communicationDateRange]);

    const fetchEntityModuleCounts = useCallback(async () => {
        try {
            const data = await dashboardService.getEntityCountByModule();
            setEntityModuleCounts(data);
        } catch (e) { console.error(e); }
    }, []);

    const fetchEntityLocationCounts = useCallback(async () => {
        try {
            const data = await dashboardService.getEntityCountByLocation(selectedLocation);
            setEntityLocationCounts(data);
        } catch (e) { console.error(e); }
    }, [selectedLocation]);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            console.log("Fetching Dashboard Data...");
            const countData = await dashboardService.getCount();
            console.log("Counts Data:", countData);
            setCounts(countData);

            await Promise.all([
                fetchActiveStudents(),
                fetchUserEntityData(),
                fetchOnlinePayments(),
                fetchCommunicationReport(),
                fetchEntityModuleCounts(),
                fetchEntityLocationCounts()
            ]);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [fetchActiveStudents, fetchUserEntityData, fetchOnlinePayments, fetchCommunicationReport, fetchEntityModuleCounts, fetchEntityLocationCounts]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return {
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
        fetchEntityLocationCounts
    };
};
