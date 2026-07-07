import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

const ColumnVisibilityToggle = ({ columns, visibleColumns, onColumnsChange, onClose }) => {
  const handleToggleColumn = (columnKey) => {
    if (visibleColumns.includes(columnKey)) {
      onColumnsChange(visibleColumns.filter(col => col !== columnKey));
    } else {
      onColumnsChange([...visibleColumns, columnKey]);
    }
  };

  const handleSelectAll = () => {
    if (visibleColumns.length === columns.length) {
      onColumnsChange([]);
    } else {
      onColumnsChange(columns.map(col => col.key));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Column Visibility</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Select All Option */}
          <div className="pb-3 border-b border-gray-300">
            <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={visibleColumns.length === columns.length}
                onChange={handleSelectAll}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="font-medium text-gray-700">Select All</span>
            </label>
          </div>

          {/* Individual Columns */}
          {columns.map((column) => (
            <label
              key={column.key}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.key)}
                onChange={() => handleToggleColumn(column.key)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700">
                {visibleColumns.includes(column.key) ? (
                  <Eye size={16} className="inline mr-2 text-blue-500" />
                ) : (
                  <EyeOff size={16} className="inline mr-2 text-gray-400" />
                )}
              </span>
              <span className="text-gray-700">{column.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnVisibilityToggle;
