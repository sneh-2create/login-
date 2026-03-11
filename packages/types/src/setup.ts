import { ReactNode } from 'react';

export interface StepAction {
    id: string;
    label: ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft-primary' | 'soft-danger';
    icon?: ReactNode;
    disabled?: boolean;
    isVisible?: boolean;
}

export interface StepOrchestratorContextProps {
    registerSaveHandler: (_handler: (_options?: { navigateNext?: boolean }) => Promise<void> | void) => void;
    /** Set custom actions to be rendered in the step header */
    setHeaderActions: (_actions: ReactNode) => void;
    /** Set custom actions to be rendered on the left side of the footer */
    setFooterLeftActions: (_actions: ReactNode) => void;
    /** Set the loading state of the current step */
    setIsLoading: (_loading: boolean) => void;
    /** Trigger the save manually if needed */
    handleSave: (_options?: { navigateNext?: boolean }) => Promise<void>;

    // Internal properties for Orchestrator layout (prefixed with _ to indicate internal use)
    _headerActions?: ReactNode;
    _footerLeftActions?: ReactNode;
    _isLoading?: boolean;
}

export interface StepOrchestratorProps {
    title: string;
    subtitle?: string;
    icon: ReactNode;
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    children: ReactNode;
}
