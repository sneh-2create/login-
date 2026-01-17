import { useState, useMemo } from 'react';
import { Title, Card, DataTable, Button, Input, Select } from '@od-erp/ui';
import { useAdmissionFollowUp, useAdmissionFollowUpStats, useCounselors } from '@od-erp/query';
import { admissionFollowUp, admissionFollowUpPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Trash2 } from 'lucide-react';
import { admissionFollowUpService } from '@od-erp/api-client';
import { useAppSelector } from '@od-erp/store';

const AdmissionFollowUps = () => {
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [status, setStatus] = useState<string>('');
    // "All", "todaysFollowUp", "upcomingFollowUp", "overdueFollowUp", "completedFollowUp"
    const [activeTab, setActiveTab] = useState('All');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const permission = localStorage.getItem('permissions') || '';
    const isAdmissionAdmin = permission.includes('isAdmissionAdmin');
    const loggedInCounselorId = localStorage.getItem('employee') || '';

    const { data: counselors } = useCounselors(entityId, 'counselor');

    // Logic to determine payload based on Active Tab
    const payload: admissionFollowUpPayload = useMemo(() => {
        const basePayload: admissionFollowUpPayload = {
            entity: entityId,
            session,
            pageSize: pagination.pageSize,
            pageNumber: pagination.pageIndex + 1,
            counselorId: isAdmissionAdmin ? selectedCounselor : loggedInCounselorId,
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        if (activeTab === 'todaysFollowUp') {
            basePayload.startDate = today.getTime();
            basePayload.endDate = todayEnd.getTime();
        } else if (activeTab === 'upcomingFollowUp') {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            basePayload.startDate = today.getTime();
            basePayload.endDate = nextWeek.getTime(); // Logic from Angular: endDate = +7 days
            basePayload.status = 'pending';
        } else if (activeTab === 'overdueFollowUp') {
            const lastMonth = new Date(today);
            lastMonth.setDate(today.getDate() - 30);
            basePayload.startDate = lastMonth.getTime(); // Logic from Angular: startDate = -30 days
            basePayload.endDate = today.getTime(); // Logic from Angular: endDate = today 00:00
            basePayload.status = 'pending';
        } else if (activeTab === 'completedFollowUp') {
            basePayload.status = 'completed';
        } else {
            // All - check manual filters
            if (dateRange.start) basePayload.startDate = new Date(dateRange.start).getTime();
            if (dateRange.end) basePayload.endDate = new Date(dateRange.end).getTime();
            if (status) basePayload.status = status;
        }

        return basePayload;
    }, [entityId, session, pagination, activeTab, selectedCounselor, dateRange, status, isAdmissionAdmin, loggedInCounselorId]);

    const { data, isLoading, refetch } = useAdmissionFollowUp(payload);
    const { data: stats } = useAdmissionFollowUpStats({ entity: entityId, session, counselorId: isAdmissionAdmin ? selectedCounselor : loggedInCounselorId });

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete?')) {
            try {
                await admissionFollowUpService.deleteAdmissionFollowUp(id);
                refetch();
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete");
            }
        }
    };

    const columns = useMemo<ColumnDef<admissionFollowUp>[]>(
        () => [
            {
                header: 'S.No',
                cell: (info) => (pagination.pageIndex * pagination.pageSize) + info.row.index + 1,
                size: 60,
            },
            {
                header: 'Application',
                accessorFn: (row) => row.applicationNumber,
                cell: (info) => (
                    <div className="flex flex-col text-sm">
                        <span>App No: <strong>{info.row.original.applicationNumber || '-'}</strong></span>
                        <span>App Date: <strong>{info.row.original.studentData?.date ? format(info.row.original.studentData.date, 'dd/MMM/yyyy') : '-'}</strong></span>
                    </div>
                )
            },
            {
                header: 'Name',
                accessorFn: (row) => row.studentData?.name,
                cell: (info) => (
                    <div className="flex flex-col text-sm">
                        <span>Name: <strong>{info.row.original.studentData?.name || '-'}</strong></span>
                        <span>Phone: <strong>{info.row.original.studentData?.phone || '-'}</strong></span>
                    </div>
                )
            },
            {
                header: 'Class',
                accessorFn: (row) => row.studentData?.course,
                cell: (info) => (
                    <div className="flex flex-col text-sm">
                        <span>Class: <strong>{info.row.original.studentData?.course || '-'}</strong></span>
                        <span>Stream: <strong>{info.row.original.studentData?.stream || '-'}</strong></span>
                    </div>
                )
            },
            {
                header: 'Counselor Name',
                accessorKey: 'counselorName',
            },
            {
                header: 'Created At',
                accessorKey: 'createdAt',
                cell: (info) => info.getValue() ? format(info.getValue() as number, 'dd/MMM/yyyy') : '-',
            },
            {
                header: 'FollowUp Query',
                accessorKey: 'followUpQuery',
            },
            {
                header: 'FollowUp Date',
                accessorKey: 'followUpDate',
                cell: (info) => info.getValue() ? format(info.getValue() as number, 'dd/MMM/yyyy HH:mm') : '-',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (info) => (
                    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${info.getValue() === 'pending' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {(info.getValue() as string)?.toUpperCase()}
                    </span>
                )
            },
            {
                header: 'Completion Remark',
                accessorKey: 'completionRemark',
            },
            {
                header: 'Action',
                id: 'actions',
                cell: (info) => (
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => console.log("View", info.row.original)}>
                            <Eye className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(info.row.original._id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                ),
            },
        ],
        [pagination]
    );

    return (
        <div className="w-full max-w-full min-w-0 p-6 space-y-6 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <Title variant="pageTitle">Follow Ups</Title>
                    <div className="text-sm text-gray-500 cursor-pointer">
                        Dashboard &gt; Admission Reports &gt; <span className="text-primary font-semibold">Follow Ups</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {isAdmissionAdmin && (
                        <div>
                            <Select
                                label="Counselor"
                                placeholder="Select Counselor"
                                options={counselors?.map(c => ({ label: c.name, value: c._id })) || []}
                                value={selectedCounselor}
                                onChange={(e) => setSelectedCounselor(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <Input
                            type="date"
                            label="Start Date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            disabled={activeTab !== 'All'}
                        />
                    </div>
                    <div>
                        <Input
                            type="date"
                            label="End Date"
                            value={dateRange.end}
                            min={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            disabled={activeTab !== 'All'}
                        />
                    </div>

                    <div>
                        <Select
                            label="Status"
                            placeholder="Status"
                            options={[{ label: 'PENDING', value: 'pending' }, { label: 'COMPLETED', value: 'completed' }]}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={activeTab !== 'All'}
                        />
                    </div>
                    {activeTab === 'All' && (
                        <div>
                            <Button onClick={() => refetch()} className="mb-1 w-full">Go</Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex space-x-2 overflow-x-auto border-b">
                {['All', 'todaysFollowUp', 'upcomingFollowUp', 'overdueFollowUp', 'completedFollowUp'].map(tab => {
                    const statsData = Array.isArray(stats) && stats.length > 0 ? stats[0] : (stats || {});
                    return (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setPagination(p => ({ ...p, pageIndex: 0 })); }}
                            className={`py-2 px-4 whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                                ? 'border-primary text-primary font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'All' ? 'All' :
                                tab === 'todaysFollowUp' ? "Today's Follow Up" :
                                    tab === 'upcomingFollowUp' ? "Upcoming Follow Up" :
                                        tab === 'overdueFollowUp' ? "Overdue Follow Up" : "Completed"
                            }
                            ({
                                tab === 'All' ? statsData.total || 0 :
                                    tab === 'todaysFollowUp' ? statsData.todayFollowUps || 0 :
                                        tab === 'upcomingFollowUp' ? statsData.upcomingFollowUps || 0 :
                                            tab === 'overdueFollowUp' ? statsData.overdueFollowUps || 0 :
                                                statsData.completedFollowUps || 0
                            })
                        </button>
                    );
                })}
            </div>

            <Card className="overflow-hidden">
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        data={data || []}
                        columns={columns}
                        isLoading={isLoading}
                    />
                </div>
            </Card>

            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                    Showing {data?.length || 0} records
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
                        disabled={pagination.pageIndex === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                        disabled={!data || data.length < pagination.pageSize}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default AdmissionFollowUps;
