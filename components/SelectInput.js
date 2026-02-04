
import React from 'react';
// import { SelectInputProps } from '../types.js'; // Types are erased

const SelectInput = ({ id, label, value, onChange, options, disabled }) => {
  return (
    React.createElement("div", null,
      React.createElement("label", { htmlFor: id, className: "block text-sm font-medium text-purple-300 mb-1" },
        label
      ),
      React.createElement("select", {
        id: id,
        value: value,
        onChange: onChange,
        disabled: disabled,
        className: "w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      },
      options.map((option) => (
        React.createElement("option", { key: option, value: option, className: "bg-gray-700 text-gray-100" },
          option
        )
      ))
      )
    )
  );
};

export default SelectInput;
