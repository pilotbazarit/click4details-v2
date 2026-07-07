import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Select from "react-select";
import toast from "react-hot-toast";
import UserService from "@/services/UserService";
import PermissionService from "@/services/PermissionService";
import RoleService from "@/services/RoleService";
import { Eye } from "lucide-react";

const UserPermissionModal = ({ open, setOpen, selectedUser, onSuccess }) => {
  const [permissionNames, setPermissionNames] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [permissionRecordId, setPermissionRecordId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [roleError, setRoleError] = useState("");
  const [activeDescriptionKey, setActiveDescriptionKey] = useState(null);

  const selectedUserId =
    selectedUser?.id ??
    selectedUser?.u_id ??
    selectedUser?.user?.id ??
    selectedUser?.user?.u_id ??
    "";

  const roleOptions = roles.map((role) => ({
    value: role.r_id,
    label: role.r_name,
  }));

  const isEmptyRoleId = (roleId) =>
    roleId === "" || roleId === null || roleId === undefined;

  const hasPermissionGroups = (permissions) =>
    Array.isArray(permissions) &&
    permissions.some((item) => Array.isArray(item?.permissions));

  const normalizePermissionIds = (...sources) => {
    const permissionIds = [];

    const getPermissionList = (permissions) => {
      if (Array.isArray(permissions)) {
        return permissions;
      }

      if (typeof permissions !== "string") {
        return [];
      }

      const trimmedPermissions = permissions.trim();

      if (!trimmedPermissions) {
        return [];
      }

      try {
        const parsedPermissions = JSON.parse(trimmedPermissions);
        return Array.isArray(parsedPermissions)
          ? parsedPermissions
          : [parsedPermissions];
      } catch (error) {
        return trimmedPermissions.includes(",")
          ? trimmedPermissions.split(",").map((permission) => permission.trim())
          : [trimmedPermissions];
      }
    };

    const collectPermissionIds = (permissions) => {
      const permissionList = getPermissionList(permissions);

      if (permissionList.length === 0) {
        return;
      }

      permissionList.forEach((permission) => {
        if (permission === undefined || permission === null) {
          return;
        }

        if (typeof permission !== "object") {
          permissionIds.push(permission);
          return;
        }

        if (Array.isArray(permission.permissions)) {
          permission.permissions.forEach((item) => {
            if (item?.p_is_selected && item?.p_id) {
              permissionIds.push(item.p_id);
            }
          });
          return;
        }

        const resolvedPermissionId =
          permission.p_id ?? permission.id ?? permission.value ?? null;

        if (resolvedPermissionId) {
          permissionIds.push(resolvedPermissionId);
        }
      });
    };

    sources.forEach((source) => {
      if (!source) {
        return;
      }

      if (Array.isArray(source)) {
        collectPermissionIds(source);
        return;
      }

      collectPermissionIds(source?.urp_permissions);
    });

    return [...new Set(permissionIds.map((id) => String(id)))];
  };

  const applySelectedPermissionIds = (permissions, selectedPermissionIds) => {
    if (!Array.isArray(permissions) || selectedPermissionIds.length === 0) {
      return Array.isArray(permissions) ? permissions : [];
    }

    const selectedPermissionIdSet = new Set(selectedPermissionIds);

    return permissions.map((section) => ({
      ...section,
      permissions: Array.isArray(section?.permissions)
        ? section.permissions.map((permission) => ({
            ...permission,
            p_is_selected:
              !!permission?.p_is_selected ||
              selectedPermissionIdSet.has(String(permission?.p_id)),
          }))
        : [],
    }));
  };

  const resetState = () => {
    setPermissionNames([]);
    setLoading(false);
    setSubmitLoading(false);
    setPermissionRecordId(null);
    setSelectedRoleId("");
    setRoleError("");
    setActiveDescriptionKey(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  const getRoles = async () => {
    try {
      const response = await RoleService.Queries.getRoles({
        _type: "system",
        _page: 1,
        _perPage: 1000,
      });

      if (response?.status === "success") {
        setRoles(Array.isArray(response?.data?.data) ? response.data.data : []);
      } else {
        toast.error(response?.data?.message || "Failed to fetch roles");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch roles");
    }
  };

  const resolveExistingPermissionRecordId = async () => {
    if (selectedUser?.urp_id) {
      return selectedUser.urp_id;
    }

    if (!selectedUserId) {
      return null;
    }

    const querySets = [
      {
        _page: 1,
        _perPage: 200,
        _entity_type: "user",
        _entity_id: selectedUserId,
        _user_id: selectedUserId,
      },
      {
        _page: 1,
        _perPage: 200,
        _urp_entity_type: "user",
        _urp_entity_id: selectedUserId,
        _urp_user_id: selectedUserId,
      },
      {
        _page: 1,
        _perPage: 200,
        _user_id: selectedUserId,
      },
      {
        _page: 1,
        _perPage: 200,
        _urp_user_id: selectedUserId,
      },
    ];

    for (const params of querySets) {
      try {
        const listResponse = await PermissionService.Queries.getUserPermissions(
          params
        );
        if (listResponse?.status !== "success") {
          continue;
        }

        const rows = Array.isArray(listResponse?.data?.data)
          ? listResponse.data.data
          : Array.isArray(listResponse?.data)
          ? listResponse.data
          : listResponse?.data
          ? [listResponse.data]
          : [];

        const matched = rows.find((row) => {
          const entityType = row?.urp_entity_type || row?.entity_type;
          const entityId = row?.urp_entity_id ?? row?.entity_id;
          const userId =
            row?.urp_user_id ??
            row?.user_id ??
            row?.user?.id ??
            row?.user?.u_id;
          const rowId = row?.urp_id ?? row?.id;

          if (!rowId) {
            return false;
          }

          const isUserType = !entityType || entityType === "user";
          const isSameUser = String(userId) === String(selectedUserId);
          const isEntityMatch =
            entityId === undefined ||
            entityId === null ||
            String(entityId) === String(selectedUserId) ||
            String(entityId) === "0";

          return isUserType && isSameUser && isEntityMatch;
        });

        if (matched?.urp_id || matched?.id) {
          return matched?.urp_id || matched?.id;
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  };

  const getUserPermissionName = async (
    roleIdParam,
    manageLoading = true,
    selectedPermissionIds = []
  ) => {
    if (!selectedUserId) {
      setPermissionNames([]);
      return [];
    }

    if (isEmptyRoleId(roleIdParam)) {
      setPermissionNames([]);
      return [];
    }

    try {
      if (manageLoading) {
        setLoading(true);
      }

      const defaultPermissionResponse = await UserService.Queries.getUserPermissionName(
        {
          _use_id: selectedUserId,
          _role_id: roleIdParam,
          _type: "system",
        }
      );

      if (defaultPermissionResponse?.status === "success") {
        const permissions = Array.isArray(defaultPermissionResponse?.data)
          ? defaultPermissionResponse.data
          : [];
        const hydratedPermissions = applySelectedPermissionIds(
          permissions,
          selectedPermissionIds
        );

        setPermissionNames(hydratedPermissions);
        return hydratedPermissions;
      } else {
        setPermissionNames([]);
        toast.error(
          defaultPermissionResponse?.data?.message ||
            "Failed to fetch permissions"
        );
        return [];
      }
    } catch (error) {
      setPermissionNames([]);
      toast.error(
        error?.response?.data?.message || "Failed to fetch permissions"
      );
      return [];
    } finally {
      if (manageLoading) {
        setLoading(false);
      }
    }
  };

  const hydratePermissionData = async () => {
    if (!selectedUserId) {
      setPermissionNames([]);
      setSelectedRoleId("");
      setPermissionRecordId(null);
      return;
    }

    try {
      setLoading(true);

      const existingRecordId = await resolveExistingPermissionRecordId();
      setPermissionRecordId(existingRecordId);

      if (existingRecordId) {
        const existingResponse =
          await PermissionService.Queries.getSingleUserRolePermission(
            existingRecordId
          );

        if (existingResponse?.status === "success") {
          const resolvedRoleId =
            existingResponse?.data?.urp_role_id ??
            selectedUser?.urp_role_id ??
            selectedUser?.role_id ??
            selectedUser?.r_id ??
            selectedUser?.role?.r_id ??
            "";
          const existingPermissions = existingResponse?.data?.urp_permissions;

          setSelectedRoleId(resolvedRoleId);

          if (!isEmptyRoleId(resolvedRoleId)) {
            await getUserPermissionName(
              resolvedRoleId,
              false,
              normalizePermissionIds(existingResponse?.data, selectedUser)
            );
          } else {
            setPermissionNames(
              hasPermissionGroups(existingPermissions) ? existingPermissions : []
            );
          }

          return;
        }
      }

      const initialRoleId =
        selectedUser?.urp_role_id ??
        selectedUser?.role_id ??
        selectedUser?.r_id ??
        selectedUser?.role?.r_id ??
        "";

      setSelectedRoleId(initialRoleId);

      if (!isEmptyRoleId(initialRoleId)) {
        await getUserPermissionName(
          initialRoleId,
          false,
          normalizePermissionIds(selectedUser)
        );
      } else {
        setPermissionNames([]);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch permissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      getRoles();
      hydratePermissionData();
    } else {
      resetState();
    }
  }, [
    open,
    selectedUserId,
    selectedUser?.urp_id,
    selectedUser?.urp_role_id,
    selectedUser?.role_id,
    selectedUser?.r_id,
    selectedUser?.role?.r_id,
  ]);

  const handlePermissionChange = (roleName, permissionId, checked) => {
    setPermissionNames((prevPermissions) =>
      prevPermissions.map((role) =>
        role.name === roleName
          ? {
              ...role,
              permissions: Array.isArray(role?.permissions)
                ? role.permissions.map((perm) =>
                    perm.p_id === permissionId
                      ? { ...perm, p_is_selected: checked }
                      : perm
                  )
                : [],
            }
          : role
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("User is required");
      return;
    }

    if (isEmptyRoleId(selectedRoleId)) {
      setRoleError("Role is required");
      toast.error("Role is required");
      return;
    }

    const permissionArr = [];
    permissionNames.forEach((role) => {
      role?.permissions?.forEach((perm) => {
        if (perm?.p_is_selected) {
          permissionArr.push(perm.p_id);
        }
      });
    });

    const payload = {
      urp_entity_id: 0,
      urp_entity_type: "user",
      urp_user_id: selectedUserId,
      urp_role_id: selectedRoleId,
      urp_permissions: permissionArr,
    };

    try {
      setSubmitLoading(true);
      let response;

      if (permissionRecordId) {
        payload._method = "PUT";
        response = await PermissionService.Commands.updateUserPermission(
          permissionRecordId,
          payload
        );
      } else {
        response = await PermissionService.Commands.storeUserPermission(payload);
      }

      if (response?.status === "success") {
        toast.success("User permission updated successfully!");
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response?.data?.message || "Failed to update permissions");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update permissions"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="flex h-[94vh] max-h-[94vh] w-[96vw] max-w-[1240px] flex-col overflow-hidden p-0 sm:w-[980px] lg:w-[1120px] xl:w-[1240px] [&>button]:hidden">
        <DialogTitle className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span className="inline-block w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
              User Permissions
            </h2>
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
            >
              <svg
                className="inline-block w-4 h-4 mr-2 -mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
          </div>
        </DialogTitle>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 sm:px-4">
            <div className="mb-5 rounded-md border border-[#d9e0ef] bg-[#e9eef8] px-4 py-3">
              <p className="text-sm font-semibold text-blue-700">
                {selectedUser?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-600">
                {selectedUser?.email || "No email"}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="role_id" className="text-base font-medium">
                  Select Role
                </label>
                <Select
                  inputId="role_id"
                  options={roleOptions}
                  classNamePrefix="react-select"
                  className="w-full"
                  value={
                    roleOptions.find(
                      (option) =>
                        String(option.value) === String(selectedRoleId)
                    ) || null
                  }
                  onChange={async (option) => {
                    const nextRoleId = option ? option.value : "";
                    setSelectedRoleId(nextRoleId);
                    setRoleError("");

                    if (isEmptyRoleId(nextRoleId)) {
                      setPermissionNames([]);
                      return;
                    }

                    await getUserPermissionName(nextRoleId);
                  }}
                  placeholder="Select Role"
                  isClearable
                />
                {roleError && (
                  <span className="text-red-500 text-xs mt-1">{roleError}</span>
                )}
              </div>
            </div>

            <div className="bg-[#f3f4f6] border border-gray-300 rounded-lg p-4 sm:p-6 mt-2">
              <h3 className="text-center text-2xl sm:text-[32px] leading-none font-bold mb-6 text-gray-700">
                Permissions
              </h3>

              {loading ? (
                <div className="text-center text-sm text-gray-500 py-6">
                  Loading permissions...
                </div>
              ) : permissionNames.length > 0 ? (
                <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {permissionNames.map((item, idx) => (
                    <div
                      key={idx}
                      className="min-w-0 rounded-lg border border-gray-300 bg-white/80 p-3 sm:p-4 min-h-[210px]"
                    >
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-700 leading-tight mb-4 break-words">
                        {item?.name}
                      </h4>

                      <div className="space-y-2">
                        {item?.permissions?.map((per, index) => {
                          const permissionKey = `${item?.name}-${per?.p_id ?? index}`;
                          const checkboxId = `permission-${per?.p_id ?? `${idx}-${index}`}`;
                          const isDescriptionOpen = activeDescriptionKey === permissionKey;
                          const description =
                            per?.p_description || "No description available.";

                          return (
                            <div
                              key={permissionKey}
                              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
                            >
                              <div className="relative group">
                                <button
                                  type="button"
                                  aria-label={`Show ${per?.p_name} description`}
                                  aria-expanded={isDescriptionOpen}
                                  className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onClick={() =>
                                    setActiveDescriptionKey((currentKey) =>
                                      currentKey === permissionKey
                                        ? null
                                        : permissionKey
                                    )
                                  }
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <span
                                  role="tooltip"
                                  className={`absolute left-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-3rem)] rounded-md bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg transition-opacity ${
                                    isDescriptionOpen
                                      ? "opacity-100"
                                      : "pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                                  }`}
                                >
                                  {description}
                                </span>
                              </div>
                              <label
                                htmlFor={checkboxId}
                                className="min-w-0 cursor-pointer break-words text-sm sm:text-base leading-snug font-medium text-gray-600"
                              >
                                {per?.p_name}
                              </label>
                              <input
                                id={checkboxId}
                                type="checkbox"
                                className="mt-0.5 w-5 h-5 accent-blue-600 cursor-pointer shrink-0 justify-self-end"
                                checked={!!per?.p_is_selected}
                                onChange={(e) =>
                                  handlePermissionChange(
                                    item?.name,
                                    per?.p_id,
                                    e.target.checked
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 py-6">
                  No permissions found.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-0 shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6 flex justify-end gap-3">
            <DialogClose asChild onClick={handleClose}>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <button
              type="submit"
              disabled={submitLoading || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? "Updating..." : "Update"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionModal;
