import React from 'react';
import { Card } from '@od-erp/ui';
import { Smartphone, UserX, Info } from 'lucide-react';

interface OverviewSideWidgetProps {
    appStudents: number;
    dormantStudents: number;
    incorrectMobile: number;
    onAppClick: () => void;
    onDormantClick: () => void;
    loading?: boolean;
}

export const OverviewSideWidget: React.FC<OverviewSideWidgetProps> = ({
    appStudents,
    dormantStudents,
    incorrectMobile,
    onAppClick,
    onDormantClick,
    loading
}) => {

    return (
        <Card className="h-full bg-white flex flex-col justify-between p-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">Overview</h3>
            </div>

            <div className="flex flex-col space-y-4 flex-1 justify-center">
                {/* App Students Card */}
                <div
                    onClick={onAppClick}
                    className="cursor-pointer bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col items-end w-full">
                            <span className="text-3xl font-bold text-gray-800">{loading ? '-' : appStudents}</span>
                            <div className="flex items-center space-x-1 mt-1" title={`Incorrect mobile number student count: ${incorrectMobile}`}>
                                <Info size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                <Smartphone size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-right">
                        <span className="text-gray-600 font-medium">App Students</span>
                    </div>
                </div>

                {/* Dormant Students Card */}
                <div
                    onClick={onDormantClick}
                    className="cursor-pointer bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col items-end w-full">
                            <span className="text-3xl font-bold text-gray-800">{loading ? '-' : dormantStudents}</span>
                            <div className="h-4"></div> {/* Spacer to match layout */}
                        </div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 ml-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
                                <UserX size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-right">
                        <span className="text-gray-600 font-medium">Dormant Students</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
