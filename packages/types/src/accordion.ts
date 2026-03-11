import { ReactNode } from 'react';

export interface AccordionItem {
    id: string;
    title: ReactNode;
    subtitle?: string;
    icon?: ReactNode;
    content?: ReactNode;
    status?: ReactNode | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    disabled?: boolean;
    headerClassName?: string;
}

export interface AccordionProps {
    items: AccordionItem[];
    allowMultiple?: boolean;
    defaultExpandedIds?: string[];
    onToggle?: (_id: string, _isOpen: boolean) => void;
    className?: string;
    itemClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
}
