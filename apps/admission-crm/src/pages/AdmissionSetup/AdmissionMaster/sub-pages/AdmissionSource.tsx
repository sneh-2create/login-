import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, ActionButton, Button, Input, useToast, Checkbox, useStepOrchestrator } from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save, GripVertical, Edit2, Check } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

const REFERENCE = 'Reference';

interface SourceRow {
    source: string;
    isEditing?: boolean;
}



const AdmissionSource: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const [rows, setRows] = useState<SourceRow[]>([]);
    const [referenceChecked, setReferenceChecked] = useState(false);
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
    const addRow = useCallback(() => {
        for (const row of rows) {
            if (!row.source.trim()) {
                showToast('error', 'Please fill all source names before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { source: '', isEditing: true }]);
    }, [rows, showToast]);

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
    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        for (const row of rows) {
            if (!row.source.trim()) {
                showToast('error', 'Source name cannot be empty');
                return;
            }
        }
        setIsLoading(true);
        try {
            const newSources = [
                ...rows.map(r => r.source.trim()),
                ...(referenceChecked ? [REFERENCE] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, source: newSources });
            showToast('success', 'Admission Source updated');
            refetch();
            if (onSuccess) onSuccess(options?.navigateNext);
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    }, [entityId, session, rows, referenceChecked, refetch, onSuccess, setIsLoading, showToast]);

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
                    <Plus size={18} /> Add New Source
                </Button>
            );
        } else {
            setFooterLeftActions(null);
        }
    }, [isEmbedded, canEdit, setFooterLeftActions, addRow]);

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
            <div>
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
                                                variant="soft-primary"
                                                size="icon"
                                                onClick={() => toggleEdit(i, false)}
                                                className="rounded-lg transition-all duration-200 border-none shadow-none hover:bg-primary/10 text-primary"
                                                title="Confirm edit"
                                            >
                                                <Check size={18} />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="soft-primary"
                                                size="icon"
                                                onClick={() => toggleEdit(i, true)}
                                                className="rounded-lg transition-all duration-200 border-none shadow-none hover:bg-primary/10 text-primary"
                                                title="Edit source"
                                            >
                                                <Edit2 size={15} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="soft-danger"
                                            size="icon"
                                            onClick={() => removeRow(i)}
                                            className="rounded-lg transition-all duration-200 border-none shadow-none hover:bg-red-100 text-red-500"
                                            title="Remove source"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isLoading && canEdit && !isEmbedded && (
                <div className="flex justify-end mt-8">
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

export default AdmissionSource;
