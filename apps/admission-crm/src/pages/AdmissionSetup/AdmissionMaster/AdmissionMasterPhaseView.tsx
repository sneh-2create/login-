import React, { useState, ReactNode } from 'react';
import {
    Button,
    StepProvider,
    useStepInternal,
    cn
} from '@od-erp/ui';
import {
    Hash,
    GitMerge,
    Receipt,
    Users,
    Network,
    Copy,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Save
} from 'lucide-react';

// Sub-pages
import ApplicationNumber from './sub-pages/ApplicationNumber';
import StagesMaster from './sub-pages/StagesMaster';
import TxnReceipt from './sub-pages/TxnReceipt';
import AdmissionHead from './sub-pages/AdmissionHead';
import AdmissionSource from './sub-pages/AdmissionSource';
import DuplicateFields from './sub-pages/DuplicateFields';

interface SectionProps {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    Component: React.ComponentType<any>;
    onSuccess: (_navigateNext?: boolean) => void;
    onNext: () => void;
}

const SectionWrapper: React.FC<SectionProps> = ({ Component, onSuccess, onNext }) => {
    return (
        <StepProvider>
            <div className="flex flex-col">
                <Component isEmbedded onSuccess={onSuccess} />
                <SectionFooter onNext={onNext} />
            </div>
        </StepProvider>
    );
};

const SectionFooter = ({ onNext }: { onNext: () => void }) => {
    const internal = useStepInternal();

    if (!internal) return null;

    const { footerLeftActions, handleSave, isLoading } = internal;

    const handleSaveAndNext = async () => {
        await handleSave({ navigateNext: false });
        onNext();
    };

    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
                {footerLeftActions}
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="primary"
                    onClick={() => handleSave({ navigateNext: false })}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-white font-bold rounded-md shadow-sm"
                >
                    <Save size={16} />Save
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSaveAndNext}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-white font-bold rounded-md shadow-sm"
                >
                    Save & Next
                </Button>
            </div>
        </div>
    );
};

const AdmissionMasterPhaseView = ({ onBack }: { onBack: () => void }) => {
    const [expandedIds, setExpandedIds] = useState<string[]>(['applicationNumber']);
    const [isPhaseExpanded, setIsPhaseExpanded] = useState(true);

    const sections = [
        {
            id: 'applicationNumber',
            title: 'Application Number Setup',
            description: 'Define application number formats for different courses',
            icon: <Hash size={18} />,
            Component: ApplicationNumber,
        },
        {
            id: 'stagesMaster',
            title: 'Stages Master Setup',
            description: 'Define the stages an application goes through',
            icon: <GitMerge size={18} />,
            Component: StagesMaster,
        },
        {
            id: 'txnReceipt',
            title: 'Transaction Receipt Setup',
            description: 'Configure receipt templates and formats',
            icon: <Receipt size={18} />,
            Component: TxnReceipt,
        },
        {
            id: 'admissionHeads',
            title: 'Admission Heads',
            description: 'Manage admission heads and their contact details',
            icon: <Users size={18} />,
            Component: AdmissionHead,
        },
        {
            id: 'admissionSource',
            title: 'Admission Source Master Setup',
            description: 'Configure sources like Direct, Agency, Walk-in',
            icon: <Network size={18} />,
            Component: AdmissionSource,
        },
        {
            id: 'duplicateFields',
            title: 'Duplicate Fields Master',
            description: 'Set rules to identify and handle duplicate applications',
            icon: <Copy size={18} />,
            Component: DuplicateFields,
        }
    ];

    const handleNext = (currentId: string) => {
        const currentIndex = sections.findIndex(s => s.id === currentId);
        if (currentIndex !== -1 && currentIndex < sections.length - 1) {
            const nextId = sections[currentIndex + 1].id;
            setExpandedIds([nextId]);

            // Scroll to the next section
            setTimeout(() => {
                const element = document.getElementById(`accordion-item-${nextId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
        } else if (currentIndex === sections.length - 1) {
            // Final step: Redirect back to the overview
            onBack();
        }
    };

    return (
        <div className="flex flex-col w-full max-w-full gap-4">
            {/* Outer Phase Container - Styled as an Accordion Header */}
            <div className="flex flex-col border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden bg-[var(--color-card)]">
                <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setIsPhaseExpanded(!isPhaseExpanded)}
                >
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-[var(--color-foreground)]">Admission Configuration</h1>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Follow the steps below to completely configure your admission portal rules and masters.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest">Steps in this phase</span>
                            <div className="w-24 h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-secondary" />
                            </div>
                        </div> */}
                        <Button
                            variant="soft-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onBack();
                            }}
                            className="flex items-center gap-2 font-bold rounded-lg border border-primary text-primary py-2 h-auto"
                        >
                            <ArrowLeft size={16} /> Back
                        </Button>
                    </div>
                </div>

                {isPhaseExpanded && (
                    <div className="px-3 py-4 border-t border-[var(--color-border)]">
                        <div className="flex flex-col gap-6 relative">
                            {/* Constant Vertical Line */}
                            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-[var(--color-border)] opacity-30 hidden md:block" />

                            {sections.map((section) => {
                                const isExpanded = expandedIds.includes(section.id);
                                return (
                                    <div key={section.id} className="flex gap-4 items-start relative">
                                        {/* Timeline Node */}
                                        <div className="w-12 flex flex-col items-center shrink-0 pt-0.5 z-10">
                                            <button
                                                onClick={() => setExpandedIds([section.id])}
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                                    isExpanded
                                                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20"
                                                        : "bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-primary/50 hover:text-primary"
                                                )}
                                            >
                                                {section.icon}
                                            </button>
                                        </div>

                                        {/* Accordion Card */}
                                        <div
                                            id={`accordion-item-${section.id}`}
                                            className={cn(
                                                "flex-1 rounded-md transition-all duration-200 border-2 overflow-hidden",
                                                isExpanded
                                                    ? "bg-[var(--color-card)] border-primary shadow-xl shadow-primary/5"
                                                    : "bg-[var(--color-card)] border-[var(--color-border)] hover:border-gray-300"
                                            )}
                                        >
                                            <button
                                                className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors"
                                                onClick={() => setExpandedIds(isExpanded ? [] : [section.id])}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={cn("text-base text-[var(--color-foreground)] font-bold")}>
                                                        {section.title}
                                                    </span>
                                                    <span className="text-sm text-[var(--color-muted-foreground)] font-normal">
                                                        {section.description}
                                                    </span>
                                                </div>
                                                {isExpanded ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-gray-400" />}
                                            </button>

                                            {isExpanded && (
                                                <div className="px-3">
                                                    <SectionWrapper
                                                        {...section}
                                                        onSuccess={() => { }}
                                                        onNext={() => handleNext(section.id)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmissionMasterPhaseView;
