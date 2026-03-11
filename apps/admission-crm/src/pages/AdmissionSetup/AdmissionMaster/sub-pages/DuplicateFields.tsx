import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    useStepOrchestrator,
} from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';
import { DUPLICATE_CHECK_FIELDS } from '@od-erp/constants';

interface DuplicateFieldRow {
    field: string;
}

const DuplicateFields: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const canEdit = permissions.includes('editAdmissionMaster');

    const [rows, setRows] = useState<DuplicateFieldRow[]>([]);

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
    const addRow = useCallback(() => {
        for (const row of rows) {
            if (!row.field) {
                showToast('error', 'Please select a field before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { field: '' }]);
    }, [rows, showToast]);

    // Matches Angular's removeSource(ind)
    const removeRow = useCallback((index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index)), []);

    const updateRow = useCallback((index: number, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { field: value } : row)), []);

    // Matches Angular's updateAdmissionMaster()
    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        for (const row of rows) {
            if (!row.field) {
                showToast('error', 'Please select a field for every row before saving');
                return;
            }
        }
        setIsLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                duplicacyCheckFields: rows.map(r => r.field),
            });
            showToast('success', 'Duplicate Fields updated successfully');
            refetch();
            if (onSuccess) onSuccess(options?.navigateNext);
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    }, [entityId, session, rows, refetch, onSuccess, setIsLoading, showToast]);

    // Register save handler with Orchestrator
    useEffect(() => {
        if (isEmbedded) {
            registerSaveHandler(handleSave);
        }
    }, [isEmbedded, handleSave, registerSaveHandler]);

    // Register Footer Left Actions
    useEffect(() => {
        if (isEmbedded && canEdit) {
            setFooterLeftActions(
                <Button 
                    variant="soft-primary" 
                    onClick={addRow} 
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold rounded-md transition-all shadow-sm"
                >
                    <Plus size={18} /> Add New Field
                </Button>
            );
        } else {
            setFooterLeftActions(null);
        }
    }, [isEmbedded, canEdit, setFooterLeftActions, addRow]);

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
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Field <span className="text-red-500">*</span></span>,
            cell: (row, i) => (
                <SelectSingle
                    value={row.field}
                    options={buildOptions(row.field)}
                    placeholder="Select a field to check for duplicates"
                    onChange={(val) => updateRow(i, String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)]"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 60,
            cell: (_: DuplicateFieldRow, i: number) => (
                <div className="flex justify-center">
                    <Button
                        variant="soft-danger"
                        size="icon"
                        onClick={() => removeRow(i)}
                        className="rounded-lg transition-all duration-200 border-none shadow-none hover:bg-red-100"
                        title="Remove row"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ),
        } as EditableTableColumn<DuplicateFieldRow>] : []),
    ], [rows, canEdit, buildOptions, updateRow, removeRow]);

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
                <>
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
                            <Button variant="soft-primary" onClick={addRow} className="flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5 px-4 h-9 font-bold rounded-lg shadow-sm">
                                <Plus size={15} /> Add Field
                            </Button>
                            ) : undefined
                        }
                    />
                </>
            )}

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                className={isEmbedded ? '' : 'mt-2'}
            />

            {!isLoading && canEdit && !isEmbedded && (
                <div className="mt-8 flex justify-end">
                    <Button 
                        variant="primary" 
                        onClick={() => handleSave()} 
                        disabled={isLoading} 
                        className="flex items-center gap-2 px-10 h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DuplicateFields;
