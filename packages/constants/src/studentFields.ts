export interface StudentField {
    value: string;
    name: string;
    fieldType: 'text' | 'phone' | 'email' | 'date' | 'select' | 'dropdown' | 'checkbox' | 'number';
    groupBy: string;
    sequence?: number;
    required?: boolean;
    options?: string[];
}

export const ALL_STUDENT_FIELDS: StudentField[] = [
    // Personal Details
    { value: 'name', name: 'Student Name', fieldType: 'text', groupBy: 'Personal Details', sequence: 0, required: true },
    { value: 'phone', name: 'Phone Number', fieldType: 'phone', groupBy: 'Personal Details', sequence: 0.5, required: true },
    { value: 'dob', name: 'Date of Birth', fieldType: 'date', groupBy: 'Personal Details', sequence: 1 },
    { value: 'gender', name: 'Gender', fieldType: 'select', options: ['Male', 'Female', 'Other'], groupBy: 'Personal Details', sequence: 2 },
    { value: 'bloodGroup', name: 'Blood Group', fieldType: 'text', groupBy: 'Personal Details', sequence: 3 },
    { value: 'nationality', name: 'Nationality', fieldType: 'text', groupBy: 'Personal Details', sequence: 4 },
    { value: 'religion', name: 'Religion', fieldType: 'text', groupBy: 'Personal Details', sequence: 5 },
    { value: 'uid', name: 'UID Number', fieldType: 'text', groupBy: 'Personal Details', sequence: 6 },
    { value: 'socialCategory', name: 'Social Category', fieldType: 'text', groupBy: 'Personal Details', sequence: 7 },
    { value: 'email', name: 'Email', fieldType: 'email', groupBy: 'Personal Details', sequence: 8 },
    { value: 'subCategory', name: 'Sub Category', fieldType: 'text', groupBy: 'Personal Details', sequence: 9 },
    { value: 'remark', name: 'Remarks (if any)', fieldType: 'text', groupBy: 'Personal Details', sequence: 10 },
    { value: 'admissionQuery', name: 'Admission Query', fieldType: 'text', groupBy: 'Personal Details', sequence: 11 },

    // Other Details
    { value: 'domicile', name: 'Domicile', fieldType: 'text', groupBy: 'Other Details', sequence: 1 },
    { value: 'reference1', name: 'Reference 1', fieldType: 'text', groupBy: 'Other Details', sequence: 2 },
    { value: 'reference2', name: 'Reference 2', fieldType: 'text', groupBy: 'Other Details', sequence: 3 },
    { value: 'reference3', name: 'Reference 3', fieldType: 'text', groupBy: 'Other Details', sequence: 4 },
    { value: 'referenceBy', name: 'Reference By', fieldType: 'text', groupBy: 'Other Details', sequence: 5 },

    // Address
    { value: 'address', name: 'Address', fieldType: 'text', groupBy: 'Address', sequence: 1 },
    { value: 'city', name: 'City', fieldType: 'text', groupBy: 'Address', sequence: 2 },
    { value: 'state', name: 'State', fieldType: 'text', groupBy: 'Address', sequence: 3 },
    { value: 'district', name: 'District', fieldType: 'text', groupBy: 'Address', sequence: 4 },
    { value: 'pinCode', name: 'Pin Code', fieldType: 'text', groupBy: 'Address', sequence: 5 },
    { value: 'country', name: 'Country', fieldType: 'text', groupBy: 'Address', sequence: 6 },

    // Contact Details (Correspondence)
    { value: 'corAddress', name: 'Correspondence Address', fieldType: 'text', groupBy: 'Contact Details', sequence: 1 },
    { value: 'corCity', name: 'Correspondence City', fieldType: 'text', groupBy: 'Contact Details', sequence: 2 },
    { value: 'corState', name: 'Correspondence State', fieldType: 'text', groupBy: 'Contact Details', sequence: 3 },
    { value: 'corDistrict', name: 'Correspondence District', fieldType: 'text', groupBy: 'Contact Details', sequence: 4 },
    { value: 'corPinCode', name: 'Correspondence Pin Code', fieldType: 'text', groupBy: 'Contact Details', sequence: 5 },
    { value: 'corCountry', name: 'Correspondence Country', fieldType: 'text', groupBy: 'Contact Details', sequence: 6 },

    // Parent Details
    { value: 'fatherName', name: 'Father Name', fieldType: 'text', groupBy: 'Parent Details', sequence: 1 },
    { value: 'fatherMobile', name: 'Father Mobile', fieldType: 'phone', groupBy: 'Parent Details', sequence: 2 },
    { value: 'fatherOccupation', name: 'Father Occupation', fieldType: 'text', groupBy: 'Parent Details', sequence: 3 },
    { value: 'motherName', name: 'Mother Name', fieldType: 'text', groupBy: 'Parent Details', sequence: 4 },
    { value: 'motherMobile', name: 'Mother Mobile', fieldType: 'phone', groupBy: 'Parent Details', sequence: 5 },
    { value: 'motherOccupation', name: 'Mother Occupation', fieldType: 'text', groupBy: 'Parent Details', sequence: 6 },

    // Guardian Details
    { value: 'guardianName', name: 'Guardian Name', fieldType: 'text', groupBy: 'Guardian Details', sequence: 1 },
    { value: 'guardianRelation', name: 'Relation With Guardian', fieldType: 'text', groupBy: 'Guardian Details', sequence: 2 },
    { value: 'guardianMobile', name: 'Guardian Mobile', fieldType: 'phone', groupBy: 'Guardian Details', sequence: 3 },
    { value: 'guardianEmail', name: 'Guardian Email', fieldType: 'email', groupBy: 'Guardian Details', sequence: 4 },
    { value: 'guardianAddress', name: 'Guardian Address', fieldType: 'text', groupBy: 'Guardian Details', sequence: 5 },

    // Class 10th Details
    { value: 'educationDetails1School', name: 'School/College', fieldType: 'text', groupBy: 'Class 10th Details', sequence: 1 },
    { value: 'educationDetails1PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Class 10th Details', sequence: 2 },
    { value: 'educationDetails1MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Class 10th Details', sequence: 3 },
    { value: 'educationDetails1ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Class 10th Details', sequence: 4 },
    { value: 'educationDetails1Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Class 10th Details', sequence: 5 },
    { value: 'educationDetails1Board', name: 'Board', fieldType: 'text', groupBy: 'Class 10th Details', sequence: 6 },

    // Class 12th Details
    { value: 'educationDetails2School', name: 'School/College', fieldType: 'text', groupBy: 'Class 12th Details', sequence: 1 },
    { value: 'educationDetails2PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Class 12th Details', sequence: 2 },
    { value: 'educationDetails2MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Class 12th Details', sequence: 3 },
    { value: 'educationDetails2ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Class 12th Details', sequence: 4 },
    { value: 'educationDetails2Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Class 12th Details', sequence: 5 },

    // Diploma Details
    { value: 'educationDetails3Class', name: 'Course', fieldType: 'text', groupBy: 'Diploma Details', sequence: 1 },
    { value: 'educationDetails3School', name: 'College/Institute/University', fieldType: 'text', groupBy: 'Diploma Details', sequence: 2 },
    { value: 'educationDetails3PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Diploma Details', sequence: 3 },
    { value: 'educationDetails3MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Diploma Details', sequence: 4 },
    { value: 'educationDetails3ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Diploma Details', sequence: 5 },
    { value: 'educationDetails3Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Diploma Details', sequence: 6 },

    // Graduation Details
    { value: 'educationDetails4Class', name: 'Course', fieldType: 'text', groupBy: 'Graduation Details', sequence: 1 },
    { value: 'educationDetails4School', name: 'College/Institute/University', fieldType: 'text', groupBy: 'Graduation Details', sequence: 2 },
    { value: 'educationDetails4PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Graduation Details', sequence: 3 },
    { value: 'educationDetails4MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Graduation Details', sequence: 4 },
    { value: 'educationDetails4ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Graduation Details', sequence: 5 },
    { value: 'educationDetails4Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Graduation Details', sequence: 6 },

    // Institute Info
    { value: 'qualifyingExamRollNo', name: 'Exam Roll No', fieldType: 'text', groupBy: 'Institute Info', sequence: 1 },
    { value: 'qualifyingExamRank', name: 'Exam Rank', fieldType: 'text', groupBy: 'Institute Info', sequence: 2 },
    { value: 'qualifyingExamPercentage', name: 'Exam Percentage', fieldType: 'text', groupBy: 'Institute Info', sequence: 3 },
];
