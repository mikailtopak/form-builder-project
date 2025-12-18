'use client';

import React, { useState } from 'react';

type FormField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

interface FormPropertiesProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

const FormProperties = ({ field, onUpdate }: FormPropertiesProps) => {
  const [editedField, setEditedField] = useState<FormField>({ ...field });

  const handleChange = (key: keyof FormField, value: any) => {
    const updated = { ...editedField, [key]: value };
    setEditedField(updated);
    onUpdate(updated);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(editedField.options || [])];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), 'Yeni seçenek'];
    handleChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = editedField.options?.filter((_, i) => i !== index) || [];
    handleChange('options', newOptions);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alan Etiketi
        </label>
        <input
          type="text"
          value={editedField.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={editedField.placeholder || ''}
          onChange={(e) => handleChange('placeholder', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Kullanıcıya gösterilecek ipucu"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          checked={editedField.required}
          onChange={(e) => handleChange('required', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="required" className="ml-2 text-sm text-gray-700">
          Zorunlu alan
        </label>
      </div>

      {editedField.type === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seçenekler
          </label>
          <div className="space-y-2">
            {editedField.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Seçenek Ekle
            </button>
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Alan Bilgisi</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Tür: {field.type}</p>
          <p>• ID: {field.id.substring(0, 8)}...</p>
          <p>• Zorunlu: {field.required ? 'Evet' : 'Hayır'}</p>
        </div>
      </div>
    </div>
  );
};

export default FormProperties;