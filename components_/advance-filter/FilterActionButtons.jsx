import { Search, X } from "lucide-react";

const FilterActionButtons = ({ onClear, isCategorySelected }) => {
  return (
    <div className="flex justify-end gap-4 w-full mt-8 pt-6 border-t border-gray-200/80">
      <button
        type="button"
        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
        onClick={onClear}
      >
        <X className="w-5 h-5" />
        Clear
      </button>
      <button
        type="submit"
        disabled={!isCategorySelected}
        title={!isCategorySelected ? "Please select a category first" : "Search products"}
        className={`px-5 py-2.5 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2 ${
          !isCategorySelected ? "bg-[#0469a3]/40 cursor-not-allowed" : "bg-[#0469a3] hover:bg-[#035a8a]"
        }`}
      >
        <Search className="w-5 h-5" />
        Search
      </button>
    </div>
  );
};

export default FilterActionButtons;
