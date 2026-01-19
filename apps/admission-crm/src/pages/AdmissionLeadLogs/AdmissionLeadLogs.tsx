import { useState, useMemo } from 'react';
import { useAdmissionLeadLogs, useCounselors } from '@od-erp/query';
import { Button, Title, Card, DataTable, Input, Select } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { admissionLeadLog } from '@od-erp/types';
import { Phone, Eye, Trash2 } from 'lucide-react';
import { admissionLeadLogsService } from '@od-erp/api-client';
import { useAppSelector } from '@od-erp/store';

const AdmissionLeadLogs = () => {
    // State for Filters
    const [pageNumber, setPageNumber] = useState(1);
    // const [pageSize, setPageSize] = useState(10);
    const pageSize = 10;
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedCallStatus, setSelectedCallStatus] = useState<string>('');
    // const [showMemberDetails, setShowMemberDetails] = useState(false);
    const showMemberDetails = false;

    // Hardcoded Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';

    const getStartTimestamp = () => {
        if (!startDate) return undefined;
        const date = new Date(startDate);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    };

    const getEndTimestamp = () => {
        if (!endDate) return undefined;
        const date = new Date(endDate);
        date.setHours(23, 59, 59, 999);
        return date.getTime();
    };

    // Queries
    const { data: counselors } = useCounselors(entityId, 'counselor');

    // Construct Query Payload
    const queryPayload = useMemo(() => ({
        entity: entityId,
        session: session,
        pageNumber,
        pageSize,
        counselorId: selectedCounselor || undefined,
        startDate: getStartTimestamp(),
        endDate: getEndTimestamp(),
        source: selectedSource || undefined,
        status: selectedStatus ? [selectedStatus] : undefined, // API expects array
        callStatus: selectedCallStatus || undefined,
        memberDetails: showMemberDetails
    }), [entityId, session, pageNumber, pageSize, selectedCounselor, startDate, endDate, selectedSource, selectedStatus, selectedCallStatus, showMemberDetails]);

    const { data: reportData, isLoading, refetch } = useAdmissionLeadLogs(queryPayload);

    // Options
    const counselorOptions = counselors?.map((c: any) => ({
        label: c.name,
        value: c._id
    })) || [];
    counselorOptions.unshift({ label: 'All Counselors', value: '' });

    const sourceOptions = [
        { label: 'All Sources', value: '' },
        { label: 'Visit', value: 'visit' },
        { label: 'MyOperator', value: 'myOperator' }
    ];

    const statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Duplicate', value: 'duplicate' },
        { label: 'Converted', value: 'converted' },
        { label: 'Rejected', value: 'rejected' }
    ];

    const callStatusOptions = [
        { label: 'All Call Status', value: '' },
        { label: 'Received', value: 'received' },
        { label: 'Missed', value: 'missed' },
        { label: 'Transferred', value: 'transferred' },
        { label: 'No Receiver', value: 'noReceiver' },
        { label: 'Call Not Picked', value: 'callNotPicked' }
    ];


    // Handlers
    const handleSearch = () => {
        setPageNumber(1); // Reset to page 1 on search
        refetch();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete?')) {
            try {
                await admissionLeadLogsService.deleteAdmissionLeadLogs(id);
                refetch();
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    const handleView = (id: string) => {
        console.log("View Lead", id);
        // Implement View Logic or Modal
    };

    const handleClickToCall = async (phone: string) => {
        try {
            await admissionLeadLogsService.clickToCall({
                entity: entityId,
                session: session,
                phone: phone,
                applicationNumber: phone,
                myOperatorId: localStorage.getItem('myOperatorId')
            });
            alert('Call Initiated');
        } catch (error) {
            console.error("Call failed", error);
        }
    };

    // Columns
    const columns: ColumnDef<admissionLeadLog>[] = [
        {
            accessorKey: 'position',
            header: 'S.No',
            cell: info => ((pageNumber - 1) * pageSize) + info.row.index + 1
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: info => (
                <div className="flex flex-col">
                    <span className="font-medium text-primary-600 cursor-pointer" onClick={() => handleView(info.row.original._id)}>{info.getValue() as string || '-'}</span>
                    <span className="text-xs text-gray-500">{info.row.original.dob ? new Date(info.row.original.dob).toLocaleDateString() : '-'}</span>
                </div>
            )
        },
        { accessorKey: 'course', header: 'Class' },
        { accessorKey: 'stream', header: 'Stream' },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: info => (
                <div className="flex items-center gap-2">
                    <span>{info.getValue() as string}</span>
                    <Phone size={14} className="cursor-pointer text-blue-500" onClick={() => handleClickToCall(info.getValue() as string)} />
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: info => {
                const status = (info.getValue() as string).toLowerCase();
                let colorClass = 'bg-gray-100 text-gray-800';
                if (status === 'pending') colorClass = 'bg-red-100 text-red-800';
                else if (status === 'duplicate') colorClass = 'bg-orange-100 text-orange-800';
                else if (status === 'converted') colorClass = 'bg-green-100 text-green-800';
                else if (status === 'rejected') colorClass = 'bg-blue-100 text-blue-800';

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${colorClass}`}>
                        {status}
                    </span>
                );
            }
        },
        { accessorKey: 'source', header: 'Source' },
        {
            accessorKey: 'date',
            header: 'Date',
            cell: info => new Date(info.getValue() as number).toLocaleDateString()
        },
        {
            accessorKey: 'callDetails.callStatus',
            header: 'Call Status',
            cell: info => {
                const callStatus = info.row.original.callDetails?.callStatus;
                return callStatus ? <span className="uppercase">{callStatus}</span> : '-';
            }
        },
        { accessorKey: 'counselorName', header: 'Counselor Name' },
        {
            id: 'actions',
            header: 'Action',
            cell: info => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(info.row.original._id)}>
                        <Eye size={16} className="text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(info.row.original._id)}>
                        <Trash2 size={16} className="text-red-500" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col h-full w-full max-w-full min-w-0 bg-gray-50 p-4 md:p-6 gap-4 md:gap-6 overflow-hidden box-border bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center shrink-0 flex-wrap gap-2 w-full min-w-0">
                <div className="min-w-0 truncate">
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>Admission Lead Logs</b>
                    </div>
                    <Title variant="pageTitle">Admission Lead Logs</Title>
                </div>
            </div>

            <Card className="p-4 shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Counselor</label>
                        <Select
                            options={counselorOptions}
                            value={selectedCounselor}
                            onChange={(e) => setSelectedCounselor(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Source</label>
                        <Select
                            options={sourceOptions}
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                        <Select
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Call Status</label>
                        <Select
                            options={callStatusOptions}
                            value={selectedCallStatus}
                            onChange={(e) => setSelectedCallStatus(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button onClick={handleSearch} isLoading={isLoading}>Go</Button>
                    </div>
                </div>
            </Card>

            <div className="flex-1 min-h-0 min-w-0 w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white flex flex-col">
                <div className="flex-1 w-full max-w-full overflow-auto">
                    <DataTable
                        columns={columns}
                        data={reportData?.data || []}
                        isLoading={isLoading}
                    />
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-between items-center shrink-0 bg-gray-50">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600 font-medium">
                        Page {pageNumber} {reportData?.count ? `of ${Math.ceil(reportData.count / pageSize)}` : ''}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageNumber(p => p + 1)}
                        disabled={isLoading || (reportData?.count ? pageNumber >= Math.ceil(reportData.count / pageSize) : false)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdmissionLeadLogs;
