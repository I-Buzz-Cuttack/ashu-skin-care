import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeInfo,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Droplets,
  Fingerprint,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import Avatar from '../../../../components/ui/Avatar/Avatar';
import Badge from '../../../../components/ui/Badge/Badge';
import Button from '../../../../components/ui/Button/Button';
import PageHeader from '../../../../components/layout/PageHeader/PageHeader';
import { ROUTES } from '../../../../constants/routes';
import { usePatient } from '../../../../lib/patient/patientservice';

// Formatter functions
const formatBloodGroup = (bloodGroup) => {
  const map = {
    'A_POS': 'A+', 'A_NEG': 'A-', 'B_POS': 'B+', 'B_NEG': 'B-',
    'O_POS': 'O+', 'O_NEG': 'O-', 'AB_POS': 'AB+', 'AB_NEG': 'AB-',
  };
  return map[bloodGroup] || bloodGroup || '-';
};

const formatGender = (gender) => {
  if (!gender) return '-';
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const formatMaritalStatus = (status) => {
  const map = {
    'single': 'Single', 'married': 'Married',
    'divorced': 'Divorced', 'widowed': 'Widowed',
  };
  return map[status] || status || '-';
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const InfoItem = ({ icon, label, value }) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/30 p-4">
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
      {icon}
      <span>{label}</span>
    </div>
    <p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{value || '-'}</p>
  </div>
);

const SectionCard = ({ title, subtitle, icon, children, className = '' }) => (
  <section className={['rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/40 p-5 shadow-sm', className].join(' ')}>
    <div className="flex items-start gap-3 mb-4">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{subtitle}</p> : null}
      </div>
    </div>
    {children}
  </section>
);

const ViewPatientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { byIdQuery } = usePatient({ id });
  const { data: patient, isLoading, error } = byIdQuery;

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-surface-500">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="page-container">
        <PageHeader title="Patient Not Found" subtitle="The requested patient record does not exist." />
        <div className="mt-4">
          <Button leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.SUPER_ADMIN.PATIENTS)}>
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Patient Details"
        subtitle="View complete patient intake details"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Patients' }, { label: patient.name }]}
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(ROUTES.SUPER_ADMIN.PATIENTS)}
            >
              Back
            </Button>
            <Button onClick={() => navigate(ROUTES.SUPER_ADMIN.PATIENT_EDIT.replace(':id', patient.id))}>
              Edit Patient
            </Button>
          </div>
        }
      />

      <div className="space-y-5">
        {/* Hero Section */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/40 p-5 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {patient.photo ? (
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="h-16 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700/60"
                />
              ) : (
                <Avatar name={patient.name} size="lg" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{patient.name}</h2>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  UHID: {patient.uhid} | Registered on {formatDate(patient.registeredAt)}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <ClipboardList size={12} />
                    UHID: {patient.uhid}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Droplets size={12} />
                    Blood: {formatBloodGroup(patient.bloodGroup)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Basic Information */}
          <SectionCard
            title="Basic Information"
            subtitle="Core identity details for the patient record."
            icon={<User size={18} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={<User size={16} />} label="Name" value={patient.name} />
              <InfoItem icon={<BadgeInfo size={16} />} label="Gender" value={formatGender(patient.gender)} />
              <InfoItem icon={<CalendarDays size={16} />} label="Date of Birth" value={formatDate(patient.dob)} />
              <InfoItem icon={<Droplets size={16} />} label="Blood Group" value={formatBloodGroup(patient.bloodGroup)} />
              <InfoItem icon={<BadgeInfo size={16} />} label="Marital Status" value={formatMaritalStatus(patient.maritalStatus)} />
              <InfoItem icon={<ClipboardList size={16} />} label="Occupation" value={patient.occupation} />
              <InfoItem icon={<ClipboardList size={16} />} label="Nationality" value={patient.nationality} />
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard
            title="Contact Information"
            subtitle="Primary and alternate communication numbers."
            icon={<Phone size={18} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={<Phone size={16} />} label="Phone" value={patient.phone} />
              <InfoItem icon={<Mail size={16} />} label="Email" value={patient.email} />
              <InfoItem icon={<MapPin size={16} />} label="Address" value={patient.address} />
              <InfoItem icon={<MapPin size={16} />} label="City" value={patient.city} />
              <InfoItem icon={<MapPin size={16} />} label="State" value={patient.state} />
            </div>
          </SectionCard>

          {/* Medical & Insurance */}
          <SectionCard
            title="Medical & Insurance"
            subtitle="Insurance and medical information."
            icon={<ShieldCheck size={18} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={<ShieldCheck size={16} />} label="Insurance Provider" value={patient.insuranceProvider} />
              <InfoItem icon={<ClipboardList size={16} />} label="Policy Number" value={patient.insurancePolicyNo} />
            </div>
          </SectionCard>

          {/* Emergency Contact & Identification */}
          <SectionCard
            title="Emergency & Identification"
            subtitle="Emergency contacts and identification details."
            icon={<Fingerprint size={18} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={<User size={16} />} label="Emergency Contact" value={patient.emergencyContactName} />
              <InfoItem icon={<Phone size={16} />} label="Emergency Phone" value={patient.emergencyContactPhone} />
              <InfoItem icon={<BadgeInfo size={16} />} label="Emergency Relation" value={patient.emergencyContactRelation} />
              <InfoItem icon={<Fingerprint size={16} />} label="Aadhar Number" value={patient.adharNo} />
              <InfoItem icon={<User size={16} />} label="Referred By" value={patient.referredBy} />
              <InfoItem icon={<User size={16} />} label="Created By" value={patient.creator?.name} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientPage;
