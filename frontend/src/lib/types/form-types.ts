// Form bileşen tipleri
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'textarea';

// Doğrulama kuralı tipleri
export type ValidationRuleType = 
  | 'required' 
  | 'minLength' 
  | 'maxLength' 
  | 'pattern' 
  | 'min' 
  | 'max' 
  | 'email';

// Doğrulama kuralı interface'i
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
}

// Form alanı interface'i
export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validationRules?: ValidationRule[];
  options?: string[]; // select için
  defaultValue?: any;
}

// Form yapısı interface'i
export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Bileşen kütüphanesi
export const COMPONENT_TYPES = {
  TEXT: {
    type: 'text' as FormFieldType,
    label: 'Metin Alanı',
    icon: '📝',
    defaultProps: {
      label: 'Metin Alanı',
      placeholder: 'Metin giriniz...',
      required: false
    }
  },
  EMAIL: {
    type: 'email' as FormFieldType,
    label: 'E-posta',
    icon: '📧',
    defaultProps: {
      label: 'E-posta Adresi',
      placeholder: 'ornek@email.com',
      required: true,
      validationRules: [
        { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
      ]
    }
  },
  NUMBER: {
    type: 'number' as FormFieldType,
    label: 'Sayı',
    icon: '🔢',
    defaultProps: {
      label: 'Sayı',
      placeholder: 'Sayı giriniz...',
      required: false
    }
  },
  DATE: {
    type: 'date' as FormFieldType,
    label: 'Tarih',
    icon: '📅',
    defaultProps: {
      label: 'Tarih',
      required: false
    }
  },
  SELECT: {
    type: 'select' as FormFieldType,
    label: 'Seçim Kutusu',
    icon: '📋',
    defaultProps: {
      label: 'Seçenekler',
      options: ['Seçenek 1', 'Seçenek 2', 'Seçenek 3'],
      required: false
    }
  },
  CHECKBOX: {
    type: 'checkbox' as FormFieldType,
    label: 'Onay Kutusu',
    icon: '☑️',
    defaultProps: {
      label: 'Onaylıyorum',
      required: false
    }
  },
  TEXTAREA: {
    type: 'textarea' as FormFieldType,
    label: 'Çok Satırlı Metin',
    icon: '📄',
    defaultProps: {
      label: 'Açıklama',
      placeholder: 'Metin giriniz...',
      required: false
    }
  }
} as const;