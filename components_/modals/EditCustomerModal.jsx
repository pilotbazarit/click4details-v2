"use client";
import CustomDatePicker from "@/components/CustomDatePicker";
import RangeSlider from "@/components/RangeSlider";
import { Button } from "@/components/ui/button";
import constData from "@/lib/constant";
import CustomerService from "@/services/CustomerService";
import MasterDataService from "@/services/MasterDataService";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

const EditCustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
  if (!isOpen) return null;

  console.log(customer);

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
  const [dateOfBirth, setDateOfBirth] = useState(null);
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

  const [loading, setLoading] = useState(false);

  // Populate form with customer data on open
  useEffect(() => {
    if (customer) {
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
    }
  }, [customer]);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveCustomer = async () => {
    if (!customerName) {
      toast.error("Please enter a customer name.");
      return;
    }

    const customerData = {
      id: customer.id, // Important for update
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
      visiting_card_image: visitingCardImage, // This is the new file if any
      client_attitude: Array.isArray(clientAttitude) ? clientAttitude.join(",") : String(clientAttitude),
      client_profession: String(clientProfession),
    };

    setLoading(true);
    try {
      const response = await CustomerService.Commands.saveCustomerInfo(customerData);
      if (response.status === "success") {
        toast.success("Customer information saved successfully!");
        onClose();
      } else {
        toast.error(response.message || "Failed to save customer information. 1");
      }
    } catch (error) {
      console.error("Failed to save customer information:", error);
      toast.error("An error occurred while saving customer information. 2");
    } finally {
      setLoading(false);
      onSuccess();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVisitingCardImage(file);
      setDisplayVisitingCardImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-7xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Edit Customer</h3>
          <button onClick={onClose} className="text-black">
            &times;
          </button>
        </div>
        <div className="mt-4 max-h-[65vh] overflow-y-auto p-4">
          {/* Customer Info  */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* Customer Mobile */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="customer-mobile">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  disabled={true}
                  id="customer-mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  className="outline-none py-2 px-3 rounded border border-gray-500/40 w-full hover:cursor-not-allowed bg-gray-100"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                />
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="customer-name">
                Customer Name <span className="text-red-500">*</span>
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
        </div>
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
            disabled={loading}
            onClick={() => handleSaveCustomer()}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors border rounded-md bg-orange-500 text-white border-orange-500 disabled:cursor-not-allowed  hover:bg-orange-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
