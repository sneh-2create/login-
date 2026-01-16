import { useState, useMemo } from 'react';
import { Card, DataTable, Button, Input, Select } from '@od-erp/ui';
import { useAdmissionLeads, useAddAdmissionLead, useCounselors, useSessions } from '@od-erp/query';
import { AdmissionLead, AdmissionLeadPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Filter, Plus, Settings, Edit } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';

const AdmissionLeads = () => {
    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const { data: sessions } = useSessions(entityId);
    const [showAddForm, setShowAddForm] = useState(false);
    const [globalSearch, setGlobalSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Add Lead Form State
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        email: '',
        alternatePhone: '',
        class: '',
        applicationNumber: '',
        source: '',
        campusVisited: false,
        addCounselor: false,
        counselorId: ''
    });

    // Queries
    const { data: counselors } = useCounselors(entityId, 'counselor');

    // Derived Payload
    const payload: AdmissionLeadPayload = useMemo(() => ({
        entity: entityId,
        session,
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: searchTerm,
        searchType: globalSearch ? undefined : searchType,
    }), [entityId, session, pagination, searchTerm, searchType, globalSearch]);

    const { data, isLoading } = useAdmissionLeads(payload);
    const addLeadMutation = useAddAdmissionLead();

    // Handlers
    const handleAddLead = async () => {
        try {
            await addLeadMutation.mutateAsync({
                ...formData,
                entityId,
                session,
                campusVisited: formData.campusVisited ? 'yes' : 'no'
            });
            setShowAddForm(false);
            setFormData({
                phone: '', name: '', email: '', alternatePhone: '', class: '',
                applicationNumber: '', source: '', campusVisited: false,
                addCounselor: false, counselorId: ''
            });
        } catch (err) {
            console.error(err);
            alert('Failed to add lead');
        }
    };

    // Columns
    const columns = useMemo<ColumnDef<AdmissionLead>[]>(
        () => [
            {
                header: 'Action',
                id: 'actions',
                cell: () => (
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                        <Settings size={16} className="text-gray-500 cursor-pointer" />
                        <Edit size={16} className="text-blue-500 cursor-pointer" />
                    </div>
                ),
                size: 100
            },
            {
                header: 'Tag',
                accessorKey: 'tags',
                cell: () => (
                    <select className="border rounded px-2 py-1 text-xs bg-green-100 text-green-800 border-green-200">
                        <option>Select Tag</option>
                        <option>Duplicate</option>
                        <option>INTERESTED</option>
                    </select>
                ),
                size: 120
            },
            {
                header: 'Application Number',
                accessorKey: 'applicationNumber',
                cell: info => <span className="font-semibold">{info.getValue() as string || '-'}</span>
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: info => info.getValue() ? format(info.getValue() as number, 'dd-MMM-yyyy') : '-'
            },
            {
                header: 'Name',
                accessorKey: 'name',
                cell: info => <span className="font-medium">{info.getValue() as string}</span>
            },
            {
                header: 'Phone',
                accessorKey: 'phone'
            },
            {
                header: 'Class',
                accessorKey: 'course', // Mapping 'Class' to 'course' field based on context
                cell: info => info.getValue() || 'Class 1' // Fallback for demo
            },
            {
                header: 'Stream',
                accessorKey: 'stream',
                cell: info => info.getValue() || 'Class 1' // Fallback for demo
            },
            {
                header: 'Source',
                accessorKey: 'source',
                cell: info => (
                    <span className="bg-red-400 text-white px-3 py-1 rounded-full text-xs">
                        {info.getValue() as string || 'Reference'}
                    </span>
                )
            }
        ],
        []
    );

    return (
        <div className="w-full max-w-full min-w-0 p-6 space-y-6 bg-gray-50 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admission Lead</h1>
                    <div className="text-xs text-gray-500 mt-1">
                        Select Session
                        <select
                            className="ml-2 border-none bg-transparent font-semibold text-gray-700 focus:ring-0"
                            value={session}
                            disabled
                        >
                            {sessions?.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                            {!sessions?.length && <option value={session}>{session}</option>}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" leftIcon={<Filter size={16} />}>Filter</Button>
                    <Button
                        variant="primary"
                        className="bg-[#1f2937] hover:bg-gray-800 text-white"
                        leftIcon={<Plus size={16} />}
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        Add Lead
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${globalSearch ? 'bg-blue-600 justify-end' : 'justify-start'}`} onClick={() => setGlobalSearch(!globalSearch)}>
                            <div className="bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out"></div>
                        </div>
                        <span className="text-xs text-gray-500">Global Search</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <Card className="p-3 shadow-sm border border-gray-200">
                <div className="flex gap-0 divide-x divide-gray-200">
                    <div className="w-1/4 px-2">
                        <select
                            className="w-full border-none focus:ring-0 text-sm text-gray-600 bg-transparent"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="name">Search By Name</option>
                            <option value="phone">Search By Phone</option>
                            <option value="applicationNumber">Search By App No</option>
                        </select>
                    </div>
                    <div className="w-3/4 px-2">
                        <input
                            type="text"
                            className="w-full border-none focus:ring-0 text-sm"
                            placeholder="Search by Name/Application No./Mobile No./Father Name/References"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Add Lead Form */}
            {showAddForm && (
                <Card className="p-4 border-t-4 border-blue-500 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 uppercase text-sm">Add Lead</h3>
                        <div className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setShowAddForm(false)}>x</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <Input
                            label="Phone Number"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="Name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Alternate Phone Number"
                            placeholder="Alternate Phone Number"
                            value={formData.alternatePhone}
                            onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                        />
                        <Select
                            label="Select Class"
                            options={[{ value: 'class1', label: 'Class 1' }, { value: 'class2', label: 'Class 2' }]}
                            value={formData.class}
                            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        />
                        <Input
                            label="Application Number"
                            placeholder="Application Number"
                            value={formData.applicationNumber}
                            onChange={(e) => setFormData({ ...formData, applicationNumber: e.target.value })}
                        />
                        <Select
                            label="Choose Source"
                            options={[{ value: 'reference', label: 'Reference' }, { value: 'walkin', label: 'Walk-in' }]}
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Campus visited</label>
                            <select
                                className="border rounded px-2 py-2 text-sm"
                                value={formData.campusVisited ? 'yes' : 'no'}
                                onChange={(e) => setFormData({ ...formData, campusVisited: e.target.value === 'yes' })}
                            >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-4 flex items-center bg-gray-300 rounded-full p-0.5 cursor-pointer ${formData.addCounselor ? 'bg-blue-600 justify-end' : 'justify-start'}`} onClick={() => setFormData({ ...formData, addCounselor: !formData.addCounselor })}>
                                <div className="bg-white w-3 h-3 rounded-full shadow"></div>
                            </div>
                            <label className="text-xs text-gray-600">Add Counselor</label>
                        </div>
                    </div>
                    {formData.addCounselor && (
                        <div className="mt-4 md:w-1/4">
                            <Select
                                label="Select Counselor"
                                options={counselors?.map((c: any) => ({ value: c._id, label: c.name })) || []}
                                value={formData.counselorId}
                                onChange={(e) => setFormData({ ...formData, counselorId: e.target.value })}
                            />
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button variant="primary" onClick={handleAddLead} isLoading={addLeadMutation.isPending}>Submit</Button>
                    </div>
                </Card>
            )}

            {/* Table */}
            <Card className="overflow-hidden shadow-sm border border-gray-200">
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        data={data?.data || []}
                        columns={columns}
                        isLoading={isLoading}
                    />
                </div>
                {/* Pagination Footer */}
                <div className="p-3 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-600">
                    <span>Showing {data?.data?.length || 0} of {data?.totalCount || 0} entries</span>
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                            disabled={pagination.pageIndex === 0}
                            onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                        >
                            Previous
                        </button>
                        <button
                            className="px-2 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                            disabled={!data || data.data.length < pagination.pageSize}
                            onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdmissionLeads;
