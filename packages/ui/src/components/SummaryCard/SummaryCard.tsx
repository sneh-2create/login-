import React from 'react';
import { Card } from '../Atoms/Card';
import { Title } from '../Atoms/Title';
import { Loader2, LucideIcon } from 'lucide-react';

export interface SummaryCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
    isLoading?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    icon: Icon,
    color,
    isLoading
}) => {
    return (
        <Card className="flex items-center p-6 transition-transform hover:scale-105">
            <div className={`p-4 rounded-full mr-4 ${color.replace('text-', 'bg-').replace('600', '100')}`}>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div>
                <Title as="p" variant="subtitle">{title}</Title>
                {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-muted-foreground)] mt-1" />
                ) : (
                    <Title as="h3" variant="cardTitle" className="text-2xl font-bold text-[var(--color-foreground)] mt-1">
                        {value}
                    </Title>
                )}
            </div>
        </Card>
    );
};
