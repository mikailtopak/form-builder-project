'use client';

import { useState, useMemo } from 'react';

interface Field {
  id: string;
  label: string;
  type: string;
}

interface Rule {
  id: string;
  ifField: string;
  ifCondition: 'equals' | 'contains' | 'empty' | 'checked';
  ifValue: string;
  thenAction: 'show' | 'hide' | 'require' | 'disable';
  thenField: string;
}

interface RuleBuilderProps {
  fields: Field[];
  onRulesChange: (rules: Rule[]) => void;
  initialRules?: Rule[];
}

const CONDITION_CONFIG = {
  equals: { label: 'Eşitse', description: 'Tam eşleşme' },
  contains: { label: 'İçeriyorsa', description: 'İçinde geçiyorsa' },
  empty: { label: 'Boşsa', description: 'Alan boşsa' },
  checked: { label: 'İşaretliyse', description: 'Checkbox işaretliyse' }
} as const;

const ACTION_CONFIG = {
  show: { label: 'Göster', description: 'Alan görünür olur', color: 'green' },
  hide: { label: 'Gizle', description: 'Alan gizlenir', color: 'red' },
  require: { label: 'Zorunlu Yap', description: 'Alan zorunlu olur', color: 'orange' },
  disable: { label: 'Devre Dışı Bırak', description: 'Alan devre dışı kalır', color: 'gray' }
} as const;

const COLOR_CLASSES = {
  green: 'bg-green-50 text-green-700 border-green-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  gray: 'bg-gray-50 text-gray-700 border-gray-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100'
} as const;

export default function RuleBuilder({ fields, onRulesChange, initialRules = [] }: RuleBuilderProps) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [isAddingRule, setIsAddingRule] = useState(false);
  
  const [newRule, setNewRule] = useState({
    ifField: fields[0]?.id || '',
    ifCondition: 'equals' as const,
    ifValue: '',
    thenAction: 'show' as const,
    thenField: fields[1]?.id || ''
  });

  // initialRules değiştiğinde rules'u güncelle
  useState(() => {
    if (initialRules.length > 0) {
      setRules(initialRules);
    }
  });

  const availableConditions = useMemo(() => {
    const field = fields.find(f => f.id === newRule.ifField);
    if (!field) return ['equals', 'contains', 'empty'];
    
    switch (field.type) {
      case 'checkbox': return ['checked', 'empty'];
      case 'select': return ['equals', 'empty'];
      default: return ['equals', 'contains', 'empty'];
    }
  }, [newRule.ifField, fields]);

  const targetFields = useMemo(() => 
    fields.filter(f => f.id !== newRule.ifField),
    [fields, newRule.ifField]
  );

  const isValidRule = useMemo(() => {
    if (!newRule.ifField || !newRule.thenField || newRule.ifField === newRule.thenField) {
      return false;
    }
    
    if (!['empty', 'checked'].includes(newRule.ifCondition) && !newRule.ifValue.trim()) {
      return false;
    }
    
    return true;
  }, [newRule]);

  const getAvailableActions = () => {
    return ['show', 'hide', 'require', 'disable'];
  };

  const addRule = () => {
    if (!isValidRule) return;

    const rule: Rule = {
      id: Date.now().toString(),
      ...newRule
    };

    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    onRulesChange(updatedRules);
    
    setNewRule({
      ifField: fields[0]?.id || '',
      ifCondition: 'equals',
      ifValue: '',
      thenAction: 'show',
      thenField: fields[1]?.id || ''
    });
    
    setIsAddingRule(false);
  };

  const removeRule = (id: string) => {
    const updatedRules = rules.filter(rule => rule.id !== id);
    setRules(updatedRules);
    onRulesChange(updatedRules);
  };

  const getConditionDisplay = (condition: string, value: string, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    const fieldLabel = field?.label || fieldId;
    const config = CONDITION_CONFIG[condition as keyof typeof CONDITION_CONFIG];
    
    if (condition === 'empty' || condition === 'checked') {
      return `${fieldLabel} ${config?.label || condition}`;
    }
    
    return `${fieldLabel} ${config?.label || condition} "${value}"`;
  };

  const getActionDisplay = (action: string, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    const fieldLabel = field?.label || fieldId;
    const config = ACTION_CONFIG[action as keyof typeof ACTION_CONFIG];
    
    return `${config?.label || action} ${fieldLabel}`;
  };

  if (fields.length < 2) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
        <div className="w-14 h-14 mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h4 className="font-semibold text-gray-800 mb-2">Koşullu Kurallar</h4>
        <p className="text-gray-600 text-sm max-w-xs">
          Koşullu kural eklemek için en az 2 form alanı gereklidir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900">Koşullu Kurallar</h3>
          <p className="text-sm text-gray-600">Form alanları arasında dinamik ilişkiler kurun</p>
        </div>
        
        <button
          onClick={() => setIsAddingRule(!isAddingRule)}
          className={`px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
            isAddingRule 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow'
          }`}
        >
          {isAddingRule ? (
            <>
              <span className="text-lg">✕</span>
              <span>Vazgeç</span>
            </>
          ) : (
            <>
              <span className="text-lg">+</span>
              <span>Yeni Kural Ekle</span>
            </>
          )}
        </button>
      </div>

      {isAddingRule && (
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/60 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Yeni Kural Oluştur</h4>
              <p className="text-sm text-gray-600">Eğer [koşul] ise [aksiyon]</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Koşul Bölümü */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center text-sm font-bold">
                  EĞER
                </div>
                <span className="font-medium text-gray-700">Koşul Belirleyin</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hangi alan?</label>
                  <select
                    value={newRule.ifField}
                    onChange={(e) => {
                      const newFieldId = e.target.value;
                      setNewRule(prev => ({
                        ...prev,
                        ifField: newFieldId,
                        ifCondition: (newFieldId ? availableConditions[0] : 'equals') as any
                      }));
                    }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-sm"
                  >
                    <option value="">Alan seçin</option>
                    {fields.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Koşul tipi</label>
                  <select
                    value={newRule.ifCondition}
                    onChange={(e) => setNewRule(prev => ({...prev, ifCondition: e.target.value as any}))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-sm"
                  >
                    {availableConditions.map(condition => (
                      <option key={condition} value={condition}>
                        {CONDITION_CONFIG[condition as keyof typeof CONDITION_CONFIG]?.label || condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!['empty', 'checked'].includes(newRule.ifCondition) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Değer</label>
                  <input
                    type="text"
                    value={newRule.ifValue}
                    onChange={(e) => setNewRule(prev => ({...prev, ifValue: e.target.value}))}
                    placeholder="Koşul değerini girin..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm"
                  />
                </div>
              )}
            </div>

            {/* Aksiyon Bölümü - SIRAYI DEĞİŞTİRDİM: ÖNCE HEDEF ALAN, SONRA AKSİYON */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-md flex items-center justify-center text-sm font-bold">
                  İSE
                </div>
                <span className="font-medium text-gray-700">Aksiyon Belirleyin</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ÖNCE HEDEF ALAN */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hangi alana uygulansın?</label>
                  <select
                    value={newRule.thenField}
                    onChange={(e) => setNewRule(prev => ({...prev, thenField: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-sm"
                  >
                    <option value="">Hedef alan seçin</option>
                    {targetFields.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SONRA AKSİYON */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ne yapılsın?</label>
                  <select
                    value={newRule.thenAction}
                    onChange={(e) => setNewRule(prev => ({...prev, thenAction: e.target.value as any}))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-sm"
                  >
                    {getAvailableActions().map(action => (
                      <option key={action} value={action}>
                        {ACTION_CONFIG[action as keyof typeof ACTION_CONFIG]?.label || action}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200 p-4">
              <div className="text-xs font-medium text-gray-600 mb-2">KURAL ÖNİZLEMESİ</div>
              <div className="flex flex-col sm:flex-row items-center gap-3 text-sm">
                <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="font-medium text-gray-900">
                    {getConditionDisplay(newRule.ifCondition, newRule.ifValue, newRule.ifField)}
                  </div>
                </div>
                <div className="text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="font-medium text-gray-900">
                    {getActionDisplay(newRule.thenAction, newRule.thenField)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsAddingRule(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex-1 text-sm font-medium"
              >
                İptal
              </button>
              <button
                onClick={addRule}
                disabled={!isValidRule}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex-1 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                ✅ Kuralı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {rules.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {rules.length}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Aktif Kurallar</h4>
                  <p className="text-sm text-gray-600">Toplam {rules.length} kural</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {rules.map((rule) => {
                const actionConfig = ACTION_CONFIG[rule.thenAction as keyof typeof ACTION_CONFIG];
                const actionColor = actionConfig?.color || 'gray';
                const colorClass = COLOR_CLASSES[actionColor as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.gray;
                
                return (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md border border-blue-100">
                            <span className="font-medium">EĞER</span>{' '}
                            {getConditionDisplay(rule.ifCondition, rule.ifValue, rule.ifField)}
                          </div>
                          
                          <div className="text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          
                          <div className={`${colorClass} px-3 py-1.5 rounded-md border`}>
                            <span className="font-medium">İSE</span>{' '}
                            {getActionDisplay(rule.thenAction, rule.thenField)}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition self-end sm:self-auto"
                        title="Kuralı sil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : !isAddingRule && (
        <div className="min-h-[200px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <div className="w-16 h-16 mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Henüz kural eklemediniz</h4>
          <p className="text-gray-600 text-sm mb-6 max-w-xs">
            Form alanları arasında dinamik ilişkiler kurmak için ilk kuralınızı ekleyin.
          </p>
          <button
            onClick={() => setIsAddingRule(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium text-sm shadow-sm hover:shadow"
          >
            + İlk Kuralınızı Ekleyin
          </button>
        </div>
      )}
    </div>
  );
}