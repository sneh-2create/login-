import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, ActionButton, Button, Input, useToast, Checkbox, useStepOrchestrator } from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save, Lock, GripVertical, Edit2, Check } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

const TOKEN_MONEY = 'Token Money';

interface HeadRow {
    head: string;
    isEditing?: boolean;
}



const AdmissionHead: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const canEdit = permissions.includes('editAdmissionMaster');

    const [rows, setRows] = useState<HeadRow[]>([]);
    const [tokenMoneyChecked, setTokenMoneyChecked] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Sync server data → local state, strip Token Money from main rows
    useEffect(() => {
        if (admissionMaster?.admissionHead) {
            const heads: string[] = admissionMaster.admissionHead;
            setTokenMoneyChecked(heads.includes(TOKEN_MONEY));
            setRows(heads.filter(h => h !== TOKEN_MONEY).map(h => ({ head: h, isEditing: false })));
        }
    }, [admissionMaster]);

    // Matches Angular's addAdmissionHeadform()
    const addRow = useCallback(() => {
        for (const row of rows) {
            if (!row.head.trim()) {
                showToast('error', 'Please fill all head names before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { head: '', isEditing: true }]);
    }, [rows, showToast]);

    const updateRow = (index: number, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { head: value } : row));

    // Matches Angular's removeAdmissionHead(ind)
    const removeRow = (index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index));

    const toggleEdit = (index: number, isEditing: boolean) => {
        if (!isEditing && !rows[index].head.trim()) {
            showToast('error', 'Head name cannot be empty');
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
            if (!row.head.trim()) {
                showToast('error', 'Head name cannot be empty');
                return;
            }
        }
        setIsLoading(true);
        try {
            const newHeads = [
                ...rows.map(r => r.head.trim()),
                ...(tokenMoneyChecked ? [TOKEN_MONEY] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, admissionHead: newHeads });
            showToast('success', 'Admission Head updated');
            refetch();
            if (onSuccess) onSuccess(options?.navigateNext);
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    }, [entityId, session, rows, tokenMoneyChecked, refetch, onSuccess, setIsLoading, showToast]);

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
                    <Plus size={18} /> Add New Head
                </Button>
            );
        } else {
            setFooterLeftActions(null);
        }
    }, [isEmbedded, canEdit, setFooterLeftActions, addRow]);

    // Matches Angular's checkFeeHead('Token Money') — immediate save on toggle
    const handleTokenMoneyToggle = async (checked: boolean) => {
        setTokenMoneyChecked(checked);
        try {
            const newHeads = [
                ...rows.map(r => r.head.trim()).filter(Boolean),
                ...(checked ? [TOKEN_MONEY] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, admissionHead: newHeads });
            showToast('success', checked ? 'Token Money added' : 'Token Money removed');
            refetch();
        } catch (err: any) {
            setTokenMoneyChecked(!checked); // rollback
            showToast('error', err?.response?.data?.message || 'Failed to update Token Money');
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
                    title="Admission Heads"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admission Setup', href: '/admission/setup' },
                        { label: 'Admission Master', href: '/admission/setup/master' },
                        { label: 'Admission Heads' },
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
                                    System Reserved Head
                                </h2>
                                <p className="text-sm text-[var(--color-muted-foreground)] m-0">
                                    This head is system-managed and cannot be renamed or reordered.
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
                                tokenMoneyChecked
                                    ? "border-primary/50 bg-primary/5 text-primary"
                                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] bg-white dark:bg-[var(--color-background)] hover:border-primary/30"
                            } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <Checkbox
                                checked={tokenMoneyChecked}
                                disabled={!canEdit}
                                onChange={(checked) =>
                                    handleTokenMoneyToggle(checked)
                                }
                                className="pointer-events-none"
                                containerClassName="m-0 p-0"
                            />
                            <span
                                className={`text-sm font-semibold select-none ${tokenMoneyChecked ? "text-primary" : "text-[var(--color-foreground)]"}`}
                            >
                                {TOKEN_MONEY}
                            </span>
                            <Lock size={14} className="ml-1 opacity-50" />
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
                            No admission heads yet. Click 'Add Head' to begin.
                        </p>
                        {canEdit && (
                            <Button
                                variant="outline"
                                onClick={addRow}
                                className="flex items-center gap-1.5 border-primary text-primary"
                            >
                                <Plus size={15} /> Add Head
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
                                            value={row.head}
                                            onChange={(e) => updateRow(i, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    toggleEdit(i, false);
                                                }
                                            }}
                                            className="w-full h-10 border-[var(--color-border)] rounded-lg bg-[var(--color-card)] focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
                                            autoFocus
                                            placeholder="e.g. Registration Fee"
                                        />
                                    ) : (
                                        <span className="text-[15px] font-semibold text-[var(--color-foreground)] flex items-center">
                                            {row.head}
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
                                                title="Edit head"
                                            >
                                                <Edit2 size={15} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="soft-danger"
                                            size="icon"
                                            onClick={() => removeRow(i)}
                                            className="rounded-lg transition-all duration-200 border-none shadow-none hover:bg-red-100 text-red-500"
                                            title="Remove head"
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

export default AdmissionHead;
