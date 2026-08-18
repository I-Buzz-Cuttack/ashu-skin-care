import PageHeader from '../../../../components/layout/PageHeader/PageHeader';
import { ROUTES } from '../../../../constants/routes';
import { useToast } from '../../../../hooks/useToast';
import PatientForm from '../components/PatientForm';
import { PATIENT_EMPTY_FORM } from '../constants/patient.constants';
import { usePatient } from '../../../../lib/patient/patientservice';
import useRoleNavigate from '../../../../hooks/useRoleNavigate';

const CreatePatientPage = () => {
  // const navigate = useNavigate();
  const navigate = useRoleNavigate();
  const toast = useToast();
  const { create, createLoading } = usePatient();

  const handleSubmit = async (values) => {
    try {
      // Form values received for create patient
      
      // Generate a unique UHID
      const generateUHID = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `MED-${year}${month}-${random}`;
      };
      
      const formattedDob = values.dob ? new Date(values.dob).toISOString() : null;
      // Formatted DOB prepared
      
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        dob: formattedDob,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        bloodGroup: values.bloodGroup,
        address: values.address,
        city: values.city || null,
        state: values.state || null,
        adharNo: values.adharNo || null,
        insuranceProvider: values.insuranceProvider || null,
        insurancePolicyNo: values.insurancePolicyNo || null,
        emergencyContactName: values.emergencyContactName || null,
        emergencyContactPhone: values.emergencyContactPhone || null,
        emergencyContactRelation: values.emergencyContactRelation || null,
        referredBy: values.referredBy || null,
        occupation: values.occupation || null,
        nationality: values.nationality || null,
        photo: values.photo || null,
        uhid: generateUHID(),
      };
      
      // Final payload prepared for patient create
      await create(payload);
      // API call successful
      toast.success('Patient registered successfully!');
      navigate(ROUTES.SUPER_ADMIN.PATIENTS);
    } catch (error) {
      console.error('❌ CREATE - Error object:', error);
      console.error('❌ CREATE - Error message:', error?.message);
      console.error('❌ CREATE - Error data:', error?.data);
      toast.error(error?.data?.message || 'Failed to create patient');
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Create Patient"
        subtitle="Register a new patient with full intake details"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Patients' }, { label: 'Create' }]}
      />

      <div className="card p-6">
        <PatientForm
          initialValues={PATIENT_EMPTY_FORM}
          submitLabel="Save Patient"
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.SUPER_ADMIN.PATIENTS)}
          isSubmitting={createLoading}
        />
      </div>
    </div>
  );
};

export default CreatePatientPage;
