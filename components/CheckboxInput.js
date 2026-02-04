
import React from 'react';
// import { CheckboxInputProps } from '../types.js'; // Types are erased

const CheckboxInput = ({ id, label, checked, onChange, disabled }) => {
  return (
    React.createElement("div", { className: "flex items-center" },
      React.createElement("input", {
        id: id,
        type: "checkbox",
        checked: checked,
        onChange: onChange,
        disabled: disabled,
        className: "h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      }),
      React.createElement("label", { htmlFor: id, className: `ml-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-200'}` },
        label
      )
    )
  );
};

export default CheckboxInput;
