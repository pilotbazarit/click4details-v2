"use client";

import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import { useAppContext } from "@/context/AppContext";
import CustomerCareTeamService from "@/services/CustomerCareTeamService";
import MasterDataService from "@/services/MasterDataService";
import UserService from "@/services/UserService";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { hasPermission, hasSalesTeamActivityMenuShow } from "@/lib/utils";

// ── subcomponents ────────────────────────────────────────────────────────────
import { ActivityToolbar } from "./sales-team-activity/ActivityToolbar";
import { AllActivityTable } from "./sales-team-activity/AllActivityTable";
import { EmployeeSummaryTable } from "./sales-team-activity/EmployeeSummaryTable";
import { TeamSummaryTable } from "./sales-team-activity/TeamSummaryTable";
import { UserRatioTab } from "./sales-team-activity/UserRatioTab";
import { PaginationBar } from "./sales-team-activity/PaginationBar";
import { KpiSummaryModal } from "./sales-team-activity/KpiSummaryModal";
import { AddActivityModal } from "./sales-team-activity/AddActivityModal";
import { EditActivityModal } from "./sales-team-activity/EditActivityModal";
import { ActivityFilterDrawer } from "./sales-team-activity/ActivityFilterDrawer";

// ── shared constants / utils ─────────────────────────────────────────────────
import {
  DEFAULT_FILTERS, SERIOUSNESS_OPTIONS, PROFILE_LEVEL_OPTIONS,
  EMPLOYEE_SORT_DEFAULT, ACTIVITY_TAB_ALL, ACTIVITY_TAB_EMPLOYEE,
  ACTIVITY_TAB_TEAM, ACTIVITY_TAB_USER_RATIO, PRIMARY_KPI_LABELS,
} from "./sales-team-activity/constants";
import {
  hasValue, isCustomerMetricEligible,
  normalizeProfileLevel, normalizeSeriousnessLevel,
  getTeamValue, getDataCollectByValue, getFirstVisitByValue,
  getSecondVisitByValue, getThirdVisitByValue, getSoldDateValue, getSoldByValue,
  toUserId, getTeamNameFromTeamRecord, getUserDisplayName,
} from "./sales-team-activity/activityUtils";

const EMPTY_DRAFT_ADD = {
  customerName: "", customerMobile: "", collectById: "",
  facebookLink: "", messengerLink: "", profileLevel: "", seriousnessLevel: "",
  firstVisitDate: "", firstVisitById: "", secondVisitDate: "", secondVisitById: "",
  thirdVisitDate: "", thirdVisitById: "", soldDate: "", soldById: "",
  botMessage: false, interested: false, saleDone: false, note: "",
};

const EMPTY_DRAFT_EDIT = {
  clientName: "", phoneNumber: "", facebookLink: "", messengerLink: "",
  collectById: "", profileLevel: "", seriousnessLevel: "",
  firstVisitDate: "", firstVisitById: "", secondVisitDate: "", secondVisitById: "",
  thirdVisitDate: "", thirdVisitById: "", soldDate: "", soldById: "",
  botMessage: false, interested: false, saleDone: false, note: "",
};

const SalesTeamActivityDataTable = () => {
  const { permissionList, user } = useAppContext();
  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  // ── auth / user ────────────────────────────────────────────────────────────
  const parsedUser = useMemo(() => {
    if (!user) return null;
    let parsed = user;
    try {
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
    } catch (_) { return null; }
    return parsed && typeof parsed === "object" ? parsed : null;
  }, [user]);

  const loggedInUserId = useMemo(() => parsedUser?.id != null ? String(parsedUser.id) : "", [parsedUser]);
  const userMode = useMemo(() => String(parsedUser?.user_mode ?? "").trim().toLowerCase(), [parsedUser]);
  const hasMenuFullAccess = useMemo(
    () => hasSalesTeamActivityMenuShow(permissionList),
    [permissionList]
  );
  const canViewSummaryTabs = useMemo(() => {
    return userMode === "supreme" || userMode === "admin" || hasMenuFullAccess;
  }, [userMode, hasMenuFullAccess]);

  // ── permissions ────────────────────────────────────────────────────────────
  const canShowAddSalesTeamButton =
    hasMenuFullAccess ||
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "SalesTeamActivity", "ShowSalesTeamAddButton");
  const canShowOverviewSalesTeamButton =
    hasMenuFullAccess ||
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "SalesTeamActivity", "ShowSalesTeamOverviewButton");
  const canShowFilterSalesTeamButton =
    hasMenuFullAccess ||
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "SalesTeamActivity", "ShowSalesTeamFilterButton");

  // ── core data state ────────────────────────────────────────────────────────
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverCustomerKpiCount, setServerCustomerKpiCount] = useState(null);
  const [customerCareTeams, setCustomerCareTeams] = useState([]);
  const [dynamicTeams, setDynamicTeams] = useState([]);
  const [teamMemberIdsByTeamName, setTeamMemberIdsByTeamName] = useState({});
  const [dynamicTeamMembers, setDynamicTeamMembers] = useState([]);
  const [usersDirectory, setUsersDirectory] = useState([]);
  const [activitySeriousnessOptions, setActivitySeriousnessOptions] = useState(SERIOUSNESS_OPTIONS);

  // ── ui state ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activityTab, setActivityTab] = useState(ACTIVITY_TAB_ALL);
  const [employeeSort, setEmployeeSort] = useState(EMPLOYEE_SORT_DEFAULT);
  const [activityFlashMessage, setActivityFlashMessage] = useState(null);
  const [actionMenuRowId, setActionMenuRowId] = useState(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [selectedRatioUser, setSelectedRatioUser] = useState("");

  // ── modal / drawer state ───────────────────────────────────────────────────
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isRowEditModalOpen, setIsRowEditModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // ── draft state ────────────────────────────────────────────────────────────
  const [addNewDraft, setAddNewDraft] = useState(EMPTY_DRAFT_ADD);
  const [editRowDraft, setEditRowDraft] = useState(EMPTY_DRAFT_EDIT);
  const [editingRowId, setEditingRowId] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

  // ── data fetching ──────────────────────────────────────────────────────────
  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const body = await commandApi.get("/api/sales-team-activities");
      const list = Array.isArray(body) ? body : body?.data?.data || body?.data || body?.rows || [];
      const kpi =
        body && typeof body === "object" && !Array.isArray(body) && typeof body.customer_kpi_count === "number"
          ? body.customer_kpi_count : null;
      setRows(Array.isArray(list) ? list : []);
      setServerCustomerKpiCount(kpi);
    } catch (_) {
      setRows([]);
      setServerCustomerKpiCount(null);
    } finally {
      setLoading(false);
    }
  }, [commandApi]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await CustomerCareTeamService.Queries.getTeams();
        const list = Array.isArray(response?.data) ? response.data : [];
        setCustomerCareTeams(list);
        const teamMemberMap = {};
        list.forEach((team) => {
          const teamName = String(getTeamNameFromTeamRecord(team) ?? "");
          if (!teamName) return;
          const memberIds = (team?.members || [])
            .map((m) => toUserId(m?.id ?? m?.user_id)).filter((id) => id !== null);
          teamMemberMap[teamName] = Array.from(new Set(memberIds));
        });
        const names = list.map((t) => getTeamNameFromTeamRecord(t)).filter((n) => hasValue(n)).map(String);
        setDynamicTeams(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)));
        setTeamMemberIdsByTeamName(teamMemberMap);
      } catch (_) {
        setCustomerCareTeams([]);
        setDynamicTeams([]);
        setTeamMemberIdsByTeamName({});
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserService.Queries.getUserList();
        const list = Array.isArray(response?.data) ? response.data : [];
        setUsersDirectory(list);
        const names = list.map((u) => getUserDisplayName(u)).filter((n) => hasValue(n)).map(String);
        setDynamicTeamMembers(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)));
      } catch (_) {
        setUsersDirectory([]);
        setDynamicTeamMembers([]);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchSeriousness = async () => {
      try {
        const response = await MasterDataService.Queries.getMasterDataByTypeCode("client_seriousness_1758128063");
        const options = (response?.data?.master_data || []).map((item) => String(item?.md_title ?? "").trim()).filter(Boolean);
        if (options.length > 0) setActivitySeriousnessOptions(options);
      } catch (_) {
        setActivitySeriousnessOptions(SERIOUSNESS_OPTIONS);
      }
    };
    fetchSeriousness();
  }, []);

  // ── team/permission helpers ────────────────────────────────────────────────
  const pblTeamInfos = useMemo(() => {
    if (userMode !== "pbl") return [];
    const currentUserId = Number(loggedInUserId);
    if (!Number.isInteger(currentUserId) || currentUserId <= 0) return [];
    return customerCareTeams
      .filter((team) => {
        const leaderId = toUserId(team?.team_leader_id ?? team?.leader?.id);
        const memberIds = (team?.members || []).map((m) => toUserId(m?.id ?? m?.user_id)).filter((id) => id !== null);
        return leaderId === currentUserId || memberIds.includes(currentUserId);
      })
      .map((team) => {
        const teamName = String(getTeamNameFromTeamRecord(team) || "Unnamed Team");
        const leaderId = toUserId(team?.team_leader_id ?? team?.leader?.id);
        const leaderName = hasValue(getUserDisplayName(team?.leader)) ? String(getUserDisplayName(team?.leader)) : "";
        const members = (team?.members || []).map((m) => {
          const id = toUserId(m?.id ?? m?.user_id);
          const displayName = hasValue(getUserDisplayName(m)) ? String(getUserDisplayName(m)) : `User ${m?.id ?? ""}`;
          return { id, name: displayName, isLeader: leaderId !== null && id === leaderId };
        });
        if (leaderId !== null && leaderName && !members.some((m) => m.id === leaderId)) {
          members.unshift({ id: leaderId, name: leaderName, isLeader: true });
        }
        return { teamName, members };
      });
  }, [userMode, loggedInUserId, customerCareTeams]);

  const pblTeamMemberIds = useMemo(() => {
    if (userMode !== "pbl") return [];
    return Array.from(new Set(
      pblTeamInfos.flatMap((team) =>
        team.members.map((m) => (m.id != null ? Number(m.id) : null)).filter((id) => Number.isInteger(id) && id > 0)
      )
    ));
  }, [userMode, pblTeamInfos]);

  const canManageActivityRow = useCallback((row) => {
    if (hasMenuFullAccess || userMode === "admin" || userMode === "supreme") return true;
    if (userMode === "pbl") {
      const rowUserIds = [
        toUserId(row?.data_collect_by), toUserId(row?.first_visit_by),
        toUserId(row?.second_visit_by), toUserId(row?.third_visit_by), toUserId(row?.sold_by),
      ].filter((id) => id !== null);
      return rowUserIds.some((id) => pblTeamMemberIds.includes(id));
    }
    return false;
  }, [hasMenuFullAccess, userMode, pblTeamMemberIds]);

  // ── filter options ─────────────────────────────────────────────────────────
  const filterOptions = useMemo(() => {
    const rowTeams = rows.map((row) => getTeamValue(row));
    const uniqueTeams = Array.from(new Set([...dynamicTeams, ...rowTeams].filter(hasValue))).map(String).sort((a, b) => a.localeCompare(b));
    const rowTeamMembers = rows.flatMap((row) => [
      getDataCollectByValue(row), getFirstVisitByValue(row), getSecondVisitByValue(row), getThirdVisitByValue(row),
    ]);
    const uniqueTeamMembers = Array.from(new Set([...dynamicTeamMembers, ...rowTeamMembers].filter(hasValue))).map(String).sort((a, b) => a.localeCompare(b));
    return {
      profileLevels: PROFILE_LEVEL_OPTIONS,
      seriousnessLevels: activitySeriousnessOptions,
      dataCollectors: uniqueTeamMembers,
      teams: uniqueTeams,
    };
  }, [rows, dynamicTeams, dynamicTeamMembers, activitySeriousnessOptions]);

  // ── filtered rows ──────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const norm = (v) => String(v ?? "").toLowerCase();
    const compact = (v) => norm(v).replace(/[^a-z0-9]/g, "");
    const kwCompact = compact(keyword);

    return rows.filter((row) => {
      const values = [
        row.id, row.customer_id, row.client_name, row?.customer?.name, row?.customer?.mobile,
        getDataCollectByValue(row), getTeamValue(row), row.phone_number,
        row.facebook_id_link, row.chat_link, row.profile_level, row.seriousness_level,
        getFirstVisitByValue(row), getSecondVisitByValue(row), getThirdVisitByValue(row), getSoldByValue(row),
      ];
      const matchesKeyword = keyword
        ? values.some((v) => { const r = norm(v); return r.includes(keyword) || compact(v).includes(kwCompact); })
        : true;

      const boolFilterMatch = (fv, av) => {
        if (fv === "all") return true;
        return fv === "true" ? Boolean(av) : !Boolean(av);
      };
      const hasValueFilterMatch = (fv, av) => {
        if (fv === "all") return true;
        return fv === "yes" ? hasValue(av) : !hasValue(av);
      };

      const matchesTeam = (() => {
        if (!filters.teams.length) return true;
        const selectedIds = Array.from(new Set(filters.teams.flatMap((tn) => teamMemberIdsByTeamName[tn] || [])));
        if (selectedIds.length === 0) return filters.teams.includes(String(getTeamValue(row) ?? ""));
        const rowUserIds = [
          toUserId(row?.data_collect_by), toUserId(row?.first_visit_by),
          toUserId(row?.second_visit_by), toUserId(row?.third_visit_by),
        ].filter((id) => id !== null);
        return rowUserIds.some((id) => selectedIds.includes(id));
      })();

      const matchesActivityMonth = (() => {
        if (!filters.activityMonth) return true;
        if (!row?.created_at || !row?.updated_at) return false;
        const ca = new Date(row.created_at);
        const ua = new Date(row.updated_at);
        if (Number.isNaN(ca.getTime()) || Number.isNaN(ua.getTime())) return false;
        const cm = ca.toISOString().slice(0, 7);
        const um = ua.toISOString().slice(0, 7);
        return filters.activityMonth >= cm && filters.activityMonth <= um;
      })();

      return (
        matchesKeyword &&
        (filters.profileLevel ? normalizeProfileLevel(row.profile_level) === filters.profileLevel : true) &&
        (filters.seriousnessLevel.length ? filters.seriousnessLevel.includes(normalizeSeriousnessLevel(row.seriousness_level)) : true) &&
        (filters.dataCollectors.length
          ? [getDataCollectByValue(row), getFirstVisitByValue(row), getSecondVisitByValue(row), getThirdVisitByValue(row)]
              .some((n) => filters.dataCollectors.includes(String(n ?? "")))
          : true) &&
        matchesTeam && matchesActivityMonth &&
        hasValueFilterMatch(filters.hasFacebookLink, row.facebook_id_link) &&
        hasValueFilterMatch(filters.hasMessengerLink, row.chat_link) &&
        boolFilterMatch(filters.saleDone, row.sale_done) &&
        boolFilterMatch(filters.notInterested, row.not_interested) &&
        boolFilterMatch(filters.botMessage, row.bot_message)
      );
    });
  }, [rows, search, filters, teamMemberIdsByTeamName]);

  // ── employee / team aggregates ─────────────────────────────────────────────
  const employeeWiseRows = useMemo(() => {
    const map = new Map();
    const ensure = (key) => {
      if (!map.has(key)) {
        map.set(key, {
          name: key, dataCollect: 0, firstVisit: 0, secondVisit: 0, thirdVisit: 0,
          recordIds: new Set(), totalSaleRecordIds: new Set(), botMessageRecordIds: new Set(),
          notInterestedRecordIds: new Set(), facebookRecordIds: new Set(), messengerRecordIds: new Set(),
          customerNameKeys: new Set(), customerMobileKeys: new Set(),
        });
      }
      return map.get(key);
    };
    filteredRows.forEach((row, index) => {
      const recordKey = row?.id != null && row?.id !== "" ? row.id : `idx-${index}`;
      const contribs = [
        { raw: getDataCollectByValue(row), field: "dataCollect" },
        { raw: getFirstVisitByValue(row), field: "firstVisit" },
        { raw: getSecondVisitByValue(row), field: "secondVisit" },
        { raw: getThirdVisitByValue(row), field: "thirdVisit" },
        { raw: getSoldByValue(row), field: null },
      ];
      const keysThisRow = new Set();
      contribs.forEach(({ raw, field }) => {
        if (!hasValue(raw)) return;
        const key = String(raw).trim();
        if (!key) return;
        keysThisRow.add(key);
        const e = ensure(key);
        if (field) e[field] += 1;
        e.recordIds.add(recordKey);
      });
      if (row.sale_done && hasValue(getSoldByValue(row))) {
        const sk = String(getSoldByValue(row)).trim();
        if (sk) ensure(sk).totalSaleRecordIds.add(recordKey);
      }
      keysThisRow.forEach((key) => {
        const e = map.get(key);
        if (!e) return;
        if (row.bot_message) e.botMessageRecordIds.add(recordKey);
        if (row.not_interested) e.notInterestedRecordIds.add(recordKey);
        if (hasValue(row.facebook_id_link)) e.facebookRecordIds.add(recordKey);
        if (hasValue(row.chat_link)) e.messengerRecordIds.add(recordKey);
        if (isCustomerMetricEligible(row)) e.customerNameKeys.add(String(row.client_name).trim());
        if (hasValue(row?.phone_number)) e.customerMobileKeys.add(String(row.phone_number).trim());
      });
    });
    return Array.from(map.values()).map(
      ({ recordIds, totalSaleRecordIds, botMessageRecordIds, notInterestedRecordIds, facebookRecordIds, messengerRecordIds, customerNameKeys, customerMobileKeys, ...rest }) => ({
        ...rest,
        records: recordIds.size, customerNames: customerNameKeys.size, customerMobiles: customerMobileKeys.size,
        totalSale: totalSaleRecordIds.size, botMessage: botMessageRecordIds.size,
        interested: notInterestedRecordIds.size, withFacebook: facebookRecordIds.size, withMessenger: messengerRecordIds.size,
      })
    );
  }, [filteredRows]);

  const teamNamesByMemberId = useMemo(() => {
    const map = new Map();
    Object.entries(teamMemberIdsByTeamName).forEach(([teamName, memberIds]) => {
      memberIds.forEach((id) => { if (!map.has(id)) map.set(id, []); map.get(id).push(teamName); });
    });
    return map;
  }, [teamMemberIdsByTeamName]);

  const teamWiseRows = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const explicitTeam = hasValue(getTeamValue(row)) ? String(getTeamValue(row)).trim() : "";
      const rowUserIds = [
        toUserId(row?.data_collect_by), toUserId(row?.first_visit_by),
        toUserId(row?.second_visit_by), toUserId(row?.third_visit_by),
      ].filter((id) => id !== null);
      const inferredTeams = Array.from(new Set(rowUserIds.flatMap((id) => teamNamesByMemberId.get(id) || [])));
      const key = explicitTeam || inferredTeams[0] || "Unassigned";
      if (!map.has(key)) {
        map.set(key, {
          name: key, records: 0, customerNameKeys: new Set(), customerMobileKeys: new Set(),
          dataCollect: 0, totalSale: 0, firstVisit: 0, secondVisit: 0, thirdVisit: 0,
          botMessage: 0, interested: 0, withFacebook: 0, withMessenger: 0,
        });
      }
      const e = map.get(key);
      e.records += 1;
      if (isCustomerMetricEligible(row)) e.customerNameKeys.add(String(row.client_name).trim());
      if (hasValue(row?.phone_number)) e.customerMobileKeys.add(String(row.phone_number).trim());
      if (hasValue(getDataCollectByValue(row))) e.dataCollect += 1;
      if (Boolean(row.sale_done) && hasValue(getSoldByValue(row))) e.totalSale += 1;
      if (hasValue(getFirstVisitByValue(row))) e.firstVisit += 1;
      if (hasValue(getSecondVisitByValue(row))) e.secondVisit += 1;
      if (hasValue(getThirdVisitByValue(row))) e.thirdVisit += 1;
      if (Boolean(row.bot_message)) e.botMessage += 1;
      if (Boolean(row.not_interested)) e.interested += 1;
      if (hasValue(row.facebook_id_link)) e.withFacebook += 1;
      if (hasValue(row.chat_link)) e.withMessenger += 1;
    });
    return Array.from(map.values()).map(({ customerNameKeys, customerMobileKeys, ...rest }) => ({
      ...rest, customerNames: customerNameKeys.size, customerMobiles: customerMobileKeys.size,
    }));
  }, [filteredRows, teamNamesByMemberId]);

  const sortedEmployeeRows = useMemo(() => {
    const list = [...employeeWiseRows];
    const { key, direction } = employeeSort;
    const m = direction === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const av = a?.[key]; const bv = b?.[key];
      if (typeof av === "number" && typeof bv === "number") {
        return av === bv ? a.name.localeCompare(b.name) : (av - bv) * m;
      }
      const at = String(av ?? "").toLowerCase(); const bt = String(bv ?? "").toLowerCase();
      return at === bt ? a.name.localeCompare(b.name) : at.localeCompare(bt) * m;
    });
    return list;
  }, [employeeWiseRows, employeeSort]);

  const sortedTeamRows = useMemo(() => {
    const list = [...teamWiseRows];
    const { key, direction } = employeeSort;
    const m = direction === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const av = a?.[key]; const bv = b?.[key];
      if (typeof av === "number" && typeof bv === "number") {
        return av === bv ? a.name.localeCompare(b.name) : (av - bv) * m;
      }
      const at = String(av ?? "").toLowerCase(); const bt = String(bv ?? "").toLowerCase();
      return at === bt ? a.name.localeCompare(b.name) : at.localeCompare(bt) * m;
    });
    return list;
  }, [teamWiseRows, employeeSort]);

  const userRatioOptions = useMemo(
    () => sortedEmployeeRows.map((row) => ({ value: row.name, label: row.name })),
    [sortedEmployeeRows]
  );

  useEffect(() => {
    if (!userRatioOptions.length) { setSelectedRatioUser(""); return; }
    if (!userRatioOptions.some((o) => o.value === selectedRatioUser)) {
      setSelectedRatioUser(userRatioOptions[0].value);
    }
  }, [userRatioOptions, selectedRatioUser]);

  const selectedUserRows = useMemo(() => {
    if (!selectedRatioUser) return [];
    return filteredRows.filter((row) => {
      const names = [getDataCollectByValue(row), getFirstVisitByValue(row), getSecondVisitByValue(row), getThirdVisitByValue(row), getSoldByValue(row)]
        .filter(hasValue).map((n) => String(n).trim());
      return names.includes(selectedRatioUser);
    });
  }, [filteredRows, selectedRatioUser]);

  const ratioCharts = useMemo(() => {
    const mobileCount = selectedUserRows.filter((row) => hasValue(row?.phone_number)).length;
    const messengerLinkCount = selectedUserRows.filter((row) => hasValue(row?.chat_link)).length;
    const visitCount = selectedUserRows.filter((row) => {
      const v1 = hasValue(row?.first_visit_date) && String(getFirstVisitByValue(row) ?? "").trim() === selectedRatioUser;
      const v2 = hasValue(row?.second_visit_date) && String(getSecondVisitByValue(row) ?? "").trim() === selectedRatioUser;
      const v3 = hasValue(row?.third_visit_date) && String(getThirdVisitByValue(row) ?? "").trim() === selectedRatioUser;
      return v1 || v2 || v3;
    }).length;
    const soldCount = selectedUserRows.filter((row) => Boolean(row?.sale_done) && String(getSoldByValue(row) ?? "").trim() === selectedRatioUser).length;
    return [
      { title: "Messenger Link vs Mobile Number", series: [{ label: "Messenger Link Count", value: messengerLinkCount, color: "#f97316" }, { label: "Mobile Number Count", value: mobileCount, color: "#0ea5e9" }] },
      { title: "Mobile Number vs Visit Count", subtitle: "If 1st/2nd/3rd visit all exist on one row, it still counts as 1 visit.", series: [{ label: "Mobile Number Count", value: mobileCount, color: "#14b8a6" }, { label: "Visit Count", value: visitCount, color: "#a855f7" }] },
      { title: "Mobile Number vs Sold Count", series: [{ label: "Mobile Number Count", value: mobileCount, color: "#3b82f6" }, { label: "Sold Count", value: soldCount, color: "#e11d48" }] },
    ];
  }, [selectedUserRows, selectedRatioUser]);

  // ── KPI ────────────────────────────────────────────────────────────────────
  const kpiItems = useMemo(() => {
    const countBy = (key) => filteredRows.filter((row) => hasValue(row[key])).length;
    const countTruthy = (key) => filteredRows.filter((row) => Boolean(row[key])).length;
    const customerKpiValue = typeof serverCustomerKpiCount === "number"
      ? serverCustomerKpiCount
      : rows.filter((row) => isCustomerMetricEligible(row)).length;
    return [
      { label: "Total Records", value: filteredRows.length },
      { label: "Customer", value: customerKpiValue },
      { label: "Customer Mobile Number", value: countBy("phone_number") },
      { label: "Facebook Link", value: countBy("facebook_id_link") },
      { label: "Messenger Link", value: countBy("chat_link") },
      { label: "Profile Level", value: countBy("profile_level") },
      { label: "Seriousness", value: countBy("seriousness_level") },
      { label: "Bot Message Checked", value: countTruthy("bot_message") },
      { label: "Interested Checked", value: countTruthy("not_interested") },
      { label: "Total Sold", value: countTruthy("sale_done") },
    ];
  }, [filteredRows, rows, serverCustomerKpiCount]);

  const visitDateKpiRows = useMemo(() => [
    { label: "V1", value: filteredRows.filter((row) => hasValue(row.first_visit_date)).length },
    { label: "V2", value: filteredRows.filter((row) => hasValue(row.second_visit_date)).length },
    { label: "V3", value: filteredRows.filter((row) => hasValue(row.third_visit_date)).length },
  ], [filteredRows]);

  const kpiModalItems = useMemo(() => {
    const primary = kpiItems.filter((item) => PRIMARY_KPI_LABELS.has(item.label));
    const secondary = kpiItems.filter((item) => !PRIMARY_KPI_LABELS.has(item.label));
    return [...primary, ...secondary, { label: "Visit Date Summary", value: null }];
  }, [kpiItems]);

  const employeeSummaryTotals = useMemo(() => {
    const customerNameKeys = new Set();
    const customerMobileKeys = new Set();
    filteredRows.forEach((row) => {
      if (isCustomerMetricEligible(row)) customerNameKeys.add(String(row.client_name).trim());
      if (hasValue(row?.phone_number)) customerMobileKeys.add(String(row.phone_number).trim());
    });
    return {
      records: filteredRows.length,
      customerNames: customerNameKeys.size,
      customerMobiles: customerMobileKeys.size,
      dataCollect: filteredRows.filter((row) => hasValue(getDataCollectByValue(row))).length,
      totalSale: filteredRows.filter((row) => Boolean(row.sale_done) && hasValue(getSoldByValue(row))).length,
      firstVisit: filteredRows.filter((row) => hasValue(getFirstVisitByValue(row))).length,
      secondVisit: filteredRows.filter((row) => hasValue(getSecondVisitByValue(row))).length,
      thirdVisit: filteredRows.filter((row) => hasValue(getThirdVisitByValue(row))).length,
      botMessage: filteredRows.filter((row) => Boolean(row.bot_message)).length,
      interested: filteredRows.filter((row) => Boolean(row.not_interested)).length,
      withFacebook: filteredRows.filter((row) => hasValue(row.facebook_id_link)).length,
      withMessenger: filteredRows.filter((row) => hasValue(row.chat_link)).length,
    };
  }, [filteredRows]);

  // ── pagination ─────────────────────────────────────────────────────────────
  const activityViewCount =
    activityTab === ACTIVITY_TAB_EMPLOYEE ? sortedEmployeeRows.length
    : activityTab === ACTIVITY_TAB_TEAM ? sortedTeamRows.length
    : activityTab === ACTIVITY_TAB_USER_RATIO ? (selectedRatioUser ? 1 : 0)
    : filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(activityViewCount / perPage));

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredRows.slice(start, start + perPage);
  }, [filteredRows, currentPage, perPage]);

  const pagedEmployeeRows = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sortedEmployeeRows.slice(start, start + perPage);
  }, [sortedEmployeeRows, currentPage, perPage]);

  const pagedTeamRows = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sortedTeamRows.slice(start, start + perPage);
  }, [sortedTeamRows, currentPage, perPage]);

  const selectablePagedRowIds = useMemo(
    () => pagedRows.filter((row) => canManageActivityRow(row)).map((row) => row.id),
    [pagedRows, canManageActivityRow]
  );
  const allSelectableRowsChecked = selectablePagedRowIds.length > 0 && selectablePagedRowIds.every((id) => selectedActivityIds.includes(id));
  const someSelectableRowsChecked = selectablePagedRowIds.some((id) => selectedActivityIds.includes(id)) && !allSelectableRowsChecked;

  useEffect(() => { setCurrentPage(1); }, [search, perPage, filters, activityTab, employeeSort]);
  useEffect(() => { if (!canViewSummaryTabs && activityTab !== ACTIVITY_TAB_ALL) setActivityTab(ACTIVITY_TAB_ALL); }, [canViewSummaryTabs, activityTab]);
  useEffect(() => {
    const available = new Set(rows.map((row) => row.id));
    setSelectedActivityIds((prev) => prev.filter((id) => available.has(id)));
  }, [rows]);

  // ── select options ─────────────────────────────────────────────────────────
  const collectByOptions = useMemo(
    () => usersDirectory.map((u) => ({ value: String(u?.id ?? ""), label: String(getUserDisplayName(u) || u?.email || "") }))
      .filter((o) => hasValue(o.value) && hasValue(o.label))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [usersDirectory]
  );

  const teamSelectOptions = useMemo(() => filterOptions.teams.map((t) => ({ value: t, label: t })), [filterOptions.teams]);
  const selectedTeamOptions = useMemo(() => teamSelectOptions.filter((o) => draftFilters.teams.includes(o.value)), [teamSelectOptions, draftFilters.teams]);
  const teamMemberSelectOptions = useMemo(() => filterOptions.dataCollectors.map((c) => ({ value: c, label: c })), [filterOptions.dataCollectors]);
  const selectedTeamMemberOptions = useMemo(() => teamMemberSelectOptions.filter((o) => draftFilters.dataCollectors.includes(o.value)), [teamMemberSelectOptions, draftFilters.dataCollectors]);
  const seriousnessSelectOptions = useMemo(() => filterOptions.seriousnessLevels.map((l) => ({ value: l, label: l })), [filterOptions.seriousnessLevels]);
  const selectedSeriousnessOptions = useMemo(() => seriousnessSelectOptions.filter((o) => draftFilters.seriousnessLevel.includes(o.value)), [seriousnessSelectOptions, draftFilters.seriousnessLevel]);

  // ── sorting helpers ────────────────────────────────────────────────────────
  const toggleEmployeeSort = useCallback((key) => {
    setEmployeeSort((prev) => prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "desc" });
  }, []);
  const getEmployeeSortIndicator = useCallback((key) => {
    if (employeeSort.key !== key) return "↕";
    return employeeSort.direction === "asc" ? "↑" : "↓";
  }, [employeeSort]);

  // ── draft helpers ──────────────────────────────────────────────────────────
  const updateEditDraft = useCallback((field, value) => setEditRowDraft((prev) => ({ ...prev, [field]: value })), []);
  const updateAddNewDraft = useCallback((field, value) => setAddNewDraft((prev) => ({ ...prev, [field]: value })), []);

  // ── modal openers / closers ────────────────────────────────────────────────
  const openAddNewModal = () => {
    setAddNewDraft({ ...EMPTY_DRAFT_ADD, collectById: loggedInUserId });
    setIsAddNewModalOpen(true);
  };
  const closeAddNewModal = () => setIsAddNewModalOpen(false);

  const openRowEditModal = (row) => {
    if (!canManageActivityRow(row)) { toast.error("You can edit only your team member records."); return; }
    setActionMenuRowId(null);
    const toDateVal = (v) => {
      if (!v) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return String(v);
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    };
    const findUserIdByName = (name) => {
      const raw = String(name ?? "").trim();
      if (!raw) return "";
      const m = usersDirectory.find((u) => String(getUserDisplayName(u) ?? "").trim() === raw);
      return m?.id != null ? String(m.id) : "";
    };
    setEditingRowId(row?.id ?? null);
    setEditRowDraft({
      clientName: String(row?.client_name ?? ""),
      phoneNumber: String(row?.phone_number ?? ""),
      facebookLink: String(row?.facebook_id_link ?? ""),
      messengerLink: String(row?.chat_link ?? ""),
      collectById: findUserIdByName(getDataCollectByValue(row)),
      profileLevel: normalizeProfileLevel(row?.profile_level) || "",
      seriousnessLevel: normalizeSeriousnessLevel(row?.seriousness_level) || "",
      firstVisitDate: toDateVal(row?.first_visit_date),
      firstVisitById: findUserIdByName(getFirstVisitByValue(row)),
      secondVisitDate: toDateVal(row?.second_visit_date),
      secondVisitById: findUserIdByName(getSecondVisitByValue(row)),
      thirdVisitDate: toDateVal(row?.third_visit_date),
      thirdVisitById: findUserIdByName(getThirdVisitByValue(row)),
      soldDate: toDateVal(getSoldDateValue(row)),
      soldById: findUserIdByName(getSoldByValue(row)),
      botMessage: Boolean(row?.bot_message),
      interested: Boolean(row?.not_interested),
      saleDone: Boolean(row?.sale_done),
      note: String(row?.note ?? ""),
    });
    setIsRowEditModalOpen(true);
  };
  const closeRowEditModal = () => { setIsRowEditModalOpen(false); setEditingRowId(null); };

  // ── CRUD actions ───────────────────────────────────────────────────────────
  const submitAddNewActivity = useCallback(async (event) => {
    event.preventDefault();
    try {
      const payload = {
        client_name: addNewDraft.customerName.trim() || null,
        phone_number: addNewDraft.customerMobile.trim() || null,
        data_collect_by: addNewDraft.collectById ? Number(addNewDraft.collectById) : null,
        facebook_id_link: addNewDraft.facebookLink.trim() || null,
        chat_link: addNewDraft.messengerLink.trim() || null,
        profile_level: addNewDraft.profileLevel || null,
        seriousness_level: addNewDraft.seriousnessLevel || null,
        first_visit_date: addNewDraft.firstVisitDate || null,
        first_visit_by: addNewDraft.firstVisitById ? Number(addNewDraft.firstVisitById) : null,
        second_visit_date: addNewDraft.secondVisitDate || null,
        second_visit_by: addNewDraft.secondVisitById ? Number(addNewDraft.secondVisitById) : null,
        third_visit_date: addNewDraft.thirdVisitDate || null,
        third_visit_by: addNewDraft.thirdVisitById ? Number(addNewDraft.thirdVisitById) : null,
        sold_date: addNewDraft.soldDate || null,
        sold_by: addNewDraft.soldById ? Number(addNewDraft.soldById) : null,
        bot_message: Boolean(addNewDraft.botMessage),
        not_interested: Boolean(addNewDraft.interested),
        sale_done: Boolean(addNewDraft.saleDone),
        note: addNewDraft.note.trim() || null,
      };
      const response = await commandApi.post("/api/sales-team-activities", payload);
      const newRow = response?.data?.data;
      if (newRow) setRows((prev) => [newRow, ...prev]); else await fetchRows();
      toast.success("Activity created successfully");
      setActivityFlashMessage({ type: "success", text: "Activity created successfully." });
      closeAddNewModal();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to create activity";
      toast.error(msg);
      setActivityFlashMessage({ type: "error", text: msg });
    }
  }, [addNewDraft, commandApi, fetchRows]);

  const saveEditedRow = useCallback(async (event) => {
    event.preventDefault();
    if (editingRowId == null) { closeRowEditModal(); return; }
    try {
      const payload = {
        client_name: editRowDraft.clientName.trim(),
        phone_number: editRowDraft.phoneNumber.trim() || null,
        facebook_id_link: editRowDraft.facebookLink.trim() || null,
        chat_link: editRowDraft.messengerLink.trim() || null,
        data_collect_by: editRowDraft.collectById ? Number(editRowDraft.collectById) : null,
        profile_level: editRowDraft.profileLevel || null,
        seriousness_level: editRowDraft.seriousnessLevel || null,
        first_visit_date: editRowDraft.firstVisitDate || null,
        first_visit_by: editRowDraft.firstVisitById ? Number(editRowDraft.firstVisitById) : null,
        second_visit_date: editRowDraft.secondVisitDate || null,
        second_visit_by: editRowDraft.secondVisitById ? Number(editRowDraft.secondVisitById) : null,
        third_visit_date: editRowDraft.thirdVisitDate || null,
        third_visit_by: editRowDraft.thirdVisitById ? Number(editRowDraft.thirdVisitById) : null,
        sold_date: editRowDraft.soldDate || null,
        sold_by: editRowDraft.soldById ? Number(editRowDraft.soldById) : null,
        bot_message: Boolean(editRowDraft.botMessage),
        not_interested: Boolean(editRowDraft.interested),
        sale_done: Boolean(editRowDraft.saleDone),
        note: editRowDraft.note.trim() || null,
      };
      const response = await commandApi.put(`/api/sales-team-activities/${editingRowId}`, payload);
      const updated = response?.data?.data;
      if (updated) setRows((prev) => prev.map((row) => (row?.id === editingRowId ? { ...row, ...updated } : row)));
      else await fetchRows();
      toast.success("Activity updated successfully");
      setActivityFlashMessage({ type: "success", text: "Activity updated successfully." });
      closeRowEditModal();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to update activity";
      toast.error(msg);
      setActivityFlashMessage({ type: "error", text: msg });
    }
  }, [editRowDraft, editingRowId, commandApi, fetchRows]);

  const deleteRow = useCallback(async (row) => {
    if (!canManageActivityRow(row)) { toast.error("You can delete only your team member records."); return; }
    if (!row?.id) return;
    const result = await Swal.fire({
      title: "Delete activity?", text: "This action cannot be undone.", icon: "warning",
      showCancelButton: true, confirmButtonText: "Yes, delete it", cancelButtonText: "Cancel", confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await commandApi.delete(`/api/sales-team-activities/${row.id}`);
      toast.success("Activity deleted successfully");
      setActionMenuRowId(null);
      await fetchRows();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete activity");
    }
  }, [commandApi, fetchRows, canManageActivityRow]);

  const bulkDeleteRows = useCallback(async () => {
    const deletable = rows.filter((row) => selectedActivityIds.includes(row.id) && canManageActivityRow(row));
    if (!deletable.length) { toast.error("No deletable activity selected."); return; }
    const result = await Swal.fire({
      title: "Delete selected activities?", text: `You are about to delete ${deletable.length} record(s). This action cannot be undone.`,
      icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete all", cancelButtonText: "Cancel", confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(deletable.map((row) => commandApi.delete(`/api/sales-team-activities/${row.id}`)));
      toast.success(`${deletable.length} activity record(s) deleted successfully`);
      setSelectedActivityIds([]);
      setActionMenuRowId(null);
      await fetchRows();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete selected activity");
    }
  }, [rows, selectedActivityIds, canManageActivityRow, commandApi, fetchRows]);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full p-6 space-y-4">
      <ActivityToolbar
        activityTab={activityTab} setActivityTab={setActivityTab}
        canViewSummaryTabs={canViewSummaryTabs} pblTeamInfos={pblTeamInfos}
        showPblTeamScope={userMode === "pbl" && !hasMenuFullAccess}
        search={search} setSearch={setSearch} perPage={perPage} setPerPage={setPerPage}
        canShowFilterSalesTeamButton={canShowFilterSalesTeamButton}
        canShowOverviewSalesTeamButton={canShowOverviewSalesTeamButton}
        canShowAddSalesTeamButton={canShowAddSalesTeamButton}
        onOpenFilterPanel={() => { setDraftFilters(filters); setIsFilterPanelOpen(true); }}
        onOpenKpiModal={() => setIsKpiModalOpen(true)}
        onOpenAddNewModal={openAddNewModal}
        onBulkDelete={bulkDeleteRows}
        selectedActivityIds={selectedActivityIds}
        activityFlashMessage={activityFlashMessage}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {activityTab === ACTIVITY_TAB_ALL ? (
            <AllActivityTable
              loading={loading} pagedRows={pagedRows}
              canManageActivityRow={canManageActivityRow}
              selectedActivityIds={selectedActivityIds} setSelectedActivityIds={setSelectedActivityIds}
              selectablePagedRowIds={selectablePagedRowIds}
              allSelectableRowsChecked={allSelectableRowsChecked}
              someSelectableRowsChecked={someSelectableRowsChecked}
              onEditRow={openRowEditModal} onDeleteRow={deleteRow}
              actionMenuRowId={actionMenuRowId} setActionMenuRowId={setActionMenuRowId}
            />
          ) : activityTab === ACTIVITY_TAB_EMPLOYEE ? (
            <EmployeeSummaryTable
              loading={loading} pagedEmployeeRows={pagedEmployeeRows}
              sortedEmployeeRows={sortedEmployeeRows} employeeSummaryTotals={employeeSummaryTotals}
              filteredRows={filteredRows} toggleEmployeeSort={toggleEmployeeSort}
              getEmployeeSortIndicator={getEmployeeSortIndicator}
            />
          ) : activityTab === ACTIVITY_TAB_TEAM ? (
            <TeamSummaryTable
              loading={loading} pagedTeamRows={pagedTeamRows}
              sortedTeamRows={sortedTeamRows} employeeSummaryTotals={employeeSummaryTotals}
              filteredRows={filteredRows} toggleEmployeeSort={toggleEmployeeSort}
              getEmployeeSortIndicator={getEmployeeSortIndicator}
            />
          ) : (
            <UserRatioTab
              userRatioOptions={userRatioOptions} selectedRatioUser={selectedRatioUser}
              setSelectedRatioUser={setSelectedRatioUser} ratioCharts={ratioCharts}
            />
          )}
        </div>
      </div>

      <PaginationBar
        currentPage={currentPage} setCurrentPage={setCurrentPage}
        totalPages={totalPages} perPage={perPage} activityViewCount={activityViewCount}
      />

      <KpiSummaryModal
        isOpen={isKpiModalOpen} onClose={() => setIsKpiModalOpen(false)}
        kpiModalItems={kpiModalItems} visitDateKpiRows={visitDateKpiRows}
      />

      <AddActivityModal
        isOpen={isAddNewModalOpen} onClose={closeAddNewModal}
        draft={addNewDraft} updateDraft={updateAddNewDraft}
        onSubmit={submitAddNewActivity} collectByOptions={collectByOptions}
        seriousnessOptions={activitySeriousnessOptions}
      />

      <EditActivityModal
        isOpen={isRowEditModalOpen} onClose={closeRowEditModal}
        draft={editRowDraft} updateDraft={updateEditDraft}
        onSubmit={saveEditedRow} collectByOptions={collectByOptions}
        seriousnessOptions={activitySeriousnessOptions}
      />

      <ActivityFilterDrawer
        isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)}
        draftFilters={draftFilters} setDraftFilters={setDraftFilters}
        filterOptions={filterOptions}
        teamSelectOptions={teamSelectOptions} selectedTeamOptions={selectedTeamOptions}
        teamMemberSelectOptions={teamMemberSelectOptions} selectedTeamMemberOptions={selectedTeamMemberOptions}
        seriousnessSelectOptions={seriousnessSelectOptions} selectedSeriousnessOptions={selectedSeriousnessOptions}
        onApply={() => { setFilters(draftFilters); setIsFilterPanelOpen(false); }}
      />
    </div>
  );
};

export default SalesTeamActivityDataTable;
