export interface CalendarEvent {
    lect: string;
    title: string;
    start: string; // ISO date string
    end: string;   // ISO date string
    className?: string; // scheduled, adjusted, attendanceMarked, cancelled, substituted
    backgroundColor?: string;
    // extendedProps can be used for tooltip info if needed
    extendedProps?: {
        lect: string;
    };
}

export interface CalendarResponse {
    dates: {
        date: number; // timestamp
        lectureData: {
            name: string;
            subjectName: string;
            subjectCode: string;
            course: string;
            stream: string;
            batch: string;
            section: string;
            startTime: string; // "HH:MM"
            endTime: string;   // "HH:MM"
            status: 'scheduled' | 'adjusted' | 'attendanceMarked' | 'cancelled' | 'substituted';
        }[];
    }[];
}
