"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Calendar, ArrowRight, X, Sparkles, User, Share2, Bookmark } from 'lucide-react';
import { blogPosts } from '../data/blogData';

export default function BlogSection() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <section id="blog" className="py-24 relative bg-primary-bg overflow-hidden border-t border-gold/10">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-gold/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest"
          >
            <BookOpen className="w-3.5 h-3.5 text-gold animate-pulse" />
            Culinary Chronicles
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-wide"
          >
            Latest News & Gourmet Stories
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed"
          >
            Explore Chef secrets, heritage spices, and culinary insights behind Kanary&apos;s signature dishes.
          </motion.p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-panel rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/50 shadow-xl flex flex-col justify-between group transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {/* Image Container */}
              <div className="relative h-60 w-full overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />
                
                {/* Category Tag */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border backdrop-blur-md ${post.categoryColor}`}>
                    {post.category}
                  </span>
                </div>

                {/* Read time badge */}
                <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1 text-[11px] text-gray-300 font-sans bg-primary-dark/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-gold/20">
                  <Clock className="w-3 h-3 text-gold" />
                  {post.readTime}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gold/80 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    <span>{post.date}</span>
                    <span className="text-gray-600">•</span>
                    <span>By {post.author}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors duration-300 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 font-sans">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read More Link */}
                <div className="pt-4 border-t border-gold/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gold group-hover:text-gold-light transition-colors flex items-center gap-1 uppercase tracking-wider">
                    Read Story
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                  <Sparkles className="w-4 h-4 text-gold/30 group-hover:text-gold transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Article Reader Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-primary-dark/90 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="glass-panel max-w-3xl w-full rounded-3xl border border-gold/40 shadow-2xl overflow-hidden relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-30 bg-primary-dark/80 hover:bg-gold hover:text-primary-dark text-white p-2.5 rounded-full border border-gold/30 shadow-lg transition-all cursor-pointer"
                title="Close article"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cover Image Header */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                <img 
                  src={selectedPost.image} 
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/60 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
                  <span className={`inline-block text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border backdrop-blur-md ${selectedPost.categoryColor}`}>
                    {selectedPost.category}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight">
                    {selectedPost.title}
                  </h2>
                </div>
              </div>

              {/* Author & Meta Bar */}
              <div className="px-6 py-4 bg-primary-light/40 border-b border-gold/15 flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{selectedPost.author}</span>
                    <span className="text-gray-400 text-[10px]">{selectedPost.authorRole}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gold/80">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedPost.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedPost.readTime}</span>
                </div>
              </div>

              {/* Story Body Content */}
              <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto font-sans text-gray-300 leading-relaxed text-sm sm:text-base">
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }} 
                  className="prose prose-invert max-w-none"
                />

                <div className="mt-8 pt-6 border-t border-gold/15 flex items-center justify-between">
                  <span className="text-xs text-gold/70 font-serif italic">Crafted with passion by Kanary Group of Restaurants</span>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: selectedPost.title, url: window.location.href });
                      } else {
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-gold hover:text-white font-bold bg-gold/10 px-3 py-1.5 rounded-full border border-gold/30 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Story
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
