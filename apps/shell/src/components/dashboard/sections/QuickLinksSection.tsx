import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, FileText } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';
import { RANDOM_COLORS, TEXT_COLORS, STATIC_FAVOURITE_LIST } from '@od-erp/constants';

export const QuickLinksSection: React.FC = () => {
    const { preferences } = useAppSelector((state) => state.auth);

    const { actions, reports } = useMemo(() => {
        const favs = preferences?.favourites || [];
        const acts: any[] = [];
        const reps: any[] = [];

        favs.forEach((item: any) => {
            // Legacy filter: !item.name.includes('Report') && !staticFavouriteList.includes(item.name) && item.name!='Result At A Glance'
            if (!item.name.includes('Report') && !STATIC_FAVOURITE_LIST.includes(item.name) && item.name !== 'Result At A Glance') {
                acts.push(item);
            } else {
                reps.push(item);
            }
        });

        return { actions: acts, reports: reps };
    }, [preferences]);

    if (!preferences?.favourites || preferences.favourites.length === 0) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
                <Star className="w-8 h-8 mb-2 opacity-50" />
                <span>No favorites added yet.</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Actions Section */}
            <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
                </div>

                {actions.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {actions.map((fav, index) => {
                            const colorIndex = index % RANDOM_COLORS.length;
                            return (
                                <Link
                                    key={index}
                                    to={fav.route} // TODO: Map legacy routes to new routes if needed
                                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all group"
                                >
                                    <div className={`p-3 rounded-full ${RANDOM_COLORS[colorIndex]} bg-opacity-20`}>
                                        <Star className={`w-6 h-6 ${TEXT_COLORS[colorIndex]}`} />
                                    </div>
                                    <span className={`text-sm font-medium ${TEXT_COLORS[colorIndex]} text-center`}>{fav.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-8">No Actions Added</div>
                )}
            </div>

            {/* Reports Section */}
            <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
                </div>

                {reports.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {reports.map((fav, index) => {
                            // Reports use primary color in legacy, user store has colourTheme? 
                            // For now using standard color
                            return (
                                <Link
                                    key={index}
                                    to={fav.route}
                                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                                >
                                    <div className="p-3 rounded-full bg-purple-50">
                                        <FileText className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 text-center">{fav.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-8">No Reports Added</div>
                )}
            </div>
        </div>
    );
};

