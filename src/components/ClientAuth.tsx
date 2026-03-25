import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';

interface ClientAuthProps {
  onLogin: (token: string, user: any) => void;
  onNavigate: (page: string) => void;
}

export default function ClientAuth({ onLogin, onNavigate }: ClientAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const data = await api.auth.login({ email: formData.email, password: formData.password });
        onLogin(data.token, data.user);
        onNavigate('home');
      } else {
        await api.auth.register(formData);
        const data = await api.auth.login({ email: formData.email, password: formData.password });
        onLogin(data.token, data.user);
        onNavigate('home');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 py-24">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-6">
          <button 
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-3 text-secondary-text hover:text-accent-red transition-colors text-[10px] font-sans font-bold uppercase tracking-[0.2em] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
          <div className="space-y-2">
            <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Authentification</span>
            <h1 className="text-4xl md:text-5xl font-display italic text-main-text">
              {isLogin ? 'Bon retour parmi nous' : 'Rejoignez-nous'}
            </h1>
          </div>
          <p className="text-secondary-text font-serif italic text-lg">
            {isLogin 
              ? 'Connectez-vous pour commander vos plats préférés.' 
              : 'Créez un compte pour profiter de tous nos services.'}
          </p>
        </div>

        <div className="bg-white border border-border-color p-12 shadow-[0_30px_60px_rgba(232,224,216,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-5 bg-accent-red/5 border border-accent-red/20 flex items-center gap-4 text-accent-red text-xs font-serif italic">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Nom</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="elegant-button w-full py-5"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-4">
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Se connecter' : 'Créer un compte'}
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-border-color text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-secondary-text text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:text-accent-red transition-colors"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
