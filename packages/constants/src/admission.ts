// Admission Module Constants

// Search By Options
export const ADMISSION_SEARCH_BY_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'Application Number', value: 'applicationNumber' },
    { label: 'Father Name', value: 'fatherName' },
    { label: 'Phone', value: 'phone' },
    { label: 'Source Id', value: 'sourceId' }
] as const;

export const ADMISSION_LEADS_SEARCH_BY_OPTIONS = [
    { label: 'Name', value: 'name' },
    { label: 'Phone', value: 'phone' },
    { label: 'Application Number', value: 'applicationNumber' }
] as const;

// Pagination Options
export const ADMISSION_PAGE_SIZE_OPTIONS = [10, 25, 100] as const;
export const DEFAULT_ADMISSION_PAGE_SIZE = 10;

// Template Report Type
export const ADMISSION_REPORT_TYPE = 'admissionApplicationReport' as const;

// Fixed Table Columns (always present in table)
export const ADMISSION_FIXED_COLUMNS = ['position', 'action', 'currentStage'] as const;

// Date Filter Shortcuts
export const DATE_FILTER_SHORTCUTS = {
    CURRENT_DATE: 'currentDate',
    LAST_WEEK: 'lastWeek',
    LAST_MONTH: 'lastMonth',
    THIS_YEAR: 'thisYear'
} as const;

// Duplicate Fields Master — mirrors data.json → updateAdmissionFieldsList
// Used to configure which student fields are checked for duplicate admission entries.
export interface DuplicateCheckField {
    value: string;
    label: string;
    group: string;
}

export const DUPLICATE_CHECK_FIELDS: DuplicateCheckField[] = [
    // Personal Details
    { value: 'uid', label: 'UID Number', group: 'Personal Details' },
    { value: 'srn', label: 'SRN', group: 'Personal Details' },
    { value: 'pen', label: 'PEN', group: 'Personal Details' },
    { value: 'name', label: 'Student Name', group: 'Personal Details' },
    { value: 'dob', label: 'Date of Birth', group: 'Personal Details' },
    { value: 'phone', label: 'Phone', group: 'Personal Details' },
    { value: 'gender', label: 'Gender', group: 'Personal Details' },
    { value: 'bloodGroup', label: 'Blood Group', group: 'Personal Details' },
    { value: 'height', label: 'Height', group: 'Personal Details' },
    { value: 'weight', label: 'Weight', group: 'Personal Details' },
    { value: 'branchId', label: 'Branch Id', group: 'Personal Details' },
    { value: 'doa', label: 'Admission Date', group: 'Personal Details' },
    { value: 'identificationMark', label: 'Identification Mark', group: 'Personal Details' },
    { value: 'motherTongue', label: 'Mother Tongue', group: 'Personal Details' },
    { value: 'birthPlace', label: 'Birth Place', group: 'Personal Details' },
    { value: 'nationality', label: 'Nationality', group: 'Personal Details' },
    { value: 'religion', label: 'Religion', group: 'Personal Details' },
    { value: 'socialCategory', label: 'Social Category', group: 'Personal Details' },
    { value: 'caste', label: 'Caste', group: 'Personal Details' },
    { value: 'subCaste', label: 'Sub Caste', group: 'Personal Details' },
    { value: 'otherLanguages', label: 'Other Languages', group: 'Personal Details' },
    { value: 'medicalHistory', label: 'Medical History', group: 'Personal Details' },
    { value: 'bmi', label: 'BMI', group: 'Personal Details' },
    { value: 'leftVision', label: 'Left Vision', group: 'Personal Details' },
    { value: 'rightVision', label: 'Right Vision', group: 'Personal Details' },
    { value: 'colourVision', label: 'Colour Vision', group: 'Personal Details' },
    { value: 'leftGlasses', label: 'Left Glasses', group: 'Personal Details' },
    { value: 'rightGlasses', label: 'Right Glasses', group: 'Personal Details' },
    { value: 'oralHygiene', label: 'Oral Hygiene', group: 'Personal Details' },
    { value: 'disease', label: 'Disease', group: 'Personal Details' },
    { value: 'allergy', label: 'Allergy', group: 'Personal Details' },
    { value: 'currentMedication', label: 'Current Medication', group: 'Personal Details' },
    { value: 'batch', label: 'Batch', group: 'Personal Details' },
    { value: 'isLEET', label: 'Lateral Entry', group: 'Personal Details' },
    { value: 'lastSchool', label: 'Last School', group: 'Personal Details' },
    { value: 'lastSchoolBoard', label: 'Last School Board', group: 'Personal Details' },
    { value: 'passingOutCourse', label: 'Passing Out Course', group: 'Personal Details' },
    { value: 'percentageAchieved', label: 'Percentage Achieved', group: 'Personal Details' },
    // Address
    { value: 'address', label: 'Address', group: 'Address' },
    { value: 'city', label: 'City', group: 'Address' },
    { value: 'state', label: 'State', group: 'Address' },
    { value: 'country', label: 'Country', group: 'Address' },
    { value: 'pinCode', label: 'Pin Code', group: 'Address' },
    // Contact Details
    { value: 'correspondenceAddress', label: 'Correspondence Address', group: 'Contact Details' },
    { value: 'correspondenceCity', label: 'Correspondence City', group: 'Contact Details' },
    { value: 'correspondenceState', label: 'Correspondence State', group: 'Contact Details' },
    { value: 'correspondenceCountry', label: 'Correspondence Country', group: 'Contact Details' },
    { value: 'correspondencePinCode', label: 'Correspondence Pin Code', group: 'Contact Details' },
    // Parent Details
    { value: 'email', label: 'Email', group: 'Parent Details' },
    { value: 'fatherName', label: 'Father Name', group: 'Parent Details' },
    { value: 'fatherMobile', label: 'Father Mobile', group: 'Parent Details' },
    { value: 'fatherEmail', label: 'Father Email', group: 'Parent Details' },
    { value: 'fatherDOB', label: 'Father DOB', group: 'Parent Details' },
    { value: 'fatherUID', label: 'Father UID', group: 'Parent Details' },
    { value: 'fatherQualification', label: 'Father Qualification', group: 'Parent Details' },
    // Institute Info
    { value: 'qualifyingExamName', label: 'Qualifying Exam Name', group: 'Institute Info' },
    { value: 'qualifyingExamRollNo', label: 'Qualifying Exam Roll No', group: 'Institute Info' },
    { value: 'qualifyingExamRank1', label: 'Qualifying Exam Rank 1', group: 'Institute Info' },
    { value: 'qualifyingExamRank2', label: 'Qualifying Exam Rank 2', group: 'Institute Info' },
    { value: 'meritScore', label: 'Merit Score', group: 'Institute Info' },
];
