export const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString();
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

export * from './reports';

