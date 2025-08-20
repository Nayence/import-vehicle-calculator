import React from 'react';
import { clsx } from 'clsx';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  max?: string;
  min?: string;
}

export function DateInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled,
  max,
  min
}: DateInputProps) {
  const inputId = `date-${Math.random().toString(36).substr(2, 9)}`;

  // Fonction pour formater la date au format YYYY-MM-DD
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // Fonction pour gérer le changement de date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={clsx(
            "block text-sm font-medium mb-1",
            disabled ? "text-gray-400" : "text-gray-700"
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="date"
          id={inputId}
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          disabled={disabled}
          max={max}
          min={min}
          placeholder={placeholder}
          className={clsx(
            'w-full px-3 py-2 pr-10 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900',
            {
              'border-red-300 focus:ring-red-500': error,
              'border-gray-300': !error && !disabled,
              'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed': disabled,
            }
          )}
        />
        
        <Calendar className={clsx(
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