import React from 'react';
import { Card } from '@od-erp/ui';
import { Loader2 } from 'lucide-react';

interface AnalyticsSidebarProps {
    entities: any[];
    selectedEntities: string[];
    onEntityChange: (_entityId: string, _checked: boolean) => void;
    onSelectAll: (_checked: boolean) => void;
    preFilledSeats: boolean;
    onPreFilledSeatsChange: (_checked: boolean) => void;
    isLoading?: boolean;
}

export const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({
    entities,
    selectedEntities,
    onEntityChange,
    onSelectAll,
    preFilledSeats,
    onPreFilledSeatsChange,
    isLoading
}) => {
    const isAllSelected = entities.length > 0 && selectedEntities.length === entities.length;

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Select Institutes</h3>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="checkbox"
                        id="preFilledSeats"
                        checked={preFilledSeats}
                        onChange={(e) => onPreFilledSeatsChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="preFilledSeats" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Pre-Filled Seats
                    </label>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                        type="checkbox"
                        id="selectAll"
                        checked={isAllSelected}
                        onChange={(e) => onSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="selectAll" className="text-base font-semibold text-gray-900 cursor-pointer flex-1">
                        Select All
                    </label>
                </div>

                <div className="space-y-1">
                    {entities.map((entity) => (
                        <div key={entity.entityId || entity.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                id={entity.entityId || entity.id}
                                checked={selectedEntities.includes(entity.entityId || entity.id)}
                                onChange={(e) => onEntityChange(entity.entityId || entity.id, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={entity.entityId || entity.id} className="text-sm text-gray-700 cursor-pointer flex-1 truncate">
                                {entity.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                    {selectedEntities.length} Options Selected
                </p>
            </div>
        </Card>
    );
};
