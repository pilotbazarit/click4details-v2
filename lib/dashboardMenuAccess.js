import { hasPermission } from "./utils";

const normalizePath = (path = "") => {
  if (!path) return "";

  if (path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "") || "/";
};

const normalizeAccessContext = (accessContextOrUserMode) => {
  if (typeof accessContextOrUserMode === "string") {
    return { userMode: accessContextOrUserMode };
  }

  return accessContextOrUserMode || {};
};

const hasModeAccess = (allowedModes, userMode) => {
  if (!allowedModes || allowedModes.length === 0) {
    return true;
  }

  return allowedModes.includes(userMode);
};

const hasPermissionAccess = (requiredPermission, accessContext) => {
  if (!requiredPermission) {
    return true;
  }

  const { userMode, permissionList, companyShopId } = accessContext;
  const appliesToModes = requiredPermission.appliesToModes;

  if (Array.isArray(appliesToModes) && !appliesToModes.includes(userMode)) {
    return true;
  }

  const permissionShopId =
    (userMode === "pbl" || userMode === "admin") &&
    requiredPermission.pblShopId !== undefined
      ? requiredPermission.pblShopId
      : companyShopId;

  return hasPermission(
    permissionList,
    Number(permissionShopId),
    requiredPermission.section,
    requiredPermission.action
  );

  // const result = hasPermission(
  //   permissionList,
  //   Number(permissionShopId),
  //   requiredPermission.section,
  //   requiredPermission.action
  // );

  // console.log("[----------------Sidebar Permission Debug dashboardMenuAccess---------------]", {
  //   userMode,
  //   requiredPermission,
  //   permissionShopId: Number(permissionShopId),
  //   permissionList,
  //   result,
  // });

  // return result;

};

export const hasMenuAccess = (menuItem, accessContextOrUserMode) => {
  const accessContext = normalizeAccessContext(accessContextOrUserMode);

  return (
    hasModeAccess(menuItem.allowedModes, accessContext.userMode) &&
    hasPermissionAccess(menuItem.requiredPermission, accessContext)
  );
};

export const filterDashboardMenuTree = (menuItems = [], accessContextOrUserMode) => {
  const accessContext = normalizeAccessContext(accessContextOrUserMode);

  return menuItems.reduce((visibleItems, item) => {
    if (!hasMenuAccess(item, accessContext)) {
      return visibleItems;
    }

    const nextItem = { ...item };

    if (Array.isArray(item.children) && item.children.length > 0) {
      const visibleChildren = filterDashboardMenuTree(item.children, accessContext);

      if (visibleChildren.length === 0 && !item.path) {
        return visibleItems;
      }

      nextItem.children = visibleChildren;
    }

    visibleItems.push(nextItem);
    return visibleItems;
  }, []);
};

export const matchesDashboardPath = (pathname = "", menuPath = "") => {
  const normalizedPathname = normalizePath(pathname);
  const normalizedMenuPath = normalizePath(menuPath);

  if (!normalizedMenuPath) {
    return false;
  }

  if (normalizedMenuPath === "/dashboard") {
    return normalizedPathname === "/dashboard";
  }

  return (
    normalizedPathname === normalizedMenuPath ||
    normalizedPathname.startsWith(`${normalizedMenuPath}/`)
  );
};

export const getAccessibleDashboardPaths = (menuItems = [], accessContextOrUserMode) => {
  const accessContext = normalizeAccessContext(accessContextOrUserMode);
  const visibleMenus = filterDashboardMenuTree(menuItems, accessContext);

  return visibleMenus.flatMap((item) => {
    const ownPath = item.path ? [normalizePath(item.path)] : [];
    const childPaths = item.children
      ? getAccessibleDashboardPaths(item.children, accessContext)
      : [];

    return [...ownPath, ...childPaths];
  });
};

export const canAccessDashboardPath = (menuItems = [], accessContextOrUserMode, pathname = "") => {
  const accessiblePaths = getAccessibleDashboardPaths(menuItems, accessContextOrUserMode);

  return accessiblePaths.some((menuPath) =>
    matchesDashboardPath(pathname, menuPath)
  );
};
