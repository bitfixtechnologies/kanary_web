"use client";
import { motion } from 'framer-motion';
import { Award, Heart, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-primary-bg relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-light/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gold/20">
              <img 
                src="/images/about_img.jpeg" 
                alt="About Kanary Restaurant" 
                className="w-full h-[32rem] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Decorative Gold Frame Background */}
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-gold/30 rounded-2xl z-0 pointer-events-none translate-x-1 translate-y-1 lg:translate-x-0 lg:translate-y-0" />
            
            {/* Overlay Info Card */}
            <div className="absolute bottom-6 right-6 z-20 glass-panel p-6 rounded-xl shadow-xl max-w-xs border border-gold/30">
              <div className="font-serif text-gold text-4xl font-bold mb-1">4+</div>
              <div className="text-white text-sm font-semibold tracking-wider uppercase mb-1">Years of Culinary Excellence</div>
              <div className="text-gray-300 text-xs leading-relaxed">Serving authentic Kerala, Indian, and Continental delicacies.</div>
            </div>
          </motion.div>

          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 space-y-6"
          >
            <div className="space-y-2">
              <span className="text-gold font-sans font-semibold tracking-widest text-sm uppercase block">OUR STORY</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                About Our Restaurant
              </h2>
              <div className="w-20 h-1 bg-gold rounded mt-2" />
            </div>

            <p className="font-sans text-gray-300 text-base sm:text-lg leading-relaxed">
              Kanary Group of Restaurants has been Thrissur's premier multi-cuisine dining destination since 2022. Known for our rich flavors and uncompromising quality, we take pride in using premium, wholesome ingredients to elevate our traditional recipes.
            </p>

            {/* Glowing A2 Milk & Ghee Luxury Highlight Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-primary-dark/80 border border-gold/40 shadow-[0_4px_30px_rgba(212,175,55,0.2)] relative overflow-hidden">
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gold text-primary-dark flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-base">
                  A2
                </div>
                <div className="space-y-1.5">
                  <span className="text-gold font-sans font-bold text-xs uppercase tracking-widest block">
                    PURE A2 MILK & GHEE GUARANTEE
                  </span>
                  <p className="font-serif text-white text-sm sm:text-base italic leading-relaxed">
                    “Made from A2 milk sourced from cows that naturally produce A2 beta-casein, our milk and ghee bring together traditional dairy goodness, rich taste, and premium quality.”
                  </p>
                </div>
              </div>
            </div>

            <p className="font-sans text-gray-400 text-sm sm:text-base leading-relaxed">
              Nestled in the cultural capital of Kerala, Thrissur (with branches at MG Road, Koorkenchery, and Ayyanthole), we offer an immersive culinary journey. From traditional Malabar spices to global Continental plates, our chefs prepare every meal with pure dedication.
            </p>

            {/* Core Values grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/35 flex items-center justify-center">
                  <Award className="w-5 h-5 text-gold" />
                </div>
                <h4 className="text-white font-semibold text-sm">A2 Milk & Ghee</h4>
                <p className="text-gray-400 text-xs">Exclusively premium A2 dairy products.</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/35 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <h4 className="text-white font-semibold text-sm">Authentic Taste</h4>
                <p className="text-gray-400 text-xs">Original traditional Keralite flavors.</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/35 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                </div>
                <h4 className="text-white font-semibold text-sm">Premium Quality</h4>
                <p className="text-gray-400 text-xs">Carefully sourced fresh ingredients.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
