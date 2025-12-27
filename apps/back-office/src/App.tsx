import React from 'react';
import { Button } from '@od-erp/ui';

function App() {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Back Office</h1>
                    <Button variant="secondary">Settings</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-50 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition">
                        <h3 className="font-bold text-lg mb-2">School Configuration</h3>
                        <p className="text-sm text-gray-600">Manage basic school details and preferences.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition">
                        <h3 className="font-bold text-lg mb-2">User Management</h3>
                        <p className="text-sm text-gray-600">Create, edit, and assign roles to users.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition">
                        <h3 className="font-bold text-lg mb-2">Audit Logs</h3>
                        <p className="text-sm text-gray-600">View system-wide activity logs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
