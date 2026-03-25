import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { Order, Reservation } from '../types';

interface ClientHistoryProps {
  onNavigate: (page: string) => void;
}

export default function ClientHistory({ onNavigate }: ClientHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, resData] = await Promise.all([
        api.orders.getMyOrders(),
        api.reservations.getMyReservations()
      ]);
      setOrders(ordersData);
      setReservations(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'en préparation': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'en route': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'livré': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'confirmé': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'annulé': return 'bg-primary-red/10 text-primary-red border-primary-red/20';
      case 'rejeté': return 'bg-primary-red/10 text-primary-red border-primary-red/20';
      default: return 'bg-white/5 text-secondary-text/50 border-border-color';
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary-red animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-16">
      <div className="flex items-center gap-6">
        <button onClick={() => onNavigate('home')} className="p-3 hover:bg-bg-off-white border border-border-color transition-colors">
          <ArrowLeft className="w-5 h-5 text-main-text" />
        </button>
        <div className="space-y-1">
          <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Espace Client</span>
          <h1 className="text-4xl md:text-5xl font-display italic text-main-text">Mon Historique</h1>
        </div>
      </div>

      <div className="flex p-2 bg-bg-off-white border border-border-color w-full max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all ${
            activeTab === 'orders' ? 'bg-white text-accent-red shadow-sm border border-border-color' : 'text-secondary-text hover:text-main-text'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Commandes
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all ${
            activeTab === 'reservations' ? 'bg-white text-accent-red shadow-sm border border-border-color' : 'text-secondary-text hover:text-main-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Réservations
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'orders' ? (
          Array.isArray(orders) && orders.length > 0 ? (
            orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-border-color p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-[0_15px_30px_rgba(232,224,216,0.1)] hover:shadow-[0_20px_40px_rgba(232,224,216,0.15)] transition-all"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 border border-border-color flex items-center justify-center text-accent-red bg-bg-off-white">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-main-text font-display italic text-xl">Commande #{order.id.toString().slice(-4)}</h3>
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-secondary-text font-serif italic text-xs">
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 opacity-50" />
                        {new Date(order.created_at).toLocaleString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-sans font-bold">
                        <Truck className="w-3.5 h-3.5 opacity-50" />
                        {order.order_type}
                      </span>
                      {order.payment_method && (
                        <span className="text-[10px] uppercase tracking-widest font-bold text-secondary-text/40 font-sans">
                          {order.payment_method === 'carte' ? 'CARTE' : 'CASH'}
                        </span>
                      )}
                      {order.payment_status && (
                        <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 border ${
                          order.payment_status === 'payé' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 
                          order.payment_status === 'échoué' ? 'bg-accent-red/5 text-accent-red border-accent-red/20' : 
                          'bg-amber-500/5 text-amber-600 border-amber-500/20'
                        }`}>
                          {order.payment_status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-3xl font-display italic text-main-text">{Number(order.total_amount).toFixed(0)} MAD</p>
                  <p className="text-secondary-text font-sans font-bold uppercase tracking-[0.2em] text-[10px]">Total TTC</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-32 bg-white border border-border-color border-dashed">
              <ShoppingBag className="w-12 h-12 text-border-color mx-auto mb-6" />
              <p className="text-secondary-text font-serif italic text-lg">Vous n'avez pas encore passé de commande.</p>
            </div>
          )
        ) : (
          Array.isArray(reservations) && reservations.length > 0 ? (
            reservations.map((res) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-border-color p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-[0_15px_30px_rgba(232,224,216,0.1)] hover:shadow-[0_20px_40px_rgba(232,224,216,0.15)] transition-all"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 border border-border-color flex items-center justify-center text-amber-600 bg-bg-off-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-main-text font-display italic text-xl">{res.number_of_guests} Personnes</h3>
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 border ${getStatusColor(res.status)}`}>
                        {res.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-secondary-text font-serif italic text-xs">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {new Date(res.reservation_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 opacity-50" />
                        {res.reservation_time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xl font-display italic text-main-text">L'Érable Rouge</p>
                  <p className="text-secondary-text font-sans font-bold uppercase tracking-[0.2em] text-[10px]">Agadir</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-32 bg-white border border-border-color border-dashed">
              <Calendar className="w-12 h-12 text-border-color mx-auto mb-6" />
              <p className="text-secondary-text font-serif italic text-lg">Vous n'avez pas encore effectué de réservation.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
