import React from 'react';
import { Title } from '../Atoms/Title';
import { Breadcrumb } from '../Breadcrumb';
import { DropdownMenu } from '../Atoms/DropdownMenu';
import { MoreVertical } from 'lucide-react';

export interface PageHeaderAction {
    icon: React.ElementType;
    onClick: () => void;
    title: string;
    isVisible?: boolean;
    iconClass?: string;
}

export interface PageHeaderProps {
    title: string;
    breadcrumbs: { label: string; href?: string }[];
    className?: string;
    actionButtons?: PageHeaderAction[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, className, actionButtons }) => {
    const visibleActions = actionButtons?.filter(action => action.isVisible !== false) || [];
    
    return (
        <div className={`md:mb-3 ${className || ''}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <Title as='h1' variant="pageTitleNoMargin">{title}</Title>
                    <div className="hidden md:block">
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                </div>
                
                {visibleActions.length > 0 && (
                    <div className="md:hidden shrink-0">
                        <DropdownMenu
                            trigger={
                                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                                    <MoreVertical className="h-5 w-5 text-gray-600" />
                                </button>
                            }
                            items={visibleActions.map(action => ({
                                key: action.title,
                                label: (
                                    <div className="flex items-center gap-3">
                                        <action.icon className={`h-4 w-4 ${action.iconClass || 'text-primary'}`} />
                                        <span>{action.title}</span>
                                    </div>
                                ),
                                onClick: action.onClick
                            }))}
                            placement="bottom-end"
                            minWidth="10rem"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
