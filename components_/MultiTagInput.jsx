import React, { useState } from "react";

const TagsInput = ({
  label,
  id,
  value = [],
  onChange,
  placeholder = "Add a tag...",
}) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
  };

  const handleRemove = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-col gap-1 max-w-md">
      {label && (
        <label htmlFor={id} className="text-base font-medium">
          {label}
        </label>
      )}
      <div
        className="flex flex-wrap items-center gap-2 border border-gray-500/40 px-3 py-2 rounded"
        onClick={() => typeof document !== 'undefined' && document.getElementById(id)?.focus()}
      >
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              className="text-red-600 font-bold ml-1"
              onClick={() => handleRemove(tag)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="outline-none flex-1 min-w-[120px] py-1 text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default TagsInput;
