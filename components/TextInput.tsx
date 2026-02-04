
import React from 'react';
import { TextInputProps } from '../types';

const TextInput: React.FC<TextInputProps> = ({ id, label, value, onChange, placeholder, type = "text", disabled, onKeyDown }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-purple-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown} // Added onKeyDown prop
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default TextInput;