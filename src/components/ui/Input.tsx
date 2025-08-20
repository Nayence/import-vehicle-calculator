import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className,
  id,
  type = "text",
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && type !== 'date' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          id={inputId}
          className={clsx(
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
            'text-gray-900 placeholder-gray-400 bg-white',
            {
              'pl-10': icon && type !== 'date',
              'border-red-300 focus:ring-red-500': error,
            },
            // Styles spécifiques pour les inputs date
            type === 'date' && 'cursor-pointer',
            className
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}