
// import { useNavigate, useParams } from 'react-router-dom';
// import PageHeader from '../../../../components/layout/PageHeader/PageHeader';
// import { ROUTES } from '../../../../constants/routes';
// import { useToast } from '../../../../hooks/useToast';
// import PatientForm from '../components/PatientForm';
// import { PATIENT_EMPTY_FORM } from '../constants/patient.constants';
// import { usePatient } from '../../../../lib/patient/patientservice';

// const EditPatientPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const toast = useToast();
  
//   const { byIdQuery, update, updateLoading } = usePatient({ id });
//   const { data: patient, isLoading, error } = byIdQuery;

//   // Transform backend data to frontend format
//   const initialValues = patient ? {
//     name: patient.name || '',
//     email: patient.email || '',
//     phone: patient.phone || '',
//     dob: patient.dob ? patient.dob.split('T')[0] : '',
//     gender: patient.gender || 'male',
//     maritalStatus: patient.maritalStatus || 'single',
//     bloodGroup: patient.bloodGroup || '',
//     address: patient.address || '',
//     city: patient.city || '',
//     state: patient.state || '',
//     adharNo: patient.adharNo || '',
//     insuranceProvider: patient.insuranceProvider || '',
//     insurancePolicyNo: patient.insurancePolicyNo || '',
//     emergencyContactName: patient.emergencyContactName || '',
//     emergencyContactPhone: patient.emergencyContactPhone || '',
//     emergencyContactRelation: patient.emergencyContactRelation || '',
//     referredBy: patient.referredBy || '',
//     occupation: patient.occupation || '',
//     nationality: patient.nationality || '',
//     hospitalId: patient.hospitalId || '',
//   } : PATIENT_EMPTY_FORM;

//   console.log('🔵 EDIT - Initial values loaded:', initialValues);
//   console.log('🔵 EDIT - Patient ID from URL:', id);

//   if (isLoading) {
//     return (
//       <div className="page-container flex items-center justify-center py-20">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//           <p className="mt-4 text-surface-500">Loading patient data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !patient) {
//     return (
//       <div className="page-container">
//         <PageHeader title="Patient Not Found" subtitle="The requested patient record does not exist." />
//         <div className="mt-4">
//           <button onClick={() => navigate(ROUTES.SUPER_ADMIN.PATIENTS)} className="btn btn-primary">
//             Back to Patients
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const handleSubmit = async (values) => {
//     try {
//       console.log('🔵 EDIT - Step 1: Form values received:', JSON.stringify(values, null, 2));
//       console.log('🔵 EDIT - Step 2: Patient ID:', id);
      
//       const formattedDob = values.dob ? new Date(values.dob).toISOString() : null;
//       console.log('🔵 EDIT - Step 3: Formatted DOB:', formattedDob);
      
//       // Validate required fields
//       if (!values.hospitalId || values.hospitalId === '') {
//         console.error('❌ EDIT ERROR: hospitalId is empty!');
//         toast.error('Please select a hospital');
//         return;
//       }
      
//       const payload = {
//         id,
//         name: values.name,
//         email: values.email,
//         phone: values.phone,
//         dob: formattedDob,
//         gender: values.gender,
//         maritalStatus: values.maritalStatus,
//         bloodGroup: values.bloodGroup,
//         address: values.address,
//         city: values.city,
//         state: values.state,
//         adharNo: values.adharNo || null,
//         insuranceProvider: values.insuranceProvider || null,
//         insurancePolicyNo: values.insurancePolicyNo || null,
//         emergencyContactName: values.emergencyContactName || null,
//         emergencyContactPhone: values.emergencyContactPhone || null,
//         emergencyContactRelation: values.emergencyContactRelation || null,
//         referredBy: values.referredBy || null,
//         occupation: values.occupation || null,
//         nationality: values.nationality || null,
//         hospitalId: values.hospitalId,
//       };
      
//       console.log('🔵 EDIT - Step 4: Final payload:', JSON.stringify(payload, null, 2));
//       console.log('🔵 EDIT - Step 5: hospitalId value:', values.hospitalId);
      
//       await update(payload);
//       console.log('🔵 EDIT - Step 6: API call successful!');
//       toast.success('Patient updated successfully!');
//       navigate(ROUTES.SUPER_ADMIN.PATIENTS);
//     } catch (error) {
//       console.error('❌ EDIT - Error object:', error);
//       console.error('❌ EDIT - Error message:', error?.message);
//       console.error('❌ EDIT - Error data:', error?.data);
//       toast.error(error?.data?.message || 'Failed to update patient');
//     }
//   };

//   return (
//     <div className="page-container">
//       <PageHeader
//         title="Update Patient"
//         subtitle="Update patient intake details"
//         breadcrumbs={[{ label: 'Super Admin' }, { label: 'Patients' }, { label: 'Edit' }]}
//       />

//       <div className="card p-6">
//         <PatientForm
//           initialValues={initialValues}
//           submitLabel="Update Patient Details"
//           onSubmit={handleSubmit}
//           onCancel={() => navigate(ROUTES.SUPER_ADMIN.PATIENTS)}
//           isSubmitting={updateLoading}
//         />
//       </div>
//     </div>
//   );
// };

// export default EditPatientPage;





import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader/PageHeader';
import { ROUTES } from '../../../../constants/routes';
import { useToast } from '../../../../hooks/useToast';
import { calculateAgeFromDob } from '../utils/patient.validation';
import PatientForm from '../components/PatientForm';
import { PATIENT_EMPTY_FORM } from '../constants/patient.constants';
import { usePatient } from '../../../../lib/patient/patientservice';

const EditPatientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { byIdQuery, update, updateLoading } = usePatient({ id });
  const { data: patient, isLoading, error } = byIdQuery;

  // const deriveAge = (p) => {
  //   if (p.ageYears !== undefined && p.ageYears !== null && p.ageYears !== '') {
  //     return {
  //       ageYears: String(p.ageYears),
  //       ageMonths: String(p.ageMonths || 0),
  //       ageDays: String(p.ageDays || 0),
  //     };
  //   }
  //   if (p.dob) return calculateAgeFromDob(p.dob.split('T')[0]);
  //   return { ageYears: '', ageMonths: '', ageDays: '' };
  // };

  const deriveAge = (p) => {
    if (p.dob) {
      const { years, months, days } = calculateAgeFromDob(p.dob.split('T')[0]);
      return {
        ageYears: years,
        ageMonths: months,
        ageDays: days,
      };
    }
    return { ageYears: '', ageMonths: '', ageDays: '' };
  };

  const initialValues = patient ? {
    name: patient.name || '',
    email: patient.email || '',
    phone: patient.phone || '',
    dob: patient.dob ? patient.dob.split('T')[0] : '',
    gender: patient.gender || 'male',
    maritalStatus: patient.maritalStatus || 'single',
    bloodGroup: patient.bloodGroup || '',
    address: patient.address || '',
    city: patient.city || '',
    state: patient.state || '',
    adharNo: patient.adharNo || '',
    insuranceProvider: patient.insuranceProvider || '',
    insurancePolicyNo: patient.insurancePolicyNo || '',
    emergencyContactName: patient.emergencyContactName || '',
    emergencyContactPhone: patient.emergencyContactPhone || '',
    emergencyContactRelation: patient.emergencyContactRelation || '',
    referredBy: patient.referredBy || '',
    occupation: patient.occupation || '',
    nationality: patient.nationality || '',
    patientPhotoPreview: patient.photo || '',
    ...deriveAge(patient),
  } : PATIENT_EMPTY_FORM;

  // Initial values loaded for edit patient
  // Patient ID: id

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-surface-500">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="page-container">
        <PageHeader title="Patient Not Found" subtitle="The requested patient record does not exist." />
        <div className="mt-4">
          <button onClick={() => navigate(ROUTES.SUPER_ADMIN.PATIENTS)} className="btn btn-primary">
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values) => {
    try {
      // Form values received for patient update
      // Patient ID: id
      
      const formattedDob = values.dob ? new Date(values.dob).toISOString() : null;
      // Formatted DOB prepared
      
      // const payload = {
      //   id,
      //   name: values.name,
      //   email: values.email,
      //   phone: values.phone,
      //   dob: formattedDob,
      //   gender: values.gender,
      //   maritalStatus: values.maritalStatus,
      //   bloodGroup: values.bloodGroup,
      //   address: values.address,
      //   city: values.city,
      //   state: values.state,
      //   adharNo: values.adharNo || null,
      //   insuranceProvider: values.insuranceProvider || null,
      //   insurancePolicyNo: values.insurancePolicyNo || null,
      //   emergencyContactName: values.emergencyContactName || null,
      //   emergencyContactPhone: values.emergencyContactPhone || null,
      //   emergencyContactRelation: values.emergencyContactRelation || null,
      //   referredBy: values.referredBy || null,
      //   occupation: values.occupation || null,
      //   nationality: values.nationality || null,
      //   hospitalId: values.hospitalId,
      //   ageYears: values.ageYears || null,
      //   ageMonths: values.ageMonths || null,
      //   ageDays: values.ageDays || null,
      // };
      
      const payload = {
        id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        dob: formattedDob,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        bloodGroup: values.bloodGroup,
        address: values.address,
        city: values.city,
        state: values.state,
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
      };

      // Final payload prepared for update
      
      await update(payload);
      // API call successful
      toast.success('Patient updated successfully!');
      navigate(ROUTES.SUPER_ADMIN.PATIENTS);
    } catch (error) {
      console.error('❌ EDIT - Error object:', error);
      console.error('❌ EDIT - Error message:', error?.message);
      console.error('❌ EDIT - Error data:', error?.data);
      toast.error(error?.data?.message || 'Failed to update patient');
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Update Patient"
        subtitle="Update patient intake details"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Patients' }, { label: 'Edit' }]}
      />

      <div className="card p-6">
        <PatientForm
          initialValues={initialValues}
          submitLabel="Update Patient Details"
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.SUPER_ADMIN.PATIENTS)}
          isSubmitting={updateLoading}
        />
      </div>
    </div>
  );
};

export default EditPatientPage;
