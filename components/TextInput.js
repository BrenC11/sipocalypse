
import React from 'react';
// import { TextInputProps } from '../types.js'; // Types are erased

const TextInput = ({ id, label, value, onChange, placeholder, type = "text", disabled, onKeyDown }) => {
  return (
    React.createElement("div", null,
      React.createElement("label", { htmlFor: id, className: "block text-sm font-medium text-purple-300 mb-1" },
        label
      ),
      React.createElement("input", {
        id: id,
        type: type,
        value: value,
        onChange: onChange,
        onKeyDown: onKeyDown,
        placeholder: placeholder,
        disabled: disabled,
        className: "w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      })
    )
  );
};

export default TextInput;
