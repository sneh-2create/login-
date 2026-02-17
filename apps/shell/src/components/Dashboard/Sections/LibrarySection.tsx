import React, { useMemo } from 'react';
import { useLibraryDashboard } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import {
    Card,
    cn
} from '@od-erp/ui';
import {
    Book,
    Library,
    Vote,
    SearchCheck,
    ArchiveX,
    Clock,
    UserCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';


export const LibrarySection = () => {
    const { permissions, entityDetails } = useAppSelector((state: any) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    const hasPermission = useMemo(() => {
        return permissions?.includes('libraryModule') && permissions?.includes('libraryDashboard');
    }, [permissions]);

    const { data: libraryData, isLoading } = useLibraryDashboard(
        entityId,
        session,
        hasPermission
    );

    if (!hasPermission) return null;

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-3 mt-8">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-48 animate-pulse bg-gray-100 p-4">
                        <div className="h-full w-full"></div>
                    </Card>
                ))}
            </div>
        );
    }

    const booksCount = libraryData?.booksCount?.[0] || { totalBooks: 0, newBooks: 0 };
    const todayBooksCount = libraryData?.todayBooksCount?.[0] || { bookIssued: 0, bookReturned: 0 };
    const booksCirculated = libraryData?.booksCirculated?.[0] || { circulatedBooks: 0, overDueBooks: 0 };

    // Issued Books Data Integration
    const issuedBooksData = libraryData?.groupByMemberType || [];
    const totalIssuedBooks = issuedBooksData.reduce((acc: number, curr: any) => acc + curr.count, 0);
    const PIE_COLORS = ['#41A6ED', '#FCB965', '#35C87C', '#FE6C8A', '#8B5CF6'];

    // Overdue Books Data Integration
    const overdueBooks = libraryData?.top10OverDueDefaulters || [];

    const StatCard = ({ title, className, children }: { title: string, className?: string, children: React.ReactNode }) => (
        <Card className={cn("border-none shadow-[0px_0px_10px_-2px_#0000001A] p-0", className)}>
            <div className="p-6 pb-2">
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <div className="p-6 pt-2">
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </Card>
    );

    const StatItem = ({ icon: Icon, color, bg, label, value }: any) => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-lg flex items-center justify-center", bg)}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                <span className="font-semibold text-gray-700">{label}</span>
            </div>
            <span className="font-bold text-lg">{value || '-'}</span>
        </div>
    );

    return (
        <div className="mt-8 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Library</h3>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Books Count - Yellow Theme */}
                <StatCard title="Books Count" className="bg-yellow-50/50">
                    <StatItem
                        icon={Book}
                        color="text-[#FFBC5B]"
                        bg="bg-white shadow-sm"
                        label="Total Books"
                        value={booksCount.totalBooks}
                    />
                    <StatItem
                        icon={Library}
                        color="text-[#3A3347]"
                        bg="bg-white shadow-sm"
                        label="New Books"
                        value={booksCount.newBooks}
                    />
                </StatCard>

                {/* Books Issued - Blue Theme */}
                <StatCard title="Books Issued" className="bg-blue-50/50">
                    <StatItem
                        icon={Vote}
                        color="text-[#4BB3FD]"
                        bg="bg-white shadow-sm"
                        label="Today's Issued Books"
                        value={todayBooksCount.bookIssued}
                    />
                    <StatItem
                        icon={SearchCheck}
                        color="text-[#41A6ED]"
                        bg="bg-white shadow-sm"
                        label="Today's Returned Books"
                        value={todayBooksCount.bookReturned}
                    />
                </StatCard>

                {/* Books Circulation - Green Theme */}
                <StatCard title="Books Circulation" className="bg-emerald-50/50">
                    <StatItem
                        icon={ArchiveX}
                        color="text-[#35C87C]"
                        bg="bg-white shadow-sm"
                        label="Circulated Books"
                        value={booksCirculated.circulatedBooks}
                    />
                    <StatItem
                        icon={Clock}
                        color="text-[#35C87C]"
                        bg="bg-white shadow-sm"
                        label="Over Due Books"
                        value={booksCirculated.overDueBooks}
                    />
                </StatCard>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Issued Books Chart */}
                <Card className="border-none shadow-[0px_0px_10px_-2px_#0000001A]">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-bold">Issued Books</h3>
                    </div>
                    <div className="p-6 h-[300px] flex items-center justify-center relative">
                        {issuedBooksData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={issuedBooksData}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="count"
                                            nameKey="memberType"
                                        >
                                            {issuedBooksData.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="rect" />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-20">
                                    <span className="text-sm text-gray-500">Total</span>
                                    <span className="text-xl font-bold">{totalIssuedBooks}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Book className="w-12 h-12 mb-2 opacity-50" />
                                <p>No Data Found</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Top Overdue Books List */}
                <Card className="border-none shadow-[0px_0px_10px_-2px_#0000001A]">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-bold">Top Overdue Books</h3>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[300px] space-y-4">
                        {overdueBooks.length > 0 ? (
                            overdueBooks.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {item.photo ? (
                                                <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                                                {item.course && <span className="text-xs text-gray-500">({item.course})</span>}
                                            </div>
                                            <div className="mt-1">
                                                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-md inline-block max-w-[200px] truncate" title={item.title}>
                                                    {item.title}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-1">Member Type</p>
                                        <span className="text-xs font-medium text-gray-700 uppercase">{item.memberType}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                <Clock className="w-12 h-12 mb-2 opacity-50" />
                                <p>No Overdue Books</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
                {/* Most Issued Books Chart */}
                <Card className="md:col-span-2 border-none shadow-[0px_0px_10px_-2px_#0000001A]">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-bold">Most Issued Books</h3>
                    </div>
                    <div className="p-6 h-[400px]">
                        {libraryData?.top10Books && libraryData.top10Books.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={libraryData.top10Books}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 60,
                                    }}
                                >
                                    <XAxis
                                        dataKey="title"
                                        angle={-15}
                                        textAnchor="end"
                                        interval={0}
                                        height={80}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#41A6ED" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Book className="w-12 h-12 mb-2 opacity-50" />
                                <p>No Data Found</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Users With Books Chart */}
                <Card className="border-none shadow-[0px_0px_10px_-2px_#0000001A]">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-bold">Users With Books</h3>
                    </div>
                    <div className="p-6 h-[400px] flex items-center justify-center relative">
                        {libraryData?.groupByMemberTypeUnique && libraryData.groupByMemberTypeUnique.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={libraryData.groupByMemberTypeUnique}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={2}
                                            dataKey="count"
                                            nameKey="memberType"
                                        >
                                            {libraryData.groupByMemberTypeUnique.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="top" align="right" layout="vertical" iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                                    <span className="text-sm text-gray-500">Total</span>
                                    <span className="text-2xl font-bold">
                                        {libraryData.groupByMemberTypeUnique.reduce((acc: number, curr: any) => acc + curr.count, 0)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <UserCircle className="w-12 h-12 mb-2 opacity-50" />
                                <p>No Data Found</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div >
    );
};
