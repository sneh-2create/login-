import React from 'react';
import { Card } from '@od-erp/ui';
import { BirthdayEmployee } from '@od-erp/types';

interface EventListProps {
    title: string;
    events: BirthdayEmployee[];
    type: 'birthday' | 'anniversary';
}

export const EventList: React.FC<EventListProps> = ({ title, events, type }) => {
    return (
        <Card className="h-full">
            <div className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>
                <div className="flex-1 overflow-y-auto max-h-[300px]">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p>No Data Found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event._id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                        {event.photo ? (
                                            <img src={event.photo} alt={event.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                                                {event.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{event.name}</h4>
                                        <p className="text-xs text-gray-500">{event.designation?.name}</p>
                                        <p className="text-xs text-gray-500">{event.department?.name}</p>
                                    </div>
                                    <div className="text-xs font-medium text-gray-600">
                                        {new Date(type === 'birthday' ? event.dob : event.doj).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
