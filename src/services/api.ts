import { Category, MenuItem, Order, Reservation, Delivery, Slide } from '../types';

const getBaseApiUrl = () => {
  // Support both Vite and Next.js naming conventions for environment variables
  let url = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.NEXT_PUBLIC_API_URL || '/api';
  
  // Handle the case where the environment variable might be the string "undefined"
  if (url === 'undefined') {
    url = '/api';
  }
  
  // If it's a full URL and doesn't end with /api, append it
  if (url.startsWith('http') && !url.endsWith('/api')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  
  console.log('[API] Using base URL:', url);
  return url;
};

const API_URL = getBaseApiUrl();

const handleResponse = async (res: Response, url: string) => {
  const contentType = res.headers.get('content-type');
  const text = await res.text();
  
  if (!res.ok) {
    let errorData: any = {};
    if (contentType && contentType.includes('application/json')) {
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        // Not JSON
      }
    }
    const errorMessage = errorData.details || errorData.error || `Erreur ${res.status}: ${text || 'Une erreur est survenue'}`;
    console.error(`[API Error] ${res.status} ${url}:`, errorMessage);
    throw new Error(errorMessage);
  }

  if (!text || text === 'undefined' || text.trim() === 'undefined') {
    console.warn(`[API Warning] Empty or undefined response from ${url}`);
    return null;
  }

  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(`[API] Failed to parse JSON response from ${url}:`, text);
      throw new Error('La réponse du serveur n\'est pas au format JSON valide');
    }
  }

  // If we expected JSON but got something else
  console.warn(`[API Warning] Expected JSON but got ${contentType || 'no content-type'} from ${url}`);
  if (text && text !== 'undefined' && text.trim() !== 'undefined') {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
  return null;
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const api = {
  auth: {
    login: async (credentials: any) => {
      const url = `${API_URL}/auth/login`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse(res, url);
    },
    register: async (userData: any) => {
      const url = `${API_URL}/auth/register`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(res, url);
    },
  },
  menu: {
    getAll: async (): Promise<MenuItem[]> => {
      const url = `${API_URL}/menu`;
      const res = await fetch(url);
      return handleResponse(res, url);
    },
    getCategories: async (): Promise<Category[]> => {
      const url = `${API_URL}/menu/categories`;
      const res = await fetch(url);
      return handleResponse(res, url);
    },
    create: async (formData: FormData) => {
      const url = `${API_URL}/menu`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return handleResponse(res, url);
    },
    update: async (id: string, formData: FormData) => {
      const url = `${API_URL}/menu/${id}`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return handleResponse(res, url);
    },
    delete: async (id: string) => {
      const url = `${API_URL}/menu/${id}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res, url);
    },
  },
  orders: {
    getAll: async (): Promise<Order[]> => {
      const url = `${API_URL}/orders`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res, url);
    },
    getMyOrders: async (): Promise<Order[]> => {
      const url = `${API_URL}/orders/my-orders`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res, url);
    },
    create: async (orderData: any) => {
      const url = `${API_URL}/orders`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      return handleResponse(res, url);
    },
    updateStatus: async (id: string, status: string) => {
      const url = `${API_URL}/orders/${id}/status`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res, url);
    },
  },
  reservations: {
    getAll: async (): Promise<Reservation[]> => {
      const url = `${API_URL}/reservations`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res, url);
    },
    getMyReservations: async (): Promise<Reservation[]> => {
      const url = `${API_URL}/reservations/my-reservations`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res, url);
    },
    create: async (resData: any) => {
      const url = `${API_URL}/reservations`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resData),
      });
      return handleResponse(res, url);
    },
    updateStatus: async (id: string, status: string) => {
      const url = `${API_URL}/reservations/${id}/status`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res, url);
    },
  },
  deliveries: {
    getAll: async (): Promise<Delivery[]> => {
      const url = `${API_URL}/deliveries`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res, url);
    },
    updateStatus: async (id: string, data: any) => {
      const url = `${API_URL}/deliveries/${id}/status`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res, url);
    },
  },
  payments: {
    initiateCmi: async (data: { amount: number, order_id: string }) => {
      const url = `${API_URL}/payments/cmi/initiate`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res, url);
    },
    record: async (data: any) => {
      const url = `${API_URL}/payments/record`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res, url);
    },
  },
  slides: {
    getAll: async (): Promise<Slide[]> => {
      const url = `${API_URL}/slides`;
      const res = await fetch(url);
      return handleResponse(res, url);
    },
    create: async (formData: FormData) => {
      const url = `${API_URL}/slides`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return handleResponse(res, url);
    },
    update: async (id: number, formData: FormData) => {
      const url = `${API_URL}/slides/${id}`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return handleResponse(res, url);
    },
    delete: async (id: number) => {
      const url = `${API_URL}/slides/${id}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res, url);
    },
    reorder: async (slides: { id: number, ordre: number }[]) => {
      const url = `${API_URL}/slides/reorder`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ slides }),
      });
      return handleResponse(res, url);
    },
  },
};
