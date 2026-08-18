import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentRole } from '@store/slices/authSlice';
import { resolveRolePath } from '@utils/rolePath.utils';

export const useRoleNavigate = () => {
  const navigate = useNavigate();
  const role = useSelector(selectCurrentRole);

  return useCallback(
    (path, options) => {
      if (typeof path === 'number') return navigate(path);
      return navigate(resolveRolePath(path, role), options);
    },
    [navigate, role],
  );
};

export default useRoleNavigate;
