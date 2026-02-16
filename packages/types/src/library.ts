export interface LibraryMemberTypeStat {
    memberType: string;
    count: number;
    color?: string;
}

export interface LibraryOverdueDefaulter {
    name: string;
    course: string;
    title: string;
    memberType: string;
    photo?: string;
}

export interface LibraryBookStat {
    title: string;
    count: number;
}

export interface LibraryDashboardResponse {
    booksCount: {
        totalBooks: number;
        newBooks: number;
    }[];
    todayBooksCount: {
        bookIssued: number;
        bookReturned: number;
    }[];
    booksCirculated: {
        circulatedBooks: number;
        overDueBooks: number;
    }[];
    top10Books: LibraryBookStat[];
    groupByMemberType: LibraryMemberTypeStat[];
    groupByMemberTypeUnique: LibraryMemberTypeStat[];
    top10OverDueDefaulters: LibraryOverdueDefaulter[];
}
