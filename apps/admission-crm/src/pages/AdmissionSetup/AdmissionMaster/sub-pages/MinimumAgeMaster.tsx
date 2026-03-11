import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import {
    PageHeader,
    ActionButton,
    Button,
    NumberInput,
    DatePicker,
    Switch,
    EditableTable,
    EditableTableColumn,
    useToast,
    useStepOrchestrator,
} from '@od-erp/ui';
import { RefreshCw, Save } from 'lucide-react';
import { useCourseList } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

interface CourseRow {
    _id: string;
    name: string;
    minimumAge: string;
    asOnDate: string;
    status: boolean;
    [key: string]: any;
}

// Convert a Date → 'YYYY-MM-DD' string
const toISODate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const MinimumAgeMaster: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setFooterLeftActions, setHeaderActions } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const canEdit = permissions.includes('editAdmissionMaster');

    const { data: courseListRaw = [], isLoading, refetch } = useCourseList(entityId, session);

    const [rows, setRows] = useState<CourseRow[]>([]);
    const [originalRows, setOriginalRows] = useState<CourseRow[]>([]);
    const [applyDate, setApplyDate] = useState<string>('');
    const [bulkSaving, setBulkSaving] = useState(false);
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

    // Sync fetched data → local state
    useEffect(() => {
        if (courseListRaw.length > 0) {
            const mapped: CourseRow[] = courseListRaw.map((c: any) => ({
                ...c,
                minimumAge: c.minimumAge != null ? String(c.minimumAge) : '',
                asOnDate: c.asOnDate || '',
                status: c.status !== undefined ? Boolean(c.status) : true,
            }));
            setRows(mapped);
            setOriginalRows(JSON.parse(JSON.stringify(mapped)));
        }
    }, [courseListRaw]);

    // Auto-save single row
    const saveRow = useCallback(async (row: CourseRow) => {
        setSavingIds(prev => new Set(prev).add(row._id));
        try {
            await admissionStudentDataService.editCourseData(row);
            showToast('success', 'Saved successfully');
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setSavingIds(prev => {
                const next = new Set(prev);
                next.delete(row._id);
                return next;
            });
        }
    }, [showToast]);

    // minimumAge: validate ≥ 1 on blur then save
    const handleAgeChange = (index: number, raw: string) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, minimumAge: raw } : r));
    };

    const handleAgeBlur = (index: number) => {
        const row = rows[index];
        const num = Number(row.minimumAge);
        const clamped = row.minimumAge !== '' && num < 1 ? '1' : row.minimumAge;
        const updated = { ...row, minimumAge: clamped };
        setRows(prev => prev.map((r, i) => i === index ? updated : r));
        saveRow(updated);
    };

    // Date change → save immediately
    const handleDateChange = (index: number, date: Date) => {
        const updated = { ...rows[index], asOnDate: toISODate(date) };
        setRows(prev => prev.map((r, i) => i === index ? updated : r));
        saveRow(updated);
    };

    // Status toggle → save immediately
    const handleStatusChange = (index: number, val: boolean) => {
        const updated = { ...rows[index], status: val };
        setRows(prev => prev.map((r, i) => i === index ? updated : r));
        saveRow(updated);
    };

    // Global save handler for StepOrchestrator
    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        if (onSuccess) {
            onSuccess(options?.navigateNext);
        }
    }, [onSuccess]);

    // Bulk apply date to all rows
    const applyToAll = useCallback(async () => {
        if (!applyDate) {
            showToast('error', 'Please select a date to apply.');
            return;
        }
        setBulkSaving(true);
        const updated = rows.map(r => ({ ...r, asOnDate: applyDate }));
        setRows(updated);
        try {
            await Promise.all(updated.map(row => admissionStudentDataService.editCourseData(row)));
            showToast('success', 'Date applied and saved successfully for all classes.');
            if (isEmbedded && onSuccess) onSuccess(true);
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to apply date');
        } finally {
            setBulkSaving(false);
        }
    }, [applyDate, rows, isEmbedded, onSuccess, showToast]);

    // Reset all rows
    const resetAll = useCallback(() => {
        setRows(JSON.parse(JSON.stringify(originalRows)));
        setApplyDate('');
    }, [originalRows]);

    // Header Actions (Bulk Apply)
    const HeaderBulkActions = useMemo(() => {
        if (!canEdit) return null;
        return (
            <div className="flex items-center gap-2">
                <DatePicker
                    value={applyDate}
                    placeholder="Apply Date to All"
                    onChange={date => date && setApplyDate(toISODate(date))}
                    containerClassName="w-44"
                    className="h-9 text-xs border-[var(--color-border)] rounded-lg bg-[var(--color-background)]"
                />
                <Button
                    variant="primary"
                    onClick={applyToAll}
                    disabled={bulkSaving || !applyDate}
                    className="h-9 px-4 font-bold text-xs flex items-center gap-1.5"
                >
                    {bulkSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Apply
                </Button>
                <Button 
                    variant="outline" 
                    onClick={resetAll} 
                    disabled={bulkSaving} 
                    className="h-9 px-4 font-bold text-xs"
                >
                    Reset
                </Button>
            </div>
        );
    }, [canEdit, applyDate, bulkSaving, applyToAll, resetAll]);

    // Register Save and Footer Actions
    useEffect(() => {
        if (isEmbedded) {
            registerSaveHandler(handleSave);
            setHeaderActions(HeaderBulkActions);
        } else {
            setHeaderActions(null);
        }
    }, [isEmbedded, handleSave, registerSaveHandler, setHeaderActions, HeaderBulkActions]);

    // Register Footer Left Actions
    useEffect(() => {
        if (isEmbedded && canEdit) {
            // Keep footer actions if needed, or clear them if moving to header
            // The user wanted them in "top right side of title"
            setFooterLeftActions(null); 
        } else {
            setFooterLeftActions(null);
        }
    }, [isEmbedded, canEdit, setFooterLeftActions]);

    const actionButtons: ActionButton[] = [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isLoading ? 'animate-spin' : '',
        variant: 'outline',
    }];

    const columns = useMemo<EditableTableColumn<CourseRow>[]>(() => [
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">S.No.</span>,
            width: 80,
            cell: (_, i) => <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>,
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Class Name</span>,
            width: 200,
            cell: (row) => <span className="text-sm font-medium text-[var(--color-foreground)]">{row.name}</span>,
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Minimum Age (Years)</span>,
            width: 220,
            cell: (row, i) => (
                <NumberInput
                    value={row.minimumAge}
                    min={1}
                    placeholder="Age"
                    disabled={!row.status || savingIds.has(row._id) || !canEdit}
                    onChange={e => handleAgeChange(i, e.target.value)}
                    onBlur={() => handleAgeBlur(i)}
                    className="h-10 border-[var(--color-border)] rounded-lg"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Age As On Date</span>,
            width: 240,
            cell: (row, i) => (
                <DatePicker
                    value={row.asOnDate || ''}
                    placeholder="As on Date"
                    disabled={!row.status || savingIds.has(row._id) || !canEdit}
                    onChange={date => date && handleDateChange(i, date)}
                    className="h-10 border-[var(--color-border)] rounded-lg"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Status</span>,
            width: 160,
            cell: (row, i) => (
                <div className="flex items-center gap-3">
                    <Switch
                        checked={row.status}
                        disabled={savingIds.has(row._id) || !canEdit}
                        onChange={val => handleStatusChange(i, val)}
                    />
                    <span className={`text-xs font-bold uppercase tracking-widest ${row.status ? 'text-green-600' : 'text-slate-400'}`}>
                        {row.status ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
    ], [savingIds, canEdit, handleAgeBlur, handleAgeChange, handleDateChange, handleStatusChange]);

    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
                <>
                    <PageHeader
                        title="Minimum Age Master"
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Admission Setup', href: '/admission/setup' },
                            { label: 'Admission Master', href: '/admission/setup/master' },
                            { label: 'Minimum Age Master' },
                        ]}
                        actionButtons={actionButtons}
                    />
                    <div className="mt-4 mb-2 flex justify-end">
                        {HeaderBulkActions}
                    </div>
                </>
            )}

            <div className={`mt-2 ${!isEmbedded ? 'rounded-xl border border-[var(--color-border)] p-2 bg-[var(--color-card)] shadow-sm' : ''}`}>
                <EditableTable
                    columns={columns}
                    data={rows}
                    isLoading={isLoading}
                    emptyMessage="No classes found."
                    className="w-full"
                />
            </div>

            {!isLoading && canEdit && !isEmbedded && (
                <div className="mt-8 flex justify-end">
                    <Button 
                        variant="primary" 
                        onClick={() => handleSave()} 
                        className="flex items-center gap-2 px-10 h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        <Save size={18} /> Finish Setup
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MinimumAgeMaster;
