"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Flame, Leaf, BookOpen } from 'lucide-react';

import { useState, useEffect } from 'react';
import { menuData as initialMenuData } from '../data/menuData';

export default function Menu() {
  const [currentMenuData, setCurrentMenuData] = useState(initialMenuData);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kanary_menu_data');
    }
    fetch('/api/save-menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.menuData) {
          setCurrentMenuData(data.menuData);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const chefSpecials = currentMenuData?.chefSpecials || [];
  const specialties = chefSpecials.slice(0, 6).map((item, index) => ({
    id: index + 1,
    name: item.name,
    image: item.image,
    price: typeof item.price === 'number' ? `₹${item.price}` : item.price,
    description: item.description,
    popular: true,
    veg: item.veg,
    spicy: item.spicy,
    dairy: item.dairy,
  }));

  return (
    <section id="menu" className="py-24 bg-primary-dark/50 luxury-pattern-bg relative">
      {/* Background visual element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,45,32,0.3),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-gold font-sans font-semibold tracking-widest text-sm uppercase block">OUR SPECIALTIES</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Discover Our Menu
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto" />
          <p className="text-gray-300 font-sans text-sm sm:text-base">
            Savor our premier multi-cuisine offerings, crafted to perfection with traditional spices, pure A2 ghee, and fresh ingredients.
          </p>
        </div>

        {/* 6 Specialties Grid (3 on 1st Row, 3 on 2nd Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {specialties.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-primary-dark rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/30 shadow-2xl flex flex-col h-full transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={dish.image} 
                  alt={dish.name} 
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {dish.popular && (
                    <span className="bg-gold text-primary-dark text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-md">
                      <Award className="w-3 h-3" /> Chef's Special
                    </span>
                  )}
                  {dish.spicy && (
                    <span className="bg-red-600 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3" /> Spicy
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-white font-serif text-xl font-bold group-hover:text-gold transition-colors">
                      {dish.name}
                    </h4>
                    {dish.veg && <Leaf className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gold/10 flex justify-between items-center">
                  <span className="text-gold font-sans font-bold text-xl">
                    {dish.price}
                  </span>
                  <Link 
                    href="/menu" 
                    className="text-xs font-sans font-semibold text-gray-400 hover:text-gold transition-colors"
                  >
                    View in Menu →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Look Menu CTA Button */}
        <div className="text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-transparent hover:bg-gold border-2 border-gold text-gold hover:text-primary-dark font-sans font-bold py-4 px-10 rounded-full text-sm tracking-wider transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.1)] hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            LOOK MENU
          </Link>
        </div>

      </div>
    </section>
  );
}
