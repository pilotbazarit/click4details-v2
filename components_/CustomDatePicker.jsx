import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Add custom CSS to make react-datepicker wrapper full width
const customStyles = `
  .react-datepicker-wrapper {
    width: 100% !important;
  }
  .react-datepicker__input-container {
    width: 100% !important;
  }
  .react-datepicker__input-container input {
    width: 100% !important;
  }
`;

// Custom input with calendar icon
const CalendarInput = forwardRef(({ value, onClick, placeholder, hasError }, ref) => (
  <div className="relative flex items-center w-full">
    <input
      type="text"
      value={value || ""}
      onClick={onClick}
      ref={ref}
      readOnly
      placeholder={placeholder}
      className={`outline-none py-2 px-3 rounded border w-full pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        hasError ? "border-red-500" : "border-gray-300"
      }`}
    />
    <span className="absolute right-3 text-gray-400 pointer-events-none">
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 3v4M8 3v4M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  </div>
));

export default function CustomDatePicker({ selected, onChange, placeholderText, hasError = false }) {
  return (
    <>
      <style>{customStyles}</style>
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholderText}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={15}
        customInput={<CalendarInput hasError={hasError} />}
        isClearable={true}
      />
    </>
  );
}
