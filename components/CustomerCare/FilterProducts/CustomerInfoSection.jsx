"use client";

import CustomDatePicker from "@/components/CustomDatePicker";
import RangeSlider from "@/components/RangeSlider";
import FollowupModal from "@/components/modals/FollowupModal";
import PasswordModal from "@/components/modals/PasswordModal";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import constData from "@/lib/constant";
import MasterDataService from "@/services/MasterDataService";
import SearchHistoryService from "@/services/SearchHistoryService";
import dayjs from "dayjs";
import { Plus, User, Users, Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import Link from "next/link";

const CustomerInfoSection = ({
  customerName,
  setCustomerName,
  customerMobile,
  setCustomerMobile,
  selectedCustomerId,
  setSelectedCustomerId,
  customerEmail,
  setCustomerEmail,
  customerAddress,
  setCustomerAddress,
  purchaseReason,
  setPurchaseReason,
  interestedLoan,
  setInterestedLoan,
  bankLoanAmount,
  setBankLoanAmount,
  clientIncome,
  setClientIncome,
  clientCompanyTransaction,
  setClientCompanyTransaction,
  facebookLink,
  setFacebookLink,
  clientLevel,
  setClientLevel,
  clientSeriousness,
  setClientSeriousness,
  purchaseReasonData,
  setPurchaseReasonData,
  clientIncomeData,
  setClientIncomeData,
  bankLoanAmountData,
  setBankLoanAmountData,
  carAvailable,
  setCarAvailable,
  carAvailableData,
  setCarAvailableData,
  clientAttitude,
  setClientAttitude,
  clientAttitudeData,
  setClientAttitudeData,
  clientProfession,
  setClientProfession,
  clientProfessionData,
  setClientProfessionData,
  carExchangeCategory,
  setCarExchangeCategory,
  description,
  setDescription,
  searchHistory,
  setSearchHistory,
  visitingCardImage,
  setVisitingCardImage,
  originalVisitingCardFile,
  setOriginalVisitingCardFile,
  modalOpen,
  setModalOpen,
  displayVisitingCardImage,
  setDisplayVisitingCardImage,
  imageToCrop,
  setImageToCrop,
  isLoading,
  setIsLoading,
  isFollowupModalOpen,
  setIsFollowupModalOpen,
  selectedFollowupForEdit,
  setSelectedFollowupForEdit,
  showCustomerInfo,
  setShowCustomerInfo,
  showAdditionalInfo,
  setShowAdditionalInfo,
  isPasswordModalOpen,
  setIsPasswordModalOpen,
  readyBudgetInputInFocus,
  setReadyBudgetInputInFocus,
  filterFields,
  setFilterFields,
  normalizedUser,
  canSeeCustomerInfo,
  userRoleName,
  operationType,
  setOperationType,
  oldHistoryId,
  setOldHistoryId,
  getAllProduct,
  setIsConsolidatedView,
  setSearchType,
  setSelectedUserModes,
}) => {
  const api = createApiRequest(API_URL);

  const handleOpenFollowupModal = (customerId = null) => {
    setSelectedFollowupForEdit(null);
    setIsFollowupModalOpen(true);
  };

  const handleOpenFollowupModalWithCustomer = (customerId) => {
    setSelectedFollowupForEdit(null);
    setIsFollowupModalOpen(true);
  };

  const handleCloseFollowupModal = () => {
    setIsFollowupModalOpen(false);
    setSelectedCustomerId(null);
  };

  const handleFollowupSuccess = () => {
    setIsFollowupModalOpen(false);
    toast.success("Follow-up created successfully!");
  };

  const fetchCustomerDetailsBasedOnMobile = async (mobile) => {
    try {
      const [customerResponse, response] = await Promise.all([
        SearchHistoryService.Queries.getCustomerByMobile(mobile),
        SearchHistoryService.Queries.getSearchHistory(mobile),
      ]);

      if (customerResponse.status === "success") {
        setCustomerName(customerResponse.data.name || "");
        setCustomerEmail(customerResponse.data.email || "");
        setCustomerAddress(customerResponse.data.address || "");
        setSelectedCustomerId(customerResponse.data.id || null);

        setPurchaseReason(customerResponse.data.customer_info?.purchaseReason || "");
        setInterestedLoan(customerResponse.data.customer_info?.interestedLoan || "");
        setClientCompanyTransaction(customerResponse.data.customer_info?.clientCompanyTransaction || "");
        setBankLoanAmount(customerResponse.data.customer_info?.bankLoanAmount || "");
        setClientIncome(customerResponse.data.customer_info?.clientIncome || "");
        setClientLevel(customerResponse.data.customer_info?.clientLevel || "");
        setClientSeriousness(customerResponse.data.customer_info?.clientSeriousness || "");
        setCarExchangeCategory(customerResponse.data.customer_info?.carExchangeCategory || "");
        setDescription(customerResponse.data.customer_info?.description || "");
        setCarAvailable(customerResponse.data.customer_info?.carAvailable || "");
        setClientAttitude(customerResponse.data.customer_info?.clientAttitude || "");
        setClientProfession(customerResponse.data.customer_info?.clientProfession || "");
      } else {
        setSelectedCustomerId(null);
        setSearchHistory([]);
      }

      if (response.status === "success") {
        setSearchHistory(response.data);
      } else {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch search history:", error);
      setSearchHistory([]);
      toast.error("Failed to fetch search history.");
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  useEffect(() => {
    if (customerMobile) {
      fetchCustomerDetailsBasedOnMobile(customerMobile);
    }
  }, [customerMobile]);

  const handlePasswordVerify = async (password) => {
    try {
      const response = await api.post("api/verify-password", { password });
      if (response.status === "success") {
        setShowAdditionalInfo(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Password verification API error:", error);
      return false;
    }
  };

  const getPurchaseReasons = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.PURCHASE_REASON_MD_CODE);
      const purchaseReasonMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Purchase Reason-" },
        ...purchaseReasonMasterData.map((reason) => ({
          value: reason.md_id,
          label: reason.md_title,
        })),
      ];
      setPurchaseReasonData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getClientIncomes = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_INCOME_MD_CODE);
      const clientIncomeMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Income-" },
        ...clientIncomeMasterData.map((income) => ({
          value: income.md_id,
          label: income.md_title,
        })),
      ];
      setClientIncomeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getBankLoanAmounts = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.BANK_LOAN_AMOUNT_MD_CODE);
      const bankLoanAmountMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Bank Loan Amount-" },
        ...bankLoanAmountMasterData.map((loan) => ({
          value: loan.md_id,
          label: loan.md_title,
        })),
      ];
      setBankLoanAmountData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getCarAvailable = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CAR_AVAILABLE_MD_CODE);
      const carAvailableMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Car Available-" },
        ...carAvailableMasterData.map((car) => ({
          value: car.md_id,
          label: car.md_title,
        })),
      ];
      setCarAvailableData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getClientAttitude = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_ATTITUDE_MD_CODE);
      const clientAttitudeMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Attitude-" },
        ...clientAttitudeMasterData.map((attitude) => ({
          value: attitude.md_id,
          label: attitude.md_title,
        })),
      ];
      setClientAttitudeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getClientProfession = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_PROFESSION_MD_CODE);
      const clientProfessionMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Profession-" },
        ...clientProfessionMasterData.map((profession) => ({
          value: profession.md_id,
          label: profession.md_title,
        })),
      ];
      setClientProfessionData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  useEffect(() => {
    getPurchaseReasons();
    getClientIncomes();
    getBankLoanAmounts();
    getCarAvailable();
    getClientAttitude();
    getClientProfession();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalVisitingCardFile(file);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageToCrop(reader.result);
        setModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageData) => {
    const response = await fetch(croppedImageData);
    const blob = await response.blob();
    const croppedFile = new File([blob], "visiting_card.png", { type: "image/png" });
    setVisitingCardImage(croppedFile);
    setDisplayVisitingCardImage(URL.createObjectURL(croppedFile));
  };

  return (
    <>
      {canSeeCustomerInfo && (
        <div className="w-full mt-6 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-end md:px-10">
            <button
              type="button"
              onClick={() => handleOpenFollowupModal(selectedCustomerId)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Followup
            </button>
          </div>

          {searchHistory.length > 0 && (
            <div className="w-full mt-6 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between cursor-pointer select-none">
                <p className="text-lg font-semibold text-orange-700">Search History</p>
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {searchHistory.map((historyItem, index) => (
                  <li
                    key={index}
                    className="bg-gray-200 p-2 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => {
                      const historySearchParams = JSON.parse(historyItem.search_params);
                      const historyCustomerInfo = JSON.parse(historyItem.customer_info);

                      const searchParams = historySearchParams;
                      const customerInfo = historyCustomerInfo;

                      const formattedSearchParams = {
                        ...searchParams,
                        v_tax_token_exp_date_from: searchParams.v_tax_token_exp_date_from ? dayjs(searchParams.v_tax_token_exp_date_from).toDate() : null,
                        v_tax_token_exp_date_to: searchParams.v_tax_token_exp_date_to ? dayjs(searchParams.v_tax_token_exp_date_to).toDate() : null,
                        v_fitness_exp_date_from: searchParams.v_fitness_exp_date_from ? dayjs(searchParams.v_fitness_exp_date_from).toDate() : null,
                        v_fitness_exp_date_to: searchParams.v_fitness_exp_date_to ? dayjs(searchParams.v_fitness_exp_date_to).toDate() : null,
                        v_insurance_exp_date_from: searchParams.v_insurance_exp_date_from ? dayjs(searchParams.v_insurance_exp_date_from).toDate() : null,
                        v_insurance_exp_date_to: searchParams.v_insurance_exp_date_to ? dayjs(searchParams.v_insurance_exp_date_to).toDate() : null,
                        clientLastPurchaseDate: searchParams.clientLastPurchaseDate ? dayjs(searchParams.clientLastPurchaseDate).toDate() : null,
                      };
                      setFilterFields(formattedSearchParams);

                      setPurchaseReason(customerInfo.purchaseReason || "");
                      setInterestedLoan(customerInfo.interestedLoan || "");
                      setBankLoanAmount(customerInfo.bankLoanAmount || "");
                      setClientIncome(customerInfo.clientIncome || "");
                      setClientCompanyTransaction(customerInfo.clientCompanyTransaction || "");
                      setClientLevel(customerInfo.clientLevel || "");
                      setClientSeriousness(customerInfo.clientSeriousness || "");
                      setCarExchangeCategory(customerInfo.carExchangeCategory || "");
                      setDescription(customerInfo.description || "");
                      setCarAvailable(customerInfo.carAvailable || "");
                      setClientAttitude(customerInfo.clientAttitude || "");
                      setClientProfession(customerInfo.clientProfession || "");

                      setSearchType(searchParams.search_type || "wide");
                      setIsConsolidatedView(historyItem.consolidated === 1);
                      setSelectedUserModes(searchParams.user_modes || ["Partner"]);
                      setDisplayVisitingCardImage(historyItem.visiting_card_image || null);
                      setVisitingCardImage(null);

                      setOperationType("update_search");
                      setOldHistoryId(historyItem.id);

                      getAllProduct(formattedSearchParams, true);

                      toast.success("History loaded and search results updated.");
                    }}
                  >
                    <p className="text-sm text-[rgb(17,111,165)]">{dayjs(historyItem.created_at).format("YYYY-MM-DD hh:mm a")}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button type="button" className="mr-2 text-orange-600" onClick={() => setIsPasswordModalOpen(true)}>
                {showAdditionalInfo ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                    />
                  </svg>
                )}
              </button>
              <p className="text-lg font-semibold text-orange-700">Customer Information</p>
              {selectedCustomerId && customerName && (
                <Link href={`/dashboard/customers/${selectedCustomerId}`} className="ml-2 text-blue-600 hover:underline text-lg font-semibold" target="_blank">
                  ({customerName})
                </Link>
              )}
            </div>
            <div className="cursor-pointer select-none" onClick={() => setShowCustomerInfo((prev) => !prev)}>
              <span className="text-orange-600">
                {showCustomerInfo ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          {showCustomerInfo && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
                      onChange={async (e) => {
                        setCustomerMobile(e.target.value);
                        if (e.target.value.length >= 11) {
                          setIsLoading(true);
                          try {
                            const [customerResponse, response] = await Promise.all([
                              SearchHistoryService.Queries.getCustomerByMobile(e.target.value),
                              SearchHistoryService.Queries.getSearchHistory(e.target.value),
                            ]);

                            if (customerResponse.status === "success") {
                              setSelectedCustomerId(customerResponse.data.id || null);
                              setCustomerName(customerResponse.data.name || "");
                              setCustomerEmail(customerResponse.data.email || "");
                              setCustomerAddress(customerResponse.data.address || "");

                              setPurchaseReason(customerResponse.data.purchase_reason || "");
                              setInterestedLoan(customerResponse.data.interested_for_loan || "");
                              setClientCompanyTransaction(customerResponse.data.client_company_transaction || "");
                              setBankLoanAmount(customerResponse.data.bank_loan_amount || "");
                              setClientIncome(customerResponse.data.client_income_per_month || "");
                              setClientLevel(customerResponse.data.client_level || "");
                              setClientSeriousness(customerResponse.data.client_seriousness || "");
                              setCarExchangeCategory(customerResponse.data.car_exchange_category_per_year || "");
                              setDescription(customerResponse.data.description || "");
                              setCarAvailable(customerResponse.data.car_available || "");
                            } else {
                              setSelectedCustomerId(null);
                              setSearchHistory([]);
                            }

                            if (response.status === "success") {
                              setSearchHistory(response.data);
                            } else {
                              setSearchHistory([]);
                            }
                          } catch (error) {
                            console.error("Failed to fetch search history:", error);
                            setSearchHistory([]);
                            toast.error("Failed to fetch search history.");
                          } finally {
                            setIsLoading(false);
                          }
                        } else {
                          setSearchHistory([]);
                        }
                      }}
                    />
                    {isLoading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

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

              {showAdditionalInfo && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6 mt-4">
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
                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="ready-budget-range">
                        Ready Budget (Price Range)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="ready-budget-min"
                          type="text"
                          value={
                            readyBudgetInputInFocus === 'min'
                              ? filterFields.readyBudget?.[0]
                              : (filterFields.readyBudget?.[0] || 0).toLocaleString()
                          }
                          onFocus={() => setReadyBudgetInputInFocus('min')}
                          onBlur={() => setReadyBudgetInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, readyBudget: [Number(value), prev.readyBudget?.[1] || 500000000] }))
                            }
                          }}
                          className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                        />
                        <span className="self-center">to</span>
                        <input
                          id="ready-budget-max"
                          type="text"
                          value={
                            readyBudgetInputInFocus === 'max'
                              ? filterFields.readyBudget?.[1]
                              : (filterFields.readyBudget?.[1] || 500000000).toLocaleString()
                          }
                          onFocus={() => setReadyBudgetInputInFocus('max')}
                          onBlur={() => setReadyBudgetInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, readyBudget: [prev.readyBudget?.[0] || 0, Number(value)] }))
                            }
                          }}
                          className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                        />
                      </div>
                      <div className="mt-2 px-6">
                        <RangeSlider
                          budget={filterFields?.readyBudget || [0, 500000000]}
                          setBudget={(newBudget) => setFilterFields((prev) => ({ ...prev, readyBudget: newBudget }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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

                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="client-attitude">
                        Client Attitude
                      </label>
                      <Select
                        id="client-attitude"
                        options={clientAttitudeData}
                        value={clientAttitudeData.find((opt) => opt.value === clientAttitude) || null}
                        onChange={(option) => setClientAttitude(option ? option.value : "")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="-Select Client Attitude-"
                      />
                    </div>

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
                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="client-company-transaction">
                        Client Company Transaction
                      </label>
                      <input
                        id="client-company-transaction"
                        type="text"
                        placeholder="Enter company transaction"
                        className="outline-none py-2 px-3 rounded border border-gray-500/40"
                        value={clientCompanyTransaction}
                        onChange={(e) => setClientCompanyTransaction(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6 mt-8">
                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="facebook-link">
                        Facebook Link
                      </label>
                      <input
                        id="facebook-link"
                        type="text"
                        placeholder="Enter Facebook profile link"
                        className="outline-none py-2 px-3 rounded border border-gray-500/40"
                        value={facebookLink}
                        onChange={(e) => setFacebookLink(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="client-level">
                        Client Level
                      </label>
                      <Select
                        id="client-level"
                        options={[
                          { value: "regular", label: "Regular" },
                          { value: "vip", label: "VIP" },
                          { value: "new", label: "New" },
                        ]}
                        value={clientLevel ? { value: clientLevel, label: clientLevel.charAt(0).toUpperCase() + clientLevel.slice(1) } : null}
                        onChange={(option) => setClientLevel(option ? option.value : "")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select level"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="client-seriousness">
                        Client Seriousness
                      </label>
                      <Select
                        id="client-seriousness"
                        options={[
                          { value: "high", label: "High" },
                          { value: "medium", label: "Medium" },
                          { value: "low", label: "Low" },
                        ]}
                        value={
                          clientSeriousness
                            ? { value: clientSeriousness, label: clientSeriousness.charAt(0).toUpperCase() + clientSeriousness.slice(1) }
                            : null
                        }
                        onChange={(option) => setClientSeriousness(option ? option.value : "")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select seriousness"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="car-exchange-category">
                        Car Exchange Category Per Year
                      </label>
                      <input
                        id="car-exchange-category"
                        type="text"
                        placeholder="Enter car exchange category"
                        className="outline-none py-2 px-3 rounded border border-gray-500/40"
                        value={carExchangeCategory}
                        onChange={(e) => setCarExchangeCategory(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-base font-medium" htmlFor="client-last-purchase-date">
                        Client Last Purchase Date
                      </label>

                      <CustomDatePicker
                        selected={filterFields.clientLastPurchaseDate}
                        onChange={(date) => setFilterFields((prev) => ({ ...prev, clientLastPurchaseDate: date }))}
                        placeholderText="Select date"
                      />
                    </div>

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
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="visiting-card-upload" />
                      <Button type="button" onClick={() => typeof window !== "undefined" && document.getElementById("visiting-card-upload").click()}>
                        Upload Visiting Card
                      </Button>
                      {displayVisitingCardImage ? (
                        <div>
                          <img
                            src={displayVisitingCardImage}
                            alt="Cropped Visiting Card"
                            className="mt-2 max-w-xs h-auto border border-gray-300 rounded-md"
                          />
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No visiting card uploaded.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      <FollowupModal
        isOpen={isFollowupModalOpen}
        onClose={handleCloseFollowupModal}
        onSuccess={handleFollowupSuccess}
        customerId={selectedCustomerId}
        selectedFollowup={selectedFollowupForEdit}
      />
      <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onVerify={handlePasswordVerify} />
    </>
  );
};

export default CustomerInfoSection;
