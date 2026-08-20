import { normalizeUrgentSaleFilter } from "@/services/FilterProductService";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const SearchHistorySection = ({
  searchHistory,
  showSearchHistory,
  setShowSearchHistory,
  oldHistoryId,
  setFilterFields,
  setPurchaseReason,
  setInterestedLoan,
  setBankLoanAmount,
  setCarAvailable,
  setClientIncome,
  setClientCompanyTransaction,
  setFacebookIdLink,
  setFacebookMessengerLink,
  setClientLevel,
  setClientSeriousness,
  setCarExchangeCategory,
  setDescription,
  setSearchType,
  setStrictSortOrder,
  setIsConsolidatedView,
  setSelectedUserModes,
  shopsData,
  setSelectedShops,
  setDisplayVisitingCardImage,
  setVisitingCardImage,
  setOperationType,
  setOldHistoryId,
  getAllProduct,
}) => {
  if (searchHistory.length === 0) return null;

  return (
    <div className="w-full mt-6 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowSearchHistory((prev) => !prev)}>
        <p className="text-lg font-semibold text-blue-700">Search History</p>
        <span className="text-blue-600">
          {showSearchHistory ? (
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

      {showSearchHistory && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {searchHistory.map((historyItem, index) => (
            <li
              key={index}
              className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                historyItem.id === oldHistoryId ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => {
                const historySearchParams = JSON.parse(historyItem.search_params);
                const historyCustomerInfo = JSON.parse(historyItem.customer_info);

                const searchParams = historySearchParams;
                const customerInfo = historyCustomerInfo;

                const formattedSearchParams = {
                  ...searchParams,
                  v_urgent_sale: normalizeUrgentSaleFilter(searchParams.v_urgent_sale),
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
                setCarAvailable(customerInfo.carAvailable || "");
                setClientIncome(customerInfo.clientIncome || "");
                setClientCompanyTransaction(customerInfo.clientCompanyTransaction || "");
                setFacebookIdLink(customerInfo.facebook_id_link || "");
                setFacebookMessengerLink(customerInfo.facebook_messenger_link || "");
                setClientLevel(customerInfo.clientLevel || "");
                setClientSeriousness(customerInfo.clientSeriousness || "");
                setCarExchangeCategory(customerInfo.carExchangeCategory || "");
                setDescription(customerInfo.description || "");

                setSearchType(searchParams.search_type || "wide");
                setStrictSortOrder(searchParams.strict_sort || searchParams.sort_order || "");
                setIsConsolidatedView(historyItem.consolidated === 1);
                setSelectedUserModes(searchParams.user_modes || ["Partner"]);

                if (searchParams.shops && Array.isArray(searchParams.shops)) {
                  const selectedShopObjects = searchParams.shops.map((shopId) => {
                    const shop = shopsData.find((s) => s.value === shopId || s.value === String(shopId));
                    return shop || { value: shopId, label: `Shop ${shopId}` };
                  });
                  setSelectedShops(selectedShopObjects);
                } else {
                  setSelectedShops([]);
                }

                setDisplayVisitingCardImage(historyItem.visiting_card_image || null);
                setVisitingCardImage(null);
                setOperationType("update_search");
                setOldHistoryId(historyItem.id);

                const paramsForHistory = { ...formattedSearchParams };
                if (Array.isArray(paramsForHistory.budget) && paramsForHistory.budget.length === 2 && Number(paramsForHistory.budget[0]) === 0 && Number(paramsForHistory.budget[1]) === 500000000) {
                  delete paramsForHistory.budget;
                }
                getAllProduct(paramsForHistory, true);

                toast.success("History loaded and search results updated.");
              }}
            >
              <p className={`text-sm ${historyItem.id === oldHistoryId ? "text-white" : "text-[rgb(17,111,165)]"}`}>
                {dayjs(historyItem.created_at).format("YYYY-MM-DD hh:mm a")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchHistorySection;
