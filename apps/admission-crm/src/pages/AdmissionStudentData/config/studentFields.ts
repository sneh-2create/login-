export const ALL_STUDENT_FIELDS = [
    // Personal Details
    { value: 'dob', name: 'Date of Birth', fieldType: 'date', groupBy: 'Personal Details' },
    { value: 'gender', name: 'Gender', fieldType: 'select', options: ['Male', 'Female', 'Other'], groupBy: 'Personal Details' },
    { value: 'bloodGroup', name: 'Blood Group', fieldType: 'text', groupBy: 'Personal Details' },
    { value: 'nationality', name: 'Nationality', fieldType: 'text', groupBy: 'Personal Details' },
    { value: 'religion', name: 'Religion', fieldType: 'text', groupBy: 'Personal Details' },
    { value: 'uid', name: 'UID Number', fieldType: 'text', groupBy: 'Personal Details' },
    { value: 'socialCategory', name: 'Social Category', fieldType: 'text', groupBy: 'Personal Details' },
    { value: 'email', name: 'Email', fieldType: 'email', groupBy: 'Personal Details' },
    { value: 'subCategory', name: 'Sub Category', fieldType: 'text', groupBy: 'Personal Details' },
    { value: 'remark', name: 'Remarks (if any)', fieldType: 'text', groupBy: 'Personal Details' },
    { value: 'admissionQuery', name: 'Admission Query', fieldType: 'text', groupBy: 'Personal Details' },

    // Other Details
    { value: 'domicile', name: 'Domicile', fieldType: 'text', groupBy: 'Other Details' },
    { value: 'reference1', name: 'Reference 1', fieldType: 'text', groupBy: 'Other Details' },
    { value: 'reference2', name: 'Reference 2', fieldType: 'text', groupBy: 'Other Details' },
    { value: 'reference3', name: 'Reference 3', fieldType: 'text', groupBy: 'Other Details' },
    { value: 'referenceBy', name: 'Reference By', fieldType: 'text', groupBy: 'Other Details' },

    // Address
    { value: 'address', name: 'Address', fieldType: 'text', groupBy: 'Address' },
    { value: 'city', name: 'City', fieldType: 'text', groupBy: 'Address' },
    { value: 'state', name: 'State', fieldType: 'text', groupBy: 'Address' },
    { value: 'district', name: 'District', fieldType: 'text', groupBy: 'Address' },
    { value: 'pinCode', name: 'Pin Code', fieldType: 'text', groupBy: 'Address' },
    { value: 'country', name: 'Country', fieldType: 'text', groupBy: 'Address' },

    // Contact Details (Correspondence)
    { value: 'corAddress', name: 'Correspondence Address', fieldType: 'text', groupBy: 'Contact Details' },
    { value: 'corCity', name: 'Correspondence City', fieldType: 'text', groupBy: 'Contact Details' },
    { value: 'corState', name: 'Correspondence State', fieldType: 'text', groupBy: 'Contact Details' },
    { value: 'corDistrict', name: 'Correspondence District', fieldType: 'text', groupBy: 'Contact Details' },
    { value: 'corPinCode', name: 'Correspondence Pin Code', fieldType: 'text', groupBy: 'Contact Details' },
    { value: 'corCountry', name: 'Correspondence Country', fieldType: 'text', groupBy: 'Contact Details' },

    // Parent Details
    { value: 'fatherName', name: 'Father Name', fieldType: 'text', groupBy: 'Parent Details' },
    { value: 'fatherMobile', name: 'Father Mobile', fieldType: 'phone', groupBy: 'Parent Details' },
    { value: 'fatherOccupation', name: 'Father Occupation', fieldType: 'text', groupBy: 'Parent Details' },
    { value: 'motherName', name: 'Mother Name', fieldType: 'text', groupBy: 'Parent Details' },
    { value: 'motherMobile', name: 'Mother Mobile', fieldType: 'phone', groupBy: 'Parent Details' },
    { value: 'motherOccupation', name: 'Mother Occupation', fieldType: 'text', groupBy: 'Parent Details' },

    // Guardian Details
    { value: 'guardianName', name: 'Guardian Name', fieldType: 'text', groupBy: 'Guardian Details' },
    { value: 'guardianRelation', name: 'Relation With Guardian', fieldType: 'text', groupBy: 'Guardian Details' },
    { value: 'guardianMobile', name: 'Guardian Mobile', fieldType: 'phone', groupBy: 'Guardian Details' },
    { value: 'guardianEmail', name: 'Guardian Email', fieldType: 'email', groupBy: 'Guardian Details' },
    { value: 'guardianAddress', name: 'Guardian Address', fieldType: 'text', groupBy: 'Guardian Details' },

    // Class 10th Details
    { value: 'educationDetails1School', name: 'School/College', fieldType: 'text', groupBy: 'Class 10th Details' },
    { value: 'educationDetails1PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Class 10th Details' },
    { value: 'educationDetails1MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Class 10th Details' },
    { value: 'educationDetails1ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Class 10th Details' },
    { value: 'educationDetails1Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Class 10th Details' },
    { value: 'educationDetails1Board', name: 'Board', fieldType: 'text', groupBy: 'Class 10th Details' }, // Guessing 'Board' or 'University' ?
    // data.json has 'educationDetails1University' which might be Board?
    // educationDetails1University label is "Education Details1 University"
    // "Last School Board" existed separately.
    // User asked for "School/College" and "Board" isn't explicitly in their list under 10th, 
    // but standard flow has Board. 
    // User list: School/College, Year, Total, Obtained, Percentage. NO BOARD mentioned for 10th/12th in request?
    // Wait, USER REQUEST:
    // Class 10th Details
    // School/College
    // Year of Passing
    // Total Marks
    // Marks Obtained
    // Percentage
    // IT DOES NOT LIST BOARD.
    // So I will OMIT Board to match request exactly.

    // Class 12th Details
    { value: 'educationDetails2School', name: 'School/College', fieldType: 'text', groupBy: 'Class 12th Details' },
    { value: 'educationDetails2PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Class 12th Details' },
    { value: 'educationDetails2MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Class 12th Details' },
    { value: 'educationDetails2ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Class 12th Details' },
    { value: 'educationDetails2Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Class 12th Details' },

    // Diploma Details
    { value: 'educationDetails3Class', name: 'Course', fieldType: 'text', groupBy: 'Diploma Details' }, // Mapping 'Class' to 'Course'
    { value: 'educationDetails3School', name: 'College/Institute/University', fieldType: 'text', groupBy: 'Diploma Details' },
    { value: 'educationDetails3PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Diploma Details' },
    { value: 'educationDetails3MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Diploma Details' },
    { value: 'educationDetails3ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Diploma Details' },
    { value: 'educationDetails3Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Diploma Details' },

    // Graduation Details
    { value: 'educationDetails4Class', name: 'Course', fieldType: 'text', groupBy: 'Graduation Details' },
    { value: 'educationDetails4School', name: 'College/Institute/University', fieldType: 'text', groupBy: 'Graduation Details' },
    { value: 'educationDetails4PassingYear', name: 'Year of Passing', fieldType: 'text', groupBy: 'Graduation Details' },
    { value: 'educationDetails4MaxMarks', name: 'Total Marks', fieldType: 'text', groupBy: 'Graduation Details' },
    { value: 'educationDetails4ObtainedMarks', name: 'Marks Obtained', fieldType: 'text', groupBy: 'Graduation Details' },
    { value: 'educationDetails4Percentage', name: 'Percentage', fieldType: 'text', groupBy: 'Graduation Details' },

    // Institute Info
    { value: 'qualifyingExamRollNo', name: 'Exam Roll No', fieldType: 'text', groupBy: 'Institute Info' },
    { value: 'qualifyingExamRank', name: 'Exam Rank', fieldType: 'text', groupBy: 'Institute Info' },
    { value: 'qualifyingExamPercentage', name: 'Exam Percentage', fieldType: 'text', groupBy: 'Institute Info' },
];
