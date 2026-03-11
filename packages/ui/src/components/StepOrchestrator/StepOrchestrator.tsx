import React from 'react';
import { ChevronLeft, Save, RefreshCw } from 'lucide-react';
import { Button } from '../Atoms/Button';
import { StepOrchestratorProps } from '@od-erp/types';
import { StepProvider, useStepInternal } from './StepContext';

const OrchestratorContent: React.FC<StepOrchestratorProps> = ({
    title,
    subtitle,
    icon,
    currentStep,
    totalSteps,
    onBack,
    children
}) => {
    const internal = useStepInternal();

    if (!internal) return <>{children}</>;

    const { headerActions, footerLeftActions, isLoading, handleSave } = internal;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Navigation Bar */}
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline transition-all"
                >
                    <ChevronLeft size={18} /> Back to Overview
                </button>
                <div className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest bg-[var(--color-muted)] px-4 py-1.5 rounded-full border border-[var(--color-border)] shadow-sm">
                    Step {currentStep} of {totalSteps}
                </div>
            </div>

            {/* Main Step Card */}
            <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] shadow-xl overflow-hidden flex flex-col">
                {/* Card Header */}
                <div className="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-muted)]/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-[color-mix(in_srgb,var(--color-primary),transparent_92%)] text-primary border border-primary/10 shadow-sm">
                            {React.isValidElement(icon) ? React.cloneElement(icon as any, { size: 24 }) : icon}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Header Actions Slot */}
                    <div className="flex items-center gap-2">
                        {headerActions}
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-3 py-2 flex-grow overflow-auto bg-[var(--color-background)]/30">
                    {children}
                </div>

                {/* Standardized Footer actions */}
                <div className="px-3 py-2 bg-[var(--color-card)] flex items-center justify-between">
                    <div id="setup-footer-left-actions">
                        {footerLeftActions}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            onClick={() => handleSave({ navigateNext: false })}
                            disabled={isLoading}
                            className="flex items-center gap-2 text-white font-bold rounded-md shadow-sm"
                        >
                            <Save size={16} /> Save
                        </Button>
                        {
                            currentStep !== totalSteps && <Button
                                variant="primary"
                                onClick={() => handleSave({ navigateNext: true })}
                                disabled={isLoading}
                                className="flex items-center gap-2 text-white font-bold rounded-md shadow-sm"
                            >
                                {isLoading && <RefreshCw size={16} className="animate-spin" />}
                                Save & Next
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StepOrchestrator: React.FC<StepOrchestratorProps> = (props) => (
    <StepProvider>
        <OrchestratorContent {...props} />
    </StepProvider>
);
