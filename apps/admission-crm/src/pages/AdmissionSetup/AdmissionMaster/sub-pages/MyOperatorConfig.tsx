import React, { useState, useEffect, type ChangeEvent } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, ActionButton, Button, Input, useToast } from '@od-erp/ui';
import { RefreshCw, Save } from 'lucide-react';
import { useAdmissionMaster } from '@od-erp/query';
import { admissionStudentDataService } from '@od-erp/api-client';

interface MyOperatorKeys {
    secretToken: string;
    companyId: string;
    publicIvrId: string;
    xApiKey: string;
}

const EMPTY_KEYS: MyOperatorKeys = {
    secretToken: '',
    companyId: '',
    publicIvrId: '',
    xApiKey: '',
};

interface MyOperatorConfigProps {
    isEmbedded?: boolean;
    onSuccess?: () => void;
}

const MyOperatorConfig: React.FC<MyOperatorConfigProps> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const canEdit = permissions.includes('editAdmissionMaster');

    const [loading, setLoading] = useState(false);
    const [keys, setKeys] = useState<MyOperatorKeys>(EMPTY_KEYS);

    const { data: admissionMaster, isLoading, refetch } = useAdmissionMaster(entityId, session);

    // Matches Angular's viewAdmissionMaster() → this.myOperatorKeys = res.myOperatorKeys
    useEffect(() => {
        if (admissionMaster?.myOperatorKeys) {
            const k = admissionMaster.myOperatorKeys;
            setKeys({
                secretToken: k.secretToken || '',
                companyId: k.companyId || '',
                publicIvrId: k.publicIvrId || '',
                xApiKey: k.xApiKey || '',
            });
        }
    }, [admissionMaster]);

    const setField = (field: keyof MyOperatorKeys) => (e: ChangeEvent<HTMLInputElement>) =>
        setKeys(prev => ({ ...prev, [field]: e.target.value }));

    // Matches Angular's updateAdmissionMaster()
    const handleSave = async () => {
        setLoading(true);
        try {
            await admissionStudentDataService.editAdmissionMaster({
                entity: entityId,
                session,
                myOperatorKeys: {
                    secretToken: keys.secretToken.trim(),
                    companyId: keys.companyId.trim(),
                    publicIvrId: keys.publicIvrId.trim(),
                    xApiKey: keys.xApiKey.trim(),
                },
            });
            showToast('success', 'My Operator Config updated successfully');
            refetch();
            if (onSuccess) onSuccess();
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

    const fields: { key: keyof MyOperatorKeys; label: string; placeholder: string }[] = [
        { key: 'secretToken', label: 'Secret Token', placeholder: 'Enter secret token' },
        { key: 'companyId',   label: 'Company ID',   placeholder: 'Enter company ID'   },
        { key: 'publicIvrId', label: 'Public IVR ID', placeholder: 'Enter public IVR ID' },
        { key: 'xApiKey',     label: 'X API Key',     placeholder: 'Enter X API key'    },
    ];

    return (
        <div className="w-full font-sans">
            {!isEmbedded && (
                <PageHeader
                    title="My Operator Config"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Admission Setup', href: '/admission/setup' },
                        { label: 'Admission Master', href: '/admission/setup/master' },
                        { label: 'My Operator Config' },
                    ]}
                    actionButtons={actionButtons}
                />
            )}

            {!isEmbedded && <PageToolbar actions={actionButtons} />}

            <div className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm ${isEmbedded ? '' : 'mt-4'}`}>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <RefreshCw size={14} className="animate-spin" /> Loading...
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-end gap-5">
                            {fields.map(({ key, label, placeholder }) => (
                                <div key={key} className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                                        {label}
                                    </label>
                                    <Input
                                        value={keys[key]}
                                        onChange={setField(key)}
                                        disabled={!canEdit}
                                        placeholder={placeholder}
                                        className="font-mono h-10"
                                    />
                                </div>
                            ))}
                        </div>

                        {canEdit && (
                            <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 bg-primary hover:bg-primary/90 h-10"
                                >
                                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                                    {isEmbedded ? 'Save & Next' : 'Save'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOperatorConfig;
