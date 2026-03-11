import { format } from 'date-fns';

const AdmissionFormTemplate = ({ student }: { student: any }) => {
    if (!student) return <div className="p-8 text-center text-sm">Loading data...</div>;

    const renderDate = (dateVal: any) => {
        if (!dateVal) return '-';
        try {
            return format(new Date(dateVal), 'dd/MM/yyyy');
        } catch {
            return dateVal;
        }
    };

    const FieldParams = ({ label, value, className = '' }: { label: string, value: any, className?: string }) => (
        <div className={`flex flex-col mb-2 ${className}`}>
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tight">{label}</span>
            <div className="border border-gray-300 px-2 py-1 min-h-[24px] text-xs font-semibold text-gray-900 bg-white rounded-sm">
                {value || '-'}
            </div>
        </div>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="mt-4 mb-2">
            <h4 className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-1">{title}</h4>
        </div>
    );

    const TableRow = ({ exam, board, school, year, max, obt, percent }: any) => (
        <tr className="border-b border-gray-200">
            <td className="py-1 px-2 border-r border-gray-200">{exam}</td>
            <td className="py-1 px-2 border-r border-gray-200">{board || '-'}</td>
            <td className="py-1 px-2 border-r border-gray-200">{school || '-'}</td>
            <td className="py-1 px-2 border-r border-gray-200">{year || '-'}</td>
            <td className="py-1 px-2 border-r border-gray-200">{max || '-'}</td>
            <td className="py-1 px-2 border-r border-gray-200">{obt || '-'}</td>
            <td className="py-1 px-2">{percent || '-'}</td>
        </tr>
    );

    return (
        <div className="max-w-[210mm] mx-auto bg-white text-xs font-sans leading-tight">
            {/* Custom Header */}
            <div className="text-center mb-6 border-b-2 border-double border-gray-400 pb-4">
                <div className="flex justify-center items-center gap-4 mb-2">
                    {/* Placeholder Logo */}
                    <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 border border-gray-200">Logo</div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1e429f] font-serif tracking-wide">SDGI GLOBAL UNIVERSITY</h1>
                        <div className="text-[10px] font-medium text-gray-600 mt-1 uppercase tracking-wide">
                            Established Under Uttar Pradesh Act No. 12 of 2019 & Recognised Under Section 2(f) of UGC Act, 1956
                        </div>
                    </div>
                    {/* Placeholder Photo */}
                    <div className="w-16 h-20 bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 border border-gray-200 ml-4">Photo</div>
                </div>
                <div className="text-[10px] text-gray-600">
                    NH-9, Delhi-Hapur Road, Ghaziabad, Delhi-NCR, Pin 201015, U.P<br />
                    Admission Helpline : 1800 890 3280, Email id : admission@sgu.edu.in, www.sgu.edu.in
                </div>
            </div>

            {/* Basic Details */}
            <SectionHeader title="Basic Details" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <FieldParams label="School Name *" value={student.school} />
                <FieldParams label="Course *" value={student.course} />

                <FieldParams label="Application Number" value={student.applicationNumber} />
                <FieldParams label="Name of Applicant (English) *" value={student.name} />

                <FieldParams label="Email ID *" value={student.email} />
                <FieldParams label="Student Mobile *" value={student.phone} />

                <FieldParams label="Father's Name *" value={student.fatherName} />
                <FieldParams label="Father's Mobile *" value={student.fatherMobile} />

                {/* Extra Field to match layout balance */}
                <div className="grid grid-cols-2 gap-4 col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                        <FieldParams label="Father's Occupation" value={student.fatherOccupation} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    </div>
                </div>
            </div>

            {/* Correcting Grid for Parents (3 cols) */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2">
                <FieldParams label="Father's Name *" value={student.fatherName} />
                <FieldParams label="Father's Mobile *" value={student.fatherMobile} />
                <FieldParams label="Father's Occupation" value={student.fatherOccupation} />

                <FieldParams label="Mother's Name" value={student.motherName} />
                <FieldParams label="Mother's Mobile" value={student.motherMobile} />
                <FieldParams label="Mother's Occupation" value={student.motherOccupation} />
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2">
                <FieldParams label="Mode of Admission" value={student.admissionCategory} />
                <FieldParams label="Blood Group" value={student.bloodGroup} />
                <FieldParams label="Aadhar Card No. *" value={student.uid} />

                <FieldParams label="Religion" value={student.religion} />
                <FieldParams label="Nationality *" value={student.nationality} />
                <FieldParams label="State of Domicile *" value={student.domicile} />

                <FieldParams label="Competitive Exam" value={student.qualifyingExamName || student.examName || '-'} />
                <FieldParams label="Entrance Roll No." value={student.qualifyingExamRollNo} />
                <div className="grid grid-cols-2 gap-2">
                    <FieldParams label="Rank" value={student.qualifyingExamRank} />
                    <FieldParams label="Score" value={student.qualifyingExamPercentage} />
                </div>
            </div>

            {/* Addresses */}
            <SectionHeader title="Addresses" />
            <div className="border border-gray-200 p-2 rounded-sm mb-4">
                <div className="mb-4">
                    <h5 className="font-bold text-gray-700 text-[10px] mb-2">Permanent Address *</h5>
                    <div className="grid grid-cols-1 mb-2">
                        <FieldParams label="Address" value={student.address} className="w-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <FieldParams label="City *" value={student.city} />
                        <FieldParams label="District *" value={student.district} />
                        <FieldParams label="Pin Code *" value={student.pinCode} />
                    </div>
                </div>

                <div>
                    <h5 className="font-bold text-gray-700 text-[10px] mb-2">Correspondence Address</h5>
                    <div className="grid grid-cols-1 mb-2">
                        <FieldParams label="Address" value={student.corAddress} className="w-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <FieldParams label="City" value={student.corCity} />
                        <FieldParams label="District" value={student.corDistrict} />
                        <FieldParams label="Pin Code" value={student.corPinCode} />
                    </div>
                </div>
            </div>

            {/* Personal & Academic Info */}
            <SectionHeader title="Personal & Academic Information" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <FieldParams label="Date of Birth *" value={renderDate(student.dob)} />
                <FieldParams label="Gender *" value={student.gender} />

                <FieldParams label="Category *" value={student.socialCategory} />
                <FieldParams label="Sub Category" value={student.subCategory} />
            </div>

            {/* Academic Qualification Table */}
            <SectionHeader title="Academic Qualification (10th onwards)" />
            <div className="mb-4">
                <table className="w-full border-collapse border border-gray-300 text-[10px]">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="border border-gray-300 px-2 py-1">Examination</th>
                            <th className="border border-gray-300 px-2 py-1">Board/University</th>
                            <th className="border border-gray-300 px-2 py-1">School/Institution</th>
                            <th className="border border-gray-300 px-2 py-1">Year</th>
                            <th className="border border-gray-300 px-2 py-1">Max Marks</th>
                            <th className="border border-gray-300 px-2 py-1">Marks Obtained</th>
                            <th className="border border-gray-300 px-2 py-1">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TableRow
                            exam="10th *"
                            board={student.educationDetails1Board}
                            school={student.educationDetails1School}
                            year={student.educationDetails1PassingYear}
                            max={student.educationDetails1MaxMarks}
                            obt={student.educationDetails1ObtainedMarks}
                            percent={student.educationDetails1Percentage}
                        />
                        <TableRow
                            exam="12th"
                            board={student.educationDetails2Board}
                            school={student.educationDetails2School}
                            year={student.educationDetails2PassingYear}
                            max={student.educationDetails2MaxMarks}
                            obt={student.educationDetails2ObtainedMarks}
                            percent={student.educationDetails2Percentage}
                        />
                        <TableRow
                            exam="Diploma"
                            board={student.educationDetails3University} /* Guessing field name based on 10th pattern or studentFields.ts might not have board for 3? Let's treat 'School' as Institute */
                            school={student.educationDetails3School} // This is mapped to College/Inst in config
                            year={student.educationDetails3PassingYear}
                            max={student.educationDetails3MaxMarks}
                            obt={student.educationDetails3ObtainedMarks}
                            percent={student.educationDetails3Percentage}
                        />
                        <TableRow
                            exam="Graduation"
                            board={student.educationDetails4University}
                            school={student.educationDetails4School}
                            year={student.educationDetails4PassingYear}
                            max={student.educationDetails4MaxMarks}
                            obt={student.educationDetails4ObtainedMarks}
                            percent={student.educationDetails4Percentage}
                        />
                        {/* Post Grad placeholder if needed, layout shows 4 rows typically + headers */}
                    </tbody>
                </table>
            </div>

            {/* Address & Guardian Details */}
            <SectionHeader title="Address & Guardian Details" />
            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                <FieldParams label="Guardian's Name" value={student.guardianName} />
                {/* Placeholder to match layout row items */}
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2">
                <FieldParams label="Relation" value={student.guardianRelation} />
                <FieldParams label="Mobile No." value={student.guardianMobile} />
                <FieldParams label="Email ID" value={student.guardianEmail} />
            </div>
            <div className="mt-2">
                <FieldParams label="Address" value={student.guardianAddress} className="w-full" />
            </div>

            {/* Declaration */}
            <SectionHeader title="Declaration" />
            <div className="border border-gray-300 p-3 rounded-sm mb-8">
                <ul className="list-disc ml-4 space-y-1 text-[10px] text-gray-700">
                    <li>I hereby declare that the information given above or contained in the documents attached is complete and correct.</li>
                    <li>I understand that concealment or will full omission of facts will lead to cancellation of my admission or expulsion.</li>
                    <li>I have read the above matter and pledge to abide by it.</li>
                </ul>

                <div className="flex justify-between items-end mt-12 px-4">
                    <div className="w-1/3 border-b border-gray-400 text-center pb-1 text-[10px] font-bold">STUDENT SIGN.</div>
                    <div className="w-1/3 border-b border-gray-400 text-center pb-1 text-[10px] font-bold">PARENTS SIGN.</div>
                    <div className="w-1/4 border-b border-gray-400 text-center pb-1 text-[10px] font-bold">Date: {format(new Date(), 'dd/MM/yyyy')}</div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionFormTemplate;
