'use client';

import { useState, useEffect } from 'react';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormPropertiesProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

export default function FormProperties({ field, onUpdate }: FormPropertiesProps) {
  const [localField, setLocalField] = useState<FormField>(field);

  // Field değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalField(field);
  }, [field]);

  // Değişiklikleri anında uygula
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(localField) !== JSON.stringify(field)) {
        onUpdate(localField);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localField, field, onUpdate]);

  const handleChange = (key: keyof FormField, value: any) => {
    setLocalField(prev => ({ ...prev, [key]: value }));
  };

  const addOption = () => {
    if (localField.options && localField.options.length < 10) {
      const newOption = `Seçenek ${localField.options.length + 1}`;
      const updatedOptions = [...localField.options, newOption];
      setLocalField(prev => ({ ...prev, options: updatedOptions }));
    }
  };

  const removeOption = (index: number) => {
    if (localField.options && localField.options.length > 1) {
      const updatedOptions = localField.options.filter((_, i) => i !== index);
      setLocalField(prev => ({ ...prev, options: updatedOptions }));
    }
  };

  const updateOption = (index: number, value: string) => {
    if (localField.options) {
      const updatedOptions = [...localField.options];
      updatedOptions[index] = value;
      setLocalField(prev => ({ ...prev, options: updatedOptions }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Field Header */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-xl">
            {field.type === 'text' && '📝'}
            {field.type === 'email' && '📧'}
            {field.type === 'number' && '🔢'}
            {field.type === 'date' && '📅'}
            {field.type === 'select' && '📋'}
            {field.type === 'checkbox' && '✓'}
            {field.type === 'textarea' && '📄'}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{field.label}</h3>
            <p className="text-sm text-gray-500 capitalize">{field.type} alanı</p>
          </div>
        </div>
      </div>

      {/* Field Properties */}
      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alan Etiketi
          </label>
          <input
            type="text"
            value={localField.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Alan etiketini girin"
          />
        </div>

        {/* Placeholder */}
        {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'textarea') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yer Tutucu Metin
            </label>
            <input
              type="text"
              value={localField.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Örnek: Adınızı giriniz"
            />
          </div>
        )}

        {/* Options for Select */}
        {field.type === 'select' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Seçenekler
              </label>
              <button
                type="button"
                onClick={addOption}
                className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                disabled={localField.options && localField.options.length >= 10}
              >
                + Ekle
              </button>
            </div>
            <div className="space-y-2">
              {localField.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder={`Seçenek ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                    disabled={localField.options && localField.options.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Checkbox */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="required"
            checked={localField.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <label htmlFor="required" className="text-sm font-medium text-gray-700">
              Zorunlu Alan
            </label>
            <p className="text-xs text-gray-500">
              Kullanıcı bu alanı doldurmak zorunda
            </p>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800 font-medium mb-1">Canlı Önizleme</p>
        <p className="text-xs text-green-700">
          Değişiklikler formda anında görüntüleniyor
        </p>
      </div>
    </div>
  );
}