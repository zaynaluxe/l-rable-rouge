import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UtensilsCrossed, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ChevronRight,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';
import { Slide } from '../types';
import Carousel from './Carousel';

interface ClientHomeProps {
  onNavigate: (page: string) => void;
}

export default function ClientHome({ onNavigate }: ClientHomeProps) {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await api.slides.getAll();
        setSlides(data);
      } catch (error) {
        console.error('Error fetching slides:', error);
      }
    };
    fetchSlides();
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000" 
            alt="Restaurant interior" 
            className="w-full h-full object-cover opacity-100"
            referrerPolicy="no-referrer"
          />
          {/* Professional Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.7) 100%)'
            }}
          ></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <span className="inline-block text-white font-sans font-medium uppercase tracking-[0.4em] text-[10px] mb-8">
              Gastronomie Marocaine Contemporaine
            </span>
            <h1 
              className="text-7xl md:text-9xl font-display italic text-white mb-10 tracking-tight leading-[0.9]"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              L'Érable Rouge
            </h1>
            <div className="h-[1px] w-24 bg-white/60 mx-auto mb-12"></div>
            <p 
              className="text-white/90 text-xl md:text-3xl font-serif italic leading-relaxed max-w-3xl mx-auto"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              "Une escale de raffinement au cœur d'Agadir, où l'art de vivre rencontre l'excellence culinaire."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Carousel Section */}
      {slides.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-6">
          <Carousel slides={slides} />
        </section>
      )}

      {/* Quick Info & Actions Section */}
      <section className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="bg-white border border-border-color p-10 md:p-20 shadow-[0_30px_60px_rgba(232,224,216,0.2)]">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16 mb-20">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-main-text mb-2">Horaires</h4>
                <p className="text-secondary-text font-serif italic text-sm">Ouvert 7j/7 • 12:00 - 00:00</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-main-text mb-2">Localisation</h4>
                <p className="text-secondary-text font-serif italic text-sm">Hay Mohammadi, Agadir</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6 col-span-2 md:col-span-1">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-main-text mb-2">Livraison</h4>
                <p className="text-secondary-text font-serif italic text-sm">Service premium à domicile</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center">
            <button 
              onClick={() => onNavigate('menu')}
              className="elegant-button w-full sm:w-auto min-w-[280px]"
            >
              Découvrir la carte
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/5] overflow-hidden border border-border-color p-4 bg-white">
              <img 
                src="https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=1000" 
                alt="Signature dish" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 bg-bg-off-white border border-border-color p-12 hidden md:block max-w-xs">
              <Star className="w-8 h-8 text-accent-red mb-6" />
              <p className="text-main-text font-serif italic text-xl leading-relaxed">
                "L'excellence culinaire au service de vos sens les plus raffinés."
              </p>
            </div>
          </div>
          <div className="space-y-10 order-1 lg:order-2">
            <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Notre Philosophie</span>
            <h2 className="text-5xl md:text-6xl font-display italic text-main-text leading-tight">
              Une passion pour le <br/> goût authentique
            </h2>
            <p className="text-secondary-text leading-relaxed text-lg font-serif italic">
              Situé à Hay Mohammadi, L'Érable Rouge est né d'une volonté de sublimer les produits du terroir marocain. Notre chef sélectionne chaque matin les meilleurs ingrédients pour vous offrir une expérience inoubliable, empreinte de tradition et de modernité.
            </p>
            <div className="grid grid-cols-2 gap-12 pt-8">
              <div>
                <p className="text-5xl font-display italic text-accent-red mb-3">15+</p>
                <p className="text-secondary-text text-[10px] uppercase tracking-[0.2em] font-sans font-bold">Années d'excellence</p>
              </div>
              <div>
                <p className="text-5xl font-display italic text-accent-red mb-3">100%</p>
                <p className="text-secondary-text text-[10px] uppercase tracking-[0.2em] font-sans font-bold">Produits Frais</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('menu')}
              className="inline-flex items-center gap-4 text-accent-red font-sans font-bold uppercase tracking-[0.3em] text-[10px] hover:gap-6 transition-all duration-500"
            >
              Explorer l'univers <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="bg-bg-off-white py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px] mb-6 block">La Carte</span>
          <h2 className="text-5xl font-display italic text-main-text mb-6">Nos Spécialités</h2>
          <p className="text-secondary-text max-w-2xl mx-auto font-serif italic text-lg">Parcourez nos différentes catégories et laissez-vous tenter par nos créations culinaires exclusives.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {[
            { name: 'Plats Signature', img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=500' },
            { name: 'Entrées Fraîches', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500' },
            { name: 'Desserts Gourmands', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=500' },
            { name: 'Jus & Cocktails', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500' },
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -15 }}
              className="group cursor-pointer"
              onClick={() => onNavigate('menu')}
            >
              <div className="relative aspect-[3/4] md:aspect-[3/4] h-[180px] md:h-auto overflow-hidden mb-6 md:mb-8 border border-border-color p-1 md:p-2 bg-white">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-main-text/0 group-hover:bg-main-text/10 transition-colors duration-700"></div>
              </div>
              <h3 className="text-main-text font-display italic text-lg md:text-2xl mb-2 text-center">{cat.name}</h3>
              <div className="flex items-center justify-center gap-3 text-accent-red text-[9px] font-sans font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                Découvrir <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
