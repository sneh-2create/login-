
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

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

        // Auto-print after 1 second (matching Angular)
        setTimeout(() => {
            window.print();
        }, 1000);

        // Clean up localStorage (matching Angular)
        localStorage.removeItem('print_student_data');
        localStorage.removeItem('print_timeline_data');
    }, []);

    if (!student && !timeline.length) {
        return <div className="p-8 text-center">Loading or No Data...</div>;
    }

    return (
        <>
            <div className="p-8 font-sans text-sm">
                {/* Student Details */}
                <div className="mb-4">
                    <label className="block mb-1"><b>Name:</b> {student?.name}</label>
                    <label className="block mb-1"><b>Application No.:</b> {student?.applicationNumber}</label>
                    <label className="block mb-1"><b>Father Name:</b> {student?.fatherName}</label>
                    <label className="block mb-1"><b>Counsellor Name:</b> {student?.counselorName}</label>
                    <label className="block mb-1"><b>Phone No.:</b> {student?.phone}</label>
                    <label className="block mb-1"><b>Current Stage:</b> {student?.currentStage || 'Data Requested'}</label>
                    <label className="block mb-1"><b>Date:</b> {format(new Date(), 'dd/MMM/yyyy')}</label>
                </div>

                {/* Timeline Section */}
                <div className="timeline mt-8 relative">
                    <div className="timeline__items pt-6 pb-8">
                        {/* Timeline Header */}
                        <div className="timeline-month mb-6 inline-flex items-center gap-2 text-base font-bold text-white bg-primary px-4 py-2 rounded-full relative">
                            <div className="monthIcon absolute left-3">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                            </div>
                            <span className="ml-4">Timeline</span>
                        </div>

                        {/* Timeline Items Container with vertical line */}
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-[14px] top-0 bottom-0 w-1 bg-gray-300 rounded"></div>

                            {timeline?.map((item: any, index: number) => {
                                const dateObj = item.date ? new Date(item.date) : new Date();
                                
                                return (
                                    <div key={index} className="timeline-section mb-6 relative pl-9">
                                        {/* Red dot on timeline */}
                                        <div className="absolute left-[10px] top-2 w-[10px] h-[10px] bg-white border-[3px] border-red-500 rounded-full z-10"></div>

                                        {/* Date and Time Badges */}
                                        <div className="flex gap-2 mb-3">
                                            <div className="timeline-date bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                {format(dateObj, 'dd/MM/yyyy')}
                                            </div>
                                            <div className="timeline-time bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                {format(dateObj, 'hh:mm a')}
                                            </div>
                                        </div>

                                        {/* Timeline Box */}
                                        <div className="timeline-box border border-gray-200 rounded-lg bg-white shadow-sm p-4 ml-2">
                                            {/* Box Title with Icon and Action Type */}
                                            <div className="box-title flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                                {/* Icon based on action type */}
                                                <span className="text-primary">
                                                    {item.actionType === 'instituteAction' && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    )}
                                                    {item.actionType === 'userAction' && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                            <circle cx="12" cy="7" r="4"></circle>
                                                        </svg>
                                                    )}
                                                    {item.actionType === 'communication' && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                        </svg>
                                                    )}
                                                    {item.actionType === 'notes' && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                            <polyline points="14 2 14 8 20 8"></polyline>
                                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                                            <polyline points="10 9 9 9 8 9"></polyline>
                                                        </svg>
                                                    )}
                                                </span>
                                                
                                                {/* Action Type Label */}
                                                <span className="font-semibold text-gray-800">
                                                    {item.actionType === 'instituteAction' && 'Institute'}
                                                    {item.actionType === 'userAction' && 'User'}
                                                    {item.actionType === 'communication' && 'Communication'}
                                                    {item.actionType === 'notes' && 'Notes'}
                                                    {!item.actionType && 'Event'}
                                                </span>
                                            </div>

                                            {/* Box Content */}
                                            <div className="box-content">
                                                <div className="box-item mb-2">
                                                    <strong className="text-gray-700">Remark</strong>
                                                </div>
                                                <div className="box-item text-gray-800 whitespace-pre-wrap">
                                                    {item.remark || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {!timeline?.length && (
                                <div className="text-gray-500 italic pl-9">No timeline activities found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body { margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                }
                
                .timeline-section {
                    page-break-inside: avoid;
                }
                
                .timeline-box {
                    page-break-inside: avoid;
                }
            `}</style>
        </>
    );
};

export default PrintStudentTimeline;
