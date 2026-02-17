
import React from 'react';
import { Announcement } from '@od-erp/types';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

interface AnnouncementListProps {
    announcements: Announcement[];
    loading?: boolean;
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({ announcements, loading }) => {
    const navigate = useNavigate();

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'employeeAnnouncement':
                return 'bg-blue-100 text-blue-700';
            case 'notice':
                return 'bg-yellow-100 text-yellow-700';
            case 'circular':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getBadgeLabel = (type: string) => {
        switch (type) {
            case 'employeeAnnouncement':
                return 'Announcement';
            case 'notice':
                return 'Notice';
            case 'circular':
                return 'Circular';
            default:
                return type;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-800">Latest Announcements</h3>
                </div>
                <button
                    onClick={() => navigate('/communication/employeeAnnouncement')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-400">Loading announcements...</div>
                </div>
            ) : announcements && announcements.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {announcements.map((announcement, index) => (
                        <div key={announcement._id} className={`pb-3 ${index !== announcements.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <h5 className="font-bold text-gray-800 text-sm flex-1 mr-2">{announcement.title}</h5>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{moment(announcement.createdAt).format('YYYY-MM-DD')}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{announcement.message}</p>
                            <div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeColor(announcement.notificationType)}`}>
                                    {getBadgeLabel(announcement.notificationType)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h5 className="text-gray-800 font-medium">No Announcements</h5>
                    <p className="text-gray-500 text-sm">There are no recent announcements to display.</p>
                </div>
            )}
        </div>
    );
};
