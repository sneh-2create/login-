import React from 'react';
import { Card } from '../Atoms/Card';
import { Title } from '../Atoms/Title';

export interface DashboardSectionProps {
    title: string;
    children: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
    title,
    children,
    rightElement
}) => {
    return (
        <Card className="flex flex-col h-full shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-muted)] rounded-t-lg">
                <Title as="h3" variant="sectionTitle" className="text-lg font-bold text-[var(--color-foreground)] m-0">
                    {title}
                </Title>
                {rightElement && (
                    <div className="flex items-center gap-2">
                        {rightElement}
                    </div>
                )}
            </div>
            <div className="p-0">
                {children}
            </div>
        </Card>
    );
};
