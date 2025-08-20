import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({
  label,
  error,
  className,
  children,
  id,
  disabled,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className={clsx(
            "block text-sm font-medium mb-1",
            disabled ? "text-gray-400" : "text-gray-700"
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          className={clsx(
            'w-full px-3 py-2 pr-10 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none',
            {
              'border-red-300 focus:ring-red-500': error,
              'border-gray-300': !error && !disabled,
              'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed': disabled,
              'text-gray-900': !disabled
            },
            className
          )}
          {...props}
        >
          {children}
        </select>
        
        <ChevronDown className={clsx(
          "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none",
          disabled ? "text-gray-300" : "text-gray-400"
        )} />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}