export const PATIENT_GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const PATIENT_MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export const PATIENT_TPA_OPTIONS = [
  { value: '', label: 'Select Insurance Provider' },
  { value: 'Medi Assist', label: 'Medi Assist' },
  { value: 'Star Health', label: 'Star Health' },
  { value: 'FHPL', label: 'FHPL' },
  { value: 'Paramount', label: 'Paramount' },
  { value: 'Raksha', label: 'Raksha' },
];

export const PATIENT_BLOOD_OPTIONS = [
  { value: 'A_POS', label: 'A+' },
  { value: 'A_NEG', label: 'A-' },
  { value: 'B_POS', label: 'B+' },
  { value: 'B_NEG', label: 'B-' },
  { value: 'O_POS', label: 'O+' },
  { value: 'O_NEG', label: 'O-' },
  { value: 'AB_POS', label: 'AB+' },
  { value: 'AB_NEG', label: 'AB-' },
];

export const PATIENT_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export const PATIENT_EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  dob: '',  // Changed from dateOfBirth to dob
  gender: 'male',
  maritalStatus: 'single',
  bloodGroup: '',  // Changed from blood to bloodGroup
  address: '',
  city: '',
  state: '',
  adharNo: '',  // Changed from nationalIdentificationNumber
  insuranceProvider: '',  // Changed from tpa
  insurancePolicyNo: '',  // Changed from tpaId
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  referredBy: '',
  occupation: '',
  nationality: '',
  // status: 'Active',
};
