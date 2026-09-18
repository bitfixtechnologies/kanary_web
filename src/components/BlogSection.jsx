"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Calendar, ArrowRight, X, Sparkles, User, Share2, Plus, Edit3, Trash2, Upload, Save, Check } from 'lucide-react';
import { blogPosts as initialBlogPosts } from '../data/blogData';

export default function BlogSection() {
  const [blogs, setBlogs] = useState(initialBlogPosts);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false); // Add or Edit modal
  const [editingPost, setEditingPost] = useState(null); // null = Add, object = Edit

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: "CHEF'S SECRETS",
    categoryColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    readTime: '4 min read',
    author: 'Chef Rahil Varma',
    authorRole: 'Head Culinary Director',
    image: '',
    excerpt: '',
    content: '',
  });

  // Fetch live blogs on mount
  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.blogs && data.blogs.length > 0) {
          setBlogs(data.blogs);
        }
      })
      .catch((err) => console.error('Failed to fetch live blogs:', err));
  }, []);

  const openAddModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      category: "CHEF'S SECRETS",
      categoryColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      readTime: '4 min read',
      author: 'Chef Rahil Varma',
      authorRole: 'Head Culinary Director',
      image: 'https://res.cloudinary.com/lzebcil2/image/upload/v1789643306/kanary_restaurant_dishes/ITM0001368_phbmq3.jpg',
      excerpt: '',
      content: '',
    });
    setShowModal(true);
  };

  const openEditModal = (post, e) => {
    if (e) e.stopPropagation();
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      category: post.category || "CHEF'S SECRETS",
      categoryColor: post.categoryColor || 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      readTime: post.readTime || '4 min read',
      author: post.author || 'Chef Rahil Varma',
      authorRole: post.authorRole || 'Head Culinary Director',
      image: post.image || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
    });
    setShowModal(true);
  };

  // Upload cover photo to Cloudinary CDN
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    setStatusMsg('Uploading image to Cloudinary CDN...');
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await fetch('/api/save-menu/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.imagePath) {
        setFormData((prev) => ({ ...prev, image: data.imagePath }));
        setStatusMsg('✓ Image uploaded to Cloudinary!');
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert('Image upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Add or Edit Blog
  const handleSubmitBlog = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image) {
      alert('Please fill in the Blog Title and Cover Image.');
      return;
    }

    setIsSaving(true);
    setStatusMsg(editingPost ? 'Updating story...' : 'Publishing story...');

    const blogObj = {
      id: editingPost ? editingPost.id : `blog_${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      categoryColor: formData.categoryColor,
      date: editingPost ? editingPost.date : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: formData.readTime.trim(),
      author: formData.author.trim(),
      authorRole: formData.authorRole.trim(),
      image: formData.image,
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim() || `<p>${formData.excerpt.trim()}</p>`,
    };

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blog: blogObj }),
      });
      const data = await res.json();

      if (data.success && data.blogs) {
        setBlogs(data.blogs);
      } else {
        setBlogs((prev) => {
          if (editingPost) {
            return prev.map((b) => (b.id === blogObj.id ? blogObj : b));
          }
          return [blogObj, ...prev];
        });
      }

      setStatusMsg(editingPost ? '✓ Story updated live!' : '✓ Story published live!');
      setTimeout(() => setStatusMsg(''), 4000);
      setShowModal(false);
    } catch (err) {
      console.error('Save blog error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (postId, title, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setIsSaving(true);
    setStatusMsg('Deleting story...');
    try {
      const res = await fetch(`/api/blogs?id=${postId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success && data.blogs) {
        setBlogs(data.blogs);
      } else {
        setBlogs((prev) => prev.filter((b) => b.id !== postId));
      }
      setStatusMsg(`✓ Story deleted!`);
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section id="blog" className="py-24 relative bg-primary-bg overflow-hidden border-t border-gold/10">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-gold/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Floating Status Notification */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-900 border border-green-400 text-white px-6 py-3 rounded-2xl shadow-2xl font-sans text-sm font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 text-green-300" />
          {statusMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="text-center md:text-left space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5 text-gold animate-pulse" />
              Culinary Chronicles
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-wide">
              Latest News & Gourmet Stories
            </h2>
            <p className="text-gray-400 font-sans text-sm sm:text-base leading-relaxed">
              Explore Chef secrets, heritage spices, and culinary insights behind Kanary&apos;s signature dishes.
            </p>
          </div>

          {/* Add New Story Action Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gold hover:bg-gold-light text-primary-dark font-sans px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/20 hover:scale-105 transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Story
          </button>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-panel rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/50 shadow-xl flex flex-col justify-between group transition-all duration-300 cursor-pointer relative"
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
                  <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border backdrop-blur-md ${post.categoryColor || 'bg-gold/20 text-gold border-gold/30'}`}>
                    {post.category}
                  </span>
                </div>

                {/* Edit & Delete Quick Action Controls */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => openEditModal(post, e)}
                    className="p-2 rounded-full bg-primary-dark/80 hover:bg-gold text-gold hover:text-primary-dark border border-gold/30 backdrop-blur-md shadow-md transition-all cursor-pointer"
                    title="Edit Story"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteBlog(post.id, post.title, e)}
                    className="p-2 rounded-full bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 backdrop-blur-md shadow-md transition-all cursor-pointer"
                    title="Delete Story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
                  <span className={`inline-block text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border backdrop-blur-md ${selectedPost.categoryColor || 'bg-gold/20 text-gold border-gold/30'}`}>
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

      {/* Add / Edit Blog Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-primary-dark/95 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel max-w-2xl w-full rounded-3xl border border-gold/40 shadow-2xl p-6 sm:p-8 relative my-8 text-gray-200 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gold/15 pb-4">
                <h3 className="font-serif text-2xl font-bold text-gold flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-gold" />
                  {editingPost ? 'Edit Blog Story' : 'Publish New Blog Story'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full bg-primary-dark hover:bg-gold hover:text-primary-dark text-gray-400 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitBlog} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gold uppercase mb-1">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., The Secret Behind Our 12-Hour Smoked Brisket"
                    className="w-full bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gold uppercase mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        let color = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                        if (val.includes('HEALTH')) color = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                        if (val.includes('GRILL')) color = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                        setFormData({ ...formData, category: val, categoryColor: color });
                      }}
                      className="w-full bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                    >
                      <option value="CHEF'S SECRETS">CHEF&apos;S SECRETS</option>
                      <option value="HERITAGE & HEALTH">HERITAGE & HEALTH</option>
                      <option value="AL FAHAM & GRILLS">AL FAHAM & GRILLS</option>
                      <option value="EVENT HIGHLIGHTS">EVENT HIGHLIGHTS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gold uppercase mb-1">Read Time</label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="e.g., 4 min read"
                      className="w-full bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gold uppercase mb-1">Author Name</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g., Chef Rahil Varma"
                      className="w-full bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gold uppercase mb-1">Author Role</label>
                    <input
                      type="text"
                      value={formData.authorRole}
                      onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                      placeholder="e.g., Head Culinary Director"
                      className="w-full bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold uppercase mb-1">Cover Image URL / Upload to Cloudinary CDN *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://res.cloudinary.com/..."
                      className="flex-grow bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                    />
                    <label className="bg-gold hover:bg-gold-light text-primary-dark text-xs font-bold px-4 py-2.5 rounded-xl uppercase transition-all flex items-center gap-1 cursor-pointer flex-shrink-0">
                      <Upload className="w-4 h-4" />
                      Upload
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold uppercase mb-1">Card Excerpt / Summary</label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief 2-sentence summary shown on the card preview..."
                    className="w-full bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold uppercase mb-1">Full Article Body Content (HTML allowed)</label>
                  <textarea
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="<p class='mb-4'>Write your full article paragraphs here...</p>"
                    className="w-full bg-primary-dark/80 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold font-mono text-xs"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-xs font-bold hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gold hover:bg-gold-light text-primary-dark text-xs font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save & Publish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
