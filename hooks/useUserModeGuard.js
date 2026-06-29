"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import { parseStoredUser } from "@/lib/parseStoredUser";

const normalizeUserData = (rawUser) => parseStoredUser(rawUser);

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem("user");
    return normalizeUserData(storedUser);
  } catch (error) {
    console.error("Failed to read stored user data:", error);
    return null;
  }
};

export const hasAllowedUserMode = (user, allowedModes = []) => {
  const modes = Array.isArray(allowedModes)
    ? allowedModes
    : [allowedModes];

  if (!user?.user_mode || modes.length === 0) {
    return false;
  }

  return modes.some((mode) => String(mode) === String(user.user_mode));
};

const useUserModeGuard = (allowedModes = [], options = {}) => {
  const router = useRouter();
  const { user: appUser, loading: appUserLoading } = useAppContext();
  const accessHandledRef = useRef(false);
  const [resolvedUser, setResolvedUser] = useState(null);
  const [isHydratingUser, setIsHydratingUser] = useState(true);

  const normalizedAppUser = useMemo(() => normalizeUserData(appUser), [appUser]);
  const normalizedAllowedModes = useMemo(
    () =>
      (Array.isArray(allowedModes) ? allowedModes : [allowedModes]).filter(
        Boolean
      ),
    [allowedModes]
  );

  const redirectTo = options.redirectTo || "/dashboard";
  const errorMessage =
    options.errorMessage || "You are not allowed to access this page.";
  const showToast = options.showToast !== false;

  useEffect(() => {
    const nextUser = normalizedAppUser || getStoredUser();
    setResolvedUser(nextUser);

    if (!appUserLoading) {
      setIsHydratingUser(false);
    }
  }, [normalizedAppUser, appUserLoading]);

  const hasAccess = hasAllowedUserMode(resolvedUser, normalizedAllowedModes);
  const isCheckingAccess = appUserLoading || isHydratingUser;

  useEffect(() => {
    if (isCheckingAccess || accessHandledRef.current) {
      return;
    }

    if (!hasAccess) {
      accessHandledRef.current = true;

      if (showToast) {
        toast.error(errorMessage);
      }

      router.replace(redirectTo);
    }
  }, [
    errorMessage,
    hasAccess,
    isCheckingAccess,
    redirectTo,
    router,
    showToast,
  ]);

  useEffect(() => {
    if (hasAccess) {
      accessHandledRef.current = false;
    }
  }, [hasAccess]);

  return {
    user: resolvedUser,
    hasAccess,
    isCheckingAccess,
    isRedirecting: !isCheckingAccess && !hasAccess,
    allowedModes: normalizedAllowedModes,
  };
};

export default useUserModeGuard;
