'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useFormApi } from '@/lib/api/useFormApi';
import { FiSave, FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import ComponentPalette from './ComponentPalette';
import FormCanvas from './FormCanvas';
import FieldSettings from './FieldSettings';
import { FormField } from '@/lib/types/form-types';

const FormBuilder = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const { saveForm, loading, error, clearError } = useFormApi();
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Bileşen paletinden alan ekleme
  const handleAddField = (fieldType: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType as any,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Alanı`,
      placeholder: 'Metin giriniz...',
      required: false,
    };

    if (fieldType === 'select') {
      newField.options = ['Seçenek 1', 'Seçenek 2', 'Seçenek 3'];
    }

    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  // Sürükle-bırak ile sıralama
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Alan güncelleme
  const handleUpdateField = (updatedField: FormField) => {
    setFields(fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    setSelectedField(updatedField);
  };

  // Alan silme
  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  // Formu kaydet
  const handleSaveForm = async () => {
    if (fields.length === 0) {
      setSaveStatus({ type: 'error', message: 'Form boş, kaydedilemez!' });
      return;
    }

    const formData = {
      title: `Form ${new Date().toLocaleDateString()}`,
      description: 'Form Builder ile oluşturuldu',
      fields: fields,
      rules: {},
    };

    const result = await saveForm(formData);
    
    if (result.success) {
      setSaveStatus({ 
        type: 'success', 
        message: `Form başarıyla kaydedildi! ID: ${result.data?.form?.id || 'N/A'}` 
      });
    } else {
      setSaveStatus({ 
        type: 'error', 
        message: result.error || 'Form kaydedilemedi' 
      });
    }

    // 5 saniye sonra mesajı temizle
    setTimeout(() => {
      setSaveStatus({ type: null, message: '' });
      clearError();
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Güncellenmiş */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Form Builder - Dinamik Kurallı Form Tasarımcısı</h1>
              <p className="mt-1 text-sm text-blue-100">
                Sürükle-bırak ile form oluşturun, doğrulama kuralları ekleyin
              </p>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
              <button
                onClick={handleSaveForm}
                disabled={loading || fields.length === 0}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                  loading || fields.length === 0
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <FiSave />
                {loading ? 'Kaydediliyor...' : 'Formu Kaydet'}
              </button>
              
              <button
                onClick={() => {
                  // JSON export
                  const formJson = JSON.stringify({ fields }, null, 2);
                  const blob = new Blob([formJson], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `form-${Date.now()}.json`;
                  a.click();
                }}
                disabled={fields.length === 0}
                className={`flex items-center gap-2 rounded-lg border border-white px-4 py-2 font-medium transition-all hover:bg-white/10 ${
                  fields.length === 0 ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <FiDownload />
                JSON Export
              </button>
            </div>
          </div>

          {/* Sistem durumu */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>Frontend: Next.js + Tailwind</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>Backend: NestJS + PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>Alanlar: {fields.length} adet</span>
            </div>
          </div>
        </div>
      </header>

      {/* Save Status Messages */}
      <div className="container mx-auto px-4 pt-4">
        {saveStatus.type === 'success' && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800">
            <FiCheckCircle className="text-green-500" />
            <span className="font-medium">{saveStatus.message}</span>
          </div>
        )}
        
        {saveStatus.type === 'error' && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-800">
            <FiAlertCircle className="text-red-500" />
            <span className="font-medium">{saveStatus.message}</span>
          </div>
        )}
        
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800">
            <FiAlertCircle className="text-yellow-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>

      {/* Form Builder Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="rounded-xl bg-white shadow-xl">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-2xl font-bold text-gray-800">Form Tasarımcısı</h2>
            <p className="text-gray-600">Bileşenleri sürükleyin, form alanlarını düzenleyin, kurallar ekleyin</p>
          </div>
          
          {/* Form Builder Ana Alanı */}
          <div className="flex min-h-[600px] divide-x divide-gray-200">
            {/* Sol Panel: Bileşen Paleti */}
            <div className="w-64 flex-shrink-0">
              <ComponentPalette onAddField={handleAddField} />
            </div>

            {/* Orta Panel: Form Tasarım Alanı */}
            <div className="flex-1">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <FormCanvas
                    fields={fields}
                    selectedField={selectedField}
                    onSelectField={setSelectedField}
                    onDeleteField={handleDeleteField}
                  />
                </SortableContext>
              </DndContext>
            </div>

            {/* Sağ Panel: Alan Ayarları */}
            <div className="w-80 flex-shrink-0">
              {selectedField ? (
                <FieldSettings
                  field={selectedField}
                  onUpdate={handleUpdateField}
                />
              ) : (
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="font-medium text-gray-700">Alan Ayarları</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Ayarlarını düzenlemek için bir alan seçin
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;