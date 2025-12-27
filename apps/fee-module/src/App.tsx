import React from 'react';
import { Button } from '@od-erp/ui';

function App() {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
                    <Button variant="primary">Collect Fee</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Today's Collections</h2>
                        <p className="text-3xl font-bold text-success">$12,450</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-lg font-semibold mb-2">Pending Dues</h2>
                        <p className="text-3xl font-bold text-danger">$5,320</p>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="p-3 font-medium text-gray-600">Student Name</th>
                                    <th className="p-3 font-medium text-gray-600">Class</th>
                                    <th className="p-3 font-medium text-gray-600">Amount</th>
                                    <th className="p-3 font-medium text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="p-3">John Doe</td>
                                    <td className="p-3">Class X - A</td>
                                    <td className="p-3">$500</td>
                                    <td className="p-3 text-success">Paid</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="p-3">Jane Smith</td>
                                    <td className="p-3">Class IX - B</td>
                                    <td className="p-3">$450</td>
                                    <td className="p-3 text-success">Paid</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
