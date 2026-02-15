interface EmptyStateProps {
    message?: string;
}

export const EmptyState = ({ message = 'No Records Found' }: EmptyStateProps) => {
    return (
        <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <span className="text-gray-400 text-lg font-medium">{message}</span>
        </div>
    );
};
