import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppSelector } from '@od-erp/store';
import {
    PageHeader,
    PageToolbar,
    ActionButton,
    Button,
    Input,
    SelectSingle,
    EditableTable,
    EditableTableColumn,
    useToast,
    useStepOrchestrator,
} from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save } from 'lucide-react';
import { useAdmissionMaster, useCourseList } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

interface AppNumberRow {
    course: string;
    stream: string;
    prefix: string;
    number: string;
    suffix: string;
}

const ApplicationNumber: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.auth.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const entityPreferences = useAppSelector((state: any) => state.auth.entityDetails?.entityPreferences) || {};

    const displayNames = useMemo(() => ({
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Course',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
    }), [entityPreferences]);

    const [rows, setRows] = useState<AppNumberRow[]>([]);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);
    const { data: courseList = [], isLoading: coursesLoading } = useCourseList(entityId, session);

    useEffect(() => {
        if (admissionMaster) {
            const appNumbers: any[] = admissionMaster.applicationNumber || [];
            if (appNumbers.length > 0) {
                setRows(appNumbers.map((r: any) => ({
                    course: r.course || '',
                    stream: r.stream || '',
                    prefix: r.prefix || '',
                    number: String(r.number ?? ''),
                    suffix: r.suffix || '',
                })));
            } else {
                setRows([{ course: '', stream: '', prefix: '', number: '', suffix: '' }]);
            }
        }
    }, [admissionMaster]);

    const canEdit = permissions.includes('viewAdmissionMaster');

    const courseOptions = useMemo(() =>
        courseList.map((c: any) => ({ value: c.name, label: c.name })),
        [courseList]
    );

    const getStreamOptions = (courseName: string) =>
        (courseList.find((c: any) => c.name === courseName)?.stream || []).map((s: string) => ({ value: s, label: s }));

    const addRow = useCallback(() => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.number) {
                showToast('error', 'Please fill all required fields before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { course: '', stream: '', prefix: '', number: '', suffix: '' }]);
    }, [rows, showToast]);

    const removeRow = useCallback((index: number) => {
        if (rows.length === 1) {
            setRows([{ course: '', stream: '', prefix: '', number: '', suffix: '' }]);
            return;
        }
        setRows(prev => prev.filter((_, i) => i !== index));
    }, [rows]);

    const updateRow = useCallback((index: number, field: keyof AppNumberRow, value: string) => {
        setRows(prev => prev.map((row, i) => {
            if (i !== index) return row;
            if (field === 'course') {
                const streams = getStreamOptions(value);
                return { ...row, course: value, stream: streams[0]?.value || '' };
            }
            return { ...row, [field]: value };
        }));
    }, [courseList]);

    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        const validRows = rows.filter(r => r.course || r.stream || r.number || r.prefix || r.suffix);
        
        if (validRows.length === 0) {
            showToast('error', 'Please add at least one configuration');
            return;
        }

        for (const row of validRows) {
            if (!row.course || !row.stream || !row.number) {
                showToast('error', `${displayNames.course}, ${displayNames.stream} and Number are required for all entries`);
                return;
            }
        }

        setIsLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                applicationNumber: validRows.map(r => ({ ...r, prefix: r.prefix.trim(), suffix: r.suffix.trim() })),
            });
            showToast('success', 'Application Number Setup saved successfully');
            refetch();
            if (onSuccess) onSuccess(options?.navigateNext);
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    }, [entityId, session, rows, displayNames, refetch, onSuccess, setIsLoading, showToast]);

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
                    <Plus size={18} /> Add New Details
                </Button>
            );
        } else {
            setFooterLeftActions(null);
        }
    }, [isEmbedded, canEdit, addRow, setFooterLeftActions]);

    const columns = useMemo<EditableTableColumn<AppNumberRow>[]>(() => [
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">S.No.</span>,
            width: 80,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">{displayNames.course} <span className="text-red-500">*</span></span>,
            width: 220,
            cell: (row, i) => (
                <SelectSingle
                    value={row.course}
                    options={courseOptions}
                    placeholder={`Select ${displayNames.course}`}
                    onChange={(val) => updateRow(i, 'course', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)]"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">{displayNames.stream} <span className="text-red-500">*</span></span>,
            width: 220,
            cell: (row, i) => row.course ? (
                <SelectSingle
                    value={row.stream}
                    options={getStreamOptions(row.course)}
                    placeholder={`Select ${displayNames.stream}`}
                    onChange={(val) => updateRow(i, 'stream', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)]"
                />
            ) : (
                <div className="h-10 flex items-center px-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-muted)/20] text-xs text-[var(--color-muted-foreground)] italic">
                    Select {displayNames.course} first
                </div>
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Prefix</span>,
            width: 140,
            cell: (row, i) => (
                <Input
                    value={row.prefix}
                    onChange={e => updateRow(i, 'prefix', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. APP"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)] font-mono"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Number <span className="text-red-500">*</span></span>,
            width: 140,
            cell: (row, i) => (
                <Input
                    value={row.number}
                    onChange={e => updateRow(i, 'number', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 1001"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)] font-mono"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Suffix</span>,
            width: 140,
            cell: (row, i) => (
                <Input
                    value={row.suffix}
                    onChange={e => updateRow(i, 'suffix', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 2024"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)] font-mono"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Preview</span>,
            cell: (row) => {
                const preview = [row.prefix, row.number, row.suffix].filter(Boolean).join('');
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs font-semibold ${preview ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'}`}>
                        {preview || '—'}
                    </span>
                );
            },
        },
        ...(canEdit ? [{
            header: '',
            width: 60,
            cell: (_, i) => (
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
        } as EditableTableColumn<AppNumberRow>] : []),
    ], [rows, courseOptions, displayNames, canEdit, updateRow, removeRow]);

    const isDataLoading = isLoading || coursesLoading;

    const actionButtons: ActionButton[] = [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isDataLoading ? 'animate-spin' : '',
        variant: 'outline',
    }];

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw size={40} className="animate-spin text-primary opacity-20" />
                <p className="text-sm text-[var(--color-muted-foreground)] animate-pulse">Loading configurations...</p>
            </div>
        );
    }

    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
                <>
                    <PageHeader
                        title="Application Number Setup"
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Admission Setup', href: '/admission/setup' },
                            { label: 'Admission Master', href: '/admission/setup/master' },
                            { label: 'Application Number Setup' },
                        ]}
                        actionButtons={actionButtons}
                    />
                    <PageToolbar
                        actions={actionButtons}
                        extraContent={
                            canEdit ? (
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5">
                                        <Plus size={15} /> Add Row
                                    </Button>
                                </div>
                            ) : undefined
                        }
                    />
                </>
            )}

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isDataLoading}
                emptyMessage="No configuration yet. Click 'Add Row' to begin."
                className={isEmbedded ? '' : 'mt-2'}
                minWidth={950}
            />

            {!isDataLoading && canEdit && !isEmbedded && (
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

export default ApplicationNumber;
