export const filterSidebarItems = (
  items = [],
  {
    role = null,
    menuAccess = null,
    canAccess = null,
  } = {}
) =>
  items
    .map((item) => {
      const allowedRoles = item.allowedRoles || [];
      const isRoleAllowed =
        !role || allowedRoles.length === 0 || allowedRoles.includes(role);

      if (!isRoleAllowed) return null;

      if (menuAccess?.[item.path] === false || item.enabled === false) {
        return null;
      }

      // if (item.permissionKey && typeof canAccess === 'function') {
      //   const { resource, action } = item.permissionKey;
      //   // const isAllowed = canAccess(role, resource, action, item);
      //   const isAllowed = canAccess(resource, action);
      //   if (!isAllowed) return null;
      // }

      if (item.permissionKey && typeof canAccess === 'function') {
  const keys = Array.isArray(item.permissionKey)
    ? item.permissionKey
    : [item.permissionKey];
  const isAllowed = keys.some(({ resource, action }) => canAccess(resource, action));
  if (!isAllowed) return null;
}

      if (item.children?.length) {
        const children = filterSidebarItems(item.children, {
          role,
          menuAccess,
          canAccess,
        });

        if (!children.length) return null;

        return {
          ...item,
          children,
        };
      }

      if (item.subItems?.length) {
  const subItems = item.subItems.filter((sub) => {
    if (!sub.permissionKey || typeof canAccess !== 'function') return true;
    return canAccess(sub.permissionKey.resource, sub.permissionKey.action);
  });
  if (!subItems.length) return null;
  return { ...item, subItems };
}

      return item;
    })
    .filter(Boolean);

export const groupSidebarItems = (items = []) =>
  items.reduce((acc, item) => {
    const group = item.group || 'Main';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
