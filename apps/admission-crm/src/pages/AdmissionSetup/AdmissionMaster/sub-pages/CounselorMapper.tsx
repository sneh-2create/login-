import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import {
    PageHeader,
    PageToolbar,
    ActionButton,
    Button,
    SelectSingle,
    MultiSelect,
    EditableTable,
    EditableTableColumn,
    useToast,
} from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save } from 'lucide-react';
import { useAdmissionMaster, useCourseList, useCounselors, useSources } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

interface CounselorMapperRow {
    course: string;
    stream: string[];
    source: string[];
    counselor: string[];   // array of counselor _id values
}

const EMPTY_ROW: CounselorMapperRow = {
    course: '',
    stream: [],
    source: [],
    counselor: [],
};

interface CounselorMapperProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const CounselorMapper: React.FC<CounselorMapperProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const entityPreferences = useAppSelector((state: any) => state.auth.entityDetails?.entityPreferences) || {};

    const displayNames = useMemo(() => ({
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Course',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
    }), [entityPreferences]);

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    const [rows, setRows] = useState<CounselorMapperRow[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);
    const { data: courseList = [], isLoading: coursesLoading } = useCourseList(entityId, session);
    const { data: counselorList = [], isLoading: counselorsLoading } = useCounselors(entityId, 'counselor');
    const { data: sourceList = [], isLoading: sourcesLoading } = useSources(entityId, session);

    // Build counselor option objects: label = "name-employeeId", value = _id
    const counselorOptions = useMemo(() =>
        counselorList.map((c: any) => ({
            value: c._id as string,
            label: `${c.name}-${c.employeeId}`,
        })),
        [counselorList]
    );

    const sourceOptions = useMemo(() =>
        sourceList.map((s: string) => ({ value: s, label: s })),
        [sourceList]
    );

    const courseOptions = useMemo(() =>
        courseList.map((c: any) => ({ value: c.name, label: c.name })),
        [courseList]
    );

    const getStreamOptions = (courseName: string) =>
        (courseList.find((c: any) => c.name === courseName)?.stream || []).map((s: string) => ({ value: s, label: s }));

    // Matches Angular's viewAdmissionMaster() hydration
    useEffect(() => {
        if (admissionMaster?.counselorMapper && courseList.length > 0) {
            const mapped = admissionMaster.counselorMapper.map((item: any) => ({
                course: typeof item.course === 'object' ? (item.course?.name || '') : (item.course || ''),
                stream: Array.isArray(item.stream) ? item.stream : [],
                source: Array.isArray(item.source) ? item.source : [],
                counselor: Array.isArray(item.counselor) ? item.counselor : [],
            }));
            setRows(mapped);
        }
    }, [admissionMaster, courseList]);

    // Matches Angular's addTableHeadform() — validate before adding
    const addRow = () => {
        for (const row of rows) {
            if (!row.course || row.stream.length === 0) {
                showToast('error', `Please fill ${displayNames.course} and ${displayNames.stream} before adding a new row`);
                return;
            }
        }
        setRows(prev => [...prev, { ...EMPTY_ROW }]);
    };

    // Matches Angular's removeTableHead(ind)
    const removeRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index));

    const updateRowField = <K extends keyof CounselorMapperRow>(index: number, field: K, value: CounselorMapperRow[K]) => {
        setRows(prev => prev.map((row, i) => {
            if (i !== index) return row;
            // When course changes, reset stream (mirrors Angular behaviour)
            if (field === 'course') {
                return { ...row, course: value as string, stream: [] };
            }
            return { ...row, [field]: value };
        }));
    };

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        for (const row of rows) {
            if (!row.course || row.stream.length === 0) {
                showToast('error', `${displayNames.course} and ${displayNames.stream} are required on every row`);
                return;
            }
        }
        setLoading(true);
        try {
            const counselorMapper = rows.map(r => ({
                course: r.course,        // Angular sends course.name string on save
                stream: r.stream,
                source: r.source,
                counselor: r.counselor,
            }));
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                counselorMapper,
            });
            showToast('success', 'Counselor Mapper updated successfully');
            refetch();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo<EditableTableColumn<CounselorMapperRow>[]>(() => [
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
                    onChange={(val) => updateRowField(i, 'course', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        {
            header: <>{displayNames.stream} <span className="text-red-500">*</span></>,
            width: 220,
            cell: (row, i) => row.course ? (
                <MultiSelect
                    value={row.stream}
                    options={getStreamOptions(row.course)}
                    placeholder={`Select ${displayNames.stream}`}
                    onChange={(val) => updateRowField(i, 'stream', val as string[])}
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
            header: 'Source',
            width: 220,
            cell: (row, i) => (
                <MultiSelect
                    value={row.source}
                    options={sourceOptions}
                    placeholder="Select Source"
                    onChange={(val) => updateRowField(i, 'source', val as string[])}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        {
            header: 'Counselor',
            width: 260,
            cell: (row, i) => (
                <MultiSelect
                    value={row.counselor}
                    options={counselorOptions}
                    placeholder="Select Counselor"
                    onChange={(val) => updateRowField(i, 'counselor', val as string[])}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 52,
            cell: (_: CounselorMapperRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<CounselorMapperRow>] : []),
    ], [rows, courseOptions, sourceOptions, counselorOptions, displayNames, canEdit]);

    const isDataLoading = isLoading || coursesLoading || counselorsLoading || sourcesLoading;

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
                    title="Counselor Mapper"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admission Setup', href: '/admission/setup' },
                        { label: 'Admission Master', href: '/admission/setup/master' },
                        { label: 'Counselor Mapper' },
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
                emptyMessage="No counselor mapping yet. Click 'Add Row' to begin."
                className={isEmbedded ? '' : 'mt-2'}
            />

            {!isDataLoading && canEdit && (
                <div className="flex items-center justify-between mt-6">
                    {isEmbedded ? (
                        <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5">
                            <Plus size={15} /> Add New Row
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

export default CounselorMapper;
