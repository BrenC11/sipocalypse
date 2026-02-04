
import React from 'react';
import { SelectInputProps } from '../types';

const SelectInput: React.FC<SelectInputProps> = ({ id, label, value, onChange, options, disabled }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-purple-300 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-gray-700 text-gray-100">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
