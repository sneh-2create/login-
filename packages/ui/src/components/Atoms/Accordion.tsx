import React, { useState } from 'react';
import { AccordionProps } from '@od-erp/types';
import { cn } from '../../utils';
import { ChevronDown } from 'lucide-react';

export const Accordion: React.FC<AccordionProps> = ({
    items,
    allowMultiple = false,
    defaultExpandedIds = [],
    onToggle,
    className,
    itemClassName,
    headerClassName,
    contentClassName,
}) => {
    const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

    const handleToggle = (id: string) => {
        const isExpanding = !expandedIds.includes(id);
        let newIds: string[];

        if (allowMultiple) {
            newIds = isExpanding
                ? [...expandedIds, id]
                : expandedIds.filter((item) => item !== id);
        } else {
            newIds = isExpanding ? [id] : [];
        }

        setExpandedIds(newIds);
        if (onToggle) {
            onToggle(id, isExpanding);
        }
    };

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {items.map((item) => {
                const isExpanded = expandedIds.includes(item.id);
                return (
                    <div
                        key={item.id}
                        className={cn(
                            'border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] overflow-hidden transition-all duration-200',
                            isExpanded ? 'shadow-md ring-1 ring-primary/20 border-primary/30' : 'hover:border-primary/20',
                            item.disabled && 'opacity-60 cursor-not-allowed',
                            itemClassName
                        )}
                    >
                        <button
                            type="button"
                            disabled={item.disabled}
                            onClick={() => handleToggle(item.id)}
                            className={cn(
                                'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                                !item.disabled && 'cursor-pointer hover:bg-primary/5',
                                headerClassName,
                                item.headerClassName
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon && (
                                    <div className={cn(
                                        "p-2 rounded-lg bg-primary/10 text-primary transition-transform duration-200",
                                        isExpanded && "scale-110"
                                    )}>
                                        {item.icon}
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm font-semibold text-[var(--color-foreground)]">
                                        {item.title}
                                    </div>
                                    {item.subtitle && (
                                        <p className="text-xs text-[var(--color-muted-foreground)]">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* {item.status && (
                                    typeof item.status === 'string' && ['COMPLETED', 'IN_PROGRESS', 'PENDING'].includes(item.status) ? (
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                            item.status === 'COMPLETED' && "bg-emerald-50 text-emerald-600 border-emerald-200",
                                            item.status === 'IN_PROGRESS' && "bg-blue-50 text-blue-600 border-blue-200",
                                            item.status === 'PENDING' && "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)]"
                                        )}>
                                            {item.status}
                                        </span>
                                    ) : (
                                        item.status
                                    )
                                )} */}
                                <ChevronDown
                                    size={18}
                                    className={cn(
                                        'text-[var(--color-muted-foreground)] transition-transform duration-300',
                                        isExpanded && 'rotate-180 text-primary'
                                    )}
                                />
                            </div>
                        </button>
                        <div
                            className={cn(
                                'transition-all duration-300 ease-in-out',
                                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                            )}
                        >
                            <div className={cn('px-4 pb-4 pt-1', contentClassName)}>
                                {item.content}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
