import React, { useState, useMemo } from 'react';
import { Card, DataTable, Button, Input, Select } from '@od-erp/ui';
import { useSessions, useAdmissionStudentData, useAdmissionStages, useAdmissionStageSetup, useAddAdmissionStudentData } from '@od-erp/query';
import { AdmissionLead, AdmissionStudentDataPayload } from '@od-erp/types';
import { admissionStudentDataService } from '@od-erp/api-client';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer, Filter, RefreshCw } from 'lucide-react';
import AddStudentModal from './components/AddStudentModal';
import FilterModal from './components/FilterModal';
import UploadExcelModal from './components/UploadExcelModal';
import * as XLSX from 'xlsx';
import { useAppSelector, useAppDispatch, setAcademicSession } from '@od-erp/store';

const AdmissionStudentData = () => {
    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const dispatch = useAppDispatch();

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [selectedStage, setSelectedStage] = useState('Total');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchBy, setSearchBy] = useState('name');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<Partial<AdmissionStudentDataPayload>>({});
    const [isExporting, setIsExporting] = useState(false);

    // Mutations
    const addStudentMutation = useAddAdmissionStudentData();

    // Queries
    const { data: sessions } = useSessions(entityId);

    // Set default session


    const { data: stageSetup } = useAdmissionStageSetup(entityId, session);
    const { data: stageCounts, refetch: refetchStages } = useAdmissionStages(entityId, session);

    // Payload for student data
    const payload: AdmissionStudentDataPayload = useMemo(() => {
        const p: AdmissionStudentDataPayload = {
            entity: entityId,
            session: session,
            pageNumber,
            pageSize,
            search: searchTerm,
            searchBy: searchBy,
        };

        if (selectedStage !== 'Total') {
            p.stage = selectedStage;
        }

        // Merge advanced filters
        return { ...p, ...currentFilters };
    }, [entityId, session, pageNumber, pageSize, searchTerm, searchBy, selectedStage, currentFilters]);

    const { data, isLoading, refetch, isFetching } = useAdmissionStudentData(payload);

    // Handlers
    const handleAddStudent = async (formData: any) => {
        try {
            await addStudentMutation.mutateAsync({
                ...formData,
                entity: entityId,
                session: session,
                currentStage: 'Registered', // Default stage
                date: new Date().getTime(),
            });
            setIsAddModalOpen(false);
            refetch();
            refetchStages();
        } catch (error) {
            console.error('Failed to add student:', error);
        }
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            // Create payload to fetch all data
            const exportPayload: AdmissionStudentDataPayload = {
                ...payload,
                pageNumber: 1,
                pageSize: 100000, // Fetch all data
            };

            const response = await admissionStudentDataService.listAdmissionStudentData(exportPayload);

            if (!response?.data) return;

            const worksheet = XLSX.utils.json_to_sheet(response.data.map((item, index) => ({
                'S.No': index + 1,
                'Name': item.name,
                'Application No': item.applicationNumber,
                'Phone': item.phone,
                'Course': item.course,
                'Father Name': item.fatherName,
                'Stage': item.currentStage,
                'Date': item.date ? format(new Date(item.date), 'dd-MMM-yyyy') : '-'
            })));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
            XLSX.writeFile(workbook, `StudentData_${session}.xlsx`);
        } catch (error) {
            console.error('Failed to export excel:', error);
            alert('Failed to export excel. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handlePrint = () => {
        if (!data?.data) return;
        localStorage.setItem('admissionStudentData', JSON.stringify({
            data: data.data,
            pageNumber,
            pageSize
        }));
        window.open('/admission/print/admissionStudentData', '_blank');
    };

    const handleApplyFilters = (filters: Partial<AdmissionStudentDataPayload>) => {
        setCurrentFilters(filters);
        setIsFilterModalOpen(false);
        setPageNumber(1);
    };

    const handleUploadExcel = (file: File) => {
        console.log('Uploading file:', file);
        // TODO: Implement actual upload API call
        // const formData = new FormData();
        // formData.append('file', file);
        // uploadMutation.mutate(formData);
        setTimeout(() => {
            setIsUploadModalOpen(false);
            alert('File uploaded successfully (Mock)');
        }, 1000);
    };

    const handleGenerateReport = () => {
        alert('Report generation feature is coming soon!');
    };

    const handleRefresh = () => {
        refetch();
        refetchStages();
    };

    const handleNeedHelp = () => {
        alert('For support, please contact admin@okiedokie.com');
    }

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setAcademicSession(e.target.value));
    };


    // Columns
    const columns = useMemo<ColumnDef<AdmissionLead>[]>(() => [
        {
            header: 'S.No',
            accessorKey: 'sno',
            cell: info => (pageNumber - 1) * pageSize + info.row.index + 1,
        },
        {
            header: 'Action',
            id: 'actions',
            cell: () => (
                <div className="flex space-x-2">
                    <button className="text-blue-500 hover:text-blue-700 font-medium text-sm">
                        View
                    </button>
                </div>
            )
        },
        {
            header: 'Current Stage',
            accessorKey: 'currentStage',
            cell: info => {
                const val = info.getValue() as string;
                return (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold 
                        ${val === 'Approved' ? 'bg-green-100 text-green-800' :
                            val === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'}`}>
                        {val}
                    </span>
                );
            },
        },
        {
            header: 'Student Name',
            accessorKey: 'name',
            cell: info => <span className="font-medium text-blue-600 cursor-pointer">{info.getValue() as string}</span>
        },
        {
            header: 'Form No.',
            accessorKey: 'applicationNumber',
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: info => {
                const val = info.getValue();
                return val ? format(new Date(val as number), 'dd-MMM-yyyy') : '-';
            },
        },
        {
            header: 'Tags',
            accessorKey: 'tags',
            cell: info => {
                const tags = info.getValue() as any[];
                return (
                    <div className="flex flex-wrap gap-1">
                        {tags && tags.length > 0 ? tags.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 border border-green-200">
                                {typeof t === 'string' ? t : t.tag}
                            </span>
                        )) : '-'}
                    </div>
                );
            }
        },
        {
            header: 'Course',
            accessorKey: 'course',
        },
        {
            header: 'Phone',
            accessorKey: 'phone',
        },
        {
            header: 'Father Name',
            accessorKey: 'fatherName',
            cell: info => info.getValue() || '-'
        },
        {
            header: 'Receipt Id',
            id: 'receiptId',
            cell: () => '-'
        },
    ], [pageNumber, pageSize]);


    // Tabs Logic
    const tabs = useMemo(() => {
        const allTabs = [];
        let totalCount = 0;

        if (stageCounts) {
            totalCount = stageCounts.reduce((acc, curr) => acc + curr.count, 0);
        }

        allTabs.push({ name: 'Total', count: totalCount, value: 'Total' });

        // Add Dynamic Stages
        if (stageSetup) {
            stageSetup.forEach(stage => {
                const countObj = stageCounts?.find(s => s.stage === stage.stage);
                allTabs.push({
                    name: stage.stage,
                    count: countObj ? countObj.count : 0,
                    value: stage.stage
                });
            });
        }

        // Add Fixed Stages (Approved, Rejected, Withdrawn)
        const fixedStages = ['Approved', 'Rejected', 'Withdrawn'];
        fixedStages.forEach(fs => {
            const countObj = stageCounts?.find(s => s.stage === fs);
            allTabs.push({
                name: fs,
                count: countObj ? countObj.count : 0,
                value: fs
            });
        });

        return allTabs;

    }, [stageSetup, stageCounts]);


    return (
        <div className="w-full max-w-full min-w-0 p-6 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Application Data</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="mr-2">Select Session</span>
                        <select
                            className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer"
                            value={session}
                            onChange={handleSessionChange}
                        >
                            {sessions?.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>Add Application Data</Button>
                    <Button variant="outline" className="flex items-center" onClick={handleExportExcel} disabled={isExporting}>
                        <FileSpreadsheet className="mr-1 h-4 w-4" /> {isExporting ? 'Exporting...' : 'Excel'}
                    </Button>
                    <Button variant="outline" className="flex items-center" onClick={handlePrint}><Printer className="mr-1 h-4 w-4" /> Print</Button>
                    <Button variant="outline" className="flex items-center" onClick={handleGenerateReport}>Generate Report</Button>
                    <Button variant="outline" className="flex items-center" onClick={() => setIsUploadModalOpen(true)}>Upload Excel</Button>
                    <Button variant="outline" className="flex items-center" onClick={() => setIsFilterModalOpen(true)}><Filter className="mr-1 h-4 w-4" /> Filter</Button>
                    <Button variant="outline" className="flex items-center" onClick={handleRefresh}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isLoading || isFetching ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button variant="outline" className="flex items-center" onClick={handleNeedHelp}>Need Help</Button>

                </div>
            </div>

            {/* Stats / Tabs */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
                {tabs.map((tab) => (
                    <div
                        key={tab.value}
                        onClick={() => { setSelectedStage(tab.value); setPageNumber(1); }}
                        className={`cursor-pointer px-4 py-2 rounded-lg border text-center min-w-[100px] transition-colors
                            ${selectedStage === tab.value
                                ? 'bg-green-100 border-green-300 shadow-sm'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className="text-xs uppercase font-semibold text-gray-500 mb-1">{tab.name}</div>
                        <div className="text-lg font-bold text-gray-800">Count: {tab.count}</div>
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <Card className="mb-4 !p-4">
                <div className="flex gap-4">
                    <div className="w-1/4">
                        <Select
                            label=""
                            options={[
                                { label: 'Search By', value: '' },
                                { label: 'Name', value: 'name' },
                                { label: 'Application Number', value: 'applicationNumber' },
                                { label: 'Mobile No.', value: 'phone' }
                            ]}
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            label=""
                            placeholder="Search by Name/Application No./Mobile No./Father Name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b font-semibold text-gray-700 uppercase text-sm tracking-wider text-center">
                    APPLICATIONS
                </div>

                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={data?.data || []}
                        isLoading={isLoading}
                    />
                </div>

                {/* Pagination Footer */}
                <div className="p-3 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-600">
                    <span>Showing {data?.data?.length || 0} of {data?.totalCount || 0} entries</span>
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                            disabled={pageNumber === 1}
                            onClick={() => setPageNumber(p => p - 1)}
                        >
                            Previous
                        </button>
                        <button
                            className="px-2 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                            disabled={!data || (data.data.length < pageSize && (pageNumber * pageSize >= (data.totalCount || 0)))}
                            onClick={() => setPageNumber(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddStudent}
                isLoading={addStudentMutation.isPending}
                entityId={entityId}
            />

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={handleApplyFilters}
                currentFilters={currentFilters}
            />

            <UploadExcelModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadExcel}
            />
        </div>
    );
};

export default AdmissionStudentData;
