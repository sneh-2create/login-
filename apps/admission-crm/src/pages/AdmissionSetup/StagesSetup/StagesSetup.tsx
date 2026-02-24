import { useState, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, DataTable, ActionButton, Button, EmptyState, useToast, DropdownMenu } from '@od-erp/ui';
import { useAdmissionStageSetup, useAdmissionMaster, useSessions } from '@od-erp/query';
import { admissionStudentDataService, admissionService } from '@od-erp/api-client';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, RefreshCw, Pencil, CheckCircle, XCircle, Trash2, Copy, ChevronDown, MoreVertical } from 'lucide-react';
import StageSetupFormDrawer from './components/StageSetupFormDrawer';

const StagesSetup = () => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copySessionOpen, setCopySessionOpen] = useState(false);
    const [copyingSession, setCopyingSession] = useState(false);

    const { data: stagesSetup, isLoading, refetch } = useAdmissionStageSetup(entityId, session);
    const { data: admissionMaster } = useAdmissionMaster(entityId, session);
    const { data: sessions = [] } = useSessions(entityId);

    const canAdd = permissions.includes('addAdmissionStageSetup');
    const canEdit = permissions.includes('editAdmissionStageSetup');
    const canView = permissions.includes('viewAdmissionStageSetup');
    const canDelete = permissions.includes('deleteAdmissionStageSetup');
    const canCopySession = permissions.includes('copyAdmissionStageSetupFromSession');

    const handleAdd = () => {
        setEditData(null);
        setIsFormOpen(true);
    };

    const handleEdit = (row: any) => {
        setEditData(row);
        setIsFormOpen(true);
    };

    const handleDelete = async (row: any) => {
        const confirmed = window.confirm(`Are you sure you want to delete the stage "${row.stage}"?`);
        if (!confirmed) return;
        setDeletingId(row._id);
        try {
            await admissionStudentDataService.deleteAdmissionStageSetup(row._id, row.stage, entityId, session);
            showToast('success', 'Stage deleted successfully');
            refetch();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to delete stage');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCopyFromSession = async (fromSession: string) => {
        const confirmed = window.confirm(`Are you sure you want to copy stage setup from session "${fromSession}"?`);
        if (!confirmed) return;
        setCopyingSession(true);
        setCopySessionOpen(false);
        try {
            const res = await admissionService.copyFromSession(entityId, fromSession, session);
            showToast('success', res?.message || 'Stage setup copied successfully');
            refetch();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to copy from session');
        } finally {
            setCopyingSession(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!stagesSetup) return [];
        if (!search) return stagesSetup;
        return stagesSetup.filter((item: any) =>
            item.stage?.toLowerCase().includes(search.toLowerCase())
        );
    }, [stagesSetup, search]);

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            header: 'S.No',
            id: 'sno',
            cell: ({ row }) => (
                <span className="text-[var(--color-muted-foreground)] font-mono text-sm">{row.index + 1}</span>
            ),
            size: 70,
        },
        {
            header: 'Stage',
            accessorKey: 'stage',
            cell: info => (
                <span className="font-semibold text-[var(--color-foreground)]">{info.getValue() as string}</span>
            ),
            size: 200,
        },
        {
            header: 'Sequence',
            accessorKey: 'sequence',
            cell: info => (
                <span className="text-[var(--color-muted-foreground)]">{info.getValue() as number}</span>
            ),
            size: 100,
        },
        {
            header: 'Transaction Required',
            accessorKey: 'txnRequired',
            cell: info => (
                info.getValue()
                    ? <CheckCircle size={18} className="text-emerald-500" />
                    : <XCircle size={18} className="text-[var(--color-muted-foreground)]" />
            ),
            size: 130,
        },
        {
            header: 'No. of Fields',
            accessorKey: 'fields',
            cell: info => {
                const fields = info.getValue() as any[];
                return (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {fields?.length || 0}
                    </span>
                );
            },
            size: 120,
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu
                    trigger={
                        <MoreVertical size={15} />
                    }
                    placement="bottom-end"
                    usePortal={true}
                    items={[
                        ...((canView || canEdit) ? [{
                            label: (
                                <div className="flex items-center gap-2">
                                    <Pencil size={14} className="text-primary" />
                                    <span>Edit</span>
                                </div>
                            ) as any,
                            onClick: () => handleEdit(row.original),
                        }] : []),
                        ...(canDelete ? [{
                            label: (
                                <div className="flex items-center gap-2">
                                    <Trash2 size={14} className="text-red-500" />
                                    <span className="text-red-500">Delete</span>
                                </div>
                            ) as any,
                            onClick: () => handleDelete(row.original),
                            disabled: deletingId === row.original._id,
                        }] : []),
                    ]}
                />
            ),
            size: 60,
        },
    ], [canView, canEdit, canDelete, deletingId]);

    const actionButtons: ActionButton[] = [
        {
            icon: RefreshCw,
            onClick: () => refetch(),
            title: 'Refresh',
            className: 'text-primary hover:bg-primary/10',
            isVisible: true,
            iconClass: isLoading ? 'animate-spin' : '',
            variant: 'outline',
        },
    ];

    const toolbarExtraContent = (
        <div className="flex items-center gap-2">
            {/* Copy from Session — direct dropdown like Angular mat-menu */}
            {canCopySession && (
                <div className="relative">
                    <Button
                        variant="outline"
                        onClick={() => setCopySessionOpen(prev => !prev)}
                        disabled={copyingSession}
                        className="flex items-center gap-1.5"
                    >
                        {copyingSession
                            ? <RefreshCw size={15} className="animate-spin" />
                            : <Copy size={15} />}
                        Copy
                        <ChevronDown size={13} />
                    </Button>
                    {copySessionOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setCopySessionOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg overflow-y-auto max-h-48">
                                {sessions.map((s: any) => (
                                    <button
                                        key={s.name}
                                        onClick={() => handleCopyFromSession(s.name)}
                                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors"
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Add Stage Setup */}
            {canAdd && (
                <Button variant="primary" onClick={handleAdd} className="flex items-center gap-1.5">
                    <Plus size={16} />
                    Add Stage Setup
                </Button>
            )}
        </div>
    );

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title="Stages Setup"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission', href: '/admission' },
                    { label: 'Admission Setup', href: '/admission/setup' },
                    { label: 'Stages Setup' },
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar actions={actionButtons} extraContent={toolbarExtraContent} />

            <div className="w-full max-w-full overflow-x-auto">
                <DataTable
                    data={filteredData}
                    columns={columns}
                    isLoading={isLoading}
                    showSearch={true}
                    searchPlaceholder="Search stages..."
                    onSearch={setSearch}
                    showPagination={true}
                />
            </div>

            {!isLoading && filteredData.length === 0 && (
                <EmptyState message="No Stage Setup Found" />
            )}

            {isFormOpen && (
                <StageSetupFormDrawer
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        refetch();
                        showToast('success', editData ? 'Stage updated successfully' : 'Stage added successfully');
                    }}
                    editData={editData}
                    entityId={entityId}
                    session={session}
                    admissionMaster={admissionMaster}
                    permissions={permissions}
                />
            )}
        </div>
    );
};

export default StagesSetup;
