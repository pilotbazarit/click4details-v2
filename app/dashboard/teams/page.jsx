"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Edit, Trash2, Users, UserPlus, RotateCcw, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Select from "react-select";
import CustomerCareTeamService from "@/services/CustomerCareTeamService";
import UserService from "@/services/UserService";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";

const initialFormState = {
  name: "",
  description: "",
  status: "active",
  team_leader_id: "",
};

const TeamsPage = () => {
  const { permissionList, user } = useAppContext();
  const selectedTeamIdRef = useRef(null);
  const parsedUser = useMemo(() => {
    if (!user) return null;
    let parsed = user;
    try {
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
    } catch (_) {
      return null;
    }
    return parsed && typeof parsed === "object" ? parsed : null;
  }, [user]);
  const userMode = useMemo(() => String(parsedUser?.user_mode ?? "").trim().toLowerCase(), [parsedUser]);
  const canEditDeleteTeams = useMemo(() => userMode !== "pbl", [userMode]);

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [rotationLogs, setRotationLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState(initialFormState);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isMembersDetailsModalOpen, setIsMembersDetailsModalOpen] = useState(false);
  const [membersDraft, setMembersDraft] = useState([]);
  const [leaderDraftId, setLeaderDraftId] = useState("");

  const [rotationNote, setRotationNote] = useState("");


  const canShowAddTeamButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Team", "ShowTeamAddButton")

  const canShowEditTeamButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Team", "ShowTeamEditButton")


  const canShowDeleteTeamButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Team", "ShowTeamDeleteButton")


  const canShowManageMemberButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Team", "ShowManageMemberButton")


  const canShowAddTeamRotationButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Team", "ShowTeamAddRotationButton")

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const assignedElsewhereIds = useMemo(() => {
    const ids = new Set();
    teams.forEach((team) => {
      if (selectedTeam && team.id === selectedTeam.id) return;
      if (team.team_leader_id) ids.add(team.team_leader_id);
      (team.members || []).forEach((member) => ids.add(member.id));
    });
    return ids;
  }, [teams, selectedTeam]);

  const selectableMembers = useMemo(() => {
    if (!selectedTeam) return [];
    const currentMemberIds = new Set((selectedTeam.members || []).map((m) => m.id));
    return users.filter((u) => currentMemberIds.has(u.id) || !assignedElsewhereIds.has(u.id));
  }, [users, selectedTeam, assignedElsewhereIds]);

  const selectableLeaders = useMemo(() => {
    const editingId = editingTeam?.id || null;
    const ids = new Set();
    teams.forEach((team) => {
      if (editingId && team.id === editingId) return;
      if (team.team_leader_id) ids.add(team.team_leader_id);
      (team.members || []).forEach((member) => ids.add(member.id));
    });
    return users.filter((u) => !ids.has(u.id));
  }, [users, teams, editingTeam]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await CustomerCareTeamService.Queries.getTeams();
      const fetchedTeams = response?.data || [];
      setTeams(fetchedTeams);
      if (!selectedTeam && fetchedTeams.length > 0) {
        setSelectedTeam(fetchedTeams[0]);
      } else if (selectedTeam) {
        const updated = fetchedTeams.find((t) => t.id === selectedTeam.id);
        setSelectedTeam(updated || null);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await UserService.Queries.getUserList();
      setUsers(response?.data || []);
    } catch (error) {
      toast.error(error?.message || "Failed to fetch users");
    }
  };

  const fetchRotationLogs = async (teamId) => {
    if (!teamId) return;
    setLogLoading(true);
    try {
      const response = await CustomerCareTeamService.Queries.getRotationLogs(teamId);
      if (selectedTeamIdRef.current !== teamId) {
        return;
      }
      setRotationLogs(response?.data || []);
    } catch (error) {
      if (selectedTeamIdRef.current !== teamId) {
        return;
      }
      toast.error(error?.message || "Failed to fetch rotation logs");
      setRotationLogs([]);
    } finally {
      if (selectedTeamIdRef.current === teamId) {
        setLogLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  useEffect(() => {
    selectedTeamIdRef.current = selectedTeam?.id ?? null;
    if (!selectedTeam?.id) {
      setRotationLogs([]);
      setLogLoading(false);
      return;
    }
    setRotationLogs([]);
    fetchRotationLogs(selectedTeam.id);
  }, [selectedTeam?.id]);

  const openCreateModal = () => {
    setEditingTeam(null);
    setTeamForm(initialFormState);
    setIsTeamModalOpen(true);
  };

  const openEditModal = (team) => {
    if (!canEditDeleteTeams) {
      toast.error("You are not allowed to edit teams.");
      return;
    }
    setEditingTeam(team);
    setTeamForm({
      name: team.name || "",
      description: team.description || "",
      status: team.status || "active",
      team_leader_id: team.team_leader_id || "",
    });
    setIsTeamModalOpen(true);
  };

  const saveTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      if (editingTeam) {
        await CustomerCareTeamService.Commands.updateTeam(editingTeam.id, teamForm);
        toast.success("Team updated successfully");
      } else {
        await CustomerCareTeamService.Commands.createTeam({ ...teamForm, team_member_ids: [] });
        toast.success("Team created successfully");
      }
      setIsTeamModalOpen(false);
      await fetchTeams();
    } catch (error) {
      toast.error(error?.message || "Failed to save team");
    }
  };

  const deleteTeam = async (teamId) => {
    if (!canEditDeleteTeams) {
      toast.error("You are not allowed to delete teams.");
      return;
    }
    const confirm = await Swal.fire({
      title: "Delete this team?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      await CustomerCareTeamService.Commands.deleteTeam(teamId);
      toast.success("Team deleted successfully");
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
      await fetchTeams();
    } catch (error) {
      toast.error(error?.message || "Failed to delete team");
    }
  };

  const openMembersModal = (team) => {
    setSelectedTeam(team);
    const ids = (team.members || []).map((m) => Number(m.id));
    const leaderId = team.team_leader_id != null ? Number(team.team_leader_id) : null;
    if (leaderId && !ids.some((id) => id === leaderId)) {
      ids.unshift(leaderId);
    }
    setMembersDraft(ids);
    setIsMembersModalOpen(true);
  };

  const openMembersDetailsModal = (team) => {
    setSelectedTeam(team);
    setLeaderDraftId(team?.team_leader_id || "");
    setIsMembersDetailsModalOpen(true);
  };

  const saveMembers = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    let ids = [...membersDraft].map((id) => Number(id));
    const lid = selectedTeam.team_leader_id != null ? Number(selectedTeam.team_leader_id) : null;
    if (lid && !ids.some((id) => id === lid)) {
      ids.push(lid);
    }
    ids = [...new Set(ids)];
    try {
      await CustomerCareTeamService.Commands.setMembers(selectedTeam.id, {
        team_member_ids: ids,
      });
      toast.success("Team members updated successfully");
      setIsMembersModalOpen(false);
      await fetchTeams();
      await fetchRotationLogs(selectedTeam.id);
    } catch (error) {
      toast.error(error?.message || "Failed to update members");
    }
  };

  const addManualRotationLog = async () => {
    if (!selectedTeam?.id || !rotationNote.trim()) {
      toast.error("Please write a note for this rotation log");
      return;
    }

    try {
      await CustomerCareTeamService.Commands.addRotationLog(selectedTeam.id, {
        action: "manual_note",
        note: rotationNote.trim(),
      });
      setRotationNote("");
      toast.success("Rotation log added");
      await fetchRotationLogs(selectedTeam.id);
    } catch (error) {
      toast.error(error?.message || "Failed to add rotation log");
    }
  };

  const updateTeamLeader = async () => {
    if (!selectedTeam) return;
    if (!leaderDraftId) {
      toast.error("Please select a leader");
      return;
    }

    try {
      await CustomerCareTeamService.Commands.updateTeam(selectedTeam.id, {
        name: selectedTeam.name,
        description: selectedTeam.description || "",
        status: selectedTeam.status || "active",
        team_leader_id: leaderDraftId,
      });
      toast.success("Team leader updated successfully");
      await fetchTeams();
      await fetchRotationLogs(selectedTeam.id);
    } catch (error) {
      toast.error(error?.message || "Failed to update team leader");
    }
  };

  const removeMemberFromTeam = async (team, memberId) => {
    if (team.team_leader_id != null && Number(memberId) === Number(team.team_leader_id)) {
      toast.error("The team leader must remain a member. Change the leader first if you need to remove this person.");
      return;
    }
    try {
      const updatedMemberIds = (team.members || [])
        .map((member) => member.id)
        .filter((id) => id !== memberId);

      await CustomerCareTeamService.Commands.setMembers(team.id, {
        team_member_ids: updatedMemberIds,
      });

      toast.success("Member removed successfully");
      await fetchTeams();
      await fetchRotationLogs(team.id);
    } catch (error) {
      toast.error(error?.message || "Failed to remove member");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
        {
          canShowAddTeamButton && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" /> Add Team
            </button>
          )
        }

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 font-medium">Teams</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-left">Leader</th>
                  <th className="px-4 py-3 text-left">Members</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Loading teams...
                    </td>
                  </tr>
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No teams found
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => (
                    <tr
                      key={team.id}
                      className={`border-t cursor-pointer ${selectedTeam?.id === team.id ? "bg-orange-50" : "hover:bg-gray-50"}`}
                      onClick={() => setSelectedTeam(team)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{team.name}</p>
                        <p className="text-xs text-gray-500">{team.description || "No description"}</p>
                      </td>
                      <td className="px-4 py-3">{team.leader?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMembersDetailsModal(team);
                          }}
                          className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
                        >
                          {team.members_count || team.members?.length || 0}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${team.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {team.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">

                          {
                            canShowManageMemberButton && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); openMembersModal(team); }} className="text-green-600 hover:text-green-700" title="Manage Members">
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )
                          }

                          {
                            canShowEditTeamButton && (
                              <button
                                type="button"
                                disabled={!canEditDeleteTeams}
                                onClick={(e) => { e.stopPropagation(); openEditModal(team); }}
                                className={canEditDeleteTeams ? "text-blue-600 hover:text-blue-700" : "text-gray-300 cursor-not-allowed"}
                                title={canEditDeleteTeams ? "Edit Team" : "Not allowed"}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )
                          }

                          {
                            canShowDeleteTeamButton && (
                              <button
                                type="button"
                                disabled={!canEditDeleteTeams}
                                onClick={(e) => { e.stopPropagation(); deleteTeam(team.id); }}
                                className={canEditDeleteTeams ? "text-red-600 hover:text-red-700" : "text-gray-300 cursor-not-allowed"}
                                title={canEditDeleteTeams ? "Delete Team" : "Not allowed"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )
                          }

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <p className="font-medium">Rotation Logs</p>
              {selectedTeam ? (
                <p className="text-xs text-gray-500 mt-0.5">
                  Team: <span className="font-medium text-gray-700">{selectedTeam.name}</span>
                  <span className="text-gray-400"> · ID {selectedTeam.id}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">Select a team from the list to view its logs only.</p>
              )}
            </div>
            <RotateCcw className="w-4 h-4 text-gray-500 shrink-0" />
          </div>
          <div className="p-4 border-b border-gray-200 space-y-2">
            <textarea
              value={rotationNote}
              onChange={(e) => setRotationNote(e.target.value)}
              placeholder={selectedTeam ? `Add note for ${selectedTeam.name}…` : "Select a team first"}
              disabled={!selectedTeam}
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-orange-400 disabled:bg-gray-100"
            />

            {
              canShowAddTeamRotationButton && (
                <button
                  type="button"
                  onClick={addManualRotationLog}
                  disabled={!selectedTeam}
                  className="w-full px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-60"
                >
                  Add Rotation Note
                </button>
              )
            }

          </div>
          <div className="max-h-[420px] overflow-y-auto p-4 space-y-3">
            {!selectedTeam ? (
              <p className="text-sm text-gray-500">Select a team to view that team&apos;s rotation logs only.</p>
            ) : logLoading ? (
              <p className="text-sm text-gray-500">Loading logs...</p>
            ) : rotationLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No rotation logs yet.</p>
            ) : (
              rotationLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-500">{log?.created_at ? new Date(log.created_at).toLocaleString() : "-"}</p>
                  <p className="text-sm font-medium text-gray-800">{String(log?.action || "").replace(/_/g, " ") || "-"}</p>
                  <p className="text-xs text-gray-600">By: {log.actor?.name || "System"}</p>
                  {log.member?.name && <p className="text-xs text-gray-600">Member: {log.member.name}</p>}
                  {log.note && <p className="text-sm mt-1 text-gray-700">{log.note}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold">{editingTeam ? "Edit Team" : "Create Team"}</h2>
              <button type="button" onClick={() => setIsTeamModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveTeam} className="p-5 space-y-4">
              <input
                value={teamForm.name}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Team name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-orange-400"
              />
              <textarea
                value={teamForm.description}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-orange-400"
              />
              <Select
                options={selectableLeaders.map((u) => ({
                  value: u.id,
                  label: `${u.name} (${u.phone || "No phone"})`,
                }))}
                value={
                  teamForm.team_leader_id
                    ? selectableLeaders
                        .map((u) => ({
                          value: u.id,
                          label: `${u.name} (${u.phone || "No phone"})`,
                        }))
                        .find((option) => option.value === teamForm.team_leader_id) || null
                    : null
                }
                onChange={(selectedOption) =>
                  setTeamForm((prev) => ({
                    ...prev,
                    team_leader_id: selectedOption?.value || "",
                  }))
                }
                placeholder="Select leader"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <select
                value={teamForm.status}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-orange-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                  {editingTeam ? "Update Team" : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMembersModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Manage Members - {selectedTeam.name}</h2>
              <button type="button" onClick={() => setIsMembersModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveMembers} className="p-5">
              <div className="space-y-2">
                <Select
                  isMulti
                  options={selectableMembers.map((user) => ({
                    value: user.id,
                    label: `${user.name} (${user.phone || "No phone"})`,
                  }))}
                  value={selectableMembers
                    .filter((user) => membersDraft.includes(user.id))
                    .map((user) => ({
                      value: user.id,
                      label: `${user.name} (${user.phone || "No phone"})`,
                    }))}
                  onChange={(selectedOptions) => {
                    let nextIds = (selectedOptions || []).map((option) => Number(option.value));
                    const lid = selectedTeam.team_leader_id != null ? Number(selectedTeam.team_leader_id) : null;
                    if (lid && !nextIds.some((id) => id === lid)) {
                      nextIds = [...nextIds, lid];
                    }
                    setMembersDraft([...new Set(nextIds)]);
                  }}
                  placeholder="Select team members..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  noOptionsMessage={() => "No available users to assign"}
                />
                <p className="text-xs text-gray-500 mt-1">The team leader is always kept as a member.</p>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <p>{membersDraft.length} selected</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsMembersModalOpen(false)} className="px-3 py-2 border border-gray-300 rounded-md">
                    Cancel
                  </button>
                  <button type="submit" className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                    Save Members
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMembersDetailsModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" /> Members Details - {selectedTeam.name}
              </h2>
              <button type="button" onClick={() => setIsMembersDetailsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-5 p-4 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Change Leader</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2">
                    <Select
                      options={users
                        .filter((u) => {
                          const currentMemberIds = new Set((selectedTeam.members || []).map((m) => m.id));
                          return u.id === selectedTeam?.team_leader_id || currentMemberIds.has(u.id) || !assignedElsewhereIds.has(u.id);
                        })
                        .map((u) => ({
                          value: u.id,
                          label: `${u.name} (${u.phone || "No phone"})`,
                        }))}
                      value={
                        leaderDraftId
                          ? users
                              .map((u) => ({
                                value: u.id,
                                label: `${u.name} (${u.phone || "No phone"})`,
                              }))
                              .find((option) => option.value === leaderDraftId) || null
                          : null
                      }
                      onChange={(selectedOption) => setLeaderDraftId(selectedOption?.value || "")}
                      placeholder="Select new leader"
                      isClearable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={updateTeamLeader}
                    className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Update Leader
                  </button>
                </div>
              </div>

              {(selectedTeam.members || []).length === 0 ? (
                <p className="text-sm text-gray-500">No members in this team.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-200 rounded-md">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Phone</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeam.members.map((member) => (
                        <tr key={member.id} className="border-t">
                          <td className="px-4 py-3">
                            <span className="font-medium">{member.name || "-"}</span>
                            {Number(selectedTeam.team_leader_id) === Number(member.id) && (
                              <span className="ml-2 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded">Leader</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{member.email || "-"}</td>
                          <td className="px-4 py-3">{member.phone || "-"}</td>
                          <td className="px-4 py-3 capitalize">{member.user_mode || "-"}</td>
                          <td className="px-4 py-3 capitalize">{member.status || "-"}</td>
                          <td className="px-4 py-3">
                            {Number(selectedTeam.team_leader_id) === Number(member.id) ? (
                              <span className="text-xs text-gray-400">—</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeMemberFromTeam(selectedTeam, member.id)}
                                className="text-red-600 hover:text-red-700 inline-flex p-1 rounded hover:bg-red-50"
                                title="Remove member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
