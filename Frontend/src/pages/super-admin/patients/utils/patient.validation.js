// const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const phonePattern = /^\d{10}$/;

// export const validatePatient = (values) => {
//   const errors = {};

//   if (!values.name?.trim()) errors.name = 'Name is required';

//   if (!values.ageYears) {
//     errors.ageYears = 'Age is required';
//   }

//   if (values.email && !emailPattern.test(values.email)) {
//     errors.email = 'Enter a valid email address';
//   }

//   if (values.phone && !phonePattern.test(String(values.phone).trim())) {
//     errors.phone = 'Phone must be exactly 10 digits';
//   }

//   if (values.patientPhoto && values.patientPhoto.type && !values.patientPhoto.type.startsWith('image/')) {
//     errors.patientPhoto = 'Only image files are allowed';
//   }

//   // ✅ FIXED: Changed 'form' to 'values'
//   if (!values.hospitalId || values.hospitalId.trim() === '') {
//     errors.hospitalId = 'Hospital ID is required';
//   }

//   return errors;
// };

// export const calculateAgeFromDob = (dateOfBirth) => {
//   if (!dateOfBirth) return { years: '', months: '', days: '' };

//   const birthDate = new Date(dateOfBirth);
//   if (Number.isNaN(birthDate.getTime())) return { years: '', months: '', days: '' };

//   const today = new Date();
//   let years = today.getFullYear() - birthDate.getFullYear();
//   let months = today.getMonth() - birthDate.getMonth();
//   let days = today.getDate() - birthDate.getDate();

//   if (days < 0) {
//     const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
//     days += previousMonth.getDate();
//     months -= 1;
//   }

//   if (months < 0) {
//     months += 12;
//     years -= 1;
//   }

//   return {
//     years: String(Math.max(years, 0)),
//     months: String(Math.max(months, 0)),
//     days: String(Math.max(days, 0)),
//   };
// };




const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

export const validatePatient = (values) => {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Name is required';

  if (!values.ageYears && !values.dob) {
    errors.ageYears = 'Age or Date of Birth is required';
  }

  if (values.email && !emailPattern.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (values.phone && !phonePattern.test(String(values.phone).trim())) {
    errors.phone = 'Phone must be exactly 10 digits';
  }

  if (values.patientPhoto && values.patientPhoto.type && !values.patientPhoto.type.startsWith('image/')) {
    errors.patientPhoto = 'Only image files are allowed';
  }

  return errors;
};

export const calculateAgeFromDob = (dateOfBirth) => {
  if (!dateOfBirth) return { years: '', months: '', days: '' };

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return { years: '', months: '', days: '' };

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years: String(Math.max(years, 0)),
    months: String(Math.max(months, 0)),
    days: String(Math.max(days, 0)),
  };
};


export const formatPatientAge = (patient) => {
  const years = patient?.ageYears ? String(patient.ageYears).trim() : '';
  const months = patient?.ageMonths ? String(patient.ageMonths).trim() : '';
  const days = patient?.ageDays ? String(patient.ageDays).trim() : '';

  const parts = [];

  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}m`);
  if (days) parts.push(`${days}d`);

  if (parts.length) return parts.join(' ');

  if (patient?.dob) {
    const dob = new Date(patient.dob);
    if (!Number.isNaN(dob.getTime())) {
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      const calculatedYears = Math.abs(ageDate.getUTCFullYear() - 1970);
      return `${calculatedYears}y`;
    }
  }

  return '-';
};
