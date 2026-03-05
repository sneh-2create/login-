import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, ActionButton, Button, Input, EditableTable, EditableTableColumn, useToast } from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

const REFERENCE = 'Reference';

interface SourceRow {
    source: string;
}

interface AdmissionSourceProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const AdmissionSource: React.FC<AdmissionSourceProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const [rows, setRows] = useState<SourceRow[]>([]);
    const [referenceChecked, setReferenceChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [referenceLoading, setReferenceLoading] = useState(false);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    // Sync server data → local state, strip Reference from main rows
    useEffect(() => {
        if (admissionMaster?.source) {
            const sources: string[] = admissionMaster.source;
            setReferenceChecked(sources.includes(REFERENCE));
            setRows(sources.filter(s => s !== REFERENCE).map(s => ({ source: s })));
        }
    }, [admissionMaster]);

    // Matches Angular's addSourceform()
    const addRow = () => {
        for (const row of rows) {
            if (!row.source.trim()) {
                showToast('error', 'Please fill all source names before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { source: '' }]);
    };

    const updateRow = (index: number, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { source: value } : row));

    // Matches Angular's removeSource(ind)
    const removeRow = (index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index));

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        for (const row of rows) {
            if (!row.source.trim()) {
                showToast('error', 'Source name cannot be empty');
                return;
            }
        }
        setLoading(true);
        try {
            const newSources = [
                ...rows.map(r => r.source.trim()),
                ...(referenceChecked ? [REFERENCE] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, source: newSources });
            showToast('success', 'Admission Source updated');
            refetch();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    // Matches Angular's checkSource('Reference', isChecked) — immediate save on toggle
    const handleReferenceToggle = async (checked: boolean) => {
        setReferenceChecked(checked);
        setReferenceLoading(true);
        try {
            const newSources = [
                ...rows.map(r => r.source.trim()).filter(Boolean),
                ...(checked ? [REFERENCE] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, source: newSources });
            showToast('success', checked ? 'Reference added' : 'Reference removed');
            refetch();
        } catch (err: any) {
            setReferenceChecked(!checked); // rollback
            showToast('error', err?.response?.data?.message || 'Failed to update Reference');
        } finally {
            setReferenceLoading(false);
        }
    };

    const columns = useMemo<EditableTableColumn<SourceRow>[]>(() => [
        {
            header: 'S.No.',
            width: 60,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <span>Source Name <span className="text-red-500">*</span></span>,
            cell: (row, i) => (
                <Input
                    value={row.source}
                    onChange={e => updateRow(i, e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. Website, Walk-in, Social Media"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 52,
            cell: (_: SourceRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<SourceRow>] : []),
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
                    title="Admission Source"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admission Setup', href: '/admission/setup' },
                        { label: 'Admission Master', href: '/admission/setup/master' },
                        { label: 'Admission Source' },
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
                                <Plus size={15} /> Add Source
                            </Button>
                        ) : undefined
                    }
                />
            )}

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                emptyMessage="No admission sources yet. Click 'Add Source' to begin."
                className={isEmbedded ? '' : 'mt-2'}
            />

            {/* Reference — matches Angular's mat-checkbox with checkSource('Reference', $event.checked) */}
            {!isLoading && (
                <div className="mt-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            System Reserved Source
                        </span>
                    </div>
                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors w-fit ${
                        referenceChecked
                            ? 'border-primary/40 bg-primary/5 text-primary'
                            : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                            type="checkbox"
                            checked={referenceChecked}
                            disabled={!canEdit || referenceLoading}
                            onChange={e => handleReferenceToggle(e.target.checked)}
                            className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium">Reference</span>
                        {referenceLoading && <RefreshCw size={12} className="animate-spin text-primary ml-1" />}
                    </label>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                        This source is system-managed and cannot be renamed or reordered.
                    </p>
                </div>
            )}

            {/* Save button — matches Angular's Save button at the bottom */}
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

export default AdmissionSource;
