import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, ActionButton, Button, Input, EditableTable, EditableTableColumn, useToast } from '@od-erp/ui';
import { Plus, RefreshCw, Trash2, Save, Lock } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

const TOKEN_MONEY = 'Token Money';

interface HeadRow {
    head: string;
}

interface AdmissionHeadProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const AdmissionHead: React.FC<AdmissionHeadProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const [rows, setRows] = useState<HeadRow[]>([]);
    const [tokenMoneyChecked, setTokenMoneyChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Matches Angular's checkPermission('editAdmissionMaster')
    const canEdit = permissions.includes('editAdmissionMaster');

    // Sync server data → local state, strip Token Money from main rows
    useEffect(() => {
        if (admissionMaster?.admissionHead) {
            const heads: string[] = admissionMaster.admissionHead;
            setTokenMoneyChecked(heads.includes(TOKEN_MONEY));
            setRows(heads.filter(h => h !== TOKEN_MONEY).map(h => ({ head: h })));
        }
    }, [admissionMaster]);

    // Matches Angular's addAdmissionHeadform()
    const addRow = () => {
        for (const row of rows) {
            if (!row.head.trim()) {
                showToast('error', 'Please fill all head names before adding a new row');
                return;
            }
        }
        setRows(prev => [...prev, { head: '' }]);
    };

    const updateRow = (index: number, value: string) =>
        setRows(prev => prev.map((row, i) => i === index ? { head: value } : row));

    // Matches Angular's removeAdmissionHead(ind)
    const removeRow = (index: number) =>
        setRows(prev => prev.filter((_, i) => i !== index));

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        for (const row of rows) {
            if (!row.head.trim()) {
                showToast('error', 'Head name cannot be empty');
                return;
            }
        }
        setLoading(true);
        try {
            const newHeads = [
                ...rows.map(r => r.head.trim()),
                ...(tokenMoneyChecked ? [TOKEN_MONEY] : []),
            ];
            await admissionStudentDataService.editAdmissionMaster({ entity: entityId, session, admissionHead: newHeads });
            showToast('success', 'Admission Head updated');
            refetch();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

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

    const columns = useMemo<EditableTableColumn<HeadRow>[]>(() => [
        {
            header: 'S.No.',
            width: 60,
            cell: (_, i) => (
                <span className="text-[var(--color-muted-foreground)] text-xs font-mono">{i + 1}</span>
            ),
        },
        {
            header: <span>Admission Head <span className="text-red-500">*</span></span>,
            cell: (row, i) => (
                <Input
                    value={row.head}
                    onChange={e => updateRow(i, e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. Registration Fee, Tuition Fee"
                />
            ),
        },
        ...(canEdit ? [{
            header: '',
            width: 52,
            cell: (_: HeadRow, i: number) => (
                <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove row"
                >
                    <Trash2 size={15} />
                </button>
            ),
        } as EditableTableColumn<HeadRow>] : []),
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

    return (
        <div className="w-full font-sans">
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

            {!isEmbedded && (
                <PageToolbar
                    actions={actionButtons}
                    extraContent={
                        canEdit ? (
                            <Button variant="outline" onClick={addRow} className="flex items-center gap-1.5">
                                <Plus size={15} /> Add Head
                            </Button>
                        ) : undefined
                    }
                />
            )}

            <EditableTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                emptyMessage="No admission heads yet. Click 'Add Head' to begin."
                className={isEmbedded ? '' : 'mt-2'}
            />

            {/* Token Money — matches Angular's mat-checkbox with checkFeeHead('Token Money') */}
            {!isLoading && (
                <div className="mt-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Lock size={14} className="text-[var(--color-muted-foreground)]" />
                        <span className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
                            System Reserved Head
                        </span>
                    </div>
                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors w-fit ${
                        tokenMoneyChecked
                            ? 'border-primary/40 bg-primary/5 text-primary'
                            : 'border-[var(--color-border)] text-[var(--color-muted-foreground)]'
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                            type="checkbox"
                            checked={tokenMoneyChecked}
                            disabled={!canEdit}
                            onChange={e => handleTokenMoneyToggle(e.target.checked)}
                            className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium">Token Money</span>
                    </label>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                        This head is system-managed and cannot be renamed or reordered.
                    </p>
                </div>
            )}

            {/* Save button — shown when there are editable rows */}
            {!isLoading && canEdit && (
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

export default AdmissionHead;
