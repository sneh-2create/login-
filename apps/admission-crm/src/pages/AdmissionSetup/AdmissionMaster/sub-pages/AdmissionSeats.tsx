import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useAdmissionMaster, useCourseList, useFeeMasterData } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

interface SeatRow {
    course: string;
    stream: string;
    category: string;
    oldNew: string;
    total: string;
}

const EMPTY_ROW: SeatRow = { course: '', stream: '', category: '', oldNew: '', total: '' };



const AdmissionSeats: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const entityPreferences = useAppSelector((state: any) => state.auth.entityDetails?.entityPreferences) || {};

    const displayNames = useMemo(() => ({
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Course',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        category: entityPreferences.displayNames?.find((item: any) => item.value === 'category')?.name || 'Category',
        oldNew: entityPreferences.displayNames?.find((item: any) => item.value === 'oldNew')?.name || 'Old/New',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    }), [entityPreferences]);

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    const [rows, setRows] = useState<SeatRow[]>([]);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);
    const { data: courseList = [], isLoading: coursesLoading } = useCourseList(entityId, session);
    const { data: feeMasterData, isLoading: feeMasterLoading } = useFeeMasterData(entityId, session);

    const categories: string[] = useMemo(() => feeMasterData?.category || [], [feeMasterData]);
    const oldNewList: string[] = useMemo(() => feeMasterData?.oldNew || [], [feeMasterData]);

    // Sync server data → local state (matches Angular's viewAdmissionMaster)
    useEffect(() => {
        if (admissionMaster?.seats && courseList.length > 0) {
            const seats = admissionMaster.seats.map((item: any) => ({
                course: item.course || '',
                stream: item.stream || '',
                category: item.category || '',
                oldNew: item.oldNew || '',
                total: String(item.total ?? ''),
            }));
            setRows(seats);
        }
    }, [admissionMaster, courseList]);

    const courseOptions = useMemo(() =>
        courseList.map((c: any) => ({ value: c.name, label: c.name })),
        [courseList]
    );

    const getStreamOptions = (courseName: string) =>
        (courseList.find((c: any) => c.name === courseName)?.stream || []).map((s: string) => ({ value: s, label: s }));

    const categoryOptions = useMemo(() => categories.map(c => ({ value: c, label: c })), [categories]);
    const oldNewOptions = useMemo(() => oldNewList.map(o => ({ value: o, label: o })), [oldNewList]);

    // Matches Angular's addTableHeadform()
    const addRow = useCallback(() => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.category || !row.oldNew || !row.total) {
                showToast('error', 'Please fill all fields before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { ...EMPTY_ROW }]);
    }, [rows, showToast]);

    // Matches Angular's removeTableHead(ind)
    const removeRow = useCallback((index: number) => 
        setRows(prev => prev.filter((_, i) => i !== index)), []);

    const updateRow = useCallback((index: number, field: keyof SeatRow, value: string) => {
        setRows(prev => prev.map((row, i) => {
            if (i !== index) return row;
            // When course changes, reset stream (matches Angular's stream dependency on course.stream)
            if (field === 'course') {
                const streams = getStreamOptions(value);
                return { ...row, course: value, stream: streams[0]?.value || '' };
            }
            return { ...row, [field]: value };
        }));
    }, [courseList]);

    // Matches Angular's updateAdmissionMaster()
    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.category || !row.oldNew || !row.total) {
                showToast('error', `${displayNames.course}, ${displayNames.stream}, ${displayNames.category}, ${displayNames.oldNew} and Seats are all required`);
                return;
            }
        }
        setIsLoading(true);
        try {
            const seatsPayload = rows.map(r => ({
                course: r.course,
                stream: r.stream,
                category: r.category,
                oldNew: r.oldNew,
                total: r.total,
            }));
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                seats: seatsPayload,
            });
            showToast('success', 'Seats Setting updated successfully');
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

    const columns = useMemo<EditableTableColumn<SeatRow>[]>(() => [
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">S.No.</span>,
            width: 80,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">{displayNames.course} <span className="text-red-500">*</span></span>,
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
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">{displayNames.category} <span className="text-red-500">*</span></span>,
            width: 200,
            cell: (row, i) => (
                <SelectSingle
                    value={row.category}
                    options={categoryOptions}
                    placeholder={`Select ${displayNames.category}`}
                    onChange={(val) => updateRow(i, 'category', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)]"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">{displayNames.oldNew} <span className="text-red-500">*</span></span>,
            width: 180,
            cell: (row, i) => (
                <SelectSingle
                    value={row.oldNew}
                    options={oldNewOptions}
                    placeholder={`Select ${displayNames.oldNew}`}
                    onChange={(val) => updateRow(i, 'oldNew', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)]"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Seats <span className="text-red-500">*</span></span>,
            width: 140,
            cell: (row, i) => (
                <Input
                    type="number"
                    value={row.total}
                    onChange={e => updateRow(i, 'total', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 60"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)] font-mono"
                />
            ),
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
        } as EditableTableColumn<SeatRow>] : []),
    ], [rows, courseOptions, categoryOptions, oldNewOptions, displayNames, canEdit, updateRow, removeRow]);

    const isDataLoading = isLoading || coursesLoading || feeMasterLoading;

    const actionButtons: ActionButton[] = [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isDataLoading ? 'animate-spin' : '',
        variant: 'outline',
    }];

    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
                <>
                    <PageHeader
                        title="Seats Setting"
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Admission Setup', href: '/admission/setup' },
                            { label: 'Admission Master', href: '/admission/setup/master' },
                            { label: 'Seats Setting' },
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
                emptyMessage="No seat configuration yet. Click 'Add Row' to begin."
                className={isEmbedded ? '' : 'mt-2'}
            />

            {canEdit && !isEmbedded && (
                <div className="mt-8 flex justify-end">
                    <Button 
                        variant="primary" 
                        onClick={() => handleSave()} 
                        disabled={isDataLoading} 
                        className="flex items-center gap-2 px-10 h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdmissionSeats;
