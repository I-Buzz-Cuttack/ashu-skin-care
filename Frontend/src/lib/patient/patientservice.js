import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/notificationSlice';
import {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetPatientByIdQuery,
} from '../../store/api/patientApi/patient';

export const usePatient = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetPatientsQuery(params, {
    refetchOnMountOrArgChange: true,
  });
  
  const byIdQuery = useGetPatientByIdQuery(params?.id, {
    skip: !params?.id,
  });

  const [createPatientMutation, { isLoading: createLoading }] =
    useCreatePatientMutation();

  const [updatePatientMutation, { isLoading: updateLoading }] =
    useUpdatePatientMutation();

  const [deletePatientMutation, { isLoading: deleteLoading }] =
    useDeletePatientMutation();

  const create = async (body) => {
    try {
      // Remove fields that backend doesn't accept
      const { updatedAt, status, createdAt, registeredAt, uhid, id, ...cleanBody } = body;
      
      const res = await createPatientMutation(cleanBody).unwrap();
      dispatch(addToast({ type: 'success', message: 'Patient created successfully.' }));
      return res;
    } catch (error) {
      console.error('Create error:', error);
      dispatch(addToast({ 
        type: 'error', 
        message: error?.data?.message || 'Failed to create patient' 
      }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      // Remove fields that backend doesn't accept
      const { updatedAt, status, createdAt, registeredAt, uhid, ...cleanPayload } = payload;
      
      const res = await updatePatientMutation(cleanPayload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Patient updated successfully.' }));
      return res;
    } catch (error) {
      console.error('Update error:', error);
      dispatch(addToast({ 
        type: 'error', 
        message: error?.data?.message || 'Failed to update patient' 
      }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deletePatientMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Patient deleted successfully.' }));
    } catch (error) {
      console.error('Delete error:', error);
      dispatch(addToast({ 
        type: 'error', 
        message: error?.data?.message || 'Failed to delete patient' 
      }));
      throw error;
    }
  };

  const removeMultiple = async (ids) => {
    try {
      await Promise.all(ids.map(id => deletePatientMutation(id).unwrap()));
      dispatch(addToast({ 
        type: 'success', 
        message: `${ids.length} patient(s) deleted successfully.` 
      }));
    } catch (error) {
      console.error('Bulk delete error:', error);
      dispatch(addToast({ 
        type: 'error', 
        message: error?.data?.message || 'Failed to delete patients' 
      }));
      throw error;
    }
  };

  return {
    listQuery,
    byIdQuery,
    create,
    update,
    remove,
    removeMultiple,
    createLoading,
    updateLoading,
    deleteLoading,
  };
};