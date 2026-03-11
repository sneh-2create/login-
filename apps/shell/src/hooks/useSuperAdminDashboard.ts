import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@od-erp/api-client';
import { useAppDispatch, useAppSelector } from '@od-erp/store';
import {
    setCounts,
    setActiveStudents,
    setUserEntityData,
    setOnlinePayments,
    setCommunicationReport,
    setEntityModuleCounts,
    setEntityLocationCounts,
    setActiveStudentDateRange,
    setUserEntityDateRange,
    setOnlinePaymentDateRange,
    setCommunicationDateRange,
    setSelectedLocation,
} from '@od-erp/store';

export const useSuperAdminDashboard = () => {
    const dispatch = useAppDispatch();
    const {
        counts,
        activeStudents,
        userEntityData,
        onlinePayments,
        communicationReport,
        entityModuleCounts,
        entityLocationCounts,
        activeStudentDateRange,
        userEntityDateRange,
        onlinePaymentDateRange,
        communicationDateRange,
        selectedLocation
    } = useAppSelector((state: any) => state.dashboard); // Keeping simple for now, define RootState properly later if needed context

    const [loading, setLoading] = useState(false);

    // We can use a local refreshing state if we want to show a spinner only on refresh distinct from initial load
    // const [refreshing, setRefreshing] = useState(false);

    const fetchActiveStudents = useCallback(async () => {
        try {
            const data = await dashboardService.getActiveStudents(
                new Date(activeStudentDateRange.start).getTime(),
                new Date(activeStudentDateRange.end).getTime()
            );
            dispatch(setActiveStudents(data));
        } catch (e) { console.error(e); }
    }, [activeStudentDateRange, dispatch]);

    const fetchUserEntityData = useCallback(async () => {
        try {
            const data = await dashboardService.getUserByEntity(
                new Date(userEntityDateRange.start).getTime(),
                new Date(userEntityDateRange.end).getTime()
            );
            dispatch(setUserEntityData(data));
        } catch (e) { console.error(e); }
    }, [userEntityDateRange, dispatch]);

    const fetchOnlinePayments = useCallback(async () => {
        try {
            const data = await dashboardService.getOnlineFeePayments(
                new Date(onlinePaymentDateRange.start).getTime(),
                new Date(onlinePaymentDateRange.end).getTime()
            );
            dispatch(setOnlinePayments(data));
        } catch (e) { console.error(e); }
    }, [onlinePaymentDateRange, dispatch]);

    const fetchCommunicationReport = useCallback(async () => {
        try {
            const data = await dashboardService.getCommunicationReport(
                new Date(communicationDateRange.start).getTime(),
                new Date(communicationDateRange.end).getTime()
            );
            dispatch(setCommunicationReport(data));
        } catch (e) { console.error(e); }
    }, [communicationDateRange, dispatch]);

    const fetchEntityModuleCounts = useCallback(async () => {
        try {
            const data = await dashboardService.getEntityCountByModule();
            dispatch(setEntityModuleCounts(data));
        } catch (e) { console.error(e); }
    }, [dispatch]);

    const fetchEntityLocationCounts = useCallback(async () => {
        try {
            const data = await dashboardService.getEntityCountByLocation(selectedLocation);
            dispatch(setEntityLocationCounts(data));
        } catch (e) { console.error(e); }
    }, [selectedLocation, dispatch]);

    const fetchInitialData = useCallback(async (isRefresh = false) => {
        // If we have data and it's not a forced refresh, don't show full page loading
        if (!counts || isRefresh) {
            setLoading(true);
        }

        try {
            console.log("Fetching Dashboard Data...");
            const countData = await dashboardService.getCount();
            dispatch(setCounts(countData));

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
    }, [fetchActiveStudents, fetchUserEntityData, fetchOnlinePayments, fetchCommunicationReport, fetchEntityModuleCounts, fetchEntityLocationCounts, counts, dispatch]);

    useEffect(() => {
        // Only fetch on mount if we don't have data
        if (!counts) {
            fetchInitialData();
        }
    }, [fetchInitialData, counts]);

    const refreshDashboard = () => {
        fetchInitialData(true);
    };

    return {
        loading,
        counts,
        activeStudents,
        activeStudentDateRange,
        setActiveStudentDateRange: (range: any) => dispatch(setActiveStudentDateRange(range)),
        fetchActiveStudents,
        userEntityData,
        userEntityDateRange,
        setUserEntityDateRange: (range: any) => dispatch(setUserEntityDateRange(range)),
        fetchUserEntityData,
        onlinePayments,
        onlinePaymentDateRange,
        setOnlinePaymentDateRange: (range: any) => dispatch(setOnlinePaymentDateRange(range)),
        fetchOnlinePayments,
        communicationReport,
        communicationDateRange,
        setCommunicationDateRange: (range: any) => dispatch(setCommunicationDateRange(range)),
        fetchCommunicationReport,
        entityModuleCounts,
        entityLocationCounts,
        selectedLocation,
        setSelectedLocation: (loc: string) => dispatch(setSelectedLocation(loc)),
        fetchEntityLocationCounts,
        refreshDashboard // Exposed function
    };
};
