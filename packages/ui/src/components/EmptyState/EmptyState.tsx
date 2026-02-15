interface EmptyStateProps {
    message?: string;
}

export const EmptyState = ({ message = 'No Records Found' }: EmptyStateProps) => {
    return (
        <div className="flex items-center justify-center p-10 bg-[var(--color-muted)] rounded-lg border border-dashed border-[var(--color-border)]">
            <span className="text-[var(--color-muted-foreground)] text-lg font-medium">{message}</span>
        </div>
    );
};
