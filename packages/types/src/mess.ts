export interface MessStats {
    totalRegisteredStudents: number;
    totalRegisteredEmployees: number;
    todaysTotalEntries: number;
    activeFoodTypeCount: number;
}

export interface MealDistribution {
    foodTypeName: string;
    totalCount: number;
}

export interface RecentActivity {
    attendanceType: 'manual' | 'qr' | string;
    name: string;
    studentDetails?: {
        id: string;
    };
    foodTypeName: string;
    date: string;
}

export interface MessDashboardResponse {
    overallAnalytics: MessStats;
    todayMealDistribution: MealDistribution[];
    recentActivity: RecentActivity[];
}
