import React, { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, PageToolbar, ActionButton, Button, Input, useToast, useStepOrchestrator } from '@od-erp/ui';
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

const MyOperatorConfig: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({ isEmbedded = false, onSuccess }) => {
    const { showToast } = useToast();
    const { registerSaveHandler, setIsLoading } = useStepOrchestrator();

    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    const canEdit = permissions.includes('editAdmissionMaster');

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

    const setField = useCallback((field: keyof MyOperatorKeys) => (e: ChangeEvent<HTMLInputElement>) =>
        setKeys(prev => ({ ...prev, [field]: e.target.value })), []);

    // Matches Angular's updateAdmissionMaster()
    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        setIsLoading(true);
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
            if (onSuccess) onSuccess(options?.navigateNext);
        } catch (err: any) {
            showToast('error', err?.response?.data?.message || 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    }, [entityId, session, keys, refetch, onSuccess, setIsLoading, showToast]);

    // Register save handler with Orchestrator
    useEffect(() => {
        if (isEmbedded) {
            registerSaveHandler(handleSave);
        }
    }, [isEmbedded, handleSave, registerSaveHandler]);

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

            <div className={`${isEmbedded ? '' : 'mt-4'}`}>
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

                        {canEdit && !isEmbedded && (
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
                )}
            </div>
        </div>
    );
};

export default MyOperatorConfig;
