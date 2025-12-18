import axios from 'axios';
import { FormSchema } from '../types/form-types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Form API'leri
export const formApi = {
  // Form oluştur
  createForm: (data: { title: string; description?: string; fields: any[]; rules?: any }) => {
    return api.post('/forms', data);
  },

  // Kullanıcının formlarını getir
  getMyForms: () => {
    return api.get('/forms');
  },

  // Form detayını getir
  getFormById: (id: number) => {
    return api.get(`/forms/${id}`);
  },

  // Form güncelle
  updateForm: (id: number, data: any) => {
    return api.put(`/forms/${id}`, data);
  },

  // Form sil
  deleteForm: (id: number) => {
    return api.delete(`/forms/${id}`);
  },

  // Form gönder
  submitForm: (formId: number, data: any) => {
    return api.post(`/forms/${formId}/submit`, data);
  },

  // Form doğrula
  validateForm: (data: any, fields: any[]) => {
    return api.post('/forms/validate', { data, fields });
  },
};

// User API'leri
export const userApi = {
  // Kayıt ol
  register: (data: { email: string; password: string; name?: string }) => {
    return api.post('/users/register', data);
  },

  // Giriş yap
  login: (data: { email: string; password: string }) => {
    return api.post('/users/login', data);
  },

  // Profil getir
  getProfile: (userId: number) => {
    return api.get(`/users/profile/${userId}`);
  },
};

// Health check
export const healthApi = {
  checkBackend: () => {
    return api.get('/health');
  },

  checkForms: () => {
    return api.get('/forms/health');
  },

  checkUsers: () => {
    return api.get('/users/health');
  },
};

// Sistem durumu
export const systemApi = {
  getStatus: async () => {
    try {
      const [backend, forms, users] = await Promise.allSettled([
        healthApi.checkBackend(),
        healthApi.checkForms(),
        healthApi.checkUsers(),
      ]);

      return {
        backend: backend.status === 'fulfilled',
        forms: forms.status === 'fulfilled',
        users: users.status === 'fulfilled',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        backend: false,
        forms: false,
        users: false,
        timestamp: new Date().toISOString(),
        error: 'Status check failed',
      };
    }
  },
};

export default api;