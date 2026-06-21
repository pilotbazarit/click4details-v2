import DateRangePicker from "@/components/DateRangePicker";
import RangeSlider from "@/components/RangeSlider";
import { Star, User, Users } from "lucide-react";
import Select from "react-select";

const VehicleFiltersSection = ({
  canSeeUserModes,
  selectedUserModes,
  setSelectedUserModes,
  shopsData,
  selectedShops,
  setSelectedShops,
  shopsLoading,
  searchType,
  setSearchType,
  strictSortOrder,
  setStrictSortOrder,
  filterFields,
  setFilterFields,
  brandData,
  modelData,
  packageData,
  colorData,
  conditionData,
  fuelData,
  seatData,
  skeletonData,
  gradeData,
  exteriorGradeData,
  interiorGradeData,
  budgetInputInFocus,
  setBudgetInputInFocus,
  mileageInputInFocus,
  setMileageInputInFocus,
  yearOptions,
  userRoleName,
  capacityInputInFocus,
  setCapacityInputInFocus,
  transmissionData,
  availabilityData,
  canAccessToChasisNo,
  locationData,
  isConsolidatedView,
  setIsConsolidatedView,
}) => {
  return (
    <section className="mt-4 mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50/30">
      <div className="grid grid-cols-12 gap-6">
        {/* Left — 9/12: all filter fields */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Search by product name"
            className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-blue-500 transition"
            onChange={(e) => setFilterFields((prev) => ({ ...prev, title: e.target.value }))}
            value={filterFields?.title}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="product-code">
            Product Code
          </label>
          <input
            id="product-code"
            type="text"
            placeholder="Search by product code"
            className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-blue-500 transition"
            onChange={(e) => setFilterFields((prev) => ({ ...prev, code: e.target.value }))}
            value={filterFields?.code}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="brand">
            Brand
          </label>
          <Select
            id="brand"
            options={brandData}
            isMulti
            value={filterFields?.brand ? brandData.filter((opt) => filterFields.brand.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, brand: values, model: [], package: "" }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="model">
            Model
          </label>
          <Select
            inputId="model"
            options={modelData}
            isMulti
            value={filterFields?.model ? modelData.filter((opt) => filterFields.model.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, model: values, package: "" }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select a model"
            isDisabled={!filterFields?.brand || filterFields.brand.length === 0}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="package">
            Package
          </label>
          <Select
            inputId="package"
            options={packageData}
            isMulti
            value={filterFields?.package ? packageData.filter((opt) => filterFields.package.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, package: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select a package"
            isDisabled={!filterFields?.brand || filterFields.brand.length === 0 || !filterFields?.model || filterFields.model.length === 0}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="color">
            Color
          </label>
          <Select
            inputId="color"
            options={colorData}
            isMulti
            value={filterFields?.color ? colorData.filter((opt) => filterFields.color.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, color: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Color-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="budget-range">
            Budget (Price Range)
          </label>
          <div className="flex gap-2">
            <input
              id="budget-min"
              type="text"
              value={budgetInputInFocus === "min" ? filterFields.budget?.[0] : (filterFields.budget?.[0] || 0).toLocaleString()}
              onFocus={() => setBudgetInputInFocus("min")}
              onBlur={() => setBudgetInputInFocus(null)}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (!isNaN(value)) {
                  setFilterFields((prev) => ({ ...prev, budget: [Number(value), prev.budget?.[1] || 500000000] }));
                }
              }}
              className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
            />
            <span className="self-center">to</span>
            <input
              id="budget-max"
              type="text"
              value={budgetInputInFocus === "max" ? filterFields.budget?.[1] : (filterFields.budget?.[1] || 500000000).toLocaleString()}
              onFocus={() => setBudgetInputInFocus("max")}
              onBlur={() => setBudgetInputInFocus(null)}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (!isNaN(value)) {
                  setFilterFields((prev) => ({ ...prev, budget: [prev.budget?.[0] || 0, Number(value)] }));
                }
              }}
              className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
            />
          </div>
          <div className="mt-2 px-6">
            <RangeSlider
              budget={filterFields?.budget || [0, 500000000]}
              setBudget={(newBudget) => setFilterFields((prev) => ({ ...prev, budget: newBudget }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="condition">
            Condition
          </label>
          <Select
            inputId="condition"
            options={conditionData}
            isMulti
            value={filterFields?.condition ? conditionData.filter((opt) => filterFields.condition.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, condition: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Condition-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="fuel">
            Fuel
          </label>
          <Select
            inputId="fuel"
            options={fuelData}
            isMulti
            value={filterFields?.fuel ? fuelData.filter((opt) => filterFields.fuel.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, fuel: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Fuel-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="seat">
            Seat
          </label>
          <Select
            inputId="seat"
            options={seatData}
            isMulti
            value={filterFields?.seat ? seatData.filter((opt) => filterFields.seat.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, seat: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Seat-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="skeleton">
            Body
          </label>
          <Select
            inputId="skeleton"
            options={skeletonData}
            isMulti
            value={filterFields?.skeleton ? skeletonData.filter((opt) => filterFields.skeleton.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, skeleton: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Body-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-gray-600" htmlFor="grade">
            Point
          </label>
          <Select
            inputId="grade"
            options={gradeData}
            isMulti
            value={filterFields?.grade ? gradeData.filter((opt) => filterFields.grade.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, grade: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Point-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="ext_grade">
            Exterior Grade
          </label>
          <Select
            inputId="ext_grade"
            options={exteriorGradeData}
            isMulti
            value={filterFields?.ext_grade ? exteriorGradeData.filter((opt) => filterFields.ext_grade.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, ext_grade: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Grade-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="int_grade">
            Interior Grade
          </label>
          <Select
            inputId="int_grade"
            options={interiorGradeData}
            isMulti
            value={filterFields?.int_grade ? interiorGradeData.filter((opt) => filterFields.int_grade.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, int_grade: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Grade-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-blue-600" htmlFor="mileage-range">
            Mileage (Range)
          </label>
          <div className="flex gap-2">
            <input
              id="mileage-min"
              type="text"
              value={mileageInputInFocus === "min" ? filterFields.mileage?.[0] : (filterFields.mileage?.[0] || 0).toLocaleString()}
              onFocus={() => setMileageInputInFocus("min")}
              onBlur={() => setMileageInputInFocus(null)}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (!isNaN(value)) {
                  setFilterFields((prev) => ({ ...prev, mileage: [Number(value), prev.mileage?.[1] || 500000] }));
                }
              }}
              className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
            />
            <span className="self-center">to</span>
            <input
              id="mileage-max"
              type="text"
              value={mileageInputInFocus === "max" ? filterFields.mileage?.[1] : (filterFields.mileage?.[1] || 500000).toLocaleString()}
              onFocus={() => setMileageInputInFocus("max")}
              onBlur={() => setMileageInputInFocus(null)}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (!isNaN(value)) {
                  setFilterFields((prev) => ({ ...prev, mileage: [prev.mileage?.[0] || 0, Number(value)] }));
                }
              }}
              className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
            />
          </div>
          <div className="mt-2 px-6">
            <RangeSlider
              budget={filterFields?.mileage || [0, 500000]}
              setBudget={(newMileage) => setFilterFields((prev) => ({ ...prev, mileage: newMileage }))}
              step={50}
              maxValue={500000}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="model_year">
            Model Year
          </label>
          <Select
            inputId="model_year"
            options={yearOptions}
            isMulti
            value={filterFields?.model_year ? yearOptions.filter((opt) => filterFields.model_year.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, model_year: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Model Year-"
          />
        </div>

        {userRoleName === "Customer Care" && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="registration_year">
              Registration Year
            </label>
            <Select
              inputId="registration_year"
              options={yearOptions}
              isMulti
              value={filterFields?.registration_year ? yearOptions.filter((opt) => filterFields.registration_year.includes(opt.value)) : []}
              onChange={(selectedOptions) => {
                const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                setFilterFields((prev) => ({ ...prev, registration_year: values }));
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="-Select Registration Year-"
            />
          </div>
        )}


        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="transmission">
            Transmission
          </label>
          <Select
            inputId="transmission"
            options={transmissionData}
            isMulti
            value={filterFields?.transmission ? transmissionData.filter((opt) => filterFields.transmission.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, transmission: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Transmission-"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="availability">
            Availability
          </label>
          <Select
            inputId="availability"
            options={availabilityData}
            isMulti
            value={filterFields?.availability ? availabilityData.filter((opt) => filterFields.availability.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, availability: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Availability-"
          />
        </div>

        {canAccessToChasisNo && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="chassis">
              Chassis No
            </label>
            <input
              id="chassis"
              value={filterFields?.chassis || ""}
              onChange={(e) => setFilterFields((prev) => ({ ...prev, chassis: e.target.value }))}
              type="text"
              placeholder="Enter Chassis No"
              className="outline-none py-2 px-3 rounded border border-gray-500/40"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="location">
            Location
          </label>
          <Select
            inputId="location"
            options={locationData}
            isMulti
            value={filterFields?.location ? locationData.filter((opt) => filterFields.location.includes(opt.value)) : []}
            onChange={(selectedOptions) => {
              const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
              setFilterFields((prev) => ({ ...prev, location: values }));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="-Select Location-"
          />
        </div>

        {userRoleName === "Customer Care" && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="engine">
              Engine No
            </label>
            <input
              id="engine"
              value={filterFields?.engine || ""}
              onChange={(e) => setFilterFields((prev) => ({ ...prev, engine: e.target.value }))}
              type="text"
              placeholder="Enter Engine No"
              className="outline-none py-2 px-3 rounded border border-gray-500/40"
            />
          </div>
        )}

        {userRoleName === "Customer Care" && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium">Tax Token Expiry Date</label>
            <DateRangePicker
              startDate={filterFields.v_tax_token_exp_date_from}
              endDate={filterFields.v_tax_token_exp_date_to}
              onChange={(dates) => {
                const [start, end] = dates;
                setFilterFields((prev) => ({
                  ...prev,
                  v_tax_token_exp_date_from: start,
                  v_tax_token_exp_date_to: end,
                }));
              }}
            />
          </div>
        )}

        {userRoleName === "Customer Care" && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium">Fitness Exp. Date</label>
            <DateRangePicker
              startDate={filterFields.v_fitness_exp_date_from}
              endDate={filterFields.v_fitness_exp_date_to}
              onChange={(dates) => {
                const [start, end] = dates;
                setFilterFields((prev) => ({
                  ...prev,
                  v_fitness_exp_date_from: start,
                  v_fitness_exp_date_to: end,
                }));
              }}
            />
          </div>
        )}

        {userRoleName === "Customer Care" && (
          <div className="flex flex-col gap-1">
            <label className="text-base font-medium">Insurance Exp. Date</label>
            <DateRangePicker
              startDate={filterFields.v_insurance_exp_date_from}
              endDate={filterFields.v_insurance_exp_date_to}
              onChange={(dates) => {
                const [start, end] = dates;
                setFilterFields((prev) => ({
                  ...prev,
                  v_insurance_exp_date_from: start,
                  v_insurance_exp_date_to: end,
                }));
              }}
            />
          </div>
        )}
      </div>
        </div>

        {/* Filter by Shops + Search Type + Sort — 3/12 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:border-l lg:border-blue-200 lg:pl-4">
          {canSeeUserModes && (
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium text-gray-700 mb-2">User Mode</label>
              <div className="inline-flex rounded-md shadow-sm">
                {["Partner", "Member", "User"].map((mode, index) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      const newSelectedUserModes = selectedUserModes.includes(mode)
                        ? selectedUserModes.filter((item) => item !== mode)
                        : [...selectedUserModes, mode];
                      setSelectedUserModes(newSelectedUserModes);
                    }}
                    className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors border border-gray-300 ${
                      index === 0 ? "rounded-l-md" : ""
                    } ${index === 2 ? "rounded-r-md" : "-ml-px"} ${
                      selectedUserModes.includes(mode)
                        ? "bg-[#0469a3] text-white border-[#0469a3] z-10"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {mode === "Partner" && <Users className="w-4 h-4 mr-2" />}
                    {mode === "Member" && <Star className="w-4 h-4 mr-2" />}
                    {mode === "User" && <User className="w-4 h-4 mr-2" />}
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-gray-700 mb-2">Filter by Shops</label>
            <Select
              isMulti
              options={shopsData}
              value={selectedShops}
              onChange={(selected) => {
                const selectedArray = selected || [];
                const hasAllShops = selectedArray.some((shop) => shop.value === "all");
                const hadAllShops = selectedShops.some((shop) => shop.value === "all");
                if (hasAllShops && !hadAllShops) {
                  setSelectedShops([{ value: "all", label: "All Shops" }]);
                } else if (!hasAllShops && hadAllShops) {
                  setSelectedShops(selectedArray);
                } else if (hasAllShops && selectedArray.length > 1) {
                  setSelectedShops(selectedArray.filter((shop) => shop.value !== "all"));
                } else {
                  setSelectedShops(selectedArray);
                }
              }}
              placeholder={shopsLoading ? "Loading shops..." : "Select shops..."}
              isLoading={shopsLoading}
              isDisabled={shopsLoading}
              loadingMessage={() => "Loading shops..."}
              className="text-sm"
              classNamePrefix="react-select"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-gray-700 mb-2">Search Type</label>
            <div className="inline-flex rounded-md">
              {[
                { value: "wide", label: "Wide" },
                { value: "strict", label: "Strict" },
              ].map((type, index) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSearchType(type.value);
                    if (type.value !== "strict") setStrictSortOrder("");
                  }}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors border border-gray-300 ${
                    index === 0 ? "rounded-l-md" : ""
                  } ${index === 1 ? "rounded-r-md" : "-ml-px"} ${
                    searchType === type.value
                      ? "bg-white text-gray-800 border-gray-400 shadow-sm"
                      : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-gray-700 mb-2">Sort (Low to High Budget)</label>
            <select
              value={strictSortOrder}
              onChange={(e) => {
                const selectedSort = e.target.value;
                setStrictSortOrder(selectedSort);
                if (selectedSort) setSearchType("strict");
              }}
              className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-blue-500 transition bg-white"
            >
              <option value="">Select Sort</option>
              <option value="low_to_high">Low to High</option>
              <option value="high_to_low">High to Low</option>
            </select>
          </div>

          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsConsolidatedView(!isConsolidatedView)}
          >
            <span className="text-sm font-medium text-gray-700">Consolidated</span>
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isConsolidatedView ? "bg-[#0469a3]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isConsolidatedView ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VehicleFiltersSection;
