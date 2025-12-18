'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { FormField } from '@/lib/types/form-types';

// Sortable form alanı bileşeni
const SortableField = ({ 
  field, 
  isSelected, 
  onSelect, 
  onDelete 
}: { 
  field: FormField;
  isSelected: boolean;
  onSelect: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              readOnly
            />
          </div>
        );

      case 'textarea':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              readOnly
            />
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Seçiniz...</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              readOnly
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
          </div>
        );

      case 'date':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              readOnly
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-3 rounded-lg border-2 p-4 transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => onSelect(field)}
    >
      <div className="flex items-start gap-3">
        {/* Sürükleme tutamağı */}
        <div 
          className="cursor-grab active:cursor-grabbing" 
          {...attributes} 
          {...listeners}
        >
          <FiMoreVertical className="mt-1 text-gray-400" />
        </div>

        {/* Form alanı içeriği */}
        <div className="flex-1">
          {renderField()}
          
          {/* Doğrulama kuralları gösterimi */}
          {field.validationRules && field.validationRules.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {field.validationRules.map((rule, index) => (
                <span
                  key={index}
                  className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                >
                  {rule.type === 'required' ? 'Zorunlu' : rule.type}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sil butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          title="Sil"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

// Ana FormCanvas component'i
interface FormCanvasProps {
  fields: FormField[];
  selectedField: FormField | null;
  onSelectField: (field: FormField) => void;
  onDeleteField: (fieldId: string) => void;
}

const FormCanvas = ({ 
  fields, 
  selectedField, 
  onSelectField, 
  onDeleteField 
}: FormCanvasProps) => {
  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Form Tasarım Alanı</h3>
        <p className="text-gray-600">Alanları sürükleyerek sıralayın, tıklayarak seçin</p>
      </div>

      {fields.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📋</div>
          <h4 className="text-lg font-medium text-gray-700">Formunuz Boş</h4>
          <p className="mt-2 text-gray-500">
            Soldaki bileşenlerden forma alan ekleyin
          </p>
          <div className="mt-4 text-sm text-gray-400">
            • Metin alanı, e-posta, tarih, seçim kutusu ekleyebilirsiniz<br/>
            • Her alan için doğrulama kuralları tanımlayın<br/>
            • Alanları sürükleyip sıralayın
          </div>
        </div>
      ) : (
        <div className="max-w-2xl">
          {fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              isSelected={selectedField?.id === field.id}
              onSelect={onSelectField}
              onDelete={onDeleteField}
            />
          ))}
        </div>
      )}

      {/* İstatistikler */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-600">Toplam Alan</div>
            <div className="text-2xl font-bold text-gray-800">{fields.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Zorunlu Alanlar</div>
            <div className="text-2xl font-bold text-green-600">
              {fields.filter(f => f.required).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Doğrulama Kuralları</div>
            <div className="text-2xl font-bold text-blue-600">
              {fields.reduce((acc, f) => acc + (f.validationRules?.length || 0), 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormCanvas;