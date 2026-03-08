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
import { RefreshCw, Trash2, Save, Plus } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

// Matches Angular's labelList = ['positive', 'negative']
const LABEL_OPTIONS = [
    { value: 'positive', label: 'Positive' },
    { value: 'negative', label: 'Negative' },
];

interface TagRow {
    tag: string;
    colour: string;
    label: string;
}

const DEFAULT_ROW: TagRow = { tag: '', colour: '#000000', label: 'positive' };

// Helper to transform raw API tags (string or object) into TagRow format
const transformTags = (tags: any[]): TagRow[] => 
    tags.map(t =>
        typeof t === 'string'
            ? { tag: t, colour: '#000000', label: 'positive' }
            : { tag: t.tag || '', colour: t.colour || '#000000', label: t.label || 'positive' }
    );

const AdmissionTags: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setHeaderActions, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const sessions = useAppSelector((state: any) => state.session.sessionList) || [];
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    const [rows, setRows] = useState<TagRow[]>([]);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Matches Angular's viewAdmissionMaster() → this.admissionTags = res.tags
    useEffect(() => {
        if (admissionMaster?.tags) {
            setRows(transformTags(admissionMaster.tags as any[]));
        }
    }, [admissionMaster]);

    // Matches Angular's addAdmissionTagsform()
    const addRow = useCallback(() => {
        for (const row of rows) {
            if (!row.tag.trim() || !row.colour) {
                showToast('error', 'Please fill all fields before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { ...DEFAULT_ROW }]);
    }, [rows, showToast]);

    // Matches Angular's removeAdmissionTags(ind)
    const removeRow = useCallback((index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index)), []);

    const updateRow = useCallback((index: number, field: keyof TagRow, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row)), []);

    // Matches Angular's updateAdmissionMaster()
    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        for (const row of rows) {
            if (!row.tag.trim() || !row.colour) {
                showToast('error', 'Tag name and colour are required for every row');
                return;
            }
        }
        setIsLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                tags: rows.map(r => ({ tag: r.tag.trim(), colour: r.colour, label: r.label })),
            });
            showToast('success', 'Admission Tags updated');
            refetch();
            if (onSuccess) {
                onSuccess(options?.navigateNext);
            }
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

    // Matches Angular's selectedSession(session) — copy tags from another session
    const copyFromSession = useCallback(async (fromSession: string) => {
        const confirmed = window.confirm(`Copy tags from session "${fromSession}"? This will overwrite your current list.`);
        if (!confirmed) return;
        try {
            const res: any = await admissionStudentDataService.viewAdmissionMaster(entityId, fromSession);
            if (res?.tags) {
                setRows(transformTags(res.tags as any[]));
                showToast('success', `Tags copied from session "${fromSession}"`);
            } else {
                showToast('error', 'No tags found in that session');
            }
        } catch {
            showToast('error', 'Failed to load tags from selected session');
        }
    }, [entityId, showToast]);

    // Sessions for "Copy" Select
    const sessionOptions = useMemo(() => 
        (sessions as any[])
            .filter(s => s.name !== session)
            .map(s => ({ value: s.name, label: s.name })), 
        [sessions, session]
    );
    
    // Register Header Actions (Copy Select)
    useEffect(() => {
        if (isEmbedded && canEdit && sessionOptions.length > 0) {
            setHeaderActions(
                <div className="flex items-center gap-2 min-w-[240px]">
                    <SelectSingle
                        value=""
                        options={sessionOptions}
                        placeholder="Copy From Session"
                        onChange={(val) => copyFromSession(String(val))}
                        className="h-9 min-w-[160px] border-[var(--color-border)] rounded-lg text-xs"
                    />
                </div>
            );
        } else {
            setHeaderActions(null);
        }
    }, [isEmbedded, canEdit, sessionOptions, setHeaderActions, copyFromSession]);

    // Register Footer Left Actions (Add Tag Button)
    useEffect(() => {
        if (isEmbedded && canEdit) {
            setFooterLeftActions(
                <Button 
                    variant="soft-primary" 
                    onClick={addRow} 
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold rounded-md transition-all shadow-sm"
                >
                    <Plus size={18} /> Add New Tag
                </Button>
            );
        } else {
            setFooterLeftActions(null);
        }
    }, [isEmbedded, canEdit, addRow, setFooterLeftActions]);

    const columns = useMemo<EditableTableColumn<TagRow>[]>(() => [
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Tag Name <span className="text-red-500">*</span></span>,
            cell: (row, i) => (
                <Input
                    value={row.tag}
                    onChange={e => updateRow(i, 'tag', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. Interested, Follow-up"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)] focus:ring-1 focus:ring-primary/20"
                />
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Tag Colour <span className="text-red-500">*</span></span>,
            width: 160,
            cell: (row, i) => (
                <label className="flex items-center gap-3 p-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] h-10 transition-all hover:border-primary/30 cursor-pointer group relative overflow-hidden">
                    <div className="relative w-7 h-7 shrink-0 rounded-md overflow-hidden border border-[var(--color-border)] shadow-sm">
                        <input
                            type="color"
                            value={row.colour}
                            disabled={!canEdit}
                            onChange={e => updateRow(i, 'colour', e.target.value)}
                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none bg-transparent p-0 disabled:cursor-not-allowed"
                            title="Pick tag colour"
                        />
                    </div>
                    <span className="text-xs font-mono text-[var(--color-foreground)] uppercase tracking-tighter group-hover:text-primary transition-colors">{row.colour}</span>
                </label>
            ),
        },
        {
            header: <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">Label Type</span>,
            width: 180,
            cell: (row, i) => (
                <SelectSingle
                    value={row.label}
                    options={LABEL_OPTIONS}
                    placeholder="Select label"
                    onChange={val => updateRow(i, 'label', String(val))}
                    disabled={!canEdit}
                    containerClassName="w-full"
                    className="h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)]"
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
        } as EditableTableColumn<TagRow>] : []),
    ], [canEdit, updateRow, removeRow]);

    const actionButtons: ActionButton[] = useMemo(() => [{
        icon: RefreshCw,
        onClick: () => refetch(),
        title: 'Refresh Data',
        className: 'text-primary hover:bg-primary/10',
        isVisible: true,
        iconClass: isLoading ? 'animate-spin' : '',
        variant: 'outline',
    }], [refetch, isLoading]);

    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
                <>
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
                                    <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5">
                                        <Plus size={15} /> Add Tag
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
                isLoading={isLoading}
                emptyMessage="No admission tags configured yet. Click 'Add Tag' to begin."
                className={isEmbedded ? '' : 'mt-2'}
            />

            {canEdit && !isEmbedded && (
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

export default AdmissionTags;
