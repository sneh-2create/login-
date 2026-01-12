
import { AdmissionSummaryTableRow, CounselorTagReportTableRow, VacantSeatsReportTableRow, CourseWiseTagReportTableRow, NepSubjectReportTableRow, CounselorProductivityReportTableRow } from '@od-erp/types';

// Admission Summary Report Utils

export const processAdmissionSummaryData = (rawData: any[]) => {
    if (!rawData || rawData.length === 0) {
        return { processedRows: [], dynamicColumns: [] };
    }

    let processedRows: AdmissionSummaryTableRow[] = [];
    let dynamicColumns: Set<string> = new Set();
    let totalStats: any = { course: 'Total', total: 0, totalOpen: 0 };

    rawData.forEach((row: any, index: number) => {
        let newRow: any = {
            position: index + 1,
            course: row.course,
            stream: row.stream,
            total: row.total,
            totalOpen: row.totalOpen,
            ...row
        };

        if (Array.isArray(row.data)) {
            row.data.forEach((item: any) => {
                let colName = item.name;
                if (typeof colName === 'boolean') colName = String(colName);

                newRow[colName] = item.value;
                dynamicColumns.add(colName);
                totalStats[colName] = (totalStats[colName] || 0) + (item.value || 0);
            });
        }

        totalStats.total += row.total;
        totalStats.totalOpen += row.totalOpen;
        processedRows.push(newRow);
    });

    processedRows.push(totalStats);

    const specialCols = ["Approved", "Rejected", "Withdrawn"];
    const validDynamicCols = Array.from(dynamicColumns).filter(col => !specialCols.includes(col));
    const validSpecialCols = specialCols.filter(col => dynamicColumns.has(col));

    return {
        processedRows,
        dynamicColumns: [...validDynamicCols, ...validSpecialCols]
    };
};

export const transformAdmissionSummaryForExport = (data: AdmissionSummaryTableRow[], columns: any[]) => {
    return data.map(row => {
        const rowData: any = {};
        columns.forEach((col: any) => {
            if (col.accessorKey) {
                rowData[col.header as string] = row[col.accessorKey];
            }
        });
        return rowData;
    });
};

// Counselor Tag Report Utils

export const processCounselorTagData = (res: any[], tags: string[]) => {
    if (!res || res.length === 0) return [];

    const totalRow: any = {
        position: 0,
        counselorName: 'Total',
        totalCount: 0
    };

    tags.forEach(tag => totalRow[tag] = 0);

    const processedData = res.map((item: any, index: number) => {
        tags.forEach(tag => {
            const val = item[tag] ? Number(item[tag]) : 0;
            totalRow[tag] += val;
        });

        totalRow.totalCount += (item.totalCount || 0);

        return {
            position: index + 1,
            ...item
        };
    });

    processedData.push(totalRow);
    return processedData;
};

export const transformCounselorTagForExport = (data: CounselorTagReportTableRow[], tags: string[]) => {
    return data.map(row => {
        const newRow: any = {
            'S.No': row.position === 0 ? '' : row.position,
            'Counselor Name': row.counselorName,
            'Total Count': row.totalCount
        };
        tags.forEach(tag => {
            newRow[tag] = row[tag] || 0;
        });
        return newRow;
    });
};

// Vacant Seats Report Utils

export const processVacantSeatsReportData = (resultData: any[]) => {
    if (!resultData || resultData.length === 0) return [];

    const totalRow: VacantSeatsReportTableRow = {
        position: 0,
        course: 'Total',
        stream: '',
        batch: '',
        name: '',
        seats: 0,
        availableSeats: 0,
        filledSeats: 0,
        pendingApplications: 0
    };

    const processedData = resultData.map((item: any, index: number) => {
        totalRow.seats += (item.seats || 0);
        totalRow.availableSeats += (item.availableSeats || 0);
        totalRow.filledSeats += (item.filledSeats || 0);
        totalRow.pendingApplications += (item.pendingApplications || 0);

        return {
            position: index + 1,
            ...item
        };
    });

    processedData.push(totalRow);
    return processedData;
};

export const transformVacantSeatsForExport = (data: VacantSeatsReportTableRow[], displayNames: any, showBatch: boolean) => {
    return data.map(row => {
        const newRow: any = {
            'S.No': row.position || '',
            [displayNames.course]: row.course,
            [displayNames.stream]: row.stream,
        };
        if (showBatch) {
            newRow[displayNames.batch] = row.batch;
        }
        newRow['Name'] = row.name;
        newRow['Seats'] = row.seats;
        newRow['Available Seats'] = row.availableSeats;
        newRow['Filled Seats'] = row.filledSeats;
        newRow['Pending Applications'] = row.pendingApplications;
        return newRow;
    });
};

// Course Wise Tag Report Utils

export const processCourseWiseTagData = (res: any[], tags: string[]) => {
    if (!res || res.length === 0) return [];

    const totalRow: any = {
        position: 0,
        course: 'Total',
        stream: '',
        total: 0
    };

    tags.forEach(tag => totalRow[tag] = 0);

    const processedData = res.map((item: any, index: number) => {
        tags.forEach(tag => {
            const val = item[tag] ? Number(item[tag]) : 0;
            totalRow[tag] += val;
        });

        const itemTotal = item.total ? Number(item.total) : 0;
        totalRow.total += itemTotal;

        return {
            position: index + 1,
            ...item
        };
    });

    processedData.push(totalRow);
    return processedData;
};

export const transformCourseWiseTagForExport = (data: CourseWiseTagReportTableRow[], tags: string[]) => {
    return data.map(row => {
        const newRow: any = {
            'S.No': row.position === 0 ? '' : row.position,
            'Course': row.course,
            'Stream': row.stream,
            'Total': row.total
        };
        tags.forEach(tag => {
            newRow[tag] = row[tag] || 0;
        });
        return newRow;
    });
};

// Nep Subject Report Utils

export const processNepSubjectReportData = (resultData: any) => {
    // Handle case where resultData is wrapped in an object (e.g. { data: [...] })
    let dataToProcess = Array.isArray(resultData) ? resultData : (Array.isArray(resultData?.data) ? resultData.data : []);

    if (!dataToProcess || dataToProcess.length === 0) return [];

    const totalRow: NepSubjectReportTableRow = {
        position: 0,
        name: 'Total',
        seats: 0,
        availableSeats: 0,
        filledSeats: 0,
        pendingApplications: 0
    };

    const processedData = dataToProcess.map((item: any, index: number) => {
        totalRow.seats += (item.seats || 0);
        totalRow.availableSeats += (item.availableSeats || 0);
        totalRow.filledSeats += (item.filledSeats || 0);
        totalRow.pendingApplications += (item.pendingApplications || 0);

        return {
            position: index + 1,
            ...item
        };
    });

    processedData.push(totalRow);
    return processedData;
};

export const transformNepSubjectReportForExport = (data: NepSubjectReportTableRow[]) => {
    return data.map(row => {
        return {
            'S.No': row.position || '',
            'Name': row.name,
            'Code': row.code || '',
            'Seats': row.seats,
            'Available Seats': row.availableSeats,
            'Filled Seats': row.filledSeats,
            'Pending Applications': row.pendingApplications
        };
    });
};

// Counselor Productivity Report Utils

// Counselor Productivity Report Utils

export const processCounselorProductivityReportData = (resultData: any, stageType: 'lead' | 'application') => {
    let dataToProcess = Array.isArray(resultData) ? resultData : (Array.isArray(resultData?.data) ? resultData.data : []);

    if (!dataToProcess) dataToProcess = [];

    const dynamicColumns = new Set<string>();

    // Add default columns based on stageType
    if (stageType === 'lead') {
        dynamicColumns.add('INTERESTED');
        dynamicColumns.add('ADMISSION TAKEN SOMEWHERE ELSE');
    } else {
        dynamicColumns.add('INTERESTED');
        dynamicColumns.add('ADMISSION TAKEN SOMEWHERE ELSE');
        dynamicColumns.add('Duplicate');
        dynamicColumns.add('No Tag');
    }

    const totalRow: CounselorProductivityReportTableRow = {
        position: 0,
        counselorName: 'Total',
        totalCount: 0,
        engagedCount: 0,
        untouchedCount: 0,
        completeFollowUp: 0,
        overDueFollowUp: 0,
        tags: []
    };

    if (dataToProcess.length === 0) {
        return {
            processedRows: [totalRow],
            dynamicColumns: Array.from(dynamicColumns)
        };
    }

    const processedData = dataToProcess.map((item: any, index: number) => {
        const itemTags = item.tags || [];

        // Aggregate totals
        totalRow.totalCount += (item.totalCount || 0);
        totalRow.engagedCount += (item.engagedCount || 0);
        totalRow.untouchedCount += (item.untouchedCount || 0);
        totalRow.completeFollowUp += (item.completeFollowUp || 0);
        totalRow.overDueFollowUp += (item.overDueFollowUp || 0);

        // Process tags
        itemTags.forEach((tagItem: any) => {
            if (tagItem.tag) {
                dynamicColumns.add(tagItem.tag);

                // Add to total row tags
                const existingTagIndex = totalRow.tags.findIndex(t => t.tag === tagItem.tag);
                if (existingTagIndex !== -1) {
                    totalRow.tags[existingTagIndex].count += (tagItem.count || 0);
                } else {
                    totalRow.tags.push({ tag: tagItem.tag, count: tagItem.count || 0 });
                }
            }
        });

        return {
            position: index + 1,
            ...item
        };
    });

    processedData.push(totalRow);

    return {
        processedRows: processedData,
        dynamicColumns: Array.from(dynamicColumns)
    };
};

export const transformCounselorProductivityReportForExport = (data: CounselorProductivityReportTableRow[], dynamicColumns: string[], stageType: string) => {
    return data.map(row => {
        const rowData: any = {
            'S.No': row.position === 0 ? '' : row.position,
            'Counselor Name': row.counselorName,
            [stageType === 'lead' ? 'Total Leads' : 'Application Count']: row.totalCount,
            'Engaged Leads': row.engagedCount,
            'Untouched Leads': row.untouchedCount,
            "Today's Follow Up Done": row.completeFollowUp,
            'Pending Follow Ups': row.overDueFollowUp
        };

        dynamicColumns.forEach(col => {
            const tagObj = row.tags?.find(t => t.tag === col);
            rowData[col] = tagObj ? tagObj.count : 0;
        });

        return rowData;
    });
};
