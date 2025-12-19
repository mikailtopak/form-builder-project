'use client';

import { useState, useEffect } from 'react';
import ComponentPalette from '@/components/ComponentPalette';
import FormPreview from '@/components/FormPreview';
import FormProperties from '@/components/FormProperties';
import { formDB } from '@/lib/indexedDB';

type FormField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [formTitle, setFormTitle] = useState<string>('Yeni Form');
  const [formDescription, setFormDescription] = useState<string>('Dinamik olarak oluşturuldu');
  const [savedFormsCount, setSavedFormsCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kaydedilmiş form sayısını getir
  useEffect(() => {
    const loadSavedFormsCount = async () => {
      try {
        const forms = await formDB.getForms() as any[];
        setSavedFormsCount(forms.length);
      } catch (error) {
        console.error('Forms count load error:', error);
      }
    };

    loadSavedFormsCount();
  }, []);

  const handleAddField = (type: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: getDefaultLabel(type),
      required: false,
      placeholder: getPlaceholder(type),
    };
    
    if (type === 'select') {
      newField.options = ['Seçenek 1', 'Seçenek 2'];
    }
    
    setFields([...fields, newField]);
  };

  const getDefaultLabel = (type: string): string => {
    const labels: Record<string, string> = {
      text: 'Metin Alanı',
      email: 'E-posta Adresi',
      number: 'Sayı',
      date: 'Tarih',
      select: 'Seçim Kutusu',
      checkbox: 'Onay Kutusu',
      textarea: 'Çok Satırlı Metin',
    };
    return labels[type] || 'Alan';
  };

  const getPlaceholder = (type: string): string => {
    const placeholders: Record<string, string> = {
      text: 'Metin giriniz...',
      email: 'ornek@email.com',
      number: '0',
      date: 'GG/AA/YYYY',
      textarea: 'Açıklama giriniz...',
    };
    return placeholders[type] || '';
  };

  const handleFieldSelect = (field: FormField) => {
    setSelectedField(field);
  };

  // EKLEDİĞİM YENİ FONKSİYON - onDeleteField için
  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    
    // Eğer silinen field seçiliyse, seçimi temizle
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
    
    console.log(`Field ${fieldId} deleted`);
  };

  const handleFieldUpdate = (updatedField: FormField) => {
    setFields(fields.map(f => 
      f.id === updatedField.id ? updatedField : f
    ));
    setSelectedField(updatedField);
  };

  const handleSaveForm = async () => {
    if (fields.length === 0) {
      alert('Form boş! Lütfen en az bir alan ekleyin.');
      return;
    }

    setIsSaving(true);
    
    const formData = {
      id: Date.now().toString(),
      title: formTitle,
      description: formDescription,
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const isOnline = isClient ? navigator.onLine : true;

    try {
      // Önce backend'e kaydetmeyi dene
      const response = await fetch('http://localhost:3001/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Form başarıyla backend'e kaydedildi!\nForm ID: ${result.id || formData.id}`);
        setSavedFormsCount(prev => prev + 1);
      } else {
        // Backend'e kaydedilemezse IndexedDB'ye kaydet (offline mode)
        throw new Error('Backend unavailable');
      }
    } catch (error) {
      // Offline mod: IndexedDB'ye kaydet
      try {
        await formDB.saveForm(formData);
        alert(`İnternet bağlantısı yok! Form offline olarak kaydedildi.\nForm ID: ${formData.id}\nİnternet bağlantısı sağlandığında otomatik senkronize edilecek.`);
        setSavedFormsCount(prev => prev + 1);
        
        // Kullanıcıya senkronizasyon bilgisi göster
        if (isOnline) {
          setTimeout(async () => {
            try {
              await formDB.syncWithBackend();
              alert('Offline formlar backend\'e senkronize edildi!');
              const forms = await formDB.getForms() as any[];
              setSavedFormsCount(forms.length);
            } catch (syncError) {
              console.error('Sync error:', syncError);
            }
          }, 3000);
        }
      } catch (dbError) {
        console.error('IndexedDB error:', dbError);
        alert('Form kaydedilemedi! Lütfen tekrar deneyin.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncForms = async () => {
    try {
      await formDB.syncWithBackend();
      alert('Offline formlar backend\'e senkronize edildi!');
      const forms = await formDB.getForms() as any[];
      setSavedFormsCount(forms.length);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Senkronizasyon başarısız!');
    }
  };

  const handleClearForm = () => {
    if (fields.length > 0 && confirm('Formu temizlemek istediğinize emin misiniz?')) {
      setFields([]);
      setSelectedField(null);
      setFormTitle('Yeni Form');
      setFormDescription('Dinamik olarak oluşturuldu');
    }
  };

  const handleTestBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        alert(`Backend çalışıyor!\nStatus: ${data.status}\nDatabase: ${data.database}`);
      } else {
        alert('Backend yanıt vermiyor!');
      }
    } catch (error) {
      alert('Backend bağlantı hatası!');
    }
  };

  const handleLoadSampleForm = () => {
    const sampleFields: FormField[] = [
      {
        id: '1',
        type: 'text',
        label: 'Ad Soyad',
        required: true,
        placeholder: 'Adınız ve soyadınız'
      },
      {
        id: '2',
        type: 'email',
        label: 'E-posta',
        required: true,
        placeholder: 'ornek@email.com'
      },
      {
        id: '3',
        type: 'select',
        label: 'Şehir',
        required: false,
        options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya']
      },
      {
        id: '4',
        type: 'date',
        label: 'Doğum Tarihi',
        required: false
      },
      {
        id: '5',
        type: 'checkbox',
        label: 'Şartları kabul ediyorum',
        required: true
      }
    ];
    
    setFields(sampleFields);
    setFormTitle('Örnek Anket Formu');
    setFormDescription('Bu örnek form, sistemin tüm özelliklerini gösterir.');
  };

  // Online durumu kontrolü (sadece client-side)
  const isOnline = isClient ? navigator.onLine : true;
  const onlineStatusText = isClient ? (navigator.onLine ? 'Çevrimiçi' : 'Çevrimdışı') : 'Yükleniyor...';
  const onlineStatusColor = isClient ? (navigator.onLine ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-300';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-gray-600">Dinamik Kurallı Form Tasarımcısı - PWA</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${onlineStatusColor}`}></div>
                <span className="text-sm">{onlineStatusText}</span>
              </div>
              
              <button 
                onClick={handleTestBackend}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                API Test
              </button>
              
              <button 
                onClick={handleClearForm}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                disabled={fields.length === 0}
              >
                Formu Temizle
              </button>
              
              <button 
                onClick={handleSaveForm}
                disabled={isSaving || fields.length === 0}
                className={`px-4 py-2 rounded-lg transition text-sm ${
                  isSaving 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSaving ? 'Kaydediliyor...' : 'Formu Kaydet'}
              </button>
            </div>
          </div>

          {/* Form Title & Description */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Başlığı</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Form başlığını giriniz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Açıklaması</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Form açıklamasını giriniz"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Component Palette */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Bileşenler</h2>
                <button 
                  onClick={handleLoadSampleForm}
                  className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  Örnek Form
                </button>
              </div>
              <ComponentPalette onAddField={handleAddField} />
              
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Teknoloji Stack</h4>
                <ul className="text-xs space-y-1 text-blue-600">
                  <li>• Frontend: Next.js PWA</li>
                  <li>• Backend: NestJS + PostgreSQL</li>
                  <li>• Database: Prisma ORM</li>
                  <li>• Offline: IndexedDB</li>
                  <li>• Container: Docker</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Center - Form Builder Area */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Form Tasarım Alanı</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formTitle} - {formDescription}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {fields.length} bileşen
                  </span>
                  {isClient && !navigator.onLine && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Çevrimdışı Mod
                    </span>
                  )}
                </div>
              </div>
              
              {fields.length > 0 ? (
                <FormPreview 
                  fields={fields}
                  onFieldSelect={handleFieldSelect}
                  selectedFieldId={selectedField?.id}
                  onDeleteField={handleDeleteField} // BURASI DÜZELTİLDİ
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">Formunuz henüz boş</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Sol taraftaki bileşenlerden ekleyin veya "Örnek Form" butonuna tıklayın
                  </p>
                  <button 
                    onClick={handleLoadSampleForm}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Örnek Form Yükle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Properties & Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <h2 className="text-lg font-semibold mb-4">Özellikler</h2>
              {selectedField ? (
                <FormProperties 
                  field={selectedField}
                  onUpdate={handleFieldUpdate}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">Bir alan seçin</p>
                  <p className="text-sm">Form alanlarından birine tıklayarak özelliklerini düzenleyin</p>
                </div>
              )}
              
              <div className="mt-8 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Sistem Durumu</h3>
                  <ul className="text-sm space-y-1 text-blue-600">
                    <li className="flex items-center justify-between">
                      <span>Backend:</span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Çalışıyor
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Database:</span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Bağlı
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Form Alanları:</span>
                      <span className="font-medium">{fields.length}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Kaydedilen Formlar:</span>
                      <span className="font-medium">{savedFormsCount}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Bağlantı:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        isClient 
                          ? (navigator.onLine ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {onlineStatusText}
                      </span>
                    </li>
                  </ul>
                  
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <button
                      onClick={handleSyncForms}
                      disabled={!isOnline}
                      className={`w-full px-3 py-1.5 rounded text-sm ${
                        isOnline 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Offline Formları Senkronize Et
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-1">PWA Özellikleri</h4>
                  <ul className="text-xs space-y-1 text-green-600">
                    <li>• Offline çalışabilme</li>
                    <li>• Ana ekrana eklenebilir</li>
                    <li>• Push bildirimleri (hazır)</li>
                    <li>• Responsive tasarım</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-700">Form Builder Projesi • Yazılım Mühendisliği • {new Date().getFullYear()}</p>
              <p className="text-sm text-gray-500 mt-1">
                Backend: http://localhost:3001 • Frontend: http://localhost:3000
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="http://localhost:3001/health" 
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                Backend API Test
              </a>
              <a 
                href="http://localhost:3001/forms/health" 
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                Forms API Test
              </a>
              <a 
                href="http://localhost:3001/users/health" 
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                Users API Test
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}