import { useState, useEffect } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, ActionButton, Button, Input, useToast } from '@od-erp/ui';
import { RefreshCw, Save } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

const TxnReceipt = () => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const [loading, setLoading] = useState(false);
    const [prefix, setPrefix] = useState('');
    const [number, setNumber] = useState('');
    const [suffix, setSuffix] = useState('');

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    useEffect(() => {
        if (admissionMaster?.txnReceipt) {
            const t = admissionMaster.txnReceipt;
            setPrefix(t.prefix || '');
            setNumber(String(t.number ?? ''));
            setSuffix(t.suffix || '');
        }
    }, [admissionMaster]);

    const canEdit = permissions.includes('editAdmissionMaster');

    const preview = [prefix, number, suffix].filter(Boolean).join('');

    const handleSave = async () => {
        if (!number.trim()) {
            showToast('error', 'Transaction Receipt Number is required');
            return;
        }
        setLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                txnReceipt: {
                    prefix: prefix.trim(),
                    number: number.trim(),
                    suffix: suffix.trim(),
                },
            });
            showToast('success', 'Transaction Receipt Setup saved successfully');
            refetch();
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
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
        <div className="w-full font-sans">
            <PageHeader
                title="Transaction Receipt Setup"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Setup', href: '/admission/setup' },
                    { label: 'Admission Master', href: '/admission/setup/master' },
                    { label: 'Transaction Receipt Setup' },
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar actions={actionButtons} />

            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <RefreshCw size={14} className="animate-spin" /> Loading...
                    </div>
                ) : (
                    <div className="flex flex-wrap items-end gap-4">
                            {/* Prefix */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                                Prefix
                            </label>
                            <Input
                                value={prefix}
                                onChange={e => setPrefix(e.target.value)}
                                disabled={!canEdit}
                                placeholder="e.g. ADM"
                                className="font-mono w-32"
                                maxLength={100}
                            />
                        </div>

                        {/* Number */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                                Number <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={number}
                                onChange={e => setNumber(e.target.value)}
                                disabled={!canEdit}
                                placeholder="e.g. 1001"
                                className="font-mono w-32"
                                maxLength={100}
                            />
                        </div>

                        {/* Suffix */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                                Suffix
                            </label>
                            <Input
                                value={suffix}
                                onChange={e => setSuffix(e.target.value)}
                                disabled={!canEdit}
                                placeholder="e.g. 2024"
                                className="font-mono w-32"
                                maxLength={100}
                            />
                        </div>

                        {/* Divider */}
                        <div className="self-end h-9 w-px bg-[var(--color-border)] mx-1" />

                        {/* Preview */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">Preview</label>
                            <span className={`inline-flex items-center h-9 px-4 rounded-lg font-mono text-sm font-bold tracking-wide transition-all ${
                                preview
                                    ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm'
                                    : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]'
                            }`}>
                                {preview || '—'}
                            </span>
                        </div>

                        {/* Save */}
                        {canEdit && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-transparent select-none">Action</label>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 h-9"
                                >
                                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TxnReceipt;
