'use client';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface Rule {
  id: string;
  ifField: string;
  ifCondition: 'equals' | 'contains' | 'empty' | 'checked';
  ifValue: string;
  thenAction: 'show' | 'hide' | 'require' | 'disable';
  thenField: string;
}

interface SavedForm {
  id: string;
  title: string;
  fields: FormField[];
  rules: Rule[];
  createdAt: string;
}

interface SavedFormsProps {
  forms: SavedForm[];
  onLoadForm: (form: SavedForm) => void;
  onDeleteForm: (formId: string) => void;
  onRefresh: () => void;
}

export default function SavedForms({ forms, onLoadForm, onDeleteForm, onRefresh }: SavedFormsProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // rules object'ini array'e çevir
  const getRulesCount = (rules: any) => {
    if (!rules) return 0;
    if (Array.isArray(rules)) return rules.length;
    if (typeof rules === 'object') return Object.keys(rules).length;
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kayıtlı Formlar</h2>
          <p className="text-gray-600">Daha önce kaydettiğiniz formlar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
          >
            ↻ Yenile
          </button>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Henüz form kaydedilmemiş</h3>
          <p className="text-gray-500">
            "Form Tasarımı" sekmesine geçip yeni bir form oluşturabilirsiniz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => {
            const rulesCount = getRulesCount(form.rules);
            
            return (
              <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{form.title}</h3>
                    <p className="text-sm text-gray-500">{formatDate(form.createdAt)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onLoadForm(form)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => onDeleteForm(form.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {form.fields?.length || 0} alan
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {rulesCount} kural
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Form Alanları:</p>
                    <div className="flex flex-wrap gap-1">
                      {form.fields?.slice(0, 3).map((field, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {field.label}
                        </span>
                      ))}
                      {form.fields && form.fields.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          +{form.fields.length - 3} daha
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Form Yönetimi</h4>
        <p className="text-sm text-blue-700">
          • <strong>Düzenle</strong> butonuna tıklayarak formu tasarım modunda açıp değişiklik yapabilirsiniz.<br/>
          • Form doldurma için "Formu Doldur" sekmesine geçebilirsiniz.<br/>
          • Kurallar artık formla birlikte kaydediliyor ve düzenleniyor.
        </p>
      </div>
    </div>
  );
}