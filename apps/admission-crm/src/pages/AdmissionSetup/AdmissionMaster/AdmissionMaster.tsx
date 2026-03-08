import { useMemo, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, ActionButton, PhaseTimeline, PhaseStepCard } from '@od-erp/ui';
import { RefreshCw } from 'lucide-react';
import { ADMISSION_PHASES } from '@od-erp/constants';
import { useAdmissionMaster, useCourseList } from '@od-erp/query';

// Sub-pages
import ApplicationNumber from './sub-pages/ApplicationNumber';
import StagesMaster from './sub-pages/StagesMaster';
import TxnReceipt from './sub-pages/TxnReceipt';
import AdmissionHead from './sub-pages/AdmissionHead';
import AdmissionSource from './sub-pages/AdmissionSource';
import DuplicateFields from './sub-pages/DuplicateFields';
import AdmissionSeats from './sub-pages/AdmissionSeats';
import AdmissionTags from './sub-pages/AdmissionTags';
import CounselorMapper from './sub-pages/CounselorMapper';
import MyOperatorConfig from './sub-pages/MyOperatorConfig';
import AdmissionTeams from './sub-pages/AdmissionTeams';
import MinimumAgeMaster from './sub-pages/MinimumAgeMaster';

const AdmissionMaster = () => {
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    
    const [searchParams, setSearchParams] = useSearchParams();
    const focusedItemId = searchParams.get('step');

    const { data: admissionMaster, isLoading: isMasterLoading } = useAdmissionMaster(entityId, session);
    const { data: courseList = [], isLoading: isCourseLoading } = useCourseList(entityId, session);

    const updateParams = (itemId: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (itemId) newParams.set('step', itemId);
        else newParams.delete('step');
        setSearchParams(newParams);
    };

    const handleReset = () => {
        updateParams(null);
    };

    // Helper to check if a step is "Started" (has data)
    const checkIsStarted = (stepId: string): boolean => {
        if (!admissionMaster) return false;

        switch (stepId) {
            case 'admissionMaster':
                return (
                    (admissionMaster.applicationNumber?.length > 0) ||
                    (admissionMaster.stages?.length > 0) ||
                    (!!admissionMaster.txnReceipt?.number || !!admissionMaster.txnReceipt?.prefix || !!admissionMaster.txnReceipt?.suffix) ||
                    (admissionMaster.admissionHead?.length > 0) ||
                    (admissionMaster.source?.length > 0) ||
                    (admissionMaster.duplicacyCheckFields?.length > 0)
                );
            case 'tags':
                return admissionMaster.tags?.length > 0;
            case 'seats':
                return admissionMaster.seats?.length > 0;
            case 'counselorMapper':
                return admissionMaster.counselorMapper?.length > 0;
            case 'admissionTeams':
                return admissionMaster.teams?.length > 0;
            case 'myOperatorConfig':
                return Object.entries(admissionMaster.myOperatorKeys || {}).some(([key, val]) => 
                    !['_id', '__v'].includes(key) && !!val
                );
            case 'minimumAgeMaster':
                return courseList.some((c: any) => !!c.minimumAge || !!c.asOnDate);
            default:
                return false;
        }
    };

    // Map of component IDs to their actual React components
    const componentMap: Record<string, (_onSuccess: () => void) => ReactNode> = {
        admissionMaster: (onSuccess) => <ApplicationNumber isEmbedded onSuccess={onSuccess} />,
        stages: (onSuccess) => <StagesMaster isEmbedded onSuccess={onSuccess} />,
        txnReceipt: (onSuccess) => <TxnReceipt isEmbedded onSuccess={onSuccess} />,
        admissionHead: (onSuccess) => <AdmissionHead isEmbedded onSuccess={onSuccess} />,
        source: (onSuccess) => <AdmissionSource isEmbedded onSuccess={onSuccess} />,
        duplicateFields: (onSuccess) => <DuplicateFields isEmbedded onSuccess={onSuccess} />,
        tags: (onSuccess) => <AdmissionTags isEmbedded onSuccess={onSuccess} />,
        seats: (onSuccess) => <AdmissionSeats isEmbedded onSuccess={onSuccess} />,
        counselorMapper: (onSuccess) => <CounselorMapper isEmbedded onSuccess={onSuccess} />,
        myOperatorConfig: (onSuccess) => <MyOperatorConfig isEmbedded onSuccess={onSuccess} />,
        admissionTeams: (onSuccess) => <AdmissionTeams isEmbedded onSuccess={onSuccess} />,
        minimumAgeMaster: (onSuccess) => <MinimumAgeMaster isEmbedded onSuccess={onSuccess} />,
    };

    const allSteps = useMemo(() => ADMISSION_PHASES.flatMap(p => p.steps), []);
    const focusedStep = useMemo(() => allSteps.find(s => s.id === focusedItemId), [allSteps, focusedItemId]);

    const handleSuccess = () => {
        if (!focusedItemId) return;
        const currentIndex = allSteps.findIndex(i => i.id === focusedItemId);
        if (currentIndex < allSteps.length - 1) {
            const nextItem = allSteps[currentIndex + 1];
            updateParams(nextItem.id);
        } else {
            updateParams(null);
        }
    };

    const actionButtons: ActionButton[] = [
        {
            icon: RefreshCw,
            onClick: () => window.location.reload(),
            title: 'Refresh',
            isVisible: true,
            variant: 'outline',
        }
    ];

    const isDataLoading = isMasterLoading || isCourseLoading;

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title="Admission Setup Master"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Setup', href: '/admission/setup' },
                    { label: 'Admission Master' },
                ]}
                actionButtons={actionButtons}
            />

            <div className="mt-4 w-full max-w-full pb-4">
                {focusedStep ? (
                    /* Detail View / Focus Mode */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                            >
                                ← Back to Overview
                            </button>
                            <div className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest bg-[var(--color-muted)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                                Step {allSteps.findIndex(i => i.id === focusedItemId) + 1} of {allSteps.length}
                            </div>
                        </div>

                        <div className="bg-[var(--color-card)] rounded-3xl border border-[var(--color-border)] shadow-xl overflow-hidden">
                            <div className="px-8 py-6 border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 flex items-center gap-6">
                                <div className="p-4 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)] text-primary border border-primary/20">
                                    {focusedStep.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                                        {focusedStep.title}
                                    </h2>
                                    <p className="text-sm text-[var(--color-muted-foreground)]">
                                        {focusedStep.subtitle}
                                    </p>
                                </div>
                            </div>
                            <div className="p-2">
                                {componentMap[focusedStep.id]?.(handleSuccess)}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Main Phase List View - Phased Timeline */
                    <div className="space-y-4">
                        {isDataLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <RefreshCw size={40} className="animate-spin text-primary opacity-20" />
                                <p className="text-sm text-[var(--color-muted-foreground)] animate-pulse">Checking configurations...</p>
                            </div>
                        )}
                        {!isDataLoading && ADMISSION_PHASES.map((phase) => {
                            const visibleSteps = phase.steps.filter(step => permissions.includes(step.permission));
                            if (visibleSteps.length === 0) return null;

                            return (
                                <PhaseTimeline 
                                    key={phase.id} 
                                    title={phase.title} 
                                    phaseNumber={phase.phaseNumber}
                                >
                                    {visibleSteps.map((step) => (
                                        <PhaseStepCard
                                            key={step.id}
                                            title={step.title}
                                            subtitle={step.subtitle}
                                            icon={step.icon}
                                            isStarted={checkIsStarted(step.id)}
                                            onAction={() => updateParams(step.id)}
                                        />
                                    ))}
                                </PhaseTimeline>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionMaster;
