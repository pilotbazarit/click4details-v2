"use client";
import CustomDatePicker from "@/components/CustomDatePicker";
import RangeSlider from "@/components/RangeSlider";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import constData from "@/lib/constant";
import CustomerService from "@/services/CustomerService";
import MasterDataService from "@/services/MasterDataService";
import UserService from "@/services/UserService";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import SelectBase from "react-select";

const EditCustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // States for dropdown data
  const [purchaseReasonData, setPurchaseReasonData] = useState([]);
  const [clientIncomeData, setClientIncomeData] = useState([]);
  const [bankLoanAmountData, setBankLoanAmountData] = useState([]);
  const [carAvailableData, setCarAvailableData] = useState([]);
  const [clientAttitudeData, setClientAttitudeData] = useState([]);
  const [clientProfessionData, setClientProfessionData] = useState([]);
  const [clientLevelData, setClientLevelData] = useState([]);
  const [clientSeriousnessData, setClientSeriousnessData] = useState([]);
  const [carExchangeCategoryData, setCarExchangeCategoryData] = useState([]);
  const [clientCompanyTransactionData, setClientCompanyTransactionData] = useState([]);

  // States for form fields
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [purchaseReason, setPurchaseReason] = useState("");
  const [interestedLoan, setInterestedLoan] = useState("");
  const [bankLoanAmount, setBankLoanAmount] = useState("");
  const [carAvailable, setCarAvailable] = useState("");
  const [clientIncome, setClientIncome] = useState("");
  const [clientCompanyTransaction, setClientCompanyTransaction] = useState("");
  const [facebookIdLink, setFacebookIdLink] = useState("");
  const [facebookMessengerLink, setFacebookMessengerLink] = useState("");
  const [clientLevel, setClientLevel] = useState("");
  const [clientSeriousness, setClientSeriousness] = useState("");
  const [clientAttitude, setClientAttitude] = useState([]);
  const [clientProfession, setClientProfession] = useState("");
  const [carExchangeCategory, setCarExchangeCategory] = useState("");
  const [description, setDescription] = useState("");
  const [readyBudget, setReadyBudget] = useState([0, 500000000]);
  const [clientLastPurchaseDate, setClientLastPurchaseDate] = useState(null);
  const [visitingCardImage, setVisitingCardImage] = useState(null);
  const [displayVisitingCardImage, setDisplayVisitingCardImage] = useState(null);
  const [readyBudgetInputInFocus, setReadyBudgetInputInFocus] = useState(null);
  const [activityRecordId, setActivityRecordId] = useState(null);
  const [activityUsers, setActivityUsers] = useState([]);
  const [activityDraft, setActivityDraft] = useState({
    collectById: "",
    firstVisitDate: "",
    firstVisitById: "",
    secondVisitDate: "",
    secondVisitById: "",
    thirdVisitDate: "",
    thirdVisitById: "",
    soldDate: "",
    soldById: "",
    botMessage: false,
    interested: false,
    saleDone: false,
    note: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownsLoading, setIsDropdownsLoading] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const api = useMemo(() => createApiRequest(API_URL), []);
  const selectMenuPortalTarget = typeof window !== "undefined" ? document.body : null;
  const sharedSelectStyles = useMemo(
    () => ({
      menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
      }),
      menu: (base) => ({
        ...base,
        zIndex: 9999,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "#ffffff",
        color: state.isSelected ? "#ffffff" : "#1f2937",
      }),
    }),
    []
  );
  const Select = useCallback(
    ({ styles, menuPortalTarget, menuPosition, ...props }) => (
      <SelectBase
        {...props}
        menuPortalTarget={menuPortalTarget ?? selectMenuPortalTarget}
        menuPosition={menuPosition ?? "fixed"}
        styles={styles ?? sharedSelectStyles}
      />
    ),
    [selectMenuPortalTarget, sharedSelectStyles]
  );

  // Populate form with customer data on open, or reset for create
  useEffect(() => {
    if (!customer?.id) {
      setCustomerName("");
      setCustomerMobile("");
      setCustomerEmail("");
      setCustomerAddress("");
      setDateOfBirth("");
      setAnniversaryDate("");
      setPurchaseReason("");
      setInterestedLoan("");
      setFacebookIdLink("");
      setFacebookMessengerLink("");
      setClientCompanyTransaction("");
      setBankLoanAmount("");
      setClientIncome("");
      setClientLevel("");
      setClientSeriousness("");
      setCarExchangeCategory("");
      setDescription("");
      setCarAvailable("");
      setClientAttitude([]);
      setClientProfession("");
      setClientLastPurchaseDate(null);
      setReadyBudget([0, 500000000]);
      setVisitingCardImage(null);
      setDisplayVisitingCardImage(null);
      return;
    }

    const formatDateForInput = (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "");

    const getValue = (field) => {
      if (field === null || field === undefined) return "";
      const id = typeof field === "object" ? field.md_id : field;
      const numId = parseInt(id, 10);
      return isNaN(numId) ? "" : numId;
    };

    setCustomerName(customer.name || "");
    setCustomerMobile(customer.mobile || "");
    setCustomerEmail(customer.email || "");
    setCustomerAddress(customer.address || "");
    setDateOfBirth(formatDateForInput(customer.date_of_birth));
    setAnniversaryDate(formatDateForInput(customer.anniversary_date));
    setPurchaseReason(getValue(customer.purchase_reason));
    setInterestedLoan(customer.interested_for_loan || "");
    setFacebookIdLink(customer.facebook_id_link || "");
    setFacebookMessengerLink(customer.facebook_messenger_link || "");
    setClientCompanyTransaction(getValue(customer.client_company_transaction));
    setBankLoanAmount(getValue(customer.bank_loan_amount));
    setClientIncome(getValue(customer.client_income_per_month));
    setClientLevel(getValue(customer.client_level));
    setClientSeriousness(getValue(customer.client_seriousness));
    setCarExchangeCategory(getValue(customer.car_exchange_category_per_year));
    setDescription(customer.description || "");
    setCarAvailable(getValue(customer.car_available));
    setClientAttitude(customer.client_attitude ? String(customer.client_attitude).split(",").map(Number) : []);
    setClientProfession(getValue(customer.client_profession));
    setClientLastPurchaseDate(customer.client_last_purchase_date || null);
    setReadyBudget(customer.ready_budget ? JSON.parse(customer.ready_budget) : [0, 500000000]);
    setDisplayVisitingCardImage(customer.visiting_card_image_url || null);
  }, [customer]);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setIsDropdownsLoading(true);
      try {
        const services = [
          MasterDataService.Queries.getMasterDataByTypeCode(constData.PURCHASE_REASON_MD_CODE),
          MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_INCOME_MD_CODE),
          MasterDataService.Queries.getMasterDataByTypeCode(constData.BANK_LOAN_AMOUNT_MD_CODE),
          MasterDataService.Queries.getMasterDataByTypeCode(constData.CAR_AVAILABLE_MD_CODE),
          MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_ATTITUDE_MD_CODE),
          MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_PROFESSION_MD_CODE),
          MasterDataService.Queries.getMasterDataByTypeCode("client_level_1758127591"),
          MasterDataService.Queries.getMasterDataByTypeCode("client_seriousness_1758128063"),
          MasterDataService.Queries.getMasterDataByTypeCode("car_exchange_category_per_year_1758128234"),
          MasterDataService.Queries.getMasterDataByTypeCode("client_company_transaction_per_year_1758360851"),
        ];
        const responses = await Promise.all(services);
        const formatOptions = (response, placeholder) => [
          { value: "", label: placeholder },
          ...(response.data?.master_data.map((item) => ({ value: item.md_id, label: item.md_title })) || []),
        ];

        setPurchaseReasonData(formatOptions(responses[0], "-Select Purchase Reason-"));
        setClientIncomeData(formatOptions(responses[1], "-Select Client Income-"));
        setBankLoanAmountData(formatOptions(responses[2], "-Select Bank Loan Amount-"));
        setCarAvailableData(formatOptions(responses[3], "-Select Car Available-"));
        setClientAttitudeData(formatOptions(responses[4], "-Select Client Attitude-"));
        setClientProfessionData(formatOptions(responses[5], "-Select Client Profession-"));
        setClientLevelData(formatOptions(responses[6], "-Select Client Level-"));
        setClientSeriousnessData(formatOptions(responses[7], "-Select Client Seriousness-"));
        setCarExchangeCategoryData(formatOptions(responses[8], "-Select Car Exchange Category-"));
        setClientCompanyTransactionData(formatOptions(responses[9], "-Select Client Company Transaction-"));
      } catch (error) {
        toast.error("Failed to load selection data.");
      } finally {
        setIsDropdownsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchActivityContext = async () => {
      setIsActivityLoading(true);
      try {
        const usersResponse = await UserService.Queries.getUserList();
        const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
        setActivityUsers(users);

        if (!customer?.id) {
          setActivityRecordId(null);
          setActivityDraft({
            collectById: "",
            firstVisitDate: "",
            firstVisitById: "",
            secondVisitDate: "",
            secondVisitById: "",
            thirdVisitDate: "",
            thirdVisitById: "",
            soldDate: "",
            soldById: "",
            botMessage: false,
            interested: false,
            saleDone: false,
            note: "",
          });
          return;
        }

        const activitiesResponse = await api.get(`api/sales-team-activities?customer_id=${customer.id}`);
        const activities = Array.isArray(activitiesResponse?.data)
          ? activitiesResponse.data
          : Array.isArray(activitiesResponse?.data?.data)
            ? activitiesResponse.data.data
            : [];
        const selected = activities[0];
        if (!selected) {
          setActivityRecordId(null);
          return;
        }

        const toDateInputValue = (value) => {
          if (!value) return "";
          const text = String(value);
          if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
          return date.toISOString().slice(0, 10);
        };
        const resolveUserId = (idOrName) => {
          if (idOrName !== null && idOrName !== undefined && idOrName !== "") {
            const numeric = Number(idOrName);
            if (!Number.isNaN(numeric)) return String(numeric);
            const byName = users.find((item) => String(item?.name ?? "").trim() === String(idOrName).trim());
            return byName?.id != null ? String(byName.id) : "";
          }
          return "";
        };

        setActivityRecordId(selected.id);
        setActivityDraft({
          collectById: resolveUserId(selected?.data_collect_by ?? selected?.data_collect_by_name),
          firstVisitDate: toDateInputValue(selected?.first_visit_date),
          firstVisitById: resolveUserId(selected?.first_visit_by ?? selected?.first_visit_by_name),
          secondVisitDate: toDateInputValue(selected?.second_visit_date),
          secondVisitById: resolveUserId(selected?.second_visit_by ?? selected?.second_visit_by_name),
          thirdVisitDate: toDateInputValue(selected?.third_visit_date),
          thirdVisitById: resolveUserId(selected?.third_visit_by ?? selected?.third_visit_by_name),
          soldDate: toDateInputValue(selected?.sold_date),
          soldById: resolveUserId(selected?.sold_by ?? selected?.sold_by_name),
          botMessage: Boolean(selected?.bot_message),
          interested: Boolean(selected?.not_interested),
          saleDone: Boolean(selected?.sale_done),
          note: String(selected?.note ?? ""),
        });
      } catch {
        setActivityUsers([]);
        setActivityRecordId(null);
      } finally {
        setIsActivityLoading(false);
      }
    };

    fetchActivityContext();
  }, [customer?.id, api]);

  const handleSaveCustomer = async () => {
    if (!customerName) {
      toast.error("Please enter a customer name.");
      return;
    }

    const customerData = {
      ...(customer?.id ? { id: customer.id } : {}),
      name: customerName,
      mobile: customerMobile,
      email: customerEmail,
      address: customerAddress,
      date_of_birth: dateOfBirth,
      anniversary_date: anniversaryDate,
      purchase_reason: String(purchaseReason),
      interested_for_loan: interestedLoan,
      bank_loan_amount: String(bankLoanAmount),
      car_available: String(carAvailable),
      client_income_per_month: String(clientIncome),
      client_company_transaction: String(clientCompanyTransaction),
      facebook_id_link: facebookIdLink,
      facebook_messenger_link: facebookMessengerLink,
      client_level: String(clientLevel),
      client_seriousness: String(clientSeriousness),
      car_exchange_category_per_year: String(carExchangeCategory),
      description: description,
      ready_budget: JSON.stringify(readyBudget),
      client_last_purchase_date: clientLastPurchaseDate ? dayjs(clientLastPurchaseDate).format("YYYY-MM-DD") : null,
      visiting_card_image: visitingCardImage,
      client_attitude: Array.isArray(clientAttitude) ? clientAttitude.join(",") : String(clientAttitude),
      client_profession: String(clientProfession),
    };

    const buildActivityPayload = (customerId) => {
      const normalizedMobile = customerMobile.replace(/\D/g, "").slice(-11);
      return {
        customer_id: Number(customerId),
        client_name: customerName.trim(),
        phone_number: normalizedMobile || null,
        data_collect_by: activityDraft.collectById ? Number(activityDraft.collectById) : null,
        facebook_id_link: facebookIdLink.trim() || null,
        chat_link: facebookMessengerLink.trim() || null,
        profile_level: String(clientLevel || "").trim() || null,
        seriousness_level: String(clientSeriousness || "").trim() || null,
        first_visit_date: activityDraft.firstVisitDate || null,
        first_visit_by: activityDraft.firstVisitById ? Number(activityDraft.firstVisitById) : null,
        second_visit_date: activityDraft.secondVisitDate || null,
        second_visit_by: activityDraft.secondVisitById ? Number(activityDraft.secondVisitById) : null,
        third_visit_date: activityDraft.thirdVisitDate || null,
        third_visit_by: activityDraft.thirdVisitById ? Number(activityDraft.thirdVisitById) : null,
        sold_date: activityDraft.soldDate || null,
        sold_by: activityDraft.soldById ? Number(activityDraft.soldById) : null,
        bot_message: Boolean(activityDraft.botMessage),
        not_interested: Boolean(activityDraft.interested),
        sale_done: Boolean(activityDraft.saleDone),
        note: activityDraft.note.trim() || null,
      };
    };

    const syncActivityForCustomer = async (customerId) => {
      if (!customerId) return;
      try {
        if (activityRecordId) {
          await api.put(`api/sales-team-activities/${activityRecordId}`, buildActivityPayload(customerId));
          return;
        }
        const listRes = await api.get(`api/sales-team-activities`, { params: { customer_id: customerId } });
        const list = Array.isArray(listRes?.data) ? listRes.data : [];
        const first = list[0];
        if (first?.id) {
          await api.put(`api/sales-team-activities/${first.id}`, buildActivityPayload(customerId));
        }
      } catch (e) {
        console.error(e);
      }
    };

    setIsSaving(true);
    let saveSucceeded = false;
    let savedCustomerRow = null;
    try {
      const response = await CustomerService.Commands.saveCustomerInfo(customerData);
      if (response.status === "success") {
        savedCustomerRow = response.data ?? null;
        const effectiveCustomerId = savedCustomerRow?.id ?? customer?.id;
        await syncActivityForCustomer(effectiveCustomerId);
        saveSucceeded = true;
        toast.success(isCreateMode ? "Customer created successfully!" : "Customer information saved successfully!");
        onClose();
      } else {
        toast.error(response.message || "Failed to save customer information.");
      }
    } catch (error) {
      console.error("Failed to save customer information:", error);
      const errorPayload =
        error?.response?.data && typeof error.response.data === "object"
          ? error.response.data
          : error && typeof error === "object"
            ? error
            : null;
      const validationErrors = errorPayload?.errors;
      const firstValidationMessage =
        validationErrors && typeof validationErrors === "object"
          ? Object.values(validationErrors).flat().find((message) => typeof message === "string" && message.trim() !== "")
          : null;
      const backendMessage =
        firstValidationMessage ||
        errorPayload?.message ||
        errorPayload?.error ||
        error?.message ||
        "An error occurred while saving customer information.";
      toast.error(backendMessage);
    } finally {
      setIsSaving(false);
      if (saveSucceeded) {
        onSuccess?.(savedCustomerRow);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVisitingCardImage(file);
      setDisplayVisitingCardImage(URL.createObjectURL(file));
    }
  };

  const isInitializing = isDropdownsLoading || isActivityLoading;
  const isCreateMode = !customer?.id;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-7xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">{isCreateMode ? "Add New Customer" : "Edit Customer"}</h3>
          <button onClick={onClose} className="text-black">
            &times;
          </button>
        </div>
        {isInitializing ? (
          <div className="mt-4 flex min-h-[360px] items-center justify-center">
            <div className="flex items-center gap-3 text-gray-700">
              <svg className="h-6 w-6 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-90" />
              </svg>
              <span className="text-sm font-medium">{isCreateMode ? "Loading form…" : "Loading customer edit data..."}</span>
            </div>
          </div>
        ) : (
        <div className="mt-4 max-h-[65vh] overflow-y-auto p-4">
          {/* Customer Info  */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* Customer Mobile */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="customer-mobile">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  id="customer-mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  className="outline-none py-2 px-3 rounded border border-gray-500/40 w-full"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                />
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="customer-name">
                Customer Name
              </label>
              <input
                id="customer-name"
                type="text"
                placeholder="Enter customer name"
                className="outline-none py-2 px-3 rounded border border-gray-500/40"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Customer Email */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="customer-email">
                Email
              </label>
              <input
                id="customer-email"
                type="email"
                placeholder="Enter email address"
                className="outline-none py-2 px-3 rounded border border-gray-500/40"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            {/* Customer Address */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="customer-address">
                Address
              </label>
              <input
                id="customer-address"
                type="text"
                placeholder="Enter customer address"
                className="outline-none py-2 px-3 rounded border border-gray-500/40"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6 mt-4">
            {/* Purchase Reason */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="purchase-reason">
                Purchase Reason
              </label>
              <Select
                id="purchase-reason"
                options={purchaseReasonData}
                value={purchaseReasonData.find((opt) => opt.value === purchaseReason) || null}
                onChange={(option) => setPurchaseReason(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="-Select Purchase Reason-"
              />
            </div>
            {/* Ready Budget (Price Range) */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="ready-budget-range">
                Ready Budget (Price Range)
              </label>
              <div className="flex gap-2">
                <input
                  id="ready-budget-min"
                  type="text"
                  value={readyBudgetInputInFocus === "min" ? readyBudget?.[0] : (readyBudget?.[0] || 0).toLocaleString()}
                  onFocus={() => setReadyBudgetInputInFocus("min")}
                  onBlur={() => setReadyBudgetInputInFocus(null)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (!isNaN(value)) {
                      setReadyBudget([Number(value), readyBudget?.[1] || 500000000]);
                    }
                  }}
                  className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                />
                <span className="self-center">to</span>
                <input
                  id="ready-budget-max"
                  type="text"
                  value={readyBudgetInputInFocus === "max" ? readyBudget?.[1] : (readyBudget?.[1] || 500000000).toLocaleString()}
                  onFocus={() => setReadyBudgetInputInFocus("max")}
                  onBlur={() => setReadyBudgetInputInFocus(null)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (!isNaN(value)) {
                      setReadyBudget([readyBudget?.[0] || 0, Number(value)]);
                    }
                  }}
                  className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                />
              </div>
              <div className="mt-2 px-6">
                <RangeSlider budget={readyBudget || [0, 500000000]} setBudget={setReadyBudget} />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="date-of-birth">
                Date of Birth
              </label>
              <input
                id="date-of-birth"
                type="date"
                className="outline-none py-2 px-3 rounded border border-gray-500/40"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            {/* Anniversary Date */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="anniversary-date">
                Anniversary Date
              </label>
              <input
                id="anniversary-date"
                type="date"
                className="outline-none py-2 px-3 rounded border border-gray-500/40"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Loan Info  */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {/* Interested for Loan */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="interested-loan">
                Interested for Loan
              </label>
              <Select
                id="interested-loan"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={interestedLoan ? { value: interestedLoan, label: interestedLoan === "yes" ? "Yes" : "No" } : null}
                onChange={(option) => setInterestedLoan(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select option"
              />
            </div>
            {/* Bank Loan Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="bank-loan-amount">
                Bank Loan Amount
              </label>
              <Select
                id="bank-loan-amount"
                options={bankLoanAmountData}
                value={bankLoanAmountData.find((opt) => opt.value === bankLoanAmount) || null}
                onChange={(option) => setBankLoanAmount(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="-Select Bank Loan Amount-"
              />
            </div>

            {/* Car Available */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="car-available">
                Car Available
              </label>
              <Select
                id="car-available"
                options={carAvailableData}
                value={carAvailableData.find((opt) => opt.value === carAvailable) || null}
                onChange={(option) => setCarAvailable(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="-Select Car Available-"
              />
            </div>

            {/* Client Attitude */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="client-attitude">
                Client Attitude
              </label>
              <Select
                id="client-attitude"
                options={clientAttitudeData}
                isMulti
                value={clientAttitude ? clientAttitudeData.filter((opt) => clientAttitude.includes(opt.value)) : []}
                onChange={(selectedOptions) => {
                  const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                  setClientAttitude(values);
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="-Select Client Attitude-"
              />
            </div>

            {/* Client Profession */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="client-profession">
                Client Profession
              </label>
              <Select
                id="client-profession"
                options={clientProfessionData}
                value={clientProfessionData.find((opt) => opt.value === clientProfession) || null}
                onChange={(option) => setClientProfession(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="-Select Client Profession-"
              />
            </div>
            {/* Client Income */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="client-income">
                Client Income Per Month
              </label>
              <Select
                id="client-income"
                options={clientIncomeData}
                value={clientIncomeData.find((opt) => opt.value === clientIncome) || null}
                onChange={(option) => setClientIncome(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="-Select Client Income-"
              />
            </div>
            {/* Client Company Transaction */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="client-company-transaction">
                Client Company Transaction Per Year
              </label>
              <Select
                id="client-company-transaction"
                options={clientCompanyTransactionData}
                value={clientCompanyTransactionData.find((opt) => opt.value === clientCompanyTransaction) || null}
                onChange={(option) => setClientCompanyTransaction(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="-Select Company Transaction-"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="facebook-id-link">
                Facebook Id Link
              </label>
              <input
                id="facebook-id-link"
                type="text"
                placeholder="Enter Facebook id link"
                className="outline-none py-2 px-3 rounded border border-gray-500/40"
                value={facebookIdLink}
                onChange={(e) => setFacebookIdLink(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="facebook-messenger-link">
                Facebook Messenger Link
              </label>
              <input
                id="facebook-messenger-link"
                type="text"
                placeholder="Enter Facebook messenger link"
                className="outline-none py-2 px-3 rounded border border-gray-500/40"
                value={facebookMessengerLink}
                onChange={(e) => setFacebookMessengerLink(e.target.value)}
              />
            </div>
          </div>

          {/* Performance Info */}
          <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6 mt-8">
            {/* Client Level */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="client-level">
                Client Level
              </label>
              <Select
                id="client-level"
                options={clientLevelData}
                value={clientLevelData.find((opt) => opt.value === clientLevel) || null}
                onChange={(option) => setClientLevel(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select level"
              />
            </div>
            {/* Client Seriousness */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="client-seriousness">
                Client Seriousness
              </label>
              <Select
                id="client-seriousness"
                options={clientSeriousnessData}
                value={clientSeriousnessData.find((opt) => opt.value === clientSeriousness) || null}
                onChange={(option) => setClientSeriousness(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select seriousness"
              />
            </div>
            {/* Car Exchange Category */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="car-exchange-category">
                Car Exchange Category Per Year
              </label>
              <Select
                id="car-exchange-category"
                options={carExchangeCategoryData}
                value={carExchangeCategoryData.find((opt) => opt.value === carExchangeCategory) || null}
                onChange={(option) => setCarExchangeCategory(option ? option.value : "")}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select car exchange category"
              />
            </div>

            {/* Client Last Purchase Date */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="client-last-purchase-date">
                Client Last Purchase Date
              </label>

              <CustomDatePicker selected={clientLastPurchaseDate} onChange={(date) => setClientLastPurchaseDate(date)} placeholderText="Select date" />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1 col-span-2 w-full">
              <label className="text-base font-medium" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter description"
                className="outline-none py-2 px-3 rounded border border-gray-500/40 resize-none w-full"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="visiting-card-upload-modal" />
              <Button type="button" onClick={() => typeof window !== "undefined" && document.getElementById("visiting-card-upload-modal").click()}>
                Upload Visiting Card
              </Button>
              {displayVisitingCardImage ? (
                <div>
                  <img src={displayVisitingCardImage} alt="Visiting Card" className="mt-2 max-w-xs h-auto border border-gray-300 rounded-md" />
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No visiting card uploaded.</p>
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <h4 className="text-xl font-semibold mb-4">Activity Update Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Collect By</label>
                <Select
                  options={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).filter((o) => o.value && o.label)}
                  value={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).find((o) => o.value === activityDraft.collectById) || null}
                  onChange={(option) => setActivityDraft((p) => ({ ...p, collectById: option?.value || "" }))}
                  isClearable
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Sold By</label>
                <Select
                  options={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).filter((o) => o.value && o.label)}
                  value={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).find((o) => o.value === activityDraft.soldById) || null}
                  onChange={(option) => setActivityDraft((p) => ({ ...p, soldById: option?.value || "" }))}
                  isClearable
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Visit 1 Date</label>
                <input type="date" className="outline-none py-2 px-3 rounded border border-gray-500/40" value={activityDraft.firstVisitDate} onChange={(e) => setActivityDraft((p) => ({ ...p, firstVisitDate: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Visit 1 By</label>
                <Select
                  options={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).filter((o) => o.value && o.label)}
                  value={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).find((o) => o.value === activityDraft.firstVisitById) || null}
                  onChange={(option) => setActivityDraft((p) => ({ ...p, firstVisitById: option?.value || "" }))}
                  isClearable
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Visit 2 Date</label>
                <input type="date" className="outline-none py-2 px-3 rounded border border-gray-500/40" value={activityDraft.secondVisitDate} onChange={(e) => setActivityDraft((p) => ({ ...p, secondVisitDate: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Visit 2 By</label>
                <Select
                  options={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).filter((o) => o.value && o.label)}
                  value={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).find((o) => o.value === activityDraft.secondVisitById) || null}
                  onChange={(option) => setActivityDraft((p) => ({ ...p, secondVisitById: option?.value || "" }))}
                  isClearable
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Visit 3 Date</label>
                <input type="date" className="outline-none py-2 px-3 rounded border border-gray-500/40" value={activityDraft.thirdVisitDate} onChange={(e) => setActivityDraft((p) => ({ ...p, thirdVisitDate: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Visit 3 By</label>
                <Select
                  options={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).filter((o) => o.value && o.label)}
                  value={activityUsers.map((u) => ({ value: String(u?.id ?? ""), label: String(u?.name ?? u?.email ?? "") })).find((o) => o.value === activityDraft.thirdVisitById) || null}
                  onChange={(option) => setActivityDraft((p) => ({ ...p, thirdVisitById: option?.value || "" }))}
                  isClearable
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-base font-medium">Sold Date</label>
                <input type="date" className="outline-none py-2 px-3 rounded border border-gray-500/40" value={activityDraft.soldDate} onChange={(e) => setActivityDraft((p) => ({ ...p, soldDate: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1 lg:col-span-4">
                <label className="text-base font-medium">Note</label>
                <textarea rows={3} className="outline-none py-2 px-3 rounded border border-gray-500/40 resize-y" value={activityDraft.note} onChange={(e) => setActivityDraft((p) => ({ ...p, note: e.target.value }))} />
              </div>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={activityDraft.botMessage} onChange={(e) => setActivityDraft((p) => ({ ...p, botMessage: e.target.checked }))} />
                Bot Message
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={activityDraft.interested} onChange={(e) => setActivityDraft((p) => ({ ...p, interested: e.target.checked }))} />
                Interested
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={activityDraft.saleDone} onChange={(e) => setActivityDraft((p) => ({ ...p, saleDone: e.target.checked }))} />
                Sale Done
              </label>
            </div>
          </div>
        </div>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving || isInitializing}
            onClick={() => handleSaveCustomer()}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors border rounded-md bg-orange-500 text-white border-orange-500 disabled:cursor-not-allowed  hover:bg-orange-600"
          >
            {isCreateMode ? "Create Customer" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
