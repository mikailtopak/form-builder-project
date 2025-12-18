'use client';

import React from 'react';
import { COMPONENT_TYPES } from '@/lib/types/form-types';
import { FiType, FiMail, FiHash, FiCalendar, FiList, FiCheckSquare, FiFileText } from 'react-icons/fi';

interface ComponentPaletteProps {
  onAddField: (fieldType: string) => void;
}

const ComponentPalette = ({ onAddField }: ComponentPaletteProps) => {
  const components = [
    { type: 'text', label: 'Metin Alanı', icon: <FiType className="text-blue-500" />, color: 'bg-blue-50 hover:bg-blue-100' },
    { type: 'email', label: 'E-posta', icon: <FiMail className="text-green-500" />, color: 'bg-green-50 hover:bg-green-100' },
    { type: 'number', label: 'Sayı', icon: <FiHash className="text-purple-500" />, color: 'bg-purple-50 hover:bg-purple-100' },
    { type: 'date', label: 'Tarih', icon: <FiCalendar className="text-yellow-500" />, color: 'bg-yellow-50 hover:bg-yellow-100' },
    { type: 'select', label: 'Seçim Kutusu', icon: <FiList className="text-red-500" />, color: 'bg-red-50 hover:bg-red-100' },
    { type: 'checkbox', label: 'Onay Kutusu', icon: <FiCheckSquare className="text-indigo-500" />, color: 'bg-indigo-50 hover:bg-indigo-100' },
    { type: 'textarea', label: 'Çok Satırlı Metin', icon: <FiFileText className="text-pink-500" />, color: 'bg-pink-50 hover:bg-pink-100' },
  ];

  return (
    <div className="h-full border-r border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Bileşenler</h3>
      <p className="mb-4 text-sm text-gray-600">
        Bileşenleri forma eklemek için tıklayın
      </p>
      
      <div className="space-y-2">
        {components.map((component) => (
          <button
            key={component.type}
            onClick={() => onAddField(component.type)}
            className={`flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all ${component.color} hover:scale-[1.02] hover:shadow-sm`}
          >
            <div className="text-xl">{component.icon}</div>
            <div>
              <div className="font-medium text-gray-800">{component.label}</div>
              <div className="text-xs text-gray-500">
                'Tıklayarak ekleyin'
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-3">
        <h4 className="text-sm font-medium text-blue-800">İpucu</h4>
        <p className="mt-1 text-xs text-blue-600">
          • Bileşenleri sürükleyip sıralayabilirsiniz<br/>
          • Alanları seçip sağdaki panelden düzenleyin<br/>
          • Doğrulama kuralları ekleyin
        </p>
      </div>
    </div>
  );
};

export default ComponentPalette;