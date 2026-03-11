// Stage fields available for Admission Stage Setup configuration.
// Mirrors Angular's data.json → displayStageFields list.
export interface StageFieldOption {
    value: string;
    name: string;
    groupBy: string;
    fieldType: string;
}

export const DISPLAY_STAGE_FIELDS: StageFieldOption[] = [
    // ── Personal Details ──────────────────────────────────────────────────────
    { value: 'name',               name: 'Student Name',          groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'dob',                name: 'Date of Birth',         groupBy: 'Personal Details', fieldType: 'date' },
    { value: 'gender',             name: 'Gender',                groupBy: 'Personal Details', fieldType: 'selectBox' },
    { value: 'uid',                name: 'UID Number',            groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'srn',                name: 'SRN',                   groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'pen',                name: 'PEN',                   groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'bloodGroup',         name: 'Blood Group',           groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'height',             name: 'Height',                groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'weight',             name: 'Weight',                groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'batch',              name: 'Batch',                 groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'section',            name: 'Section',               groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'oldNew',             name: 'Old/New',               groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'category',           name: 'Category',              groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'identificationMark', name: 'Identification Mark',   groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'motherTongue',       name: 'Mother Tongue',         groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'birthPlace',         name: 'Birth Place',           groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'nationality',        name: 'Nationality',           groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'religion',           name: 'Religion',              groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'socialCategory',     name: 'Social Category',       groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'caste',              name: 'Caste',                 groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'subCaste',           name: 'Sub Caste',             groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'otherLanguages',     name: 'Other Languages',       groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'medicalHistory',     name: 'Medical History',       groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'bmi',                name: 'BMI',                   groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'leftVision',         name: 'Left Vision',           groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'rightVision',        name: 'Right Vision',          groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'colourVision',       name: 'Colour Vision',         groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'leftGlasses',        name: 'Left Glasses',          groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'rightGlasses',       name: 'Right Glasses',         groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'oralHygiene',        name: 'Oral Hygiene',          groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'disease',            name: 'Disease',               groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'allergy',            name: 'Allergy',               groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'currentMedication',  name: 'Current Medication',    groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'phone',              name: 'Phone',                 groupBy: 'Personal Details', fieldType: 'text' },
    { value: 'email',              name: 'Email',                 groupBy: 'Personal Details', fieldType: 'text' },

    // ── Address ───────────────────────────────────────────────────────────────
    { value: 'address', name: 'Address', groupBy: 'Address', fieldType: 'text' },
    { value: 'city',    name: 'City',    groupBy: 'Address', fieldType: 'text' },
    { value: 'state',   name: 'State',   groupBy: 'Address', fieldType: 'text' },
    { value: 'pincode', name: 'Pincode', groupBy: 'Address', fieldType: 'text' },

    // ── Parent Details ────────────────────────────────────────────────────────
    { value: 'fatherName',       name: 'Father Name',       groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'fatherOccupation', name: 'Father Occupation', groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'fatherPhone',      name: 'Father Phone',      groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'fatherEmail',      name: 'Father Email',      groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'motherName',       name: 'Mother Name',       groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'motherOccupation', name: 'Mother Occupation', groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'motherPhone',      name: 'Mother Phone',      groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'motherEmail',      name: 'Mother Email',      groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'guardianName',     name: 'Guardian Name',     groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'guardianPhone',    name: 'Guardian Phone',    groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'guardianEmail',    name: 'Guardian Email',    groupBy: 'Parent Details', fieldType: 'text' },
    { value: 'annualIncome',     name: 'Annual Income',     groupBy: 'Parent Details', fieldType: 'text' },

    // ── Admission Info ────────────────────────────────────────────────────────
    { value: 'source',     name: 'Source',     groupBy: 'Admission Info', fieldType: 'text' },
    { value: 'reference1', name: 'Reference 1', groupBy: 'Admission Info', fieldType: 'text' },
    { value: 'reference2', name: 'Reference 2', groupBy: 'Admission Info', fieldType: 'text' },

    // ── Education ─────────────────────────────────────────────────────────────
    { value: 'educationDetails1Percentage', name: 'Education 1 Percentage', groupBy: 'Education', fieldType: 'text' },
    { value: 'educationDetails2Percentage', name: 'Education 2 Percentage', groupBy: 'Education', fieldType: 'text' },
    { value: 'educationDetails3Percentage', name: 'Education 3 Percentage', groupBy: 'Education', fieldType: 'text' },

    // ── Institute Info ────────────────────────────────────────────────────────
    { value: 'qualifyingSubject1Name',            name: 'Qualifying Subject1 Name',             groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject1TotalMarks',       name: 'Qualifying Subject1 Total Marks',      groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject1ObtainedMarks',    name: 'Qualifying Subject1 Obtained Marks',   groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject2Name',             name: 'Qualifying Subject2 Name',             groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject2TotalMarks',       name: 'Qualifying Subject2 Total Marks',      groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject2ObtainedMarks',    name: 'Qualifying Subject2 Obtained Marks',   groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject3Name',             name: 'Qualifying Subject3 Name',             groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject3TotalMarks',       name: 'Qualifying Subject3 Total Marks',      groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject3ObtainedMarks',    name: 'Qualifying Subject3 Obtained Marks',   groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject4Name',             name: 'Qualifying Subject4 Name',             groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject4TotalMarks',       name: 'Qualifying Subject4 Total Marks',      groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject4ObtainedMarks',    name: 'Qualifying Subject4 Obtained Marks',   groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject5Name',             name: 'Qualifying Subject5 Name',             groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject5TotalMarks',       name: 'Qualifying Subject5 Total Marks',      groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'qualifyingSubject5ObtainedMarks',    name: 'Qualifying Subject5 Obtained Marks',   groupBy: 'Institute Info', fieldType: 'text' },
    { value: 'subjectCombinationName',             name: 'Subject Combination Name',             groupBy: 'Institute Info', fieldType: 'text' },

    // ── Documents ─────────────────────────────────────────────────────────────
    { value: 'photo',                      name: 'Photo',                        groupBy: 'Documents', fieldType: 'file' },
    { value: 'fatherPhoto',                name: 'Father Photo',                 groupBy: 'Documents', fieldType: 'file' },
    { value: 'motherPhoto',                name: 'Mother Photo',                 groupBy: 'Documents', fieldType: 'file' },
    { value: 'guardianPhoto',              name: 'Guardian Photo',               groupBy: 'Documents', fieldType: 'file' },
    { value: 'aadhaarCardFront',           name: 'Aadhaar Card Front',           groupBy: 'Documents', fieldType: 'file' },
    { value: 'aadhaarCardBack',            name: 'Aadhaar Card Back',            groupBy: 'Documents', fieldType: 'file' },
    { value: 'casteCertificate',           name: 'Caste Certificate',            groupBy: 'Documents', fieldType: 'file' },
    { value: 'incomeCertificate',          name: 'Income Certificate',           groupBy: 'Documents', fieldType: 'file' },
    { value: 'gapYearCertificate',         name: 'Gap Year Certificate',         groupBy: 'Documents', fieldType: 'file' },
    { value: 'migrationCertificate',       name: 'Migration Certificate',        groupBy: 'Documents', fieldType: 'file' },
    { value: 'characterCertificate',       name: 'Character Certificate',        groupBy: 'Documents', fieldType: 'file' },
    { value: 'dobCertificate',             name: 'DOB Certificate',              groupBy: 'Documents', fieldType: 'file' },
    { value: 'educationDetails1MarkSheet', name: 'Education 1 Mark Sheet',       groupBy: 'Documents', fieldType: 'file' },
    { value: 'educationDetails2MarkSheet', name: 'Education 2 Mark Sheet',       groupBy: 'Documents', fieldType: 'file' },
    { value: 'educationDetails3MarkSheet', name: 'Education 3 Mark Sheet',       groupBy: 'Documents', fieldType: 'file' },
    { value: 'customDoc1',                 name: 'Custom Doc 1',                 groupBy: 'Documents', fieldType: 'file' },
    { value: 'customDoc2',                 name: 'Custom Doc 2',                 groupBy: 'Documents', fieldType: 'file' },
    { value: 'customDoc3',                 name: 'Custom Doc 3',                 groupBy: 'Documents', fieldType: 'file' },
    { value: 'customDoc4',                 name: 'Custom Doc 4',                 groupBy: 'Documents', fieldType: 'file' },
    { value: 'customDoc5',                 name: 'Custom Doc 5',                 groupBy: 'Documents', fieldType: 'file' },
    { value: 'applicationPdf',             name: 'Application PDF',              groupBy: 'Documents', fieldType: 'file' },
    { value: 'familyId',                   name: 'Family ID',                    groupBy: 'Documents', fieldType: 'file' },
    { value: 'fatherAadhaarCard',          name: 'Father Aadhaar Card',          groupBy: 'Documents', fieldType: 'file' },
    { value: 'motherAadhaarCard',          name: 'Mother Aadhaar Card',          groupBy: 'Documents', fieldType: 'file' },

    // ── Lead Scores ───────────────────────────────────────────────────────────
    { value: 'leadScore1',  name: 'Lead Score 1',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore2',  name: 'Lead Score 2',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore3',  name: 'Lead Score 3',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore4',  name: 'Lead Score 4',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore5',  name: 'Lead Score 5',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore6',  name: 'Lead Score 6',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore7',  name: 'Lead Score 7',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore8',  name: 'Lead Score 8',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore9',  name: 'Lead Score 9',  groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'leadScore10', name: 'Lead Score 10', groupBy: 'Lead Scores', fieldType: 'file' },
    { value: 'total',       name: 'Total',          groupBy: 'Lead Scores', fieldType: 'file' },
];
