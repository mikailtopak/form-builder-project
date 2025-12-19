'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export default function FormBuilderPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Yeni Form');
  const [isCreating, setIsCreating] = useState(false);
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'question_1',
      type: 'text',
      label: 'Adınız Soyadınız',
      required: true,
      placeholder: 'Adınızı giriniz'
    }
  ]);

  const addField = () => {
    const newId = `question_${Date.now()}_${fields.length + 1}`;
    setFields([
      ...fields,
      {
        id: newId,
        type: 'text',
        label: `Yeni Soru ${fields.length + 1}`,
        required: false,
        placeholder: 'Cevap giriniz'
      }
    ]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleCreateForm = async () => {
    if (!title.trim()) {
      alert('Lütfen form başlığı girin!');
      return;
    }

    if (fields.length === 0) {
      alert('Lütfen en az bir soru ekleyin!');
      return;
    }

    setIsCreating(true);
    
    // ❗️ ÖNEMLİ DEĞİŞİKLİK: "rules" array [] değil, object {} olacak
    const formData = {
      title: title,
      fields: fields,
      rules: {}  // Array değil, boş object
    };

    console.log('📤 Gönderilen form data:', formData);

    try {
      const response = await fetch('http://localhost:3001/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Oluşturulan form:', data);
        alert(`✅ "${title}" formu başarıyla oluşturuldu!\nForm ID: ${data.id}`);
        
        // 2 saniye bekle ve kayıtlı formlara yönlendir
        setTimeout(() => {
          router.push('/forms/saved');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        
        // Validation hatası için özel mesaj
        if (errorData.message && Array.isArray(errorData.message)) {
          alert(`❌ Form oluşturulamadı:\n${errorData.message.join('\n')}`);
        } else {
          alert(`❌ Form oluşturulamadı: ${errorData.message || 'Bilinmeyen hata'}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Form oluşturma hatası:', error);
      alert(`❌ Form oluşturulamadı: ${error.message || 'Ağ hatası'}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Alan tipine göre örnek placeholder
  const getPlaceholderForType = (type: string) => {
    switch (type) {
      case 'text': return 'Metin giriniz...';
      case 'email': return 'ornek@email.com';
      case 'number': return '123';
      case 'date': return 'YYYY-AA-GG';
      case 'textarea': return 'Ayrıntılı cevabınız...';
      default: return 'Cevap giriniz...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">🏗️ Form Oluşturucu</h1>
              <p className="text-gray-600 mt-2">Yeni formunuzu oluşturun ve kaydedin</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/forms/saved')}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <span>📁</span>
                <span>Kayıtlı Formlar</span>
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <span>←</span>
                <span>Ana Sayfa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-3xl font-bold text-white placeholder-white/80 border-none outline-none"
                  placeholder="Form Başlığı"
                />
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                    {fields.length} soru
                  </span>
                  <span className="text-blue-100 text-sm">
                    Önizleme
                  </span>
                </div>
              </div>

              {/* Form Fields Preview */}
              <div className="p-6 space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{field.label}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                  Zorunlu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Field Inputs for Editing */}
                        <div className="mt-4 space-y-3 pl-11">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Soru Metni
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              placeholder="Soru metnini girin"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Tip
                              </label>
                              <select
                                value={field.type}
                                onChange={(e) => updateField(index, { 
                                  type: e.target.value,
                                  placeholder: getPlaceholderForType(e.target.value)
                                })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              >
                                <option value="text">Metin</option>
                                <option value="email">E-posta</option>
                                <option value="number">Sayı</option>
                                <option value="date">Tarih</option>
                                <option value="select">Seçim</option>
                                <option value="checkbox">Onay Kutusu</option>
                                <option value="textarea">Çok Satırlı</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Zorunlu mu?
                              </label>
                              <div className="flex items-center h-10">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => updateField(index, { required: e.target.checked })}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Evet</span>
                              </div>
                            </div>
                          </div>

                          {field.type === 'select' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Seçenekler (her satıra bir seçenek)
                              </label>
                              <textarea
                                value={field.options?.join('\n') || ''}
                                onChange={(e) => updateField(index, { 
                                  options: e.target.value.split('\n').filter(opt => opt.trim())
                                })}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                placeholder="Seçenek 1\nSeçenek 2\nSeçenek 3"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Açıklama/Yardım Metni
                            </label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(index, { placeholder: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              placeholder={getPlaceholderForType(field.type)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeField(index)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        title="Bu soruyu sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-gray-500">Henüz soru eklemediniz</p>
                    <p className="text-sm text-gray-400 mt-1">Aşağıdaki butonlardan soru ekleyin</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Form Controls */}
          <div className="space-y-6">
            {/* Form Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span>⚙️</span>
                <span>Form Ayarları</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Başlığı *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Örn: Kişisel Bilgi Formu"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Bu başlık formunuzun ana başlığı olacak
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Sorular ({fields.length})
                    </label>
                    <span className={`text-sm font-medium ${fields.length === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fields.length === 0 ? 'Sorunuz yok!' : `${fields.length} soru eklendi`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addField}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <span>+</span>
                      <span>Yeni Soru Ekle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Types Quick Add */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span>🎨</span>
                <span>Hızlı Soru Ekle</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'text', icon: '📝', label: 'Metin' },
                  { type: 'email', icon: '📧', label: 'E-posta' },
                  { type: 'number', icon: '🔢', label: 'Sayı' },
                  { type: 'date', icon: '📅', label: 'Tarih' },
                  { type: 'select', icon: '📋', label: 'Seçim' },
                  { type: 'checkbox', icon: '☑️', label: 'Onay Kutusu' },
                  { type: 'textarea', icon: '📄', label: 'Çok Satırlı' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => {
                      const newId = `field_${Date.now()}_${item.type}`;
                      const newField: FormField = {
                        id: newId,
                        type: item.type,
                        label: `${item.label} Sorusu`,
                        required: false,
                        placeholder: getPlaceholderForType(item.type)
                      };
                      if (item.type === 'select') {
                        newField.options = ['Seçenek 1', 'Seçenek 2', 'Seçenek 3'];
                      }
                      setFields([...fields, newField]);
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm transition-all text-center group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Form Button */}
            <div className="sticky top-6 space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Formunuz Hazır!</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {fields.length > 0 
                        ? `Formunuz ${fields.length} soru içeriyor. Şimdi kaydedin.`
                        : 'Henüz soru eklemediniz. Önce soru ekleyin.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateForm}
                disabled={isCreating || fields.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCreating
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl active:scale-95'
                } text-white`}
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Oluşturuluyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    <span>FORMU OLUŞTUR VE KAYDET</span>
                  </span>
                )}
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Formunuz otomatik olarak kayıtlı formlar listesine eklenecek
                </p>
                <button
                  onClick={() => console.log('Debug:', { title, fields, formData: { title, fields, rules: {} } })}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  🔍 Debug Bilgisi Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-pulse">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Oluşturuluyor</h3>
              <p className="text-gray-600">Lütfen bekleyin...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}