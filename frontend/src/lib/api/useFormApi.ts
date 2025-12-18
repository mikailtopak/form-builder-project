import { useState, useCallback } from 'react';
import { formApi } from './api.service';
import { FormSchema, FormField } from '../types/form-types';

export const useFormApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveForm = useCallback(async (formData: {
    title: string;
    description?: string;
    fields: FormField[];
    rules?: any;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await formApi.createForm(formData);
      return {
        success: true,
        data: response.data,
        message: 'Form başarıyla kaydedildi',
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Form kaydedilirken bir hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await formApi.getMyForms();
      return {
        success: true,
        data: response.data,
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Formlar yüklenirken bir hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateForm = useCallback(async (data: any, fields: FormField[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await formApi.validateForm(data, fields);
      return {
        success: true,
        data: response.data,
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Doğrulama sırasında bir hata oluştu';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    saveForm,
    loadMyForms,
    validateForm,
    loading,
    error,
    clearError: () => setError(null),
  };
};