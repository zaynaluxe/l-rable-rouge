import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ShoppingBag, 
  Search, 
  Filter, 
  Check,
  Loader2,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { api } from '../services/api';
import { MenuItem, Category } from '../types';
import { useCart } from '../context/CartContext';

export default function ClientMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching menu from:', api.menu.getAll);
      const [itemsData, catsData] = await Promise.all([
        api.menu.getAll(),
        api.menu.getCategories()
      ]);
      console.log('Items received:', itemsData);
      setItems(Array.isArray(itemsData) ? itemsData.filter(i => i.is_available) : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary-red animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-24">
      <div className="text-center space-y-6">
        <span className="text-accent-red font-sans font-medium uppercase tracking-[0.4em] text-[10px]">La Carte</span>
        <h1 className="text-5xl md:text-7xl font-display italic text-main-text tracking-tight">Saveurs & Traditions</h1>
        <div className="h-[1px] w-20 bg-accent-red mx-auto"></div>
        <p className="text-secondary-text max-w-2xl mx-auto font-serif italic text-lg">
          Découvrez notre sélection de mets d'exception, préparés avec passion et servis dans un écrin de raffinement.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-white p-6 border border-border-color shadow-[0_20px_40px_rgba(232,224,216,0.15)]">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 no-scrollbar w-full lg:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-8 py-3 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap border ${
              selectedCategory === 'all' 
                ? 'bg-accent-red text-white border-accent-red shadow-lg shadow-accent-red/20' 
                : 'text-secondary-text border-transparent hover:border-border-color hover:bg-bg-off-white'
            }`}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-8 py-3 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap border ${
                selectedCategory === cat.id 
                  ? 'bg-accent-red text-white border-accent-red shadow-lg shadow-accent-red/20' 
                  : 'text-secondary-text border-transparent hover:border-border-color hover:bg-bg-off-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
          <input
            type="text"
            placeholder="Rechercher un mets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="elegant-input w-full pl-14 pr-6 py-4 text-xs"
          />
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-12">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="group flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-[#f5f5f5] border border-border-color p-1 md:p-2 mb-4 md:mb-8">
                {item.photo_url ? (
                  <img 
                    src={item.photo_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary-text/10">
                    <Utensils className="w-8 md:w-12 h-8 md:h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-main-text/0 group-hover:bg-main-text/5 transition-colors duration-700"></div>
              </div>
              
              <div className="flex flex-col flex-grow space-y-2 md:space-y-4 text-center">
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-sm md:text-xl font-display italic text-main-text leading-tight group-hover:text-accent-red transition-colors duration-500 line-clamp-1 md:line-clamp-none">{item.name}</h3>
                  <p className="text-[10px] md:text-xs font-serif italic line-clamp-2 h-6 md:h-8">
                    {item.description}
                  </p>
                </div>
                
                <div className="pt-1 md:pt-2">
                  <span className="text-accent-red font-sans font-bold text-xs md:text-sm tracking-widest">
                    {Number(item.price).toFixed(0)} MAD
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className={`w-full py-2.5 md:py-4 text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-[0.1em] md:tracking-[0.3em] transition-all duration-500 border ${
                    addedId === item.id 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-main-text border-main-text hover:bg-main-text hover:text-white'
                  }`}
                >
                  {addedId === item.id ? (
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <Check className="w-2.5 md:w-3 h-2.5 md:h-3" /> Ajouté
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <Plus className="w-2.5 md:w-3 h-2.5 md:h-3" /> Ajouter
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-card-bg rounded-full flex items-center justify-center mx-auto text-secondary-text/20 border border-border-color">
            <Search className="w-10 h-10" />
          </div>
          <p className="text-secondary-text">Aucun plat ne correspond à votre recherche.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="text-primary-red font-bold text-sm underline underline-offset-4"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
