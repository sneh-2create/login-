
import { useEffect, useState } from 'react';

import { format } from 'date-fns';
import PrintLayout from '../../components/PrintLayout';

const PrintStudentTimeline = () => {

    const [student, setStudent] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);

    useEffect(() => {
        const storedStudent = localStorage.getItem('print_student_data');
        const storedTimeline = localStorage.getItem('print_timeline_data');

        if (storedStudent) {
            setStudent(JSON.parse(storedStudent));
        }
        if (storedTimeline) {
            setTimeline(JSON.parse(storedTimeline));
        }
    }, []);

    // If basic data is present, show it.
    if (!student && !timeline.length) return <div className="p-8 text-center">Loading or No Data...</div>;

    const reportName = `Timeline - ${student?.name || ''} (${student?.applicationNumber || ''})`;

    return (
        <PrintLayout reportName={reportName} noHeader={true}>
            <div className="font-sans text-sm">
                {/* Student Details Summary Table */}
                {/* Student Details Summary Table */}
                <div className="mb-6 border border-gray-200 rounded p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                        <div><span className="font-bold text-gray-700">Name:</span> {student?.name}</div>
                        <div><span className="font-bold text-gray-700">Application No:</span> {student?.applicationNumber}</div>
                        <div><span className="font-bold text-gray-700">Father Name:</span> {student?.fatherName}</div>
                        <div><span className="font-bold text-gray-700">Counsellor Name:</span> {student?.counselorName}</div>
                        <div><span className="font-bold text-gray-700">Phone No:</span> {student?.phone}</div>
                        <div><span className="font-bold text-gray-700">Current Stage:</span> {student?.currentStage || 'Data Requested'}</div>
                        <div><span className="font-bold text-gray-700">Date:</span> {format(new Date(), 'dd/MMM/yyyy')}</div>
                    </div>
                </div>

                {/* Timeline Content */}
                {/* Timeline Content */}
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-bold text-lg mb-6 text-[#1e429f] flex items-center gap-2">
                        <span className="p-1 bg-[#1e429f] rounded-full text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span>
                        Timeline
                    </h4>

                    <div className="relative border-l-2 border-gray-200 ml-5 space-y-8 pl-8 pb-4">
                        {timeline?.map((item: any, index: number) => {
                            // Robust Data Extraction
                            const dateStr = item.createdAt || item.date;
                            const dateObj = dateStr ? new Date(dateStr) : new Date();

                            // User extraction: handle object or string
                            let user = 'System';
                            if (item.userName) user = item.userName;
                            else if (item.createdBy && typeof item.createdBy === 'object' && item.createdBy.name) user = item.createdBy.name;
                            else if (item.createdBy) user = String(item.createdBy);
                            else if (item.user) user = item.user;

                            const type = item.type || 'Remark';
                            const subType = item.subType || '';
                            const content = item.content || item.remark || item.message || item.description || '-';

                            return (
                                <div key={index} className="relative group">
                                    {/* Dot on Line */}
                                    <div className="absolute -left-[41px] top-3 w-4 h-4 rounded-full bg-white border-4 border-[#ef4444] z-10"></div>

                                    {/* Date Badge Row */}
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="bg-[#1e429f] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            {format(dateObj, 'dd/MM/yyyy')}
                                        </div>
                                        <div className="bg-[#eff6ff] text-[#1e429f] text-xs font-bold px-2 py-1 rounded border border-blue-100">
                                            {format(dateObj, 'hh:mm a')}
                                        </div>
                                    </div>

                                    {/* Card */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm print:shadow-none print:border-gray-300">
                                        {/* Header: User / Type */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {/* Icon based on Type */}
                                            <span className="text-[#1e429f]">
                                                {type.toLowerCase().includes('communication') ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                ) : type.toLowerCase().includes('institute') ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                )}
                                            </span>
                                            <span className="font-bold text-gray-800 text-sm">
                                                {type} {subType ? ` - ${subType}` : ''}
                                            </span>
                                        </div>

                                        {/* Content Section */}
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 mb-1">Remark</div>
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {content}
                                            </div>
                                            {/* Show user if distinct from type logic, usually "User" implies the actor */}
                                            <div className="mt-2 text-xs text-gray-400 italic text-right">
                                                - by {user}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {!timeline?.length && (
                            <div className="text-gray-500 italic ml-2">No timeline activities found.</div>
                        )}
                    </div>
                </div>
            </div>
            {/* Custom styles not needed as PrintLayout handles main print styles, but keeping component specific tweaks */}
            <style>{`
                @media print {
                     .print\\:shadow-none { box-shadow: none !important; }
                }
            `}</style>
        </PrintLayout>
    );
};

export default PrintStudentTimeline;
