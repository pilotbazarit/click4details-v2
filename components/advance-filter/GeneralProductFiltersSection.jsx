"use client";
import Select from "react-select";

const BANGLA_FONT = "var(--font-bangla), 'Hind Siliguri', Arial, sans-serif";
const selectStyles = {
    option:      (base) => ({ ...base, fontFamily: BANGLA_FONT, fontSize: "13px" }),
    singleValue: (base) => ({ ...base, fontFamily: BANGLA_FONT }),
    placeholder: (base) => ({ ...base, fontFamily: BANGLA_FONT }),
    input:       (base) => ({ ...base, fontFamily: BANGLA_FONT }),
    menuList:    (base) => ({ ...base, fontFamily: BANGLA_FONT }),
    control:     (base) => ({ ...base, fontSize: "13px", minHeight: "38px" }),
};

const GeneralProductFiltersSection = ({
    filterFields = {},
    setFilterFields,
    locationData = [],
    brandData = [],
    availabilityData = [],
    conditionData = [],
    isLocationLoading = false,
    isBrandLoading = false,
    isAvailabilityLoading = false,
    isConditionLoading = false,
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

            {/* Brand */}
            <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Brand</label>
                <Select
                    options={brandData}
                    value={brandData.find(opt => opt.value === filterFields?._brand_id) || null}
                    onChange={(opt) => handleChange("_brand_id", opt?.value || undefined)}
                    isLoading={isBrandLoading}
                    isClearable
                    placeholder="Brand"
                    noOptionsMessage={() => isBrandLoading ? "Loading..." : "No brands"}
                    classNamePrefix="react-select"
                    styles={selectStyles}
                />
            </div>

            {/* Condition */}
            <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Condition</label>
                <Select
                    options={conditionData}
                    value={conditionData.find(opt => opt.value === filterFields?._condition_id) || null}
                    onChange={(opt) => handleChange("_condition_id", opt?.value || undefined)}
                    isLoading={isConditionLoading}
                    isClearable
                    placeholder="Condition"
                    noOptionsMessage={() => isConditionLoading ? "Loading..." : "No options"}
                    classNamePrefix="react-select"
                    styles={selectStyles}
                />
            </div>

            {/* Availability */}
            <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Availability</label>
                <Select
                    options={availabilityData}
                    value={availabilityData.find(opt => opt.value === filterFields?._availability_id) || null}
                    onChange={(opt) => handleChange("_availability_id", opt?.value || undefined)}
                    isLoading={isAvailabilityLoading}
                    isClearable
                    placeholder="Availability"
                    noOptionsMessage={() => isAvailabilityLoading ? "Loading..." : "No options"}
                    classNamePrefix="react-select"
                    styles={selectStyles}
                />
            </div>

            {/* Location */}
            <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
                <Select
                    options={locationData}
                    value={locationData.find(opt => opt.value === filterFields?._location_id) || null}
                    onChange={(opt) => handleChange("_location_id", opt?.value || undefined)}
                    isLoading={isLocationLoading}
                    isClearable
                    placeholder="Select location"
                    noOptionsMessage={() => isLocationLoading ? "Loading..." : "No locations"}
                    classNamePrefix="react-select"
                    styles={selectStyles}
                />
            </div>
        </div>
    );
};

export default GeneralProductFiltersSection;
