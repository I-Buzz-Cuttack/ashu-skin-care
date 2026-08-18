import usePermission from '@hooks/usePermission';

/**
 * Hides children if user lacks the permission.
 *
 * <CanDo resource="patient" action="create">
 *   <Button>Add Patient</Button>
 * </CanDo>
 */
const CanDo = ({ resource, action = 'create', fallback = null, children }) => {
  const { can } = usePermission();
  return can(resource, action) ? children : fallback;
};

export default CanDo;