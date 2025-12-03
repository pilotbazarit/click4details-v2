import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchHistoryDetailModal from "../modals/SearchHistoryDetailModal";
import SearchHistoryItem from "./SearchHistoryItem";

const SearchHistorySection = ({
  searchHistories,
  handleOpenSearchHistoryModal,
  formatDate,
  parseSearchParams,
  isEmptyValue,
  formatValue,
  customer,
  onDelete,
  allLocations,
}) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const handleOpenModal = (item) => {
    setSelectedHistoryItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedHistoryItem(null);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Search Histories</h2>

        {searchHistories.length > 0 && searchHistories[0].user_mode && (
          <div className="mb-4 text-gray-700">
            <span className="font-semibold">User Mode:</span> {searchHistories[0].user_mode}
          </div>
        )}

        {searchHistories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No search history found for this customer.</p>
          </div>
        ) : (
          <>
            {/* Consolidated Search Histories */}
            {searchHistories.filter((h) => h.consolidated === 1).length > 0 && (
              <div className="mb-8">
                {/* <h3 className="text-lg font-semibold mb-3">Consolidated Searches</h3> Removed as requested */}
                <div className="space-y-4">
                  {searchHistories
                    .filter((h) => h.consolidated === 1)
                    .map((history, index) => (
                      <SearchHistoryItem
                        key={history.id || index}
                        history={history}
                        index={index}
                        formatDate={formatDate}
                        parseSearchParams={parseSearchParams}
                        isEmptyValue={isEmptyValue}
                        formatValue={formatValue}
                        customer={customer}
                        handleOpenSearchHistoryModal={handleOpenSearchHistoryModal}
                        handleOpenModal={handleOpenModal}
                        allLocations={allLocations}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Non-Consolidated Search Histories */}
            {searchHistories.filter((h) => h.consolidated !== 1).length > 0 && (
              <div className="mt-8">
                {/* <h3 className="text-lg font-semibold mb-3">Non-Consolidated Searches</h3> Removed as requested */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {" "}
                  {/* Changed to 4-column grid for items */}
                  {searchHistories
                    .filter((h) => h.consolidated !== 1)
                    .map((history, index) => (
                      <SearchHistoryItem
                        key={history.id || index}
                        history={history}
                        index={index}
                        formatDate={formatDate}
                        parseSearchParams={parseSearchParams}
                        isEmptyValue={isEmptyValue}
                        formatValue={formatValue}
                        customer={customer}
                        handleOpenSearchHistoryModal={handleOpenSearchHistoryModal}
                        handleOpenModal={handleOpenModal}
                        onDelete={(history) => onDelete(history)}
                        allLocations={allLocations}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <SearchHistoryDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        historyItem={selectedHistoryItem}
        parseSearchParams={parseSearchParams}
        isEmptyValue={isEmptyValue}
        formatValue={formatValue}
        allLocations={allLocations}
      />
    </div>
  );
};

export default SearchHistorySection;
