
import React from 'react';
// import { SliderInputProps } from '../types.js'; // Types are erased

const SliderInput = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  unitLabel = ""
}) => {
  return (
    React.createElement("div", null,
      React.createElement("label", { htmlFor: id, className: "block text-sm font-medium text-purple-300 mb-2" },
        label, ": ", React.createElement("span", { className: "font-semibold text-custom-lime" }, value),
        unitLabel && React.createElement("span", { className: "text-gray-400 text-xs ml-1" }, unitLabel)
      ),
      React.createElement("input", {
        id: id,
        type: "range",
        value: value,
        onChange: onChange,
        min: min,
        max: max,
        step: step,
        disabled: disabled,
        className: "custom-slider-thumb w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-custom-lime disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:ring-offset-2 focus:ring-offset-gray-800 mt-2",
        "aria-describedby": `${id}-value`
      }),
      React.createElement("span", { id: `${id}-value`, className: "sr-only" }, value)
    )
  );
};

export default SliderInput;
