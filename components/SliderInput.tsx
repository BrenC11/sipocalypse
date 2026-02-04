import React from 'react';
import { SliderInputProps } from '../types';

const SliderInput: React.FC<SliderInputProps> = ({
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
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-purple-300 mb-2">
        {label}: <span className="font-semibold text-custom-lime">{value}</span> {unitLabel && <span className="text-gray-400 text-xs ml-1">{unitLabel}</span>}
      </label>
      <input
        id={id}
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="custom-slider-thumb w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-custom-lime disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:ring-offset-2 focus:ring-offset-gray-800 mt-2"
        aria-describedby={`${id}-value`}
      />
      {/* For accessibility, though the value is visually displayed in the label */}
      <span id={`${id}-value`} className="sr-only">{value}</span>
    </div>
  );
};

export default SliderInput;