import React from 'react';
import { Button } from '@od-erp/ui';

function App() {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Exam & COE</h1>
                    <Button variant="primary">Schedule Exam</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Upcoming Examinations</h3>
                        <ul className="space-y-3">
                            <li className="p-3 border rounded bg-gray-50 flex justify-between">
                                <span>Mid-term Physics</span>
                                <span className="text-sm text-gray-500">Dec 12, 10:00 AM</span>
                            </li>
                            <li className="p-3 border rounded bg-gray-50 flex justify-between">
                                <span>Finals Chemistry</span>
                                <span className="text-sm text-gray-500">Dec 15, 10:00 AM</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Results Publishing</h3>
                        <div className="p-4 border border-dashed rounded text-center text-gray-500">
                            No results pending publication.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
