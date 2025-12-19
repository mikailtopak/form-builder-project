'use client';

import { useState, useEffect } from 'react';
import ComponentPalette from '@/components/ComponentPalette';
import FormPreview from '@/components/FormPreview';
import FormProperties from '@/components/FormProperties';
import RuleBuilder from '@/components/RuleBuilder';
import SavedForms from '@/components/SavedForms';
import { formDB } from '@/lib/indexedDB';

type FormField = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

type Rule = {
  id: string;
  ifField: string;
  ifCondition: 'equals' | 'contains' | 'empty' | 'checked';
  ifValue: string;
  thenAction: 'show' | 'hide' | 'require' | 'disable';
  thenField: string;
};

type SavedForm = {
  id: string;
  title: string;
  fields: FormField[];
  rules: Rule[];
  createdAt: string;
};

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [formTitle, setFormTitle] = useState<string>('Yeni Form');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
  const [activeTab, setActiveTab] = useState<'design' | 'saved'>('design');

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadSavedForms();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSavedForms = async () => {
    try {
      const response = await fetch('http://localhost:3001/forms');
      
      if (response.ok) {
        const forms = await response.json();
        
        const formattedForms = forms.map((form: any) => {
          // rules'u uygun formata çevir
          let formattedRules: Rule[] = [];
          
          if (Array.isArray(form.rules)) {
            formattedRules = form.rules;
          } else if (form.rules && typeof form.rules === 'object') {
            // Object'ten array'e çevir
            formattedRules = Object.values(form.rules).map((rule: any, index) => ({
              id: `rule_${index}`,
              ifField: rule.ifField || '',
              ifCondition: rule.ifCondition || 'equals',
              ifValue: rule.ifValue || '',
              thenAction: rule.thenAction || 'show',
              thenField: rule.thenField || ''
            })) as Rule[];
          }
          
          return {
            id: String(form.id),
            title: form.title || 'İsimsiz Form',
            fields: form.fields || [],
            rules: formattedRules,
            createdAt: form.createdAt || new Date().toISOString(),
          };
        });
        
        setSavedForms(formattedForms);
      }
    } catch (error) {
      try {
        const localForms = await formDB.getForms();
        setSavedForms(localForms as SavedForm[]);
      } catch (dbError) {
        console.error('Local form yükleme hatası:', dbError);
      }
    }
  };

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
    setSelectedField(newField);
  };

  const getDefaultLabel = (type: string): string => {
    const labels: Record<string, string> = {
      text: 'Metin Alanı',
      email: 'E-posta',
      number: 'Sayı',
      date: 'Tarih',
      select: 'Seçim',
      checkbox: 'Onay Kutusu',
      textarea: 'Açıklama',
    };
    return labels[type] || 'Alan';
  };

  const getPlaceholder = (type: string): string => {
    const placeholders: Record<string, string> = {
      text: 'Metin giriniz...',
      email: 'email@example.com',
      number: '0',
      date: 'GG/AA/YYYY',
      textarea: 'Açıklama...',
    };
    return placeholders[type] || '';
  };

  const handleFieldSelect = (field: FormField) => {
    setSelectedField(field);
  };

  const handleFieldUpdate = (updatedField: FormField) => {
    const newFields = fields.map(f => 
      f.id === updatedField.id ? updatedField : f
    );
    setFields(newFields);
    setSelectedField(updatedField);
  };

  const handleDeleteField = (fieldId: string) => {
    if (window.confirm('Bu alanı silmek istediğinize emin misiniz?')) {
      const newFields = fields.filter(f => f.id !== fieldId);
      setFields(newFields);
      
      if (selectedField?.id === fieldId) {
        setSelectedField(newFields.length > 0 ? newFields[0] : null);
      }
      
      const newRules = rules.filter(rule => 
        rule.ifField !== fieldId && rule.thenField !== fieldId
      );
      setRules(newRules);
    }
  };

  const handleSaveForm = async () => {
    if (fields.length === 0) {
      alert('Form boş! Lütfen en az bir alan ekleyin.');
      return;
    }

    if (!formTitle.trim()) {
      alert('Lütfen form başlığı girin!');
      return;
    }

    setIsSaving(true);

    // BACKEND'İN BEKLEDİĞİ FORMAT: rules bir object olmalı
    // Array'i object'e çeviriyoruz
    const rulesObject = rules.reduce((acc, rule, index) => {
      acc[`rule_${index}`] = {
        ifField: rule.ifField,
        ifCondition: rule.ifCondition,
        ifValue: rule.ifValue,
        thenAction: rule.thenAction,
        thenField: rule.thenField
      };
      return acc;
    }, {} as Record<string, any>);

    const formData = {
      title: formTitle.trim(),
      fields: fields,
      rules: rulesObject, // Object olarak gönder
      createdAt: new Date().toISOString(),
    };

    console.log('Kaydedilen form data:', formData); // DEBUG

    try {
      const response = await fetch('http://localhost:3001/forms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ "${formTitle}" formu başarıyla kaydedildi!`);
        
        await loadSavedForms();
        setActiveTab('saved');
        
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText); // DEBUG
        let errorMessage = 'Form kaydedilemedi!\n\n';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message && Array.isArray(errorData.message)) {
            errorMessage += errorData.message.join('\n');
          } else if (errorData.message) {
            errorMessage += errorData.message;
          }
        } catch (e) {
          errorMessage += `HTTP ${response.status}: ${errorText}`;
        }
        
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Fetch error:', error); // DEBUG
      try {
        await formDB.saveForm({
          ...formData,
          id: Date.now().toString(),
          synced: false
        });
        alert('📴 Form local olarak kaydedildi.');
        await loadSavedForms();
        setActiveTab('saved');
      } catch (dbError) {
        console.error('Local save error:', dbError);
        alert('❌ Form kaydedilemedi!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadForm = (form: SavedForm) => {
    setFields(form.fields || []);
    setFormTitle(form.title || 'Yüklenen Form');
    
    // Kuralları doğrudan form.rules'dan al (zaten formatlanmış halde)
    setRules(form.rules || []);
    setSelectedField(form.fields?.[0] || null);
    setActiveTab('design');
    alert(`✅ "${form.title}" formu yüklendi!`);
  };

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Bu formu silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`http://localhost:3001/forms/${formId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await loadSavedForms();
          alert('✅ Form silindi!');
        } else {
          alert('Form silinemedi!');
        }
      } catch (error) {
        alert('Form silinemedi!');
      }
    }
  };

  const handleClearForm = () => {
    if (fields.length === 0) return;
    
    if (confirm('Formu temizlemek istediğinize emin misiniz?')) {
      setFields([]);
      setSelectedField(null);
      setFormTitle('Yeni Form');
      setRules([]);
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
    setSelectedField(sampleFields[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-xl shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-sans">Form Builder</h1>
                <p className="text-gray-600 font-medium">Kolay ve hızlı form oluşturma aracı</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('design')}
              className={`px-6 py-3 font-medium rounded-t-lg transition flex items-center gap-2 ${
                activeTab === 'design'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>📝</span>
              <span>Form Tasarımı</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 font-medium rounded-t-lg transition flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>💾</span>
              <span>Kayıtlı Formlar ({savedForms.length})</span>
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-6">
        {activeTab === 'design' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">Bileşenler</h2>
                  <button
                    onClick={handleLoadSampleForm}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    title="Örnek form yükle"
                  >
                    Örnek
                  </button>
                </div>
                <ComponentPalette onAddField={handleAddField} />
              </div>

              <div className="bg-white rounded-lg shadow p-4 mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">İstatistikler</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Alan Sayısı</span>
                    <span className="font-bold text-blue-600">{fields.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kural Sayısı</span>
                    <span className="font-bold text-purple-600">{rules.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kayıtlı Form</span>
                    <span className="font-bold text-green-600">{savedForms.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-lg shadow h-full">
                <div className="p-6 border-b">
                  <div className="max-w-2xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form Başlığı
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 text-xl bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-medium"
                      placeholder="Formunuzun başlığını yazın..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Bu başlık formunuzun ana başlığı olacak ve kayıtlı formlarda görünecek
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Form Önizleme</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearForm}
                        disabled={fields.length === 0}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                      >
                        Temizle
                      </button>
                      <button
                        onClick={handleSaveForm}
                        disabled={isSaving || fields.length === 0}
                        className={`px-4 py-2 text-sm rounded transition ${
                          isSaving 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                        } text-white disabled:opacity-50 flex items-center gap-2`}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Kaydediliyor...</span>
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            <span>Formu Kaydet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {fields.length > 0 ? (
                    <div>
                      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{formTitle || 'Form Başlığı'}</h3>
                        <p className="text-gray-600">
                          Bu form {fields.length} soru içermektedir. Lütfen tüm alanları doldurun.
                        </p>
                      </div>
                      
                      <FormPreview
                        fields={fields}
                        onFieldSelect={handleFieldSelect}
                        selectedFieldId={selectedField?.id}
                        onDeleteField={handleDeleteField}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Formunuz Boş</h3>
                      <p className="text-gray-500 mb-4">
                        Sol taraftan bileşen ekleyin veya "Örnek" butonuna tıklayın
                      </p>
                      <button
                        onClick={handleLoadSampleForm}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 transition"
                      >
                        📋 Örnek Form Yükle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-800 mb-4">Alan Özellikleri</h2>
                {selectedField ? (
                  <FormProperties
                    field={selectedField}
                    onUpdate={handleFieldUpdate}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p>Form alanı seçin</p>
                    <p className="text-sm mt-1">Alanlara tıklayarak düzenleyebilirsiniz</p>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-800 mb-4">Koşullu Kurallar</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Alanlar arası ilişkiler kurmak için kurallar oluşturun.
                </p>
                <RuleBuilder 
                  fields={fields.map(f => ({
                    id: f.id,
                    label: f.label,
                    type: f.type
                  }))}
                  onRulesChange={setRules}
                  initialRules={rules}
                />
              </div>
            </div>
          </div>
        ) : (
          <SavedForms
            forms={savedForms}
            onLoadForm={handleLoadForm}
            onDeleteForm={handleDeleteForm}
            onRefresh={loadSavedForms}
          />
        )}
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Form Builder • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>

      {isSaving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Kaydediliyor</h3>
            <p className="text-gray-600">Lütfen bekleyin...</p>
          </div>
        </div>
      )}
    </div>
  );
}