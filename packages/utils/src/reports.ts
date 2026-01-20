
export const calculateReportTotals = (data: any[], keysToSum: string[], additionalKeysToSum: string[] = []) => {
    if (!data || data.length === 0) return [];

    // keysToSum are dynamic tags
    // additionalKeysToSum are fixed columns like totalLeadCount, totalApplicationCount

    const totalRow: any = {
        source: 'Total'
    };
    // Safe defaults 
    totalRow.course = 'Total';
    totalRow.counselorName = 'Total';
    totalRow.name = 'Total';

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

export const transformToTableData = (data: any[]): any[] => {
    if (!data) return [];
    return data.map((item, index) => ({
        position: index + 1,
        ...item
    }));
};

export const processTableData = (data: any[], keysToSum: string[] = []): any[] => {
    return calculateReportTotals(data, keysToSum, ['totalLeadCount', 'totalApplicationCount', 'totalCount', 'seats', 'availableSeats', 'filledSeats', 'pendingApplications']);
};

export const processVacantSeatsReportData = (data: any[]): any[] => {
    if (!data) return [];
    return data.map((item, index) => ({
        position: index + 1,
        ...item
    }));
};

export const transformVacantSeatsForExport = (data: any[], displayNames: any, showBatch: boolean): any[] => {
    if (!data) return [];
    return data.map(item => {
        const row: any = {
            'S.No': item.position,
            [displayNames.course]: item.course,
            [displayNames.stream]: item.stream,
        };
        if (showBatch) {
            row[displayNames.batch] = item.batch || '-';
        }
        row['Name'] = item.name;
        row['Seats'] = item.seats;
        row['Available'] = item.availableSeats;
        row['Filled'] = item.filledSeats;
        row['Pending'] = item.pendingApplications;
        return row;
    });
};

// Admission Summary Report
export const processAdmissionSummaryData = (data: any[]): { processedRows: any[], dynamicColumns: string[] } => {
    if (!data || !Array.isArray(data)) return { processedRows: [], dynamicColumns: [] };

    // Identify dynamic columns (keys that are not fixed)
    const fixedKeys = ['course', 'stream', 'total', 'totalOpen', 'position'];
    const dynamicColumns = new Set<string>();

    data.forEach(row => {
        Object.keys(row).forEach(key => {
            if (!fixedKeys.includes(key) && typeof row[key] === 'number') {
                dynamicColumns.add(key);
            }
        });
    });

    const dynCols = Array.from(dynamicColumns);
    const processedRows = calculateReportTotals(data, dynCols, ['total', 'totalOpen']);

    return { processedRows, dynamicColumns: dynCols };
};

export const transformAdmissionSummaryForExport = (data: any[], columns: any[]): any[] => {
    if (!data) return [];
    return data.map(item => {
        const row: any = {};
        columns.forEach(col => {
            row[col.header as string] = item[col.accessorKey as string];
        });
        return row;
    });
};

// Course Wise Tag Report
export const processCourseWiseTagData = (data: any[], tags: string[]): any[] => {
    if (!data) return [];
    return calculateReportTotals(data, tags, ['total']);
};

export const transformCourseWiseTagForExport = (data: any[], tags: string[]): any[] => {
    if (!data) return [];
    return data.map(item => {
        const row: any = {
            'S.No': item.position,
            'Course': item.course,
            'Stream': item.stream || '-',
            'Total': item.total
        };
        tags.forEach(tag => {
            row[tag] = item[tag] || 0;
        });
        return row;
    });
};

// Counselor Productivity Report
export const processCounselorProductivityReportData = (data: any[], _stageType: string): { processedRows: any[], dynamicColumns: string[] } => {
    if (!data || !Array.isArray(data)) return { processedRows: [], dynamicColumns: [] };

    const dynamicColumns = new Set<string>();
    data.forEach(row => {
        if (row.tags && Array.isArray(row.tags)) {
            row.tags.forEach((t: any) => dynamicColumns.add(t.tag));
        }
    });

    const dynCols = Array.from(dynamicColumns);

    // Flatten tags for calculation
    const flattenedData = data.map(row => {
        const newRow = { ...row };
        if (row.tags) {
            row.tags.forEach((t: any) => {
                newRow[`tag_${t.tag}`] = t.count;
            });
        }
        return newRow;
    });

    const keysToSum = dynCols.map(tag => `tag_${tag}`);
    const fixedSumKeys = ['totalCount', 'engagedCount', 'untouchedCount', 'completeFollowUp', 'overDueFollowUp'];

    const processedRows = calculateReportTotals(flattenedData, keysToSum, fixedSumKeys);

    const totalRow = processedRows[processedRows.length - 1];
    if (totalRow && totalRow.position === 0) {
        totalRow.tags = dynCols.map(tag => ({
            tag: tag,
            count: totalRow[`tag_${tag}`] || 0
        }));
    }

    return { processedRows, dynamicColumns: dynCols };
};

export const transformCounselorProductivityReportForExport = (data: any[], dynamicColumns: string[], stageType: string): any[] => {
    if (!data) return [];
    return data.map(item => {
        const row: any = {
            'S.No': item.position,
            'Counselor Name': item.counselorName,
            [stageType === 'lead' ? 'Total Leads' : 'Application Count']: item.totalCount,
            'Engaged Leads': item.engagedCount,
            'Untouched Leads': item.untouchedCount,
            "Today's Follow Up Done": item.completeFollowUp,
            'Pending Follow Ups': item.overDueFollowUp
        };
        dynamicColumns.forEach(tag => {
            if (tag === '0') return;
            const tagObj = item.tags?.find((t: any) => t.tag === tag);
            row[tag] = tagObj ? tagObj.count : 0;
        });
        return row;
    });
};

// Counselor Tag Report
export const processCounselorTagData = (data: any[], tags: string[]): any[] => {
    if (!data) return [];
    return calculateReportTotals(data, tags, ['totalCount']);
};

export const transformCounselorTagForExport = (data: any[], tags: string[]): any[] => {
    if (!data) return [];
    return data.map(item => {
        const row: any = {
            'S.No': item.position,
            'Counselor Name': item.counselorName,
            'Total Count': item.totalCount
        };
        tags.forEach(tag => {
            row[tag] = item[tag] || 0;
        });
        return row;
    });
};

// NEP Subject Report
export const processNepSubjectReportData = (data: any[]): any[] => {
    if (!data) return [];
    return calculateReportTotals(data, [], ['seats', 'availableSeats', 'filledSeats', 'pendingApplications']);
};

export const transformNepSubjectReportForExport = (data: any[]): any[] => {
    if (!data) return [];
    return data.map(item => ({
        'S.No': item.position,
        'Subject Name': item.name,
        'Subject Code': item.code || '-',
        'Seats': item.seats,
        'Available Seats': item.availableSeats,
        'Filled Seats': item.filledSeats,
        'Pending Applications': item.pendingApplications
    }));
};
