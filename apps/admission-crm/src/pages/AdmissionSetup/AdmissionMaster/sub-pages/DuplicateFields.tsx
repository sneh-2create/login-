import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import {
    PageHeader,
    PageToolbar,
    ActionButton,
    Button,
    SelectSingle,
    EditableTable,
    EditableTableColumn,
    useToast,
} from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';
import { DUPLICATE_CHECK_FIELDS } from '@od-erp/constants';

interface DuplicateFieldRow {
    field: string;
}

const DuplicateFields = () => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    const [rows, setRows] = useState<DuplicateFieldRow[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Matches Angular's viewAdmissionMaster() → this.duplicate = res.duplicacyCheckFields
    useEffect(() => {
        if (admissionMaster?.duplicacyCheckFields) {
            setRows(
                (admissionMaster.duplicacyCheckFields as string[]).map(f => ({ field: f }))
            );
        }
    }, [admissionMaster]);

    // Matches Angular's addDuplicateForm() — validate all rows filled before adding
    const addRow = () => {
        for (const row of rows) {
            if (!row.field) {
                showToast('error', 'Please select a field before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { field: '' }]);
    };

    // Matches Angular's removeSource(ind)
    const removeRow = (index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index));

    const updateRow = (index: number, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { field: value } : row));

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        for (const row of rows) {
            if (!row.field) {
                showToast('error', 'Please select a field for every row before saving');
                return;
            }
        }
        setLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                duplicacyCheckFields: rows.map(r => r.field),
            });
            showToast('success', 'Duplicate Fields updated successfully');
            refetch();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    // Set of currently chosen field values across all rows
    const selectedValues = useMemo(
        () => new Set(rows.map(r => r.field).filter(Boolean)),
        [rows]
    );

    // Build options per row: already-selected values in OTHER rows are disabled.
    // Mirrors Angular's checkDisabled(item) = this.duplicate.some(val => val === item.value)
    const buildOptions = (currentValue: string) =>
        DUPLICATE_CHECK_FIELDS.map(opt => ({
            value: opt.value,
            label: `${opt.label}`,
            disabled: selectedValues.has(opt.value) && opt.value !== currentValue,
        }));

    const columns = useMemo<EditableTableColumn<DuplicateFieldRow>[]>(() => [
        {
            header: 'S.No.',
            width: 60,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <><span>Field</span> <span className="text-red-500">*</span></>,
            cell: (row, i) => (
                <SelectSingle
                    value={row.field}
                    options={buildOptions(row.field)}
                    placeholder="Select a field to check for duplicates"
                    onChange={(val) => updateRow(i, String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 52,
            cell: (_: DuplicateFieldRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<DuplicateFieldRow>] : []),
    ], [rows, canEdit, selectedValues]);

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
            <PageHeader
                title="Duplicate Fields Master"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Setup', href: '/admission/setup' },
                    { label: 'Admission Master', href: '/admission/setup/master' },
                    { label: 'Duplicate Fields Master' },
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                actions={actionButtons}
                extraContent={
                    canEdit ? (
                        <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5">
                            <Plus size={15} /> Add Field
                        </Button>
                    ) : undefined
                }
            />

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                emptyMessage="No duplicate-check fields configured yet. Click 'Add Field' to begin."
                className="mt-2"
            />

            {!isLoading && rows.length > 0 && canEdit && (
                <div className="flex justify-end mt-3">
                    <Button variant="primary" onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DuplicateFields;
