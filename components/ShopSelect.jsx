"use client";

import React from "react";
import Select from "react-select";

// Shared shop picker: shows "Shop Name — 01XXXXXXXXX" and is searchable by
// either. Deliberately takes an already-fetched `shops` array rather than
// fetching itself - callers legitimately fetch from different endpoints
// (own shops, company shops, all shops) with different params, only the
// rendering was duplicated ~20 times across the app.
// Accepts either a raw shop record ({s_id, s_title, user: {phone}}) or an
// already-mapped option ({value, label, phone}) - several call sites had
// pre-mapped their shop list before this component existed, so this stays
// tolerant of both rather than requiring every caller to be rewired.
const formatShopOption = (shop) => ({
  value: String(shop?.s_id ?? shop?.value ?? ""),
  label: shop?.s_title || shop?.s_name || shop?.label || "",
  phone: shop?.user?.phone || shop?.s_user_phone || shop?.phone || "",
  raw: shop,
});

const ShopSelect = ({
  shops = [],
  value,
  onChange,
  placeholder = "Select shop",
  isClearable = true,
  isDisabled = false,
  className,
  classNamePrefix = "select",
  ...rest
}) => {
  const options = shops.map(formatShopOption);
  const selected = options.find((option) => option.value === String(value ?? "")) || null;

  return (
    <Select
      options={options}
      value={selected}
      onChange={(option) => onChange?.(option?.value ?? "", option?.raw ?? null)}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      className={className}
      classNamePrefix={classNamePrefix}
      formatOptionLabel={(option) => (
        <div className="flex items-center justify-between gap-3">
          <span>{option.label}</span>
          {option.phone ? <span className="text-xs text-gray-400">{option.phone}</span> : null}
        </div>
      )}
      filterOption={(option, input) => {
        const term = input.trim().toLowerCase();
        if (!term) return true;
        return (
          option.label.toLowerCase().includes(term) ||
          String(option.data.phone || "").toLowerCase().includes(term)
        );
      }}
      noOptionsMessage={() => "No shops found"}
      {...rest}
    />
  );
};

export default ShopSelect;
