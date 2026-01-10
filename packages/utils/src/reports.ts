
export const calculateReportTotals = (data: any[], keysToSum: string[], additionalKeysToSum: string[] = []) => {
    if (!data || data.length === 0) return [];

    // keysToSum are dynamic tags
    // additionalKeysToSum are fixed columns like totalLeadCount, totalApplicationCount

    const totalRow: any = {
        source: 'Total'
    };

    // Initialize totals
    keysToSum.forEach(key => totalRow[key] = 0);
    additionalKeysToSum.forEach(key => totalRow[key] = 0);

    const processedData = data.map((item, index) => {
        // Add to totals
        keysToSum.forEach(key => {
            const val = item[key] ? Number(item[key]) : 0;
            totalRow[key] += val;
        });

        additionalKeysToSum.forEach(key => {
            const val = item[key] ? Number(item[key]) : 0;
            totalRow[key] += val;
        });

        return {
            position: index + 1,
            ...item
        };
    });

    processedData.push({
        position: 0, // Identifies total row
        ...totalRow
    });

    return processedData;
};
