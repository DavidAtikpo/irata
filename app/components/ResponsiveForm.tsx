'use client';

import React from 'react';

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export default function ResponsiveForm({ children, onSubmit, className = '' }: ResponsiveFormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
}

interface ResponsiveFormSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ResponsiveFormSection({ children, title, className = '' }: ResponsiveFormSectionProps) {
  return (
    <div className={`bg-white shadow rounded-lg p-4 sm:p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

interface ResponsiveFormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function ResponsiveFormField({ label, children, required = false, className = '', fullWidth = false }: ResponsiveFormFieldProps) {
  return (
    <div className={`${fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''} ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

interface ResponsiveInputProps {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ResponsiveInput({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  disabled = false, 
  className = '' 
}: ResponsiveInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`
        block w-full rounded-md border-gray-300 shadow-sm
        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
        disabled:bg-gray-50 disabled:text-gray-500
        ${className}
      `}
    />
  );
}

interface ResponsiveTextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function ResponsiveTextarea({ 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  disabled = false, 
  rows = 3, 
  className = '' 
}: ResponsiveTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      className={`
        block w-full rounded-md border-gray-300 shadow-sm
        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
        disabled:bg-gray-50 disabled:text-gray-500
        ${className}
      `}
    />
  );
}

interface ResponsiveSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ResponsiveSelect({ 
  value, 
  onChange, 
  required = false, 
  disabled = false, 
  className = '', 
  children 
}: ResponsiveSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`
        block w-full rounded-md border-gray-300 shadow-sm
        focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
        disabled:bg-gray-50 disabled:text-gray-500
        ${className}
      `}
    >
      {children}
    </select>
  );
}

interface ResponsiveButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveButton({ 
  children, 
  type = 'button', 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'md', 
  className = '' 
}: ResponsiveButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
} 