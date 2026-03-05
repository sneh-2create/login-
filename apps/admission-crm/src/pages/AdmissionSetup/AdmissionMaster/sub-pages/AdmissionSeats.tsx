import React, { useState, useEffect, useMemo } from 'react';
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

interface AdmissionSeatsProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const AdmissionSeats: React.FC<AdmissionSeatsProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
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
    const [loading, setLoading] = useState(false);

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
    const addRow = () => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.category || !row.oldNew || !row.total) {
                showToast('error', 'Please fill all fields before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { ...EMPTY_ROW }]);
    };

    // Matches Angular's removeTableHead(ind)
    const removeRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index));

    const updateRow = (index: number, field: keyof SeatRow, value: string) => {
        setRows(prev => prev.map((row, i) => {
            if (i !== index) return row;
            // When course changes, reset stream (matches Angular's stream dependency on course.stream)
            if (field === 'course') {
                const streams = getStreamOptions(value);
                return { ...row, course: value, stream: streams[0]?.value || '' };
            }
            return { ...row, [field]: value };
        }));
    };

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.category || !row.oldNew || !row.total) {
                showToast('error', `${displayNames.course}, ${displayNames.stream}, ${displayNames.category}, ${displayNames.oldNew} and Seats are all required`);
                return;
            }
        }
        setLoading(true);
        try {
            const seatsPayload = rows.map(r => ({
                course: r.course,    // Angular sends course.name string on save
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
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo<EditableTableColumn<SeatRow>[]>(() => [
        {
            header: 'S.No.',
            width: 60,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <>{displayNames.course} <span className="text-red-500">*</span></>,
            width: 200,
            cell: (row, i) => (
                <SelectSingle
                    value={row.course}
                    options={courseOptions}
                    placeholder={`Select ${displayNames.course}`}
                    onChange={(val) => updateRow(i, 'course', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        {
            header: <>{displayNames.stream} <span className="text-red-500">*</span></>,
            width: 180,
            cell: (row, i) => row.course ? (
                <SelectSingle
                    value={row.stream}
                    options={getStreamOptions(row.course)}
                    placeholder={`Select ${displayNames.stream}`}
                    onChange={(val) => updateRow(i, 'stream', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ) : (
                <span className="text-xs text-[var(--color-muted-foreground)] italic">
                    Select {displayNames.course} first
                </span>
            ),
        },
        {
            header: <>{displayNames.category} <span className="text-red-500">*</span></>,
            width: 180,
            cell: (row, i) => (
                <SelectSingle
                    value={row.category}
                    options={categoryOptions}
                    placeholder={`Select ${displayNames.category}`}
                    onChange={(val) => updateRow(i, 'category', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        {
            header: <>{displayNames.oldNew} <span className="text-red-500">*</span></>,
            width: 160,
            cell: (row, i) => (
                <SelectSingle
                    value={row.oldNew}
                    options={oldNewOptions}
                    placeholder={`Select ${displayNames.oldNew}`}
                    onChange={(val) => updateRow(i, 'oldNew', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        {
            header: <>Seats <span className="text-red-500">*</span></>,
            width: 140,
            cell: (row, i) => (
                <Input
                    type="number"
                    value={row.total}
                    onChange={e => updateRow(i, 'total', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 60"
                    className="font-mono"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 52,
            cell: (_: SeatRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<SeatRow>] : []),
    ], [rows, courseOptions, categoryOptions, oldNewOptions, displayNames, canEdit]);

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
            )}

            {!isEmbedded && (
                <PageToolbar
                    actions={actionButtons}
                    extraContent={
                        canEdit ? (
                            <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5">
                                <Plus size={15} /> Add Row
                            </Button>
                        ) : undefined
                    }
                />
            )}

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isDataLoading}
                emptyMessage="No seat configuration yet. Click 'Add Row' to begin."
                className={isEmbedded ? '' : 'mt-2'}
            />

            {!isDataLoading && canEdit && (
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

export default AdmissionSeats;
