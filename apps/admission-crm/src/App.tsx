import { Button } from '@od-erp/ui';

function App() {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admission CRM</h1>
                    <Button>Add Lead</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded border border-blue-100">
                        <h3 className="text-sm font-medium text-blue-600">Total Inquiries</h3>
                        <p className="text-2xl font-bold text-gray-800">1,245</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded border border-green-100">
                        <h3 className="text-sm font-medium text-green-600">Conversions</h3>
                        <p className="text-2xl font-bold text-gray-800">856</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                        <h3 className="text-sm font-medium text-yellow-600">Pending Follow-ups</h3>
                        <p className="text-2xl font-bold text-gray-800">124</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded border border-purple-100">
                        <h3 className="text-sm font-medium text-purple-600">Applications</h3>
                        <p className="text-2xl font-bold text-gray-800">450</p>
                    </div>
                </div>

                <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                    <p className="text-gray-500">Admission lists and kanban board will appear here.</p>
                </div>
            </div>
        </div>
    );
}

export default App;
