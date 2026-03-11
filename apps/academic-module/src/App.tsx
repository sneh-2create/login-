import React from 'react';
import { Button } from '@od-erp/ui';

function App() {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Academic Management</h1>
                    <Button variant="primary">Create Lesson Plan</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 border rounded hover:shadow-md transition cursor-pointer">
                        <h3 className="font-semibold text-primary mb-1">Lesson Planning</h3>
                        <p className="text-sm text-gray-600">Manage daily logs and curriculum.</p>
                    </div>
                    <div className="p-4 border rounded hover:shadow-md transition cursor-pointer">
                        <h3 className="font-semibold text-primary mb-1">Time Table</h3>
                        <p className="text-sm text-gray-600">Class scheduling and teacher allocation.</p>
                    </div>
                    <div className="p-4 border rounded hover:shadow-md transition cursor-pointer">
                        <h3 className="font-semibold text-primary mb-1">Assignments</h3>
                        <p className="text-sm text-gray-600">Create and grade student assignments.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
