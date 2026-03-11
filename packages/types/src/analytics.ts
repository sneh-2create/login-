export interface AnalyticsDashboardFilters {
    entityList: string[];
    preFilledSeats: boolean;
}

export interface AnalyticsDashboardResponse {
    admissionData: {
        totalAdmissions: number;
        totalSeats: number;
    };
    registrationData: {
        totalRegistrations: number;
        totalSeats: number;
    };
    placementData: {
        totalDrives: number;
        totalPlaced: number;
    };
    totalPartnerInstitutes: number;
    totalPartnerCompanies: number;
    totalSeminars: number;
    totalResourcePerson: number;
    totalEvents: number;
}
