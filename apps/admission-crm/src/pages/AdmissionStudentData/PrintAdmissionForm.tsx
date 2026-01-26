import { useState, useEffect } from 'react';
import PrintLayout from '../../components/PrintLayout';
import AdmissionFormTemplate from './components/AdmissionFormTemplate';

const PrintAdmissionForm = () => {
    const [student, setStudent] = useState<any>(null);

    useEffect(() => {
        const storedStudent = localStorage.getItem('print_student_data');
        if (storedStudent) {
            setStudent(JSON.parse(storedStudent));
        }
    }, []);

    if (!student) return <div className="p-8 text-center text-sm">Loading data...</div>;

    return (
        <PrintLayout reportName={`Admission Form - ${student.name}`} noHeader={true}>
            <AdmissionFormTemplate student={student} />
            {/* Custom Print Overrides */}
            <style>{`
                @media print {
                    @page { margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </PrintLayout>
    );
};

export default PrintAdmissionForm;
