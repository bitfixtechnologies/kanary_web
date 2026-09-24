"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  const handleScrollTo = (id) => {
    if (id.startsWith('/')) {
      router.push(id);
    } else {
      const element = document.querySelector(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Video with Dark Premium Overlays */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        >
          <source src="/video/kanary_web_v1.mp4" type="video/mp4" />
          <source src="/video/kanary%20web%20v1.mp4" type="video/mp4" />
          <source src="/video/kanary web v1.mp4" type="video/mp4" />
          <source src="/video/hero_bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-bg/80 via-primary-bg/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-bg/70 via-transparent to-primary-bg/30 pointer-events-none" />
      </div>



      {/* Floating Sparkles/Particles (ambient luxury effect) */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-gold rounded-full animate-ping duration-1000" />
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-gold rounded-full animate-pulse duration-2000" />
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-gold/40 rounded-full animate-bounce duration-3000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="max-w-3xl text-left">
          {/* Welcome Badge */}
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            Seat in Serenity, Dine in Divinity
          </motion.div> */}

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
          >
            Taste the Authentic <span className="gold-gradient-text">Flavors of Kerala</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-2xl"
          >
            Experience delicious food prepared with fresh ingredients and traditional recipes.
          </motion.p>

          {/* Main Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
          >
            <button
              onClick={() => handleScrollTo('/menu')}
              className="group gold-gradient-bg hover:opacity-90 text-primary-dark font-sans font-bold px-8 py-4 rounded-full text-base tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              ORDER NOW / MENU
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => handleScrollTo('#reserve')}
              className="border-2 border-white/20 hover:border-gold hover:text-gold text-white bg-white/5 hover:bg-gold/5 font-sans font-bold px-8 py-4 rounded-full text-base tracking-wider transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              BOOK RESERVATION
              <CalendarDays className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Elegant scroll down prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
        onClick={() => handleScrollTo('#about')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-sans font-medium">Scroll Down</span>
        <div className="w-6 h-10 border border-gold/40 rounded-full flex items-start justify-center p-1">
          <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
