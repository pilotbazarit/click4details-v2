import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  return (
    <DatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={(dates) => onChange(dates)}
      isClearable={true}
      placeholderText="Select a date range"
      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-full"
    />
  );
};

export default DateRangePicker;
