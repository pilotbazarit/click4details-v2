import Select from "react-select";

const filterOpts = (opts) => opts.filter(o => o.value !== "" && o.value !== null && o.value !== undefined);

const BANGLA_FONT = "var(--font-bangla), 'Hind Siliguri', Arial, sans-serif";
const banglaStyles = {
  option:       (base) => ({ ...base, fontFamily: BANGLA_FONT, fontSize: "13px" }),
  singleValue:  (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  placeholder:  (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  input:        (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  menuList:     (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  control:      (base) => ({ ...base, fontSize: "13px", minHeight: "38px" }),
};

const GeneralCategorySection = ({
    categoryData = [],
    subcategoryData = [],
    childCategoryData = [],
    filterFields = {},
    setFilterFields,
    isCategoryLoading = false,
    isSubcategoryLoading = false,
    isChildCategoryLoading = false,
}) => {
    const catOpts  = filterOpts(categoryData);
    const subOpts  = filterOpts(subcategoryData);
    const childOpts = filterOpts(childCategoryData);

    return (
        <div className="space-y-3">
            {/* Level 1 — Category */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">ক্যাটাগরি</label>
                <Select
                    options={catOpts}
                    value={catOpts.find(opt => opt.value === filterFields?.category) || null}
                    isLoading={isCategoryLoading}
                    isClearable
                    placeholder="ক্যাটাগরি বেছে নিন"
                    onChange={(option) =>
                        setFilterFields(prev => ({
                            ...prev,
                            category: option?.value ?? undefined,
                            subcategory: undefined,
                            child_category: undefined,
                        }))
                    }
                    classNamePrefix="react-select"
                    styles={banglaStyles}
                />
            </div>

            {/* Level 2 — Subcategory */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">সাব-ক্যাটাগরি</label>
                <Select
                    options={subOpts}
                    value={subOpts.find(opt => opt.value === filterFields?.subcategory) || null}
                    isLoading={isSubcategoryLoading}
                    isDisabled={!filterFields?.category}
                    isClearable
                    placeholder={!filterFields?.category ? "আগে ক্যাটাগরি বেছে নিন" : "সাব-ক্যাটাগরি বেছে নিন"}
                    onChange={(option) =>
                        setFilterFields(prev => ({
                            ...prev,
                            subcategory: option?.value ?? undefined,
                            child_category: undefined,
                        }))
                    }
                    classNamePrefix="react-select"
                    styles={banglaStyles}
                />
            </div>

            {/* Level 3 — Child Category (only renders when subcategory is selected) */}
            {filterFields?.subcategory && (
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">চাইল্ড ক্যাটাগরি</label>
                    <Select
                        options={childOpts}
                        value={childOpts.find(opt => opt.value === filterFields?.child_category) || null}
                        isLoading={isChildCategoryLoading}
                        isClearable
                        placeholder={isChildCategoryLoading ? "লোড হচ্ছে..." : childOpts.length === 0 ? "কোনো সাব-ক্যাটাগরি নেই" : "চাইল্ড ক্যাটাগরি বেছে নিন"}
                        noOptionsMessage={() => "কোনো চাইল্ড ক্যাটাগরি নেই"}
                        onChange={(option) =>
                            setFilterFields(prev => ({
                                ...prev,
                                child_category: option?.value ?? undefined,
                            }))
                        }
                        classNamePrefix="react-select"
                        styles={banglaStyles}
                    />
                </div>
            )}
        </div>
    );
};

export default GeneralCategorySection;
