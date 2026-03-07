import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@od-erp/store';
import { PageHeader, Accordion, ActionButton, cn } from '@od-erp/ui';
import {
    Hash,
    Layers,
    Receipt,
    CreditCard,
    MapPin,
    Armchair,
    UserCheck,
    Copy,
    Settings,
    Users,
    CalendarDays,
    ChevronLeft,
    RefreshCw,
    Tag,
} from 'lucide-react';

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
    const [searchParams, setSearchParams] = useSearchParams();

    const focusedPhaseId = searchParams.get('phase');
    const focusedItemId = searchParams.get('step');

    const updateParams = (phaseId: string | null, itemId: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (phaseId) newParams.set('phase', phaseId);
        else newParams.delete('phase');

        if (itemId) newParams.set('step', itemId);
        else newParams.delete('step');

        setSearchParams(newParams);
    };

    const masterConfigs = useMemo(() => [
        {
            id: 'P1',
            title: 'Admission Master',
            subtitle: 'Application numbers, stages, receipts, and basic masters',
            items: [
                {
                    id: 'applicationNumber',
                    title: 'Application Number Setup',
                    description: 'Define application number formats for different courses',
                    icon: <Hash size={18} />,
                    permission: 'viewAdmissionMaster',
                    status: 'IN_PROGRESS' as const,
                    component: (onSuccess: () => void) => <ApplicationNumber isEmbedded onSuccess={onSuccess} />,
                },
                {
                    id: 'stages',
                    title: 'Stages Master Setup',
                    description: 'Define the stages an application goes through',
                    icon: <Layers size={18} />,
                    permission: 'viewAdmissionMaster',
                    status: 'PENDING' as const,
                    component: (onSuccess: () => void) => <StagesMaster isEmbedded onSuccess={onSuccess} />,
                },
                {
                    id: 'txnReceipt',
                    title: 'Transaction Receipt Setup',
                    description: 'Configure receipt templates and formats',
                    icon: <Receipt size={18} />,
                    permission: 'viewAdmissionMaster',
                    status: 'PENDING' as const,
                    component: (onSuccess: () => void) => <TxnReceipt isEmbedded onSuccess={onSuccess} />,
                },
                {
                    id: 'admissionHead',
                    title: 'Admission Heads',
                    description: 'Manage admission heads and their contact details',
                    icon: <CreditCard size={18} />,
                    permission: 'viewAdmissionMaster',
                    status: 'PENDING' as const,
                    component: (onSuccess: () => void) => <AdmissionHead isEmbedded onSuccess={onSuccess} />,
                },
                {
                    id: 'source',
                    title: 'Admission Source Master Setup',
                    description: 'Configure sources like Direct, Agency, Walk-in',
                    icon: <MapPin size={18} />,
                    permission: 'viewAdmissionMaster',
                    status: 'PENDING' as const,
                    component: (onSuccess: () => void) => <AdmissionSource isEmbedded onSuccess={onSuccess} />,
                },
                {
                    id: 'duplicateFields',
                    title: 'Duplicate Fields Master',
                    description: 'Set rules to identify and handle duplicate applications',
                    icon: <Copy size={18} />,
                    permission: 'viewAdmissionMaster',
                    status: 'PENDING' as const,
                    component: (onSuccess: () => void) => <DuplicateFields isEmbedded onSuccess={onSuccess} />,
                },
            ]
        },
        {
            id: 'P2',
            title: 'Tags Configuration',
            subtitle: 'Admission Tags Master Setup',
            items: [
                {
                    id: 'tags',
                    title: 'Admission Tags',
                    description: 'Manage tags to categorize and track admission leads and students.',
                    icon: <Tag size={18} />,
                    permission: 'viewAdmissionMaster',
                    component: (onSuccess: () => void) => <AdmissionTags isEmbedded onSuccess={onSuccess} />,
                },
            ]
        },
        {
            id: 'P3',
            title: 'Seats Configuration',
            subtitle: 'Admission Seats Master Setup',
            items: [
                {
                    id: 'seats',
                    title: 'Admission Seats',
                    description: 'Configure available seat capacity per course, stream, and batch.',
                    icon: <Armchair size={18} />,
                    permission: 'viewAdmissionMaster',
                    component: (onSuccess: () => void) => <AdmissionSeats isEmbedded onSuccess={onSuccess} />,
                },
            ]
        },
        {
            id: 'P4',
            title: 'Counselor Mapping',
            subtitle: 'Counselor Mapper',
            items: [
                {
                    id: 'counselorMapper',
                    title: 'Counselor Mapper',
                    description: 'Map counselors to specific courses, streams, or student groups.',
                    icon: <UserCheck size={18} />,
                    permission: 'viewAdmissionMaster',
                    component: (onSuccess: () => void) => <CounselorMapper isEmbedded onSuccess={onSuccess} />,
                },
            ]
        },
        {
            id: 'P5',
            title: 'Operator Configuration',
            subtitle: 'My Operator Config',
            items: [
                {
                    id: 'myOperatorConfig',
                    title: 'My Operator Config',
                    description: 'Configure My Operator integration settings for communication.',
                    icon: <Settings size={18} />,
                    permission: 'viewAdmissionMaster',
                    component: (onSuccess: () => void) => <MyOperatorConfig isEmbedded onSuccess={onSuccess} />,
                },
            ]
        },
        {
            id: 'P6',
            title: 'Teams & Staffing',
            subtitle: 'Admission Teams Master',
            items: [
                {
                    id: 'admissionTeams',
                    title: 'Admission Teams',
                    description: 'Organize counselors and staff into admission teams.',
                    icon: <Users size={18} />,
                    permission: 'viewAdmissionMaster',
                    component: (onSuccess: () => void) => <AdmissionTeams isEmbedded onSuccess={onSuccess} />,
                },
            ]
        },
        {
            id: 'P7',
            title: 'Validation & Age Controls',
            subtitle: 'Minimum Age Master Setup',
            items: [
                {
                    id: 'minimumAgeMaster',
                    title: 'Minimum Age Master',
                    description: 'Set minimum age requirements per course/stream for admissions.',
                    icon: <CalendarDays size={18} />,
                    permission: 'updateCourseValidityChecks',
                    component: (onSuccess: () => void) => <MinimumAgeMaster isEmbedded onSuccess={onSuccess} />,
                },
            ]
        }
    ], []);

    // Flatten items for navigation logic
    const allItems = useMemo(() => masterConfigs.flatMap(p => p.items.map(i => ({ ...i, phaseId: p.id }))), [masterConfigs]);

    const handleReset = () => {
        updateParams(null, null);
    };

    const handleSuccess = () => {
        if (!focusedItemId) return;
        const currentIndex = allItems.findIndex(i => i.id === focusedItemId);
        if (currentIndex < allItems.length - 1) {
            const nextItem = allItems[currentIndex + 1];
            updateParams(nextItem.phaseId, nextItem.id);
        } else {
            // End of flow
            updateParams(null, null);
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

            <div className="mt-5 max-w-full">
                {focusedItemId ? (
                    /* Detail View / Focus Mode */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-3 flex items-center justify-between px-1">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-all group"
                            >
                                <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <ChevronLeft size={16} />
                                </div>
                                Back to Setup List
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest bg-[var(--color-muted)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                                    Phase {focusedPhaseId} • Step {allItems.findIndex(i => i.id === focusedItemId) + 1} of {allItems.length}
                                </div>
                            </div>
                        </div>

                        {allItems.find(i => i.id === focusedItemId) && (
                            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                                <div className="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                            {allItems.find(i => i.id === focusedItemId)?.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-[var(--color-foreground)]">
                                                {allItems.find(i => i.id === focusedItemId)?.title}
                                            </h2>
                                            <p className="text-sm text-[var(--color-muted-foreground)]">
                                                {allItems.find(i => i.id === focusedItemId)?.description}
                                            </p>
                                        </div>
                                    </div>
                                    {(allItems.find(i => i.id === focusedItemId) as any)?.status && (
                                        <div className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            (allItems.find(i => i.id === focusedItemId) as any)?.status === 'COMPLETE' 
                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                            : 'bg-blue-100 text-blue-700 border border-blue-200 share-in-progress-colors'
                                        }`}>
                                            {(allItems.find(i => i.id === focusedItemId) as any)?.status?.replace('_', ' ')}
                                        </div>
                                    )}
                                </div>
                                <div className="px-3 py-2">
                                    {allItems.find(i => i.id === focusedItemId)?.component(handleSuccess)}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Main Phase List View - Timeline Design */
                    <div className="relative ml-10 pl-10 border-l border-primary/20 flex flex-col gap-8 py-4">
                        {masterConfigs.map((phase, idx) => {
                            const visibleItems = phase.items.filter(item => permissions.includes(item.permission));
                            if (visibleItems.length === 0) return null;

                            const isExpanded = focusedPhaseId === phase.id;

                            return (
                                <div key={phase.id} className="relative">
                                    {/* Vertical Timeline Marker (P1, P2, etc.) */}
                                    <div 
                                        className={`absolute -left-[61px] top-2 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md border-4 border-[var(--color-background)] z-10 transition-colors ${
                                            isExpanded ? 'bg-primary text-white' : 'bg-white text-primary/60'
                                        }`}
                                    >
                                        {phase.id}
                                    </div>

                                    {visibleItems.length === 1 ? (
                                        /* Single Item Phase - Direct Button */
                                        <button
                                            onClick={() => {
                                                updateParams(phase.id, visibleItems[0].id);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between py-2 px-3 rounded-lg shadow-sm border border-[var(--color-border)] transition-all text-left",
                                                isExpanded ? "bg-primary/5 border-primary ring-1 ring-primary/20" : "bg-[var(--color-card)] hover:border-primary/20"
                                            )}
                                        >
                                            <div className="flex flex-col text-left">
                                                <span className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">{phase.title}</span>
                                                <span className="text-xs text-[var(--color-muted-foreground)] font-medium mt-0.5">{phase.subtitle}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <ChevronLeft size={16} className="rotate-180 text-primary/30 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </button>
                                    ) : (
                                        /* Multi-Item Phase - Accordion View */
                                        <Accordion
                                            itemClassName={cn(
                                                "!rounded-lg shadow-sm border-[var(--color-border)] transition-all",
                                                isExpanded && "!border-primary !ring-1 !ring-primary/20"
                                            )}
                                            defaultExpandedIds={focusedPhaseId ? [focusedPhaseId] : (idx === 0 ? ['P1'] : [])}
                                            onToggle={(id, expanded) => {
                                                if (expanded) updateParams(id, null);
                                                else if (focusedPhaseId === id) updateParams(null, null);
                                            }}
                                            items={[{
                                                id: phase.id,
                                                title: (
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">{phase.title}</span>
                                                        <span className="text-xs text-[var(--color-muted-foreground)] font-medium mt-0.5">{phase.subtitle}</span>
                                                    </div>
                                                ),
                                                headerClassName: "py-2 px-3 hover:bg-primary/5",
                                                content: (
                                                    <div className="pb-2 px-2 pt-2 flex flex-col gap-2">
                                                        {visibleItems.map((item: any) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateParams(phase.id, item.id);
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                                                    item.status === 'COMPLETE' 
                                                                    ? 'border-primary/10 bg-primary/5' 
                                                                    : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-primary/30 hover:shadow-md'
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-5">
                                                                    <div className={`p-2.5 rounded-xl border transition-colors ${
                                                                        item.status === 'IN_PROGRESS' 
                                                                        ? 'bg-primary/10 text-primary border-primary/20' 
                                                                        : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'
                                                                    }`}>
                                                                        {item.icon}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-[var(--color-foreground)]">{item.title}</h4>
                                                                        <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1 mt-0.5">{item.description}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    {item.status && (
                                                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                                                            item.status === 'COMPLETE' 
                                                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                                                            : item.status === 'IN_PROGRESS'
                                                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                                            : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)]'
                                                                        }`}>
                                                                            {item.status.replace('_', ' ')}
                                                                        </span>
                                                                    )}
                                                                    <ChevronLeft size={16} className="rotate-180 text-primary/30 transition-transform group-hover:translate-x-1" />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )
                                            }]}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionMaster;
