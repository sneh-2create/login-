import { ChevronRight } from 'lucide-react';
import type { SetupCardProps } from '@od-erp/types';

export const SetupCard = ({ card, onClick }: SetupCardProps) => {
    return (
        <div
            className="group bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={onClick}
        >
            {/* Icon box */}
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                    background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    color: 'var(--color-primary)',
                }}
            >
                {card.icon}
            </div>

            {/* Text */}
            <div className="flex flex-1 flex-col gap-1 max-w-md">
                <h3 className="text-base font-bold text-[var(--color-foreground)]">
                    {card.title}
                </h3>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {card.description}
                </p>
            </div>

            {/* Action link */}
            <div
                className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: 'var(--color-primary)' }}
            >
                <span>{card.linkLabel}</span>
                <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </div>
        </div>
    );
};
