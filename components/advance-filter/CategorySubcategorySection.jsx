import Select from "react-select";

const BANGLA_FONT = "var(--font-bangla), 'Hind Siliguri', Arial, sans-serif";
const banglaStyles = {
  option:       (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  singleValue:  (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  placeholder:  (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  input:        (base) => ({ ...base, fontFamily: BANGLA_FONT }),
  menuList:     (base) => ({ ...base, fontFamily: BANGLA_FONT }),
};

const CategorySubcategorySection = ({
  categoryData,
  subcategoryData,
  childCategoryData = [],
  filterFields,
  setFilterFields,
  isCategoryLoading,
  isSubcategoryLoading = false,
}) => {
  const realChildOpts = childCategoryData.filter(o => o.value !== "" && o.value != null);

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
        <label className="text-base font-medium" htmlFor="category">
          Category
        </label>
        <Select
          id="category"
          options={categoryData}
          value={categoryData.find((opt) => opt.value === filterFields?.category) || null}
          isLoading={isCategoryLoading}
          loadingMessage={() => "Loading categories..."}
          noOptionsMessage={() => (isCategoryLoading ? "Loading categories..." : "No categories found")}
          onChange={(option) => {
            setFilterFields((prev) => ({
              ...prev,
              category: option?.value || "",
              subcategory: "",
              child_category: "",
            }));
          }}
          styles={banglaStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
        <label className="text-base font-medium" htmlFor="subcategory">
          Subcategory
        </label>
        <Select
          id="subcategory"
          options={subcategoryData}
          value={subcategoryData.find((opt) => opt.value === filterFields?.subcategory) || null}
          isLoading={isSubcategoryLoading}
          loadingMessage={() => "Loading..."}
          onChange={(option) => {
            setFilterFields((prev) => ({
              ...prev,
              subcategory: option?.value || "",
              child_category: "",
            }));
          }}
          isDisabled={!filterFields?.category}
          placeholder={!filterFields?.category ? "Select category first" : "-Select Subcategory-"}
          styles={banglaStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
        <label className="text-base font-medium" htmlFor="child_category">
          Child Category
        </label>
        <Select
          id="child_category"
          options={realChildOpts}
          value={realChildOpts.find((opt) => opt.value === filterFields?.child_category) || null}
          onChange={(option) => {
            setFilterFields((prev) => ({
              ...prev,
              child_category: option?.value || "",
            }));
          }}
          isDisabled={!filterFields?.subcategory}
          placeholder={!filterFields?.subcategory ? "Select subcategory first" : "-Select Child Category-"}
          noOptionsMessage={() => "No child categories"}
          isClearable
          styles={banglaStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );
};

export default CategorySubcategorySection;
