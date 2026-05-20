import Select from "react-select";

const CategorySubcategorySection = ({
  categoryData,
  subcategoryData,
  filterFields,
  setFilterFields,
  isCategoryLoading,
}) => {
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
            }));
          }}
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
          onChange={(option) => {
            setFilterFields((prev) => ({ ...prev, subcategory: option?.value || "" }));
          }}
          isDisabled={!filterFields?.category}
          placeholder={!filterFields?.category ? "Select category first" : "-Select Subcategory-"}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );
};

export default CategorySubcategorySection;
