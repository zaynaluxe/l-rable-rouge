import { Category, MenuItem, Order, Reservation, Delivery, Slide } from '../types';

const API_URL = '/api';

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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error('Identifiants invalides');
      return res.json();
    },
    register: async (userData: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'inscription');
      return res.json();
    },
  },
  menu: {
    getAll: async (): Promise<MenuItem[]> => {
      const res = await fetch(`${API_URL}/menu`);
      if (!res.ok) throw new Error('Erreur lors de la récupération du menu');
      return res.json();
    },
    getCategories: async (): Promise<Category[]> => {
      const res = await fetch(`${API_URL}/menu/categories`);
      if (!res.ok) throw new Error('Erreur lors de la récupération des catégories');
      return res.json();
    },
    create: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return res.json();
    },
    update: async (id: string, formData: FormData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/menu/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.json();
    },
  },
  orders: {
    getAll: async (): Promise<Order[]> => {
      const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Erreur lors de la récupération des commandes');
      return res.json();
    },
    getMyOrders: async (): Promise<Order[]> => {
      const res = await fetch(`${API_URL}/orders/my-orders`, { headers: getHeaders() });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Veuillez vous connecter pour voir vos commandes');
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la récupération de vos commandes');
      }
      return res.json();
    },
    create: async (orderData: any) => {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      return res.json();
    },
    updateStatus: async (id: string, status: string) => {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
  },
  reservations: {
    getAll: async (): Promise<Reservation[]> => {
      const res = await fetch(`${API_URL}/reservations`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Erreur lors de la récupération des réservations');
      return res.json();
    },
    getMyReservations: async (): Promise<Reservation[]> => {
      const res = await fetch(`${API_URL}/reservations/my-reservations`, { headers: getHeaders() });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Veuillez vous connecter pour voir vos réservations');
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la récupération de vos réservations');
      }
      return res.json();
    },
    create: async (resData: any) => {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resData),
      });
      return res.json();
    },
    updateStatus: async (id: string, status: string) => {
      const res = await fetch(`${API_URL}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
  },
  deliveries: {
    getAll: async (): Promise<Delivery[]> => {
      const res = await fetch(`${API_URL}/deliveries`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Erreur lors de la récupération des livraisons');
      return res.json();
    },
    updateStatus: async (id: string, data: any) => {
      const res = await fetch(`${API_URL}/deliveries/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  payments: {
    initiateCmi: async (data: { amount: number, order_id: string }) => {
      const res = await fetch(`${API_URL}/payments/cmi/initiate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'initialisation du paiement CMI');
      return res.json();
    },
    record: async (data: any) => {
      const res = await fetch(`${API_URL}/payments/record`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  slides: {
    getAll: async (): Promise<Slide[]> => {
      const res = await fetch(`${API_URL}/slides`);
      if (!res.ok) throw new Error('Erreur lors de la récupération des slides');
      return res.json();
    },
    create: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/slides`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return res.json();
    },
    update: async (id: number, formData: FormData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/slides/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      return res.json();
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_URL}/slides/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.json();
    },
    reorder: async (slides: { id: number, ordre: number }[]) => {
      const res = await fetch(`${API_URL}/slides/reorder`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ slides }),
      });
      return res.json();
    },
  },
};
