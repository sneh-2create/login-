export interface DocumentConfig {
  key: string;
  label: string;
  required?: boolean;
}

export const STUDENT_ADMISSION_UPLOAD_DOCUMENT_LIST: DocumentConfig[] = [
  { key: 'photo', label: 'Student Photo' },
  { key: 'aadhaarCardFront', label: 'Aadhaar Card Front' },
  { key: 'aadhaarCardBack', label: 'Aadhaar Card Back' },
  { key: 'dobCertificate', label: 'DOB Certificate' },
  { key: 'fatherPhoto', label: 'Father Photo' },
  { key: 'motherPhoto', label: 'Mother Photo' },
  { key: 'fatherAadhaarCard', label: 'Father Aadhaar Card' },
  { key: 'motherAadhaarCard', label: 'Mother Aadhaar Card' },
  { key: 'familyId', label: 'Family ID' },
  { key: 'migrationCertificate', label: 'Migration Certificate' },
  { key: 'characterCertificate', label: 'Character Certificate' },
  { key: 'educationDetails1MarkSheet', label: 'Education Details 1 Mark Sheet' },
  { key: 'educationDetails2MarkSheet', label: 'Education Details 2 Mark Sheet' },
  { key: 'educationDetails3MarkSheet', label: 'Education Details 3 Mark Sheet' },
  { key: 'gapYearCertificate', label: 'Gap Year Certificate' },
  { key: 'incomeCertificate', label: 'Income Certificate' },
  { key: 'casteCertificate', label: 'Caste Certificate' },
  { key: 'customDoc1', label: 'Custom Document 1' },
  { key: 'customDoc2', label: 'Custom Document 2' },
  { key: 'customDoc3', label: 'Custom Document 3' },
  { key: 'customDoc4', label: 'Custom Document 4' },
  { key: 'customDoc5', label: 'Custom Document 5' },
  { key: 'applicationPdf', label: 'Application PDF' },
];
