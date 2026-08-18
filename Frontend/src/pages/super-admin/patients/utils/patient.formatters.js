
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