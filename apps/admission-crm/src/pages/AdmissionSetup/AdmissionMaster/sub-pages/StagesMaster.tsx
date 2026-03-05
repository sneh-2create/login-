import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, ActionButton, Button, Input, EditableTable, EditableTableColumn, useToast } from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save, Lock } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

const RESERVED_STAGES = ['Approved', 'Rejected', 'Withdrawn'] as const;
type ReservedStage = typeof RESERVED_STAGES[number];

interface StageRow {
    stage: string;
}

interface StagesMasterProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const StagesMaster: React.FC<StagesMasterProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<StageRow[]>([]);
    const [reservedActive, setReservedActive] = useState<Record<ReservedStage, boolean>>(
        { Approved: false, Rejected: false, Withdrawn: false }
    );

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);
    const canEdit = permissions.includes('viewAdmissionMaster');

    // Populate rows from server — strip reserved stages
    useEffect(() => {
        if (admissionMaster?.stages) {
            const editableStages = (admissionMaster.stages as string[])
                .filter(s => !RESERVED_STAGES.includes(s as ReservedStage));
            setRows(editableStages.map(s => ({ stage: s })));
            setReservedActive({
                Approved: admissionMaster.stages.includes('Approved'),
                Rejected: admissionMaster.stages.includes('Rejected'),
                Withdrawn: admissionMaster.stages.includes('Withdrawn'),
            });
        }
    }, [admissionMaster]);

    const addRow = () => {
        for (const row of rows) {
            if (!row.stage.trim()) {
                showToast('error', 'Please fill all stage names before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { stage: '' }]);
    };

    const updateRow = (index: number, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { stage: value } : row));

    const removeRow = (index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index));

    const handleSave = async () => {
        for (const row of rows) {
            if (!row.stage.trim()) {
                showToast('error', 'Stage name cannot be empty');
                return;
            }
        }
        setLoading(true);
        try {
            const newStages = [
                ...rows.map(r => r.stage.trim()),
                ...RESERVED_STAGES.filter(r => reservedActive[r]),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, stages: newStages });
            showToast('success', 'Stages saved successfully');
            refetch();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const handleReservedToggle = async (stage: ReservedStage, checked: boolean) => {
        const newReserved = { ...reservedActive, [stage]: checked };
        setReservedActive(newReserved);
        try {
            const newStages = [
                ...rows.map(r => r.stage.trim()).filter(Boolean),
                ...RESERVED_STAGES.filter(r => newReserved[r]),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, stages: newStages });
            showToast('success', `${stage} stage ${checked ? 'enabled' : 'disabled'}`);
            refetch();
        } catch (err: any) {
            setReservedActive(reservedActive); // rollback
            showToast('error', err?.response?.data?.message || 'Failed to update');
        }
    };

    const columns = useMemo<EditableTableColumn<StageRow>[]>(() => [
        {
            header: 'S.No.',
            width: 60,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <>Stage Name <span className="text-red-500">*</span></>,
            cell: (row, i) => (
                <Input
                    value={row.stage}
                    onChange={e => updateRow(i, e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. Application Received"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 52,
            cell: (_: StageRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<StageRow>] : []),
    ], [rows, canEdit]);

    const actionButtons: ActionButton[] = [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isLoading ? 'animate-spin' : '',
        variant: 'outline',
    }];

    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
                <PageHeader
                    title="Stages Master Setup"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admission Setup', href: '/admission/setup' },
                        { label: 'Admission Master', href: '/admission/setup/master' },
                        { label: 'Stages Master Setup' },
                    ]}
                    actionButtons={actionButtons}
                />
            )}

            {!isEmbedded && (
                <PageToolbar
                    actions={actionButtons}
                    extraContent={
                        canEdit ? (
                            <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5">
                                <Plus size={15} /> Add Stage
                            </Button>
                        ) : undefined
                    }
                />
            )}

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                emptyMessage="No stages yet. Click 'Add Stage' to begin."
                className={isEmbedded ? '' : 'mt-2'}
            />

            {/* Reserved Stages — Approved / Rejected / Withdrawn */}
            {!isLoading && (
                <div className="mt-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Lock size={14} className="text-[var(--color-muted-foreground)]" />
                        <span className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">System Reserved Stages</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {RESERVED_STAGES.map(stage => (
                            <label key={stage} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors ${
                                reservedActive[stage]
                                    ? 'border-primary/40 bg-primary/5 text-primary'
                                    : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
                            } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={reservedActive[stage]}
                                    disabled={!canEdit}
                                    onChange={e => handleReservedToggle(stage, e.target.checked)}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-sm font-medium">{stage}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-2">These stages are system-managed and cannot be renamed or reordered.</p>
                </div>
            )}

            {!isLoading && canEdit && (
                <div className="flex items-center justify-between mt-6">
                    {isEmbedded ? (
                        <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5">
                            <Plus size={15} /> Add New Details
                        </Button>
                    ) : <div />}

                    <Button variant="primary" onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-8 bg-primary hover:bg-primary/90">
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                        {isEmbedded ? 'Save & Next' : 'Save'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StagesMaster;
