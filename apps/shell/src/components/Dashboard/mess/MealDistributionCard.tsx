import React from 'react';
import { Card } from '@od-erp/ui';
import { MealDistribution } from '@od-erp/types';

interface MealDistributionCardProps {
    distribution: MealDistribution[];
    maxCount: number;
}

export const MealDistributionCard: React.FC<MealDistributionCardProps> = ({
    distribution,
    maxCount,
}) => {
    return (
        <Card className="h-full border-none shadow-sm">
            <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Today's Meal Distribution</h3>
                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {distribution.map((meal, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{meal.foodTypeName}</span>
                                <span className="font-bold text-gray-900">{meal.totalCount}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${maxCount > 0 ? (meal.totalCount / maxCount) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {distribution.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No meal distribution data for today
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
