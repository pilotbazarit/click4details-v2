"use client";

import React from "react";
import Select from "react-select";

const EditSearchHistoryModal = ({
  isOpen,
  onClose,
  onSave,
  searchType,
  setSearchType,
  isConsolidatedView,
  setIsConsolidatedView,
  selectedUserModes,
  setSelectedUserModes,
  shopsData,
  selectedShops,
  setSelectedShops,
  categoryData,
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
  yearOptions,
  transmissionData,
  availabilityData,
  locationData,
  userRoleName,
  RangeSlider,
  DateRangePicker,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[90vw] my-8">
        <h2 className="text-xl font-semibold mb-4">Edit Search History</h2>
        <div className="max-h-[80vh] overflow-y-auto pr-4">
          <div className="w-full mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center">
                <p className="text-lg font-semibold text-orange-700">Apply Filter</p>
              </div>

              {
                <div className="w-2/4">
                  <div className="flex items-center rounded-lg shadow-sm bg-gray-100 p-1 space-x-1">
                    {/* Custom Toggle Switch for Consolidated */}
                    <div className="flex items-center space-x-2 p-2 cursor-pointer" onClick={() => setIsConsolidatedView(!isConsolidatedView)}>
                      <div
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                          isConsolidatedView ? "bg-orange-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isConsolidatedView ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-orange-700">Consolidated</span>
                    </div>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                        searchType === "wide" ? "bg-orange-500 text-white" : "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
                      }`}
                      onClick={() => setSearchType("wide")}
                    >
                      Wide Search
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                        searchType === "strict" ? "bg-orange-500 text-white" : "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
                      }`}
                      onClick={() => setSearchType("strict")}
                    >
                      Strict Search
                    </button>
                  </div>
                </div>
              }
            </div>
            <>
              {/* User Mode Checkbox Group */}
              <div className="flex flex-col gap-2 mt-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <label className="text-base font-medium text-gray-700 mb-2">User Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["Partner", "Supreme", "User", "Pbl"].map((mode) => (
                    <div
                      key={mode}
                      className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        id={`user-mode-${mode}`}
                        name="userMode"
                        value={mode}
                        checked={selectedUserModes.includes(mode)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserModes((prev) => [...prev, mode]);
                          } else {
                            setSelectedUserModes((prev) => prev.filter((item) => item !== mode));
                          }
                        }}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor={`user-mode-${mode}`} className="ml-2 text-sm text-gray-700 flex-grow cursor-pointer">
                        {mode}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shops Multiselect Dropdown */}
              <div className="flex flex-col gap-2 mt-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <label className="text-base font-medium text-gray-700 mb-2">Filter by Shops</label>
                <Select
                  isMulti
                  options={shopsData}
                  value={selectedShops}
                  onChange={(selected) => {
                    const selectedArray = selected || [];
                    
                    // Check if "All Shops" was just selected
                    const hasAllShops = selectedArray.some(shop => shop.value === "all");
                    const hadAllShops = selectedShops.some(shop => shop.value === "all");
                    
                    if (hasAllShops && !hadAllShops) {
                      // "All Shops" was just selected, keep only "All Shops"
                      setSelectedShops([{ value: "all", label: "All Shops" }]);
                    } else if (!hasAllShops && hadAllShops) {
                      // "All Shops" was removed, keep other selections
                      setSelectedShops(selectedArray);
                    } else if (hasAllShops && selectedArray.length > 1) {
                      // User selected a specific shop while "All Shops" was selected, remove "All Shops"
                      setSelectedShops(selectedArray.filter(shop => shop.value !== "all"));
                    } else {
                      // Normal selection
                      setSelectedShops(selectedArray);
                    }
                  }}
                  placeholder="Select shops..."
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                {/* Category select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="category">
                    Category
                  </label>
                  <Select
                    id="category"
                    options={categoryData}
                    value={categoryData.find((opt) => opt.value === filterFields?.category) || null}
                    onChange={(option) => {
                      setFilterFields((prev) => ({ ...prev, category: option.value }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Product Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="product-name">
                    Product Name
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    placeholder="Search by product name"
                    className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                    onChange={(e) => setFilterFields((prev) => ({ ...prev, title: e.target.value }))}
                    value={filterFields?.title || ""}
                  />
                </div>

                {/* Product Code */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="product-code">
                    Product Code
                  </label>
                  <input
                    id="product-code"
                    type="text"
                    placeholder="Search by product code"
                    className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                    onChange={(e) => setFilterFields((prev) => ({ ...prev, code: e.target.value }))}
                    value={filterFields?.code || ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Brand select */}
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
                {/* Model select */}
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
                {/* Package select */}
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
                {/* Color Select */}
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
                {/* Budget Range */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="budget-range">
                    Budget (Price Range)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="budget-min"
                      type="number"
                      min={0}
                      max={500000000}
                      value={filterFields?.budget?.[0] || 0}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, budget: [Number(e.target.value), prev.budget?.[1] || 500000000] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                    <span className="self-center">to</span>
                    <input
                      id="budget-max"
                      type="number"
                      min={0}
                      max={500000000}
                      value={filterFields?.budget?.[1] || 500000000}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, budget: [prev.budget?.[0] || 0, Number(e.target.value)] }))}
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
                {/* Condition Select */}
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
                {/* Fuel Select */}
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
                {/* Seat Select */}
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
                {/* Body Select */}
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
                {/* Point Select */}
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
                {/* Exterior Grade Select */}
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
                {/* Interior Grade Select */}
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
                {/* Mileage */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="mileage-range">
                    Mileage (Range)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="mileage-min"
                      type="number"
                      min={0}
                      max={100000}
                      value={filterFields?.mileage?.[0] || 0}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, mileage: [Number(e.target.value), prev.mileage?.[1] || 100000] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                    <span className="self-center">to</span>
                    <input
                      id="mileage-max"
                      type="number"
                      min={0}
                      max={100000}
                      value={filterFields?.mileage?.[1] || 100000}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, mileage: [prev.mileage?.[0] || 0, Number(e.target.value)] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                  </div>
                  <div className="mt-2 px-6">
                    <RangeSlider
                      budget={filterFields?.mileage || [0, 100000]}
                      setBudget={(newMileage) => setFilterFields((prev) => ({ ...prev, mileage: newMileage }))}
                      step={50}
                      maxValue={100000}
                    />
                  </div>
                </div>
                {/* Model Year */}
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
                {/* Capacity */}
                <div className="flex flex-col gap-1 pr-4">
                  <label className="text-base font-medium" htmlFor="capacity-range">
                    Capacity (CC)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="capacity-min"
                      type="number"
                      min={0}
                      max={50000}
                      value={filterFields?.capacity?.[0] || 0}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, capacity: [Number(e.target.value), prev.capacity?.[1] || 50000] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                    <span className="self-center">to</span>
                    <input
                      id="capacity-max"
                      type="number"
                      min={0}
                      max={50000}
                      value={filterFields?.capacity?.[1] || 50000}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, capacity: [prev.capacity?.[0] || 0, Number(e.target.value)] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                  </div>
                  <div className="mt-2 px-6">
                    <RangeSlider
                      budget={filterFields?.capacity || [0, 50000]}
                      setBudget={(newCapacity) => setFilterFields((prev) => ({ ...prev, capacity: newCapacity }))}
                      step={100}
                      maxValue={50000}
                    />
                  </div>
                </div>
                {/* Transmission Select */}
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
                {/* Availability Select */}
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
                {/* Chassis No Input */}
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
                {/* Location Select */}
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
                    menuPlacement="top"
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
            </>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSearchHistoryModal;

