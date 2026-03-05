import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@od-erp/store';
import {
    PageHeader,
    PageToolbar,
    ActionButton,
    Button,
    NumberInput,
    DatePicker,
    Switch,
    EditableTable,
    EditableTableColumn,
    useToast,
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

interface MinimumAgeMasterProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const MinimumAgeMaster: React.FC<MinimumAgeMasterProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';

    const { data: courseListRaw = [], isLoading, refetch } = useCourseList(entityId, session);

    const [rows, setRows] = useState<CourseRow[]>([]);
    const [originalRows, setOriginalRows] = useState<CourseRow[]>([]);
    const [applyDate, setApplyDate] = useState<string>('');
    const [bulkSaving, setBulkSaving] = useState(false);
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

    // Sync fetched data → local state (mirrors Angular's getCourseList())
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

    // Auto-save single row (mirrors Angular's updateCourse())
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

    // minimumAge: validate ≥ 1 on blur then save (mirrors Angular's validateMinimumAge + focusout)
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

    // Date change → save immediately (mirrors Angular's dateChange)
    const handleDateChange = (index: number, date: Date) => {
        const updated = { ...rows[index], asOnDate: toISODate(date) };
        setRows(prev => prev.map((r, i) => i === index ? updated : r));
        saveRow(updated);
    };

    // Status toggle → save immediately (mirrors Angular's mat-slide-toggle change)
    const handleStatusChange = (index: number, val: boolean) => {
        const updated = { ...rows[index], status: val };
        setRows(prev => prev.map((r, i) => i === index ? updated : r));
        saveRow(updated);
    };

    // Bulk apply date to all rows (mirrors Angular's applyToAll via forkJoin)
    const applyToAll = async () => {
        if (!applyDate) {
            showToast('error', 'Please select a date to apply.');
            return;
        }
        setBulkSaving(true);
        const updated = rows.map(r => ({ ...r, asOnDate: applyDate }));
        setRows(updated);
        try {
            await Promise.all(updated.map(row => admissionStudentDataService.editCourseData(row)));
            showToast('success', 'Date applied and saved for all classes successfully.');
            if (onSuccess && isEmbedded) onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to apply date');
        } finally {
            setBulkSaving(false);
        }
    };

    // Reset all rows to original fetched state (mirrors Angular's resetAll())
    const resetAll = () => {
        setRows(JSON.parse(JSON.stringify(originalRows)));
        setApplyDate('');
    };

    const actionButtons: ActionButton[] = [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isLoading ? 'animate-spin' : '',
        variant: 'outline',
    }];

    const columns: EditableTableColumn<CourseRow>[] = [
        {
            header: 'S.No.',
            width: 60,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: 'Class Name',
            width: 200,
            cell: (row) => (
                <span className="text-sm font-medium text-[var(--color-foreground)]">{row.name}</span>
            ),
        },
        {
            header: 'Minimum Age (Years)',
            width: 220,
            cell: (row, i) => (
                <NumberInput
                    value={row.minimumAge}
                    min={1}
                    step={1}
                    placeholder="Enter Age"
                    disabled={!row.status || savingIds.has(row._id)}
                    onChange={e => handleAgeChange(i, e.target.value)}
                    onBlur={() => handleAgeBlur(i)}
                />
            ),
        },
        {
            header: 'Age As On Date',
            width: 240,
            cell: (row, i) => (
                <DatePicker
                    value={row.asOnDate || ''}
                    placeholder="Choose Date"
                    disabled={!row.status || savingIds.has(row._id)}
                    onChange={date => date && handleDateChange(i, date)}
                />
            ),
        },
        {
            header: 'Status',
            width: 160,
            cell: (row, i) => (
                <Switch
                    checked={row.status}
                    disabled={savingIds.has(row._id)}
                    label={row.status ? 'Active' : 'Inactive'}
                    onChange={val => handleStatusChange(i, val)}
                />
            ),
        },
    ];


    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
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
            )}

            {!isEmbedded && (
                <PageToolbar
                    actions={actionButtons}
                    extraContent={
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[var(--color-foreground)] whitespace-nowrap">
                                Apply Same Date to All:
                            </span>
                            <DatePicker
                                value={applyDate}
                                placeholder="Choose Date"
                                onChange={date => date && setApplyDate(toISODate(date))}
                                containerClassName="w-44"
                            />
                            <Button
                                variant="primary"
                                onClick={applyToAll}
                                disabled={bulkSaving || !applyDate}
                                className="flex items-center gap-1.5 whitespace-nowrap"
                            >
                                {bulkSaving
                                    ? <RefreshCw size={13} className="animate-spin" />
                                    : <Save size={13} />}
                                Apply
                            </Button>
                            <Button
                                variant="outline"
                                onClick={resetAll}
                                disabled={bulkSaving}
                                className="whitespace-nowrap"
                            >
                                Reset
                            </Button>
                        </div>
                    }
                />
            )}

            <div className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] ${isEmbedded ? '' : 'p-2 shadow-sm'}`}>
                {isEmbedded && (
                    <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                                    Bulk Actions
                                </span>
                                <span className="text-xs text-[var(--color-foreground)] font-medium">
                                    Apply Same Date to All Classes
                                </span>
                            </div>
                            <div className="h-8 w-px bg-[var(--color-border)] mx-1" />
                            <DatePicker
                                value={applyDate}
                                placeholder="Choose Date"
                                onChange={date => date && setApplyDate(toISODate(date))}
                                containerClassName="w-40"
                            />
                            <Button
                                variant="primary"
                                onClick={applyToAll}
                                disabled={bulkSaving || !applyDate}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 h-9 px-4"
                            >
                                {bulkSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                Apply & Save Next
                            </Button>
                            <Button
                                variant="outline"
                                onClick={resetAll}
                                disabled={bulkSaving}
                                className="h-9"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}

                <EditableTable
                    columns={columns}
                    data={rows}
                    isLoading={isLoading}
                    emptyMessage="No classes found. Please configure Class Master first."
                    className={isEmbedded ? '' : 'mt-2'}
                />
            </div>
            
            {isEmbedded && (
                <div className="mt-8 flex justify-end">
                    <Button 
                        variant="outline" 
                        onClick={onSuccess}
                        className="flex items-center gap-2 px-8 border-primary text-primary hover:bg-primary/5 h-10"
                    >
                        Skip to Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MinimumAgeMaster;
