import { ReactNode } from 'react';
import { Button } from '@od-erp/ui';
import { Printer } from 'lucide-react';

interface PrintLayoutProps {
    children: ReactNode;
    reportName: string;
    entityName?: string;
    hidePrintButton?: boolean;
    noHeader?: boolean;
}

const PrintLayout = ({
    children,
    reportName,
    entityName = localStorage.getItem('entityName') || 'OkieDokie',
    hidePrintButton = false,
    noHeader = false
}: PrintLayoutProps) => {

    const handlePrint = () => {
        const title = document.title;
        document.title = reportName;
        window.print();
        document.title = title;
    };

    return (
        <div className="min-h-screen bg-white text-black p-8 relative">
            {/* Header / Actions - Hidden during print */}
            {!hidePrintButton && (
                <div className="absolute top-4 right-4 print:hidden flex gap-2">
                    <Button
                        onClick={handlePrint}
                        variant="primary"
                        leftIcon={<Printer size={16} />}
                    >
                        Print
                    </Button>
                </div>
            )}

            {/* Report Header */}
            {!noHeader && (
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold mb-2 uppercase">{entityName}</h3>
                    <p className="text-lg text-gray-700">{reportName}</p>
                </div>
            )}

            {/* Content */}
            <div className="w-full">
                {children}
            </div>

            {/* Footer */}
            <div className="mt-16 flex justify-between px-16 text-sm font-medium">
                <div className="pt-8 border-t border-gray-400 w-48 text-center">Principal's Signature</div>
                <div className="pt-8 border-t border-gray-400 w-48 text-center">Authorised Signature</div>
            </div>

            {/* Print Specific Styles */}
            <style>{`
                @media print {
                    @page {
                        margin: 0.5cm;
                        size: auto;
                    }
                    body {
                        visibility: visible !important;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintLayout;
