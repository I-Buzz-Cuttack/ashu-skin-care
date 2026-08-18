import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import usePermission from '@hooks/usePermission';
import {
  inferActionFromLabel,
  inferResourceFromPath,
} from '@utils/actionPermission.utils';

const getButtonLabel = (button) =>
  [
    button.getAttribute('data-permission-label'),
    button.getAttribute('aria-label'),
    button.getAttribute('title'),
    button.textContent,
  ]
    .filter(Boolean)
    .join(' ');

const restoreButton = (button) => {
  if (button.dataset.permissionDisplay != null) {
    button.style.display = button.dataset.permissionDisplay;
    delete button.dataset.permissionDisplay;
  }

  if (button.dataset.permissionWasDisabled != null) {
    button.disabled = button.dataset.permissionWasDisabled === 'true';
    delete button.dataset.permissionWasDisabled;
  }

  button.removeAttribute('data-permission-hidden');
};

const restrictButton = (button, mode = 'hide') => {
  if (mode === 'disable') {
    if (button.dataset.permissionWasDisabled == null) {
      button.dataset.permissionWasDisabled = String(button.disabled);
    }
    button.disabled = true;
    button.setAttribute('data-permission-hidden', 'disabled');
    return;
  }

  if (button.dataset.permissionDisplay == null) {
    button.dataset.permissionDisplay = button.style.display || '';
  }
  button.style.display = 'none';
  button.setAttribute('data-permission-hidden', 'hidden');
};

export const useActionButtonPermissions = () => {
  const location = useLocation();
  const { can } = usePermission();

  useEffect(() => {
    const applyPermissions = () => {
      const buttons = Array.from(document.querySelectorAll('button'));

      buttons.forEach((button) => {
        if (button.dataset.noPermissionCheck === 'true') {
          restoreButton(button);
          return;
        }

        const resource =
          button.dataset.permissionResource ||
          inferResourceFromPath(location.pathname);
        const action =
          button.dataset.permissionAction ||
          inferActionFromLabel(getButtonLabel(button));

        if (!resource || !action) {
          restoreButton(button);
          return;
        }

        if (can(resource, action)) {
          restoreButton(button);
          return;
        }

        restrictButton(button, button.dataset.permissionMode);
      });
    };

    applyPermissions();

    const observer = new MutationObserver(applyPermissions);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      document
        .querySelectorAll('button[data-permission-hidden]')
        .forEach(restoreButton);
    };
  }, [can, location.pathname]);
};

export default useActionButtonPermissions;
