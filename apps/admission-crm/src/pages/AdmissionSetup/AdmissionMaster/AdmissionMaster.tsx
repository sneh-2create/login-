import { useMemo, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, ActionButton, PhaseTimeline, PhaseStepCard, StepOrchestrator } from '@od-erp/ui';
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
    const navigate = useNavigate();
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    // Manual URL tracking to handle router desync in Module Federation
    useEffect(() => {
        const handleLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };

        // Listen for back/forward navigation
        window.addEventListener('popstate', handleLocationChange);

        // Monkey-patch pushState and replaceState to catch host router navigation
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function(...args) {
            originalPushState.apply(window.history, args);
            handleLocationChange();
        };

        window.history.replaceState = function(...args) {
            originalReplaceState.apply(window.history, args);
            handleLocationChange();
        };

        return () => {
            window.removeEventListener('popstate', handleLocationChange);
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
        };
    }, []);

    // Derive focusedItemId from the actual window path to be safe
    const focusedItemId = useMemo(() => {
        // Path format: /admission/setup/master/:stepId
        const parts = currentPath.split('/');
        const masterIndex = parts.indexOf('master');
        if (masterIndex !== -1 && parts.length > masterIndex + 1) {
            const step = parts[masterIndex + 1];
            return step || null;
        }
        return null;
    }, [currentPath]);

    const { data: admissionMaster, isLoading: isMasterLoading } = useAdmissionMaster(entityId, session);
    const { data: courseList = [], isLoading: isCourseLoading } = useCourseList(entityId, session);

    const handleReset = () => {
        navigate('/admission/setup/master', { replace: false });
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
    const componentMap: Record<string, (_onSuccess: (_navigateNext?: boolean) => void) => ReactNode> = {
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

    const handleSuccess = (navigateNext: boolean = true) => {
        if (!focusedItemId || !navigateNext) {
            handleReset();
            return;
        }
        const currentIndex = allSteps.findIndex(i => i.id === focusedItemId);
        if (currentIndex !== -1 && currentIndex < allSteps.length - 1) {
            const nextItem = allSteps[currentIndex + 1];
            navigate(`/admission/setup/master/${nextItem.id}`);
        } else {
            handleReset();
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
                    { label: 'Admission Master', href: focusedStep ? '/admission/setup/master' : undefined },
                    ...(focusedStep ? [{ label: focusedStep.title }] : [])
                ]}
                actionButtons={actionButtons}
            />

            <div className="mt-4 w-full max-w-full pb-4" key={focusedItemId || 'overview'}>
                {focusedStep ? (
                    <StepOrchestrator
                        key={focusedStep.id}
                        title={focusedStep.title}
                        subtitle={focusedStep.subtitle}
                        icon={focusedStep.icon}
                        currentStep={allSteps.findIndex(i => i.id === focusedItemId) + 1}
                        totalSteps={allSteps.length}
                        onBack={handleReset}
                    >
                        {componentMap[focusedStep.id]?.(handleSuccess)}
                    </StepOrchestrator>
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
                                            onAction={() => navigate(`/admission/setup/master/${step.id}`)}
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
