import { useState, useEffect, useMemo } from 'react';
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
import { Plus, RefreshCw, Trash2, Save, Copy } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

// Matches Angular's labelList = ['positive', 'negative']
const LABEL_OPTIONS = [
    { value: 'positive', label: 'POSITIVE' },
    { value: 'negative', label: 'NEGATIVE' },
];

interface TagRow {
    tag: string;
    colour: string;
    label: string;
}

const DEFAULT_ROW: TagRow = { tag: '', colour: '#000000', label: 'positive' };

const AdmissionTags = () => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const sessions = useAppSelector((state: any) => state.session.sessionList) || [];
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    const [rows, setRows] = useState<TagRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [copyMenuOpen, setCopyMenuOpen] = useState(false);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Matches Angular's viewAdmissionMaster() → this.admissionTags = res.tags
    useEffect(() => {
        if (admissionMaster?.tags) {
            setRows(
                (admissionMaster.tags as any[]).map(t =>
                    typeof t === 'string'
                        ? { tag: t, colour: '#000000', label: 'positive' }
                        : { tag: t.tag || '', colour: t.colour || '#000000', label: t.label || 'positive' }
                )
            );
        }
    }, [admissionMaster]);

    // Matches Angular's addAdmissionTagsform()
    const addRow = () => {
        for (const row of rows) {
            if (!row.tag.trim() || !row.colour) {
                showToast('error', 'Please fill all fields before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { ...DEFAULT_ROW }]);
    };

    // Matches Angular's removeAdmissionTags(ind)
    const removeRow = (index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index));

    const updateRow = (index: number, field: keyof TagRow, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        for (const row of rows) {
            if (!row.tag.trim() || !row.colour) {
                showToast('error', 'Tag name and colour are required for every row');
                return;
            }
        }
        setLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                tags: rows.map(r => ({ tag: r.tag.trim(), colour: r.colour, label: r.label })),
            });
            showToast('success', 'Admission Tags updated');
            refetch();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    // Matches Angular's selectedSession(session) — copy tags from another session
    const copyFromSession = async (fromSession: string) => {
        setCopyMenuOpen(false);
        const confirmed = window.confirm(`Copy tags from session "${fromSession}"? This will overwrite your current list.`);
        if (!confirmed) return;
        try {
            const res: any = await admissionStudentDataService.viewAdmissionMaster(entityId, fromSession);
            if (res?.tags) {
                setRows(
                    (res.tags as any[]).map((t: any) =>
                        typeof t === 'string'
                            ? { tag: t, colour: '#000000', label: 'positive' }
                            : { tag: t.tag || '', colour: t.colour || '#000000', label: t.label || 'positive' }
                    )
                );
                showToast('success', `Tags copied from session "${fromSession}"`);
            } else {
                showToast('error', 'No tags found in that session');
            }
        } catch {
            showToast('error', 'Failed to load tags from selected session');
        }
    };

    const columns = useMemo<EditableTableColumn<TagRow>[]>(() => [
        {
            header: 'S.No.',
            width: 60,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <span>Tag <span className="text-red-500">*</span></span>,
            cell: (row, i) => (
                <Input
                    value={row.tag}
                    onChange={e => updateRow(i, 'tag', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. Interested, Follow-up"
                />
            ),
        },
        {
            header: <span>Colour <span className="text-red-500">*</span></span>,
            width: 140,
            cell: (row, i) => (
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={row.colour}
                        disabled={!canEdit}
                        onChange={e => updateRow(i, 'colour', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-[var(--color-border)] bg-transparent p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pick tag colour"
                    />
                    <span className="text-xs font-mono text-[var(--color-muted-foreground)]">{row.colour}</span>
                </div>
            ),
        },
        {
            header: 'Label',
            width: 160,
            cell: (row, i) => (
                <SelectSingle
                    value={row.label}
                    options={LABEL_OPTIONS}
                    placeholder="Select label"
                    onChange={val => updateRow(i, 'label', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 52,
            cell: (_: TagRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<TagRow>] : []),
    ], [rows, canEdit]);

    const actionButtons: ActionButton[] = [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isLoading ? 'animate-spin' : '',
        variant: 'outline',
    }];

    // Sessions for "Copy" menu — matches Angular's mat-menu with session list
    const otherSessions = (sessions as any[]).filter(s => s.name !== session);

    return (
        <div className="w-full font-sans">
            <PageHeader
                title="Admission Tags"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Setup', href: '/admission/setup' },
                    { label: 'Admission Master', href: '/admission/setup/master' },
                    { label: 'Admission Tags' },
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                actions={actionButtons}
                extraContent={
                    canEdit ? (
                        <div className="flex items-center gap-2">
                            {/* Copy from session — matches Angular's Copy mat-menu */}
                            {otherSessions.length > 0 && (
                                <div className="relative">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCopyMenuOpen(v => !v)}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Copy size={15} /> Copy
                                    </Button>
                                    {copyMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setCopyMenuOpen(false)} />
                                            <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg overflow-y-auto max-h-48">
                                                {otherSessions.map((s: any) => (
                                                    <button
                                                        key={s.name}
                                                        onClick={() => copyFromSession(s.name)}
                                                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors"
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5">
                                <Plus size={15} /> Add Tag
                            </Button>
                        </div>
                    ) : undefined
                }
            />

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                emptyMessage="No admission tags configured yet. Click 'Add Tag' to begin."
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

export default AdmissionTags;
