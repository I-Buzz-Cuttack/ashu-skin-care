import usePermissions from "@hooks/usePermissions";

const Can = ({
  resource,
  action = "read",
  fallback = null,
  children,
}) => {
  const { canAccess, isReady } = usePermissions();

  if (!isReady) return fallback;
  return canAccess(resource, action) ? children : fallback;
};

export default Can;
