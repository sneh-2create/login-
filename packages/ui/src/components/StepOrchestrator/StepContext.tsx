import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import { StepOrchestratorContextProps } from '@od-erp/types';

const StepContext = createContext<StepOrchestratorContextProps | undefined>(undefined);

export const StepProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [headerActions, setActions] = useState<ReactNode>(null);
    const [footerLeftActions, setFooterLeft] = useState<ReactNode>(null);
    const [isLoading, setIsLoading] = useState(false);
    const saveHandlerRef = useRef<((_options?: { navigateNext?: boolean }) => Promise<void> | void) | null>(null);

    const registerSaveHandler = useCallback((handler: (_options?: { navigateNext?: boolean }) => Promise<void> | void) => {
        saveHandlerRef.current = handler;
    }, []);

    const setHeaderActions = useCallback((actions: ReactNode) => {
        setActions(actions);
    }, []);

    const setFooterLeftActions = useCallback((actions: ReactNode) => {
        setFooterLeft(actions);
    }, []);

    const handleSave = useCallback(async (options?: { navigateNext?: boolean }) => {
        if (saveHandlerRef.current) {
            await saveHandlerRef.current(options);
        }
    }, []);

    const value: StepOrchestratorContextProps = {
        registerSaveHandler,
        setHeaderActions,
        setFooterLeftActions,
        setIsLoading,
        handleSave,
        _headerActions: headerActions,
        _footerLeftActions: footerLeftActions,
        _isLoading: isLoading,
    };

    return (
        <StepContext.Provider value={value}>
            {children}
        </StepContext.Provider>
    );
};

export const useStepOrchestrator = () => {
    const context = useContext(StepContext);
    if (!context) {
        throw new Error('useStepOrchestrator must be used within a StepProvider');
    }
    return context;
};

// Internal-only hook for the Orchestrator layout to access private state
export const useStepInternal = () => {
    const context = useContext(StepContext);
    if (!context) return null;
    return {
        headerActions: context._headerActions,
        footerLeftActions: context._footerLeftActions,
        isLoading: context._isLoading,
        handleSave: context.handleSave
    };
};
