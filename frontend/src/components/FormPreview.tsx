'use client';

import React from 'react';

type FormField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

interface FormPreviewProps {
  fields: FormField[];
  onFieldSelect: (field: FormField) => void;
  selectedFieldId?: string;
}

const FormPreview = ({ fields, onFieldSelect, selectedFieldId }: FormPreviewProps) => {
  const renderField = (field: FormField) => {
    const isSelected = field.id === selectedFieldId;
    
    const baseClasses = `p-4 border rounded-lg mb-3 transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`;

    return (
      <div 
        key={field.id}
        className={baseClasses}
        onClick={() => onFieldSelect(field)}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {field.type}
          </span>
        </div>
        
        {renderFieldInput(field)}
        
        {field.placeholder && (
          <p className="text-xs text-gray-500 mt-1">{field.placeholder}</p>
        )}
      </div>
    );
  };

  const renderFieldInput = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={field.placeholder}
            disabled
          />
        );
      
      case 'textarea':
        return (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={field.placeholder}
            rows={3}
            disabled
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        );
      
      case 'select':
        return (
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          >
            <option value="">Seçiniz...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled
            />
            <span className="ml-2 text-gray-700">Seçili</span>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Bilinmeyen alan türü"
            disabled
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {fields.map(renderField)}
    </div>
  );
};

export default FormPreview;