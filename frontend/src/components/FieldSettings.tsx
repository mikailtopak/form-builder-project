'use client';

import React, { useState } from 'react';
import { FiSettings, FiCheckCircle, FiAlertCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FormField, ValidationRule, ValidationRuleType, COMPONENT_TYPES } from '@/lib/types/form-types';

interface FieldSettingsProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

const FieldSettings = ({ field, onUpdate }: FieldSettingsProps) => {
  const [localField, setLocalField] = useState<FormField>({ ...field });

  const handleChange = (key: keyof FormField, value: any) => {
    const updated = { ...localField, [key]: value };
    setLocalField(updated);
    onUpdate(updated);
  };

  const handleValidationAdd = () => {
    const newRule: ValidationRule = {
      type: 'required',
      message: 'Bu alan zorunludur'
    };
    const updated = {
      ...localField,
      validationRules: [...(localField.validationRules || []), newRule]
    };
    setLocalField(updated);
    onUpdate(updated);
  };

  const handleValidationUpdate = (index: number, rule: ValidationRule) => {
    const updatedRules = [...(localField.validationRules || [])];
    updatedRules[index] = rule;
    const updated = { ...localField, validationRules: updatedRules };
    setLocalField(updated);
    onUpdate(updated);
  };

  const handleValidationDelete = (index: number) => {
    const updatedRules = localField.validationRules?.filter((_, i) => i !== index) || [];
    const updated = { ...localField, validationRules: updatedRules };
    setLocalField(updated);
    onUpdate(updated);
  };

  const validationTypes: { value: ValidationRuleType; label: string; description: string }[] = [
    { value: 'required', label: 'Zorunlu Alan', description: 'Alanın doldurulması zorunlu' },
    { value: 'email', label: 'E-posta Formatı', description: 'Geçerli e-posta adresi' },
    { value: 'minLength', label: 'Min. Uzunluk', description: 'Minimum karakter sayısı' },
    { value: 'maxLength', label: 'Max. Uzunluk', description: 'Maksimum karakter sayısı' },
    { value: 'min', label: 'Min. Değer', description: 'Minimum sayı değeri' },
    { value: 'max', label: 'Max. Değer', description: 'Maksimum sayı değeri' },
    { value: 'pattern', label: 'Regex Pattern', description: 'Özel format pattern\'i' },
  ];

  return (
    <div className="h-full overflow-y-auto border-l border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-3">
        <FiSettings className="text-xl text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Alan Ayarları</h3>
          <p className="text-sm text-gray-500">
            {COMPONENT_TYPES[field.type.toUpperCase() as keyof typeof COMPONENT_TYPES]?.label || field.type}
          </p>
        </div>
      </div>

      {/* Temel Ayarlar */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-gray-700">Temel Ayarlar</h4>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Başlık</label>
            <input
              type="text"
              value={localField.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">Placeholder</label>
            <input
              type="text"
              value={localField.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Kullanıcıya gösterilecek örnek metin"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-gray-600">Zorunlu Alan</label>
              <p className="text-xs text-gray-500">Bu alanın doldurulması zorunlu</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={localField.required}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Select için options */}
      {field.type === 'select' && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-700">Seçenekler</h4>
          <textarea
            value={localField.options?.join('\n') || ''}
            onChange={(e) => handleChange('options', e.target.value.split('\n'))}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Her satıra bir seçenek yazın"
          />
          <p className="mt-1 text-xs text-gray-500">Her satır bir seçenek olacak şekilde yazın</p>
        </div>
      )}

      {/* Doğrulama Kuralları */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Doğrulama Kuralları</h4>
          <button
            onClick={handleValidationAdd}
            className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
          >
            <FiPlus /> Kural Ekle
          </button>
        </div>

        {localField.validationRules?.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
            <FiAlertCircle className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Henüz doğrulama kuralı eklenmedi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localField.validationRules?.map((rule, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <select
                      value={rule.type}
                      onChange={(e) => handleValidationUpdate(index, {
                        ...rule,
                        type: e.target.value as ValidationRuleType
                      })}
                      className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      {validationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Hata mesajı"
                      value={rule.message}
                      onChange={(e) => handleValidationUpdate(index, {
                        ...rule,
                        message: e.target.value
                      })}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />

                    {rule.type !== 'required' && rule.type !== 'email' && (
                      <input
                        type="text"
                        placeholder="Değer (örn: 5, 100, regex)"
                        value={rule.value || ''}
                        onChange={(e) => handleValidationUpdate(index, {
                          ...rule,
                          value: e.target.value
                        })}
                        className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleValidationDelete(index)}
                    className="ml-2 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {validationTypes.find(t => t.value === rule.type)?.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alan Bilgileri */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-gray-700">Alan Bilgileri</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Alan Tipi:</span>
            <span className="font-medium">{field.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Alan ID:</span>
            <span className="font-mono text-xs">{field.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Kurallar:</span>
            <span className="font-medium">{field.validationRules?.length || 0} adet</span>
          </div>
        </div>
      </div>

      {/* Uyarılar */}
      {field.type === 'email' && !localField.validationRules?.some(r => r.type === 'email') && (
        <div className="mt-4 rounded-lg bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <FiAlertCircle className="mt-0.5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-yellow-800">E-posta Doğrulaması</p>
              <p className="text-xs text-yellow-600">
                Bu alan e-posta tipinde. E-posta formatı doğrulaması eklemeniz önerilir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSettings;