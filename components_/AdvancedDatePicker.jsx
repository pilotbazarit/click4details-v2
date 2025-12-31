'use client';

import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Custom input component for the advanced date picker
const AdvancedCalendarInput = forwardRef(({ value, onClick, placeholder, isTimePicker = false }, ref) => (
    <div className="relative flex items-center w-full">
        <input
            type="text"
            value={value || ""}
            onClick={onClick}
            ref={ref}
            readOnly
            placeholder={placeholder}
            className="outline-none py-2 px-3 rounded border border-gray-500/40 w-full pr-10 bg-white"
        />
        <span className="absolute right-3 text-gray-400 pointer-events-none">
            {isTimePicker ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 3v4M8 3v4M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            )}
        </span>
    </div>
));

export default function AdvancedDatePicker({ 
    selected, 
    onChange, 
    placeholderText = "Select date",
    showTimePicker = false,
    showDateRange = false,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    minDate,
    maxDate,
    disabled = false,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (showDateRange) {
        return (
            <div className="flex space-x-2">
                <DatePicker
                    selected={startDate}
                    onChange={onStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabled={disabled}
                    dateFormat="yyyy-MM-dd"
                    placeholderText={`${placeholderText} (Start)`}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={15}
                    showMonthDropdown
                    scrollableMonthDropdown
                    isClearable={true}
                    customInput={<AdvancedCalendarInput />}
                    popperClassName={className}
                    popperPlacement="bottom-start"
                    popperModifiers={[
                        {
                            name: "offset",
                            options: {
                                offset: [0, 8],
                            },
                        },
                    ]}
                    open={isOpen}
                    onInputClick={() => setIsOpen(true)}
                    onClickOutside={() => setIsOpen(false)}
                />
                <DatePicker
                    selected={endDate}
                    onChange={onEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || minDate}
                    maxDate={maxDate}
                    disabled={disabled}
                    dateFormat="yyyy-MM-dd"
                    placeholderText={`${placeholderText} (End)`}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={15}
                    showMonthDropdown
                    scrollableMonthDropdown
                    isClearable={true}
                    customInput={<AdvancedCalendarInput />}
                    popperClassName={className}
                    popperPlacement="bottom-start"
                    popperModifiers={[
                        {
                            name: "offset",
                            options: {
                                offset: [0, 8],
                            },
                        },
                    ]}
                    open={isOpen}
                    onInputClick={() => setIsOpen(true)}
                    onClickOutside={() => setIsOpen(false)}
                />
            </div>
        );
    }

    return (
        <DatePicker
            selected={selected}
            onChange={onChange}
            dateFormat={showTimePicker ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd"}
            placeholderText={placeholderText}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            showMonthDropdown
            scrollableMonthDropdown
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            isClearable={true}
            customInput={<AdvancedCalendarInput isTimePicker={showTimePicker} />}
            popperClassName={className}
            popperPlacement="bottom-start"
            popperModifiers={[
                {
                    name: "offset",
                    options: {
                        offset: [0, 8],
                    },
                },
            ]}
            open={isOpen}
            onInputClick={() => setIsOpen(true)}
            onClickOutside={() => setIsOpen(false)}
            highlightDates={[
                new Date(), // Today
                new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
                new Date(new Date().setDate(new Date().getDate() + 7)), // Next week
            ]}
            dayClassName={date => {
                const today = new Date();
                if (date.toDateString() === today.toDateString()) {
                    return 'bg-orange-500 text-white font-bold';
                }
                return '';
            }}
        />
    );
}

// Demo Component to showcase different date picker types
export function DatePickerDemo() {
    const [singleDate, setSingleDate] = useState(null);
    const [dateTime, setDateTime] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Advanced Date Picker Demo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Single Date Picker */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Single Date</label>
                    <AdvancedDatePicker
                        selected={singleDate}
                        onChange={setSingleDate}
                        placeholderText="Select a date"
                    />
                </div>

                {/* Date & Time Picker */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date & Time</label>
                    <AdvancedDatePicker
                        selected={dateTime}
                        onChange={setDateTime}
                        placeholderText="Select date and time"
                        showTimePicker={true}
                    />
                </div>

                {/* Date Range Picker */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Date Range</label>
                    <AdvancedDatePicker
                        showDateRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        placeholderText="Select date range"
                    />
                </div>
            </div>

            {/* Selected Values Display */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Values:</h3>
                <div className="space-y-2 text-sm">
                    <p><strong>Single Date:</strong> {singleDate ? singleDate.toLocaleString() : 'None'}</p>
                    <p><strong>Date & Time:</strong> {dateTime ? dateTime.toLocaleString() : 'None'}</p>
                    <p><strong>Date Range:</strong> {startDate ? startDate.toLocaleDateString() : 'None'} - {endDate ? endDate.toLocaleDateString() : 'None'}</p>
                </div>
            </div>
        </div>
    );
} 