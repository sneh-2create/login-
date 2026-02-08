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


export const calculateTotalExperience = (joiningDate: string, preExperience: string): string => {
    if (!joiningDate) return preExperience || '-';

    const start = new Date(joiningDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    if (months === 0 && now.getDate() < start.getDate()) {
        years--;
        months = 11;
    }

    return `${years} Years ${months} Months`;
};
