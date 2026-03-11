import React from 'react';
import { Button } from '@od-erp/ui';

function App() {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">HRM Portal</h1>
                    <Button variant="primary">Add Employee</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">Total Employees</h4>
                        <p className="mt-2 text-3xl font-bold text-gray-900">128</p>
                    </div>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <h4 className="text-sm font-medium text-gray-500 uppercase">On Leave Today</h4>
                        <p className="mt-2 text-3xl font-bold text-warning">4</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-2">Employee Directory</h3>
                    <p className="text-gray-500">List of employees will be displayed here.</p>
                </div>
            </div>
        </div>
    );
}

export default App;
