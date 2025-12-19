'use client';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormPreviewProps {
  fields: FormField[];
  onFieldSelect: (field: FormField) => void;
  selectedFieldId: string | null | undefined;
  onDeleteField: (fieldId: string) => void; // Silme fonksiyonu eklendi
}

export default function FormPreview({ 
  fields, 
  onFieldSelect, 
  selectedFieldId,
  onDeleteField 
}: FormPreviewProps) {
  const renderField = (field: FormField) => {
    const isSelected = selectedFieldId === field.id;
    const baseClasses = `relative p-4 mb-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-sm' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`;

    return (
      <div 
        key={field.id} 
        className={baseClasses}
        onClick={() => onFieldSelect(field)}
      >
        {/* Silme Butonu - Sağ Üst Köşe */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Tıklamanın alan seçimini tetiklemesini engelle
            onDeleteField(field.id);
          }}
          className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition z-10"
          title="Alanı sil"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Alan Etiketi */}
        <div className="flex items-center gap-2 mb-3">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            {field.type === 'text' && 'Metin'}
            {field.type === 'email' && 'E-posta'}
            {field.type === 'number' && 'Sayı'}
            {field.type === 'date' && 'Tarih'}
            {field.type === 'select' && 'Seçim'}
            {field.type === 'checkbox' && 'Onay Kutusu'}
            {field.type === 'textarea' && 'Açıklama'}
          </span>
        </div>

        {/* Alan İçeriği */}
        <div className="mt-2">
          {field.type === 'text' && (
            <input
              type="text"
              placeholder={field.placeholder || 'Metin giriniz...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              disabled
            />
          )}
          
          {field.type === 'email' && (
            <input
              type="email"
              placeholder={field.placeholder || 'email@example.com'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              disabled
            />
          )}
          
          {field.type === 'number' && (
            <input
              type="number"
              placeholder={field.placeholder || '0'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              disabled
            />
          )}
          
          {field.type === 'date' && (
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              disabled
            />
          )}
          
          {field.type === 'select' && (
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              disabled
            >
              <option value="">Seçiniz...</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
          
          {field.type === 'checkbox' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-not-allowed"
                disabled
              />
              <span className="ml-2 text-gray-600">{field.label}</span>
            </div>
          )}
          
          {field.type === 'textarea' && (
            <textarea
              placeholder={field.placeholder || 'Açıklama...'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed resize-none"
              disabled
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Henüz form alanı eklenmedi</p>
          <p className="text-sm mt-1">Sol taraftan bileşen ekleyin</p>
        </div>
      ) : (
        fields.map(renderField)
      )}
    </div>
  );
}