import { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, ActionButton, Button, Input, SelectSingle, EditableTable, EditableTableColumn, useToast } from '@od-erp/ui';
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

const ApplicationNumber = () => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const entityPreferences = useAppSelector((state: any) => state.auth.entityDetails?.entityPreferences) || {};

    const displayNames = useMemo(() => ({
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Course',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
    }), [entityPreferences]);

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<AppNumberRow[]>([]);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);
    const { data: courseList = [], isLoading: coursesLoading } = useCourseList(entityId, session);

    useEffect(() => {
        if (admissionMaster) {
            const appNumbers: any[] = admissionMaster.applicationNumber || [];
            setRows(appNumbers.map((r: any) => ({
                course: r.course || '',
                stream: r.stream || '',
                prefix: r.prefix || '',
                number: String(r.number ?? ''),
                suffix: r.suffix || '',
            })));
        }
    }, [admissionMaster]);

    const canEdit = permissions.includes('viewAdmissionMaster');

    const courseOptions = useMemo(() =>
        courseList.map((c: any) => ({ value: c.name, label: c.name })),
        [courseList]
    );

    const getStreamOptions = (courseName: string) =>
        (courseList.find((c: any) => c.name === courseName)?.stream || []).map((s: string) => ({ value: s, label: s }));

    const addRow = () => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.number) {
                showToast('error', 'Please fill all required fields before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { course: '', stream: '', prefix: '', number: '', suffix: '' }]);
    };

    const removeRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index));

    const updateRow = (index: number, field: keyof AppNumberRow, value: string) => {
        setRows(prev => prev.map((row, i) => {
            if (i !== index) return row;
            if (field === 'course') {
                const streams = getStreamOptions(value);
                return { ...row, course: value, stream: streams[0]?.value || '' };
            }
            return { ...row, [field]: value };
        }));
    };

    const handleSave = async () => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.number) {
                showToast('error', `${displayNames.course}, ${displayNames.stream} and Number are required`);
                return;
            }
        }
        setLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                applicationNumber: rows.map(r => ({ ...r, prefix: r.prefix.trim(), suffix: r.suffix.trim() })),
            });
            showToast('success', 'Application Number Setup saved successfully');
            refetch();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo<EditableTableColumn<AppNumberRow>[]>(() => [
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
            width: 200,
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
            header: 'Prefix',
            width: 140,
            cell: (row, i) => (
                <Input
                    value={row.prefix}
                    onChange={e => updateRow(i, 'prefix', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. APP"
                    className="font-mono"
                />
            ),
        },
        {
            header: <>Number <span className="text-red-500">*</span></>,
            width: 140,
            cell: (row, i) => (
                <Input
                    value={row.number}
                    onChange={e => updateRow(i, 'number', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 1001"
                    className="font-mono"
                />
            ),
        },
        {
            header: 'Suffix',
            width: 140,
            cell: (row, i) => (
                <Input
                    value={row.suffix}
                    onChange={e => updateRow(i, 'suffix', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 2024"
                    className="font-mono"
                />
            ),
        },
        {
            header: 'Preview',
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
            width: 52,
            cell: (_: AppNumberRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<AppNumberRow>] : []),
    ], [rows, courseOptions, displayNames, canEdit]);

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

    return (
        <div className="w-full font-sans">
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
                        <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5">
                            <Plus size={15} /> Add Row
                        </Button>
                    ) : undefined
                }
            />

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isDataLoading}
                emptyMessage="No configuration yet. Click 'Add Row' to begin."
                className="mt-2"
            />

            {!isDataLoading && rows.length > 0 && canEdit && (
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

export default ApplicationNumber;
