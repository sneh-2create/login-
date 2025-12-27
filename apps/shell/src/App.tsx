
import { Button } from '@od-erp/ui';

function App() {
    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary">OD ERP</h1>
                <Button variant="primary">Login</Button>
            </header>
            <main className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Welcome to the React Shell</h2>
                <p className="mb-4">This is the container for all micro-frontends.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="font-bold mb-2">Admission CRM</h3>
                        <p className="text-sm text-secondary">Manage admissions and leads.</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="font-bold mb-2">Fee Module</h3>
                        <p className="text-sm text-secondary">Manage student fees and payments.</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="font-bold mb-2">HRM</h3>
                        <p className="text-sm text-secondary">Employee management.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
