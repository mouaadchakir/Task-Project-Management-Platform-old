import React from 'react';

const Input = React.forwardRef(({ type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      {...props}
      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    />
  );
});

Input.displayName = 'Input';

export default Input;
