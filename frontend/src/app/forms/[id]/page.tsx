'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Form {
  id: string;
  title: string;
  fields: any[];
  createdAt: string;
  updatedAt: string;
}

export default function SavedFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const res = await fetch('http://localhost:3001/forms');
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Formlar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📁 Kayıtlı Formlar</h1>
              <p className="text-gray-600">Toplam {forms.length} form</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/form/builder')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Yeni Form
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                ← Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Henüz form oluşturmamışsınız
            </h3>
            <p className="text-gray-600 mb-6">
              İlk formunuzu oluşturmak için butona tıklayın
            </p>
            <button
              onClick={() => router.push('/form/builder')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + İlk Formumu Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {form.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {form.fields?.length || 0} soru • {new Date(form.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/form/fill/${form.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📝 Doldur
                    </button>
                    <button
                      onClick={() => router.push(`/form/builder?edit=${form.id}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}