import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, ActionButton, Button, Input, useToast, Checkbox } from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save, GripVertical, Edit2, Check } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

const REFERENCE = 'Reference';

interface SourceRow {
    source: string;
    isEditing?: boolean;
}

interface AdmissionSourceProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const AdmissionSource: React.FC<AdmissionSourceProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const [rows, setRows] = useState<SourceRow[]>([]);
    const [referenceChecked, setReferenceChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [referenceLoading, setReferenceLoading] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    // Sync server data → local state, strip Reference from main rows
    useEffect(() => {
        if (admissionMaster?.source) {
            const sources: string[] = admissionMaster.source;
            setReferenceChecked(sources.includes(REFERENCE));
            setRows(sources.filter(s => s !== REFERENCE).map(s => ({ source: s, isEditing: false })));
        }
    }, [admissionMaster]);

    // Matches Angular's addSourceform()
    const addRow = () => {
        for (const row of rows) {
            if (!row.source.trim()) {
                showToast('error', 'Please fill all source names before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { source: '', isEditing: true }]);
    };

    const updateRow = (index: number, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { ...row, source: value } : row));

    // Matches Angular's removeSource(ind)
    const removeRow = (index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index));

    const toggleEdit = (index: number, isEditing: boolean) => {
        if (!isEditing && !rows[index].source.trim()) {
            showToast('error', 'Source name cannot be empty');
            return;
        }
        setRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, isEditing } : row)),
        );
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = "move";
        setDraggingIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;
        setRows((prev) => {
            const newRows = [...prev];
            const draggedItem = newRows[draggingIndex];
            newRows.splice(draggingIndex, 1);
            newRows.splice(index, 0, draggedItem);
            return newRows;
        });
        setDraggingIndex(null);
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
    };

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        for (const row of rows) {
            if (!row.source.trim()) {
                showToast('error', 'Source name cannot be empty');
                return;
            }
        }
        setLoading(true);
        try {
            const newSources = [
                ...rows.map(r => r.source.trim()),
                ...(referenceChecked ? [REFERENCE] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, source: newSources });
            showToast('success', 'Admission Source updated');
            refetch();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    // Matches Angular's checkSource('Reference', isChecked) — immediate save on toggle
    const handleReferenceToggle = async (checked: boolean) => {
        setReferenceChecked(checked);
        setReferenceLoading(true);
        try {
            const newSources = [
                ...rows.map(r => r.source.trim()).filter(Boolean),
                ...(checked ? [REFERENCE] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, source: newSources });
            showToast('success', checked ? 'Reference added' : 'Reference removed');
            refetch();
        } catch (err: any) {
            setReferenceChecked(!checked); // rollback
            showToast('error', err?.response?.data?.message || 'Failed to update Reference');
        } finally {
            setReferenceLoading(false);
        }
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

    return (
        <div className="w-full font-sans max-full mx-auto space-y-3">
            {!isEmbedded && (
                <PageHeader
                    title="Admission Source"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admission Setup', href: '/admission/setup' },
                        { label: 'Admission Master', href: '/admission/setup/master' },
                        { label: 'Admission Source' },
                    ]}
                    actionButtons={actionButtons}
                />
            )}

            {/* Top Header Section for embedded mode */}
            {isEmbedded && (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--color-foreground)] m-0">
                            System Reserved Source
                        </h2>
                        <p className="text-sm text-[var(--color-muted-foreground)] m-0 mt-1">
                            Select the ones applicable to your process.
                        </p>
                    </div>
                    {canEdit && (
                        <Button
                            variant="outline"
                            onClick={addRow}
                            className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5 px-4 h-9"
                        >
                            <Plus size={16} /> Add New Details
                        </Button>
                    )}
                </div>
            )}

            {!isLoading && (
                <div>
                    {!isEmbedded && (
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-1">
                                    System Reserved Source
                                </h2>
                                <p className="text-sm text-[var(--color-muted-foreground)] m-0">
                                    This source is system-managed and cannot be renamed or reordered.
                                </p>
                            </div>
                            {canEdit && (
                                <Button
                                    variant="outline"
                                    onClick={addRow}
                                    className="flex items-center gap-1.5 border-primary text-primary"
                                >
                                    <Plus size={15} /> Add New Details
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 mt-2">
                        <label
                            className={`flex items-center gap-3 cursor-pointer pl-2 pr-6 py-2.5 rounded-lg border transition-colors w-54 ${
                                referenceChecked
                                    ? "border-primary/50 bg-primary/5 text-primary"
                                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] bg-white dark:bg-[var(--color-background)] hover:border-primary/30"
                            } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <Checkbox
                                checked={referenceChecked}
                                disabled={!canEdit || referenceLoading}
                                onChange={(checked) =>
                                    handleReferenceToggle(checked)
                                }
                                className="pointer-events-none"
                                containerClassName="m-0 p-0"
                            />
                            <span
                                className={`text-sm font-semibold select-none ${referenceChecked ? "text-primary" : "text-[var(--color-foreground)]"}`}
                            >
                                {REFERENCE}
                            </span>
                            {referenceLoading && <RefreshCw size={12} className="animate-spin text-primary ml-1" />}
                        </label>
                    </div>
                </div>
            )}

            {/* Custom Stages Section */}
            <div className="pt-2">
                {isLoading ? (
                    <div className="flex items-center justify-center p-10 bg-white dark:bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] shadow-sm">
                        <RefreshCw size={26} className="animate-spin text-primary" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] shadow-sm text-center">
                        <p className="text-[var(--color-muted-foreground)] mb-4 font-medium">
                            No admission sources yet. Click 'Add Source' to begin.
                        </p>
                        {canEdit && (
                            <Button
                                variant="outline"
                                onClick={addRow}
                                className="flex items-center gap-1.5 border-primary text-primary"
                            >
                                <Plus size={15} /> Add Source
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {rows.map((row, i) => (
                            <div
                                key={i}
                                draggable={canEdit && !row.isEditing}
                                onDragStart={(e) => handleDragStart(e, i)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, i)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-3 p-2 bg-white dark:bg-[var(--color-background)] rounded-lg border shadow-sm transition-all ${row.isEditing ? "border-primary ring-1 ring-primary/20" : "border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]/30"} ${draggingIndex === i ? "opacity-50 border-dashed bg-gray-50 dark:bg-[var(--color-foreground)]/5" : ""}`}
                            >
                                {/* Grip icon */}
                                <div className="text-[var(--color-muted-foreground)] opacity-40 hover:opacity-100 cursor-grab active:cursor-grabbing px-2 py-2 flex-shrink-0">
                                    <GripVertical size={20} strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 flex flex-col pr-4">
                                    <label
                                        className={`text-[10px] font-bold uppercase tracking-widest ${row.isEditing ? "text-primary" : "text-[var(--color-muted-foreground)]/80"}`}
                                    >
                                        Enter Value
                                    </label>
                                    {row.isEditing ? (
                                        <Input
                                            value={row.source}
                                            onChange={(e) => updateRow(i, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    toggleEdit(i, false);
                                                }
                                            }}
                                            className="w-full h-10 border-primary focus-visible:ring-primary/20 shadow-sm transition-all"
                                            autoFocus
                                            placeholder="e.g. Website"
                                        />
                                    ) : (
                                        <span className="text-[15px] font-semibold text-[var(--color-foreground)] flex items-center">
                                            {row.source}
                                        </span>
                                    )}
                                </div>

                                {canEdit && (
                                    <div className="flex items-center gap-2 pr-2">
                                        {row.isEditing ? (
                                            <Button
                                                variant="primary"
                                                onClick={() => toggleEdit(i, false)}
                                                className="!w-10 !h-10 !p-0 flex items-center justify-center min-w-[40px] shadow-sm"
                                                title="Confirm edit"
                                            >
                                                <Check size={18} />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleEdit(i, true)}
                                                className="!w-9 !h-9 !p-0 flex items-center justify-center min-w-[36px] text-[var(--color-muted-foreground)] hover:text-primary hover:border-primary hover:bg-transparent shadow-none transition-colors border-[var(--color-border)]"
                                                title="Edit source"
                                            >
                                                <Edit2 size={15} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={() => removeRow(i)}
                                            className="!w-9 !h-9 !p-0 flex items-center justify-center min-w-[36px] text-red-400 hover:text-red-600 hover:border-red-600 hover:bg-transparent shadow-none transition-colors border-red-400"
                                            title="Remove source"
                                        >
                                            <Trash2 size={15} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isLoading && canEdit && (
                <div className="flex justify-end mt-8">
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-10 py-2.5 h-[42px] font-medium shadow-sm transition-colors text-base"
                    >
                        {loading ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {isEmbedded ? "Save & Next" : "Save"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdmissionSource;
