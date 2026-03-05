import React, { useState, useMemo, useEffect } from 'react';
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

interface ApplicationNumberProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const ApplicationNumber: React.FC<ApplicationNumberProps> = ({ isEmbedded = false, onSuccess }) => {
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

    const addRow = () => {
        for (const row of rows) {
            if (!row.course || !row.stream || !row.number) {
                showToast('error', 'Please fill all required fields before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { course: '', stream: '', prefix: '', number: '', suffix: '' }]);
    };

    const removeRow = (index: number) => {
        if (rows.length === 1) {
            setRows([{ course: '', stream: '', prefix: '', number: '', suffix: '' }]);
            return;
        }
        setRows(prev => prev.filter((_, i) => i !== index));
    };

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

        setLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                applicationNumber: validRows.map(r => ({ ...r, prefix: r.prefix.trim(), suffix: r.suffix.trim() })),
            });
            showToast('success', 'Application Number Setup saved successfully');
            refetch();
            if (onSuccess) onSuccess();
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
            width: 220,
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
            width: 220,
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
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
            )}

            {!isEmbedded && (
                <PageToolbar
                    actions={actionButtons}
                    extraContent={
                        canEdit ? (
                            <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5">
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
                emptyMessage="No configuration yet. Click 'Add Row' to begin."
                className={isEmbedded ? '' : 'mt-2'}
                minWidth={950}
            />

            {!isDataLoading && canEdit && (
                <div className="flex items-center justify-between mt-6 px-1">
                    {isEmbedded ? (
                        <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5">
                            <Plus size={15} /> Add New Details
                        </Button>
                    ) : <div />}

                    <Button variant="primary" onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-10 h-11 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        <span className="font-bold">
                            {isEmbedded ? 'Save & Next' : 'Save Changes'}
                        </span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ApplicationNumber;
