import React from 'react';
import Select from 'react-select';

const SelectInput = ({
    label,
    id,
    name,
    options,
    value,
    onChange,
    onInputChange,
    selectRef,
    placeholder = 'Select...',
    isMulti = false,
    isSearchable = true,
    required = false,
    error,
    ...props
}) => {
    const handleChange = (selectedOption) => {
        onChange(selectedOption);
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="text-base font-medium" htmlFor={id || name}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <Select
                id={id || name}
                name={name}
                options={options}
                value={value}
                onChange={handleChange}
                onInputChange={onInputChange}
                placeholder={placeholder}
                isMulti={isMulti}
                isSearchable={isSearchable}
                classNamePrefix="react-select"
                className={`react-select-container ${error ? 'border-red-500' : 'border-gray-400'}`}
                ref={selectRef}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default SelectInput;
