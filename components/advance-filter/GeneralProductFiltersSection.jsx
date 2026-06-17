"use client";

const GeneralProductFiltersSection = ({
    filterFields = {},
    setFilterFields,
}) => {
    const handleChange = (key, value) => {
        setFilterFields(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            {/* Product Name */}
            <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Product Name</label>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={filterFields?._title || ""}
                    onChange={(e) => handleChange("_title", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0167a1]/30"
                />
            </div>

            {/* Price Min */}
            <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Min Price</label>
                <input
                    type="number"
                    placeholder="Min"
                    min={0}
                    value={filterFields?._price_min || ""}
                    onChange={(e) => handleChange("_price_min", e.target.value || undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0167a1]/30"
                />
            </div>

            {/* Price Max */}
            <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Max Price</label>
                <input
                    type="number"
                    placeholder="Max"
                    min={0}
                    value={filterFields?._price_max || ""}
                    onChange={(e) => handleChange("_price_max", e.target.value || undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0167a1]/30"
                />
            </div>
        </div>
    );
};

export default GeneralProductFiltersSection;
