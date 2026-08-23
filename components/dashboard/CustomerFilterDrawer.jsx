"use client";

import { useEffect, useMemo, useState } from "react";
import SelectBase from "react-select";
import { X } from "lucide-react";
import FilterProductService from "@/services/FilterProductService";
import UserService from "@/services/UserService";
import { getMenuPortalTarget, sharedSelectStyles } from "./sales-team-activity/selectConfig";

const Select = (props) => (
  <SelectBase
    {...props}
    menuPortalTarget={getMenuPortalTarget()}
    menuPosition="fixed"
    styles={compactSelectStyles}
  />
);

export const DEFAULT_CUSTOMER_FILTERS = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  hasFacebook: false,
  hasMessenger: false,
  clientSeriousnessFrom: "",
  clientSeriousnessTo: "",
  clientAttitude: [],
  clientLevel: [],
  clientProfession: [],
  clientIncome: [],
  clientCompanyTransaction: "",
  purchaseReason: [],
  interestedForLoan: "",
  bankLoanAmountFrom: "",
  bankLoanAmountTo: "",
  carAvailable: [],
  carExchangeCategory: [],
  customerSearch: "",
  dateOfBirthFrom: "",
  dateOfBirthTo: "",
  anniversaryDateFrom: "",
  anniversaryDateTo: "",
  lastPurchaseFrom: "",
  lastPurchaseTo: "",
  createdBy: "",
  createdFrom: "",
  createdTo: "",
  note: "",
};

const fieldClass = "w-full min-w-0 border border-gray-300 rounded-sm px-2 py-1 text-sm bg-white focus:outline-none focus:border-blue-500";
const labelClass = "w-full sm:w-[145px] shrink-0 text-left sm:text-right text-[13px] text-gray-600 sm:pr-2";
const rowClass = "flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2";

const compactSelectStyles = {
  ...sharedSelectStyles,
  control: (base, state) => ({
    ...sharedSelectStyles.control(base, state),
    minHeight: 30,
    height: 30,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 30,
  }),
};

const withoutEmptyOption = (options = []) => (options || []).filter((opt) => opt.value !== "" && opt.value != null);

const seriousnessRank = (label) => {
  const text = String(label || "").trim().toLowerCase();
  if (text.includes("emergency")) return 5;
  if (text.includes("critical")) return 4;
  if (text.includes("high")) return 3;
  if (text.includes("medium")) return 2;
  if (text.includes("low")) return 1;
  return 0;
};

const sortSeriousnessOptions = (options = []) =>
  [...options].sort((a, b) => {
    const rankDiff = seriousnessRank(a.label) - seriousnessRank(b.label);
    if (rankDiff !== 0) return rankDiff;
    return String(a.label).localeCompare(String(b.label));
  });

const bankLoanAmountRank = (label) => {
  const match = String(label || "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const sortBankLoanOptions = (options = []) =>
  [...options].sort((a, b) => {
    const rankDiff = bankLoanAmountRank(a.label) - bankLoanAmountRank(b.label);
    if (rankDiff !== 0) return rankDiff;
    return String(a.label).localeCompare(String(b.label));
  });

const loanInterestOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const CustomerFilterDrawer = ({
  isOpen,
  onClose,
  draftFilters,
  setDraftFilters,
  onApply,
  onReset,
  showCreatedByFilter,
}) => {
  const [seriousnessOptions, setSeriousnessOptions] = useState([]);
  const [attitudeOptions, setAttitudeOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [professionOptions, setProfessionOptions] = useState([]);
  const [incomeOptions, setIncomeOptions] = useState([]);
  const [companyTxnOptions, setCompanyTxnOptions] = useState([]);
  const [purchaseReasonOptions, setPurchaseReasonOptions] = useState([]);
  const [bankLoanOptions, setBankLoanOptions] = useState([]);
  const [carAvailableOptions, setCarAvailableOptions] = useState([]);
  const [carExchangeOptions, setCarExchangeOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      try {
        const [
          seriousness,
          attitude,
          level,
          profession,
          income,
          companyTxn,
          purchaseReason,
          bankLoan,
          carAvailable,
          carExchange,
          usersResponse,
        ] = await Promise.all([
          FilterProductService.Queries.getClientSeriousnessOptions(),
          FilterProductService.Queries.getClientAttitudeOptions(),
          FilterProductService.Queries.getClientLevelOptions(),
          FilterProductService.Queries.getClientProfessionOptions(),
          FilterProductService.Queries.getClientIncomeOptions(),
          FilterProductService.Queries.getClientCompanyTransactionOptions(),
          FilterProductService.Queries.getPurchaseReasonOptions(),
          FilterProductService.Queries.getBankLoanAmountOptions(),
          FilterProductService.Queries.getCarAvailableOptions(),
          FilterProductService.Queries.getCarExchangeCategoryOptions(),
          UserService.Queries.getUserList({ user_mode: "pbl" }),
        ]);

        setSeriousnessOptions(sortSeriousnessOptions(withoutEmptyOption(seriousness)));
        setAttitudeOptions(withoutEmptyOption(attitude));
        setLevelOptions(withoutEmptyOption(level));
        setProfessionOptions(withoutEmptyOption(profession));
        setIncomeOptions(withoutEmptyOption(income));
        setCompanyTxnOptions(withoutEmptyOption(companyTxn));
        setPurchaseReasonOptions(withoutEmptyOption(purchaseReason));
        setBankLoanOptions(sortBankLoanOptions(withoutEmptyOption(bankLoan)));
        setCarAvailableOptions(withoutEmptyOption(carAvailable));
        setCarExchangeOptions(withoutEmptyOption(carExchange));

        const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
        setUserOptions(
          users
            .map((user) => ({
              value: String(user?.id ?? ""),
              label: String(user?.name ?? user?.email ?? ""),
            }))
            .filter((opt) => opt.value && opt.label)
        );
      } catch {
        setSeriousnessOptions([]);
        setAttitudeOptions([]);
        setLevelOptions([]);
        setProfessionOptions([]);
        setIncomeOptions([]);
        setCompanyTxnOptions([]);
        setPurchaseReasonOptions([]);
        setBankLoanOptions([]);
        setCarAvailableOptions([]);
        setCarExchangeOptions([]);
        setUserOptions([]);
      }
    };

    loadOptions();
  }, [isOpen]);

  const selectedAttitudeOptions = useMemo(
    () => attitudeOptions.filter((opt) => draftFilters.clientAttitude.map(String).includes(String(opt.value))),
    [attitudeOptions, draftFilters.clientAttitude]
  );

  const selectedLevelOptions = useMemo(
    () =>
      levelOptions.filter((opt) =>
        (Array.isArray(draftFilters.clientLevel) ? draftFilters.clientLevel : []).map(String).includes(String(opt.value))
      ),
    [levelOptions, draftFilters.clientLevel]
  );

  const selectedProfessionOptions = useMemo(
    () =>
      professionOptions.filter((opt) =>
        (Array.isArray(draftFilters.clientProfession) ? draftFilters.clientProfession : []).map(String).includes(String(opt.value))
      ),
    [professionOptions, draftFilters.clientProfession]
  );

  const selectedIncomeOptions = useMemo(
    () =>
      incomeOptions.filter((opt) =>
        (Array.isArray(draftFilters.clientIncome) ? draftFilters.clientIncome : []).map(String).includes(String(opt.value))
      ),
    [incomeOptions, draftFilters.clientIncome]
  );

  const selectedPurchaseReasonOptions = useMemo(
    () =>
      purchaseReasonOptions.filter((opt) =>
        (Array.isArray(draftFilters.purchaseReason) ? draftFilters.purchaseReason : []).map(String).includes(String(opt.value))
      ),
    [purchaseReasonOptions, draftFilters.purchaseReason]
  );

  const selectedCarAvailableOptions = useMemo(
    () =>
      carAvailableOptions.filter((opt) =>
        (Array.isArray(draftFilters.carAvailable) ? draftFilters.carAvailable : []).map(String).includes(String(opt.value))
      ),
    [carAvailableOptions, draftFilters.carAvailable]
  );

  const selectedCarExchangeOptions = useMemo(
    () =>
      carExchangeOptions.filter((opt) =>
        (Array.isArray(draftFilters.carExchangeCategory) ? draftFilters.carExchangeCategory : []).map(String).includes(String(opt.value))
      ),
    [carExchangeOptions, draftFilters.carExchangeCategory]
  );

  const selectedCreatedByOption = useMemo(
    () => userOptions.find((opt) => opt.value === String(draftFilters.createdBy)) || null,
    [userOptions, draftFilters.createdBy]
  );

  if (!isOpen) return null;

  const updateFilter = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const selectValue = (options, value) => options.find((opt) => String(opt.value) === String(value)) || null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-full sm:max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2.5">
            <label className={rowClass}>
              <span className={labelClass}>Name</span>
              <input
                type="text"
                value={draftFilters.name}
                onChange={(e) => updateFilter("name", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            <label className={rowClass}>
              <span className={labelClass}>Mobile</span>
              <input
                type="text"
                value={draftFilters.mobile}
                onChange={(e) => updateFilter("mobile", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            <label className={rowClass}>
              <span className={labelClass}>Email</span>
              <input
                type="text"
                value={draftFilters.email}
                onChange={(e) => updateFilter("email", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            <label className={rowClass}>
              <span className={labelClass}>Address</span>
              <input
                type="text"
                value={draftFilters.address}
                onChange={(e) => updateFilter("address", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            <div className={rowClass}>
              <span className={labelClass}>Facebook</span>
              <input
                type="checkbox"
                checked={!!draftFilters.hasFacebook}
                onChange={(e) => updateFilter("hasFacebook", e.target.checked)}
                className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Messenger</span>
              <input
                type="checkbox"
                checked={!!draftFilters.hasMessenger}
                onChange={(e) => updateFilter("hasMessenger", e.target.checked)}
                className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Seriousness</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Select
                    isClearable
                    options={seriousnessOptions}
                    value={selectValue(seriousnessOptions, draftFilters.clientSeriousnessFrom)}
                    onChange={(option) => updateFilter("clientSeriousnessFrom", option?.value || "")}
                    placeholder="From"
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
                <span className="text-gray-400 text-sm shrink-0">-</span>
                <div className="flex-1 min-w-0">
                  <Select
                    isClearable
                    options={seriousnessOptions}
                    value={selectValue(seriousnessOptions, draftFilters.clientSeriousnessTo)}
                    onChange={(option) => updateFilter("clientSeriousnessTo", option?.value || "")}
                    placeholder="To"
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Attitude</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={attitudeOptions}
                  value={selectedAttitudeOptions}
                  onChange={(selected) => updateFilter("clientAttitude", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Level</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={levelOptions}
                  value={selectedLevelOptions}
                  onChange={(selected) => updateFilter("clientLevel", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Profession</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={professionOptions}
                  value={selectedProfessionOptions}
                  onChange={(selected) => updateFilter("clientProfession", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Income / Month</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={incomeOptions}
                  value={selectedIncomeOptions}
                  onChange={(selected) => updateFilter("clientIncome", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Company Txn</span>
              <div className="flex-1 min-w-0">
                <Select
                  isClearable
                  options={companyTxnOptions}
                  value={selectValue(companyTxnOptions, draftFilters.clientCompanyTransaction)}
                  onChange={(option) => updateFilter("clientCompanyTransaction", option?.value || "")}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Purchase Reason</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={purchaseReasonOptions}
                  value={selectedPurchaseReasonOptions}
                  onChange={(selected) => updateFilter("purchaseReason", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Interested Loan</span>
              <div className="flex-1 min-w-0">
                <Select
                  isClearable
                  options={loanInterestOptions}
                  value={selectValue(loanInterestOptions, draftFilters.interestedForLoan)}
                  onChange={(option) => updateFilter("interestedForLoan", option?.value || "")}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Bank Loan Amount</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Select
                    isClearable
                    options={bankLoanOptions}
                    value={selectValue(bankLoanOptions, draftFilters.bankLoanAmountFrom)}
                    onChange={(option) => updateFilter("bankLoanAmountFrom", option?.value || "")}
                    placeholder="From"
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
                <span className="text-gray-400 text-sm shrink-0">-</span>
                <div className="flex-1 min-w-0">
                  <Select
                    isClearable
                    options={bankLoanOptions}
                    value={selectValue(bankLoanOptions, draftFilters.bankLoanAmountTo)}
                    onChange={(option) => updateFilter("bankLoanAmountTo", option?.value || "")}
                    placeholder="To"
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Car Available</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={carAvailableOptions}
                  value={selectedCarAvailableOptions}
                  onChange={(selected) => updateFilter("carAvailable", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Car Exchange</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={carExchangeOptions}
                  value={selectedCarExchangeOptions}
                  onChange={(selected) => updateFilter("carExchangeCategory", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <label className={rowClass}>
              <span className={labelClass}>Search Data</span>
              <input
                type="text"
                value={draftFilters.customerSearch}
                onChange={(e) => updateFilter("customerSearch", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            <div className={rowClass}>
              <span className={labelClass}>Date of Birth</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <input
                  type="date"
                  value={draftFilters.dateOfBirthFrom}
                  onChange={(e) => updateFilter("dateOfBirthFrom", e.target.value)}
                  className={fieldClass}
                  aria-label="Date of birth from"
                />
                <span className="text-gray-400 text-sm shrink-0">-</span>
                <input
                  type="date"
                  value={draftFilters.dateOfBirthTo}
                  onChange={(e) => updateFilter("dateOfBirthTo", e.target.value)}
                  className={fieldClass}
                  aria-label="Date of birth to"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Anniversary</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <input
                  type="date"
                  value={draftFilters.anniversaryDateFrom}
                  onChange={(e) => updateFilter("anniversaryDateFrom", e.target.value)}
                  className={fieldClass}
                  aria-label="Anniversary from"
                />
                <span className="text-gray-400 text-sm shrink-0">-</span>
                <input
                  type="date"
                  value={draftFilters.anniversaryDateTo}
                  onChange={(e) => updateFilter("anniversaryDateTo", e.target.value)}
                  className={fieldClass}
                  aria-label="Anniversary to"
                />
              </div>
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Last Purchase</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <input
                  type="date"
                  value={draftFilters.lastPurchaseFrom}
                  onChange={(e) => updateFilter("lastPurchaseFrom", e.target.value)}
                  className={fieldClass}
                  aria-label="Last purchase from"
                />
                <span className="text-gray-400 text-sm shrink-0">-</span>
                <input
                  type="date"
                  value={draftFilters.lastPurchaseTo}
                  onChange={(e) => updateFilter("lastPurchaseTo", e.target.value)}
                  className={fieldClass}
                  aria-label="Last purchase to"
                />
              </div>
            </div>

            {showCreatedByFilter && (
              <div className={rowClass}>
                <span className={labelClass}>Created By</span>
                <div className="flex-1 min-w-0">
                  <Select
                    isClearable
                    isSearchable
                    options={userOptions}
                    value={selectedCreatedByOption}
                    onChange={(option) => updateFilter("createdBy", option?.value || "")}
                    placeholder="-None-"
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            )}

            <div className={rowClass}>
              <span className={labelClass}>Created Time</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <input
                  type="date"
                  value={draftFilters.createdFrom}
                  onChange={(e) => updateFilter("createdFrom", e.target.value)}
                  className={fieldClass}
                  aria-label="Created from"
                />
                <span className="text-gray-400 text-sm shrink-0">-</span>
                <input
                  type="date"
                  value={draftFilters.createdTo}
                  onChange={(e) => updateFilter("createdTo", e.target.value)}
                  className={fieldClass}
                  aria-label="Created to"
                />
              </div>
            </div>

            <label className={rowClass}>
              <span className={labelClass}>Note</span>
              <input
                type="text"
                value={draftFilters.note}
                onChange={(e) => updateFilter("note", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex justify-start gap-2">
          <button
            type="button"
            onClick={onReset}
            className="border border-slate-300 rounded-md px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="border border-indigo-600 rounded-md px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilterDrawer;
