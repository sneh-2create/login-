export interface RangeWiseCourseData {
    course: string;
    count0to40: number;
    count41to60: number;
    count61to70?: number; // School specific
    count61to80?: number; // College specific
    count71to80?: number; // School specific
    count81to90?: number; // School specific
    count81to100?: number; // College specific
    count91to100?: number; // School specific

    percentage0to40: number;
    percentage41to60: number;
    percentage61to70?: number;
    percentage61to80?: number;
    percentage71to80?: number;
    percentage81to90?: number;
    percentage81to100?: number;
    percentage91to100?: number;
}

export interface RangeWiseSubjectData {
    _id: string; // Course name usually
    subjectData: {
        subjectName: string;
        count0to40: number;
        count41to60: number;
        count61to70?: number;
        count61to80?: number;
        count71to80?: number;
        count81to90?: number;
        count81to100?: number;
        count91to100?: number;
    }[];
}

export interface ExaminationDashboardResponse {
    groupByCourse: RangeWiseCourseData[];
    groupByCourseSubject: RangeWiseSubjectData[];
}
