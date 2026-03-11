import { ReactNode, ElementType } from 'react';
import { Tab } from './tabs';

export interface ActionButton {
    icon: ElementType;
    onClick: () => void;
    title: string;
    isVisible?: boolean;
    className?: string;
    iconClass?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

export interface PageToolbarProps {
    tabs?: Tab[];
    activeTab?: string;
    onTabChange?: (_value: string) => void;
    secondaryTabs?: Tab[];
    secondaryActiveTab?: string;
    onSecondaryTabChange?: (_value: string) => void;
    actions?: ActionButton[];
    className?: string;
    extraContent?: ReactNode;
    /** Width threshold (px) below which actions move to their own row. Default: 1024 */
    actionsBreakpoint?: number;
}
