"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Flame, Utensils, Search, Sparkles, Milk, MapPin, X, HelpCircle, Camera, Check, Save, Image as ImageIcon, Sliders, Plus, Upload, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { menuData as initialMenuData } from '../data/menuData';
import { allImagesByFolder } from '../data/allImagesData';

// Map categories to user-friendly titles and icons
const categories = [
  { id: 'chefSpecials', name: "Chef's Specials", icon: "👑" },
  { id: 'starters', name: "Starters & Soups", icon: "🍲" },
  { id: 'mains', name: "Mains & Seafood", icon: "🍛" },
  { id: 'grills', name: "Al Faham & Grills", icon: "🍗" },
  { id: 'dosas', name: "A2 Ghee Dosas", icon: "🥞" },
  { id: 'burgers', name: "Burgers & Pizza", icon: "🍔" },
  { id: 'salads', name: "Salads & Meals", icon: "🥗" },
  { id: 'beverages', name: "Mocktails & Shakes", icon: "🥤" },
  { id: 'smoothies', name: "Juices & Smoothies", icon: "🍹" },
  { id: 'desserts', name: "Sweet Endings & Teas", icon: "🍰" },
];

// Build itemCode -> Cloudinary URL lookup map from allImagesByFolder
const cloudinaryImageMap = {};
Object.values(allImagesByFolder).forEach(folder => {
  if (Array.isArray(folder)) {
    folder.forEach(item => {
      if (item.filename && item.path) {
        const codeMatch = item.filename.match(/ITM\d+/i);
        if (codeMatch) {
          cloudinaryImageMap[codeMatch[0].toUpperCase()] = item.path;
        }
      }
    });
  }
});

const DEFAULT_CLOUDINARY_IMAGE = "https://res.cloudinary.com/lzebcil2/image/upload/v1789643306/kanary_restaurant_dishes/ITM0001368_phbmq3.jpg";

const sanitizeCloudinaryUrls = (menuDataObj) => {
  if (!menuDataObj || typeof menuDataObj !== 'object') return menuDataObj;
  const cleaned = JSON.parse(JSON.stringify(menuDataObj));
  Object.keys(cleaned).forEach(cat => {
    if (Array.isArray(cleaned[cat])) {
      cleaned[cat].forEach(dish => {
        if (!dish.image || dish.image.startsWith('/menu-images')) {
          const match = (dish.image || dish.name || '').match(/ITM\d+/i);
          if (match && cloudinaryImageMap[match[0].toUpperCase()]) {
            dish.image = cloudinaryImageMap[match[0].toUpperCase()];
          } else {
            dish.image = DEFAULT_CLOUDINARY_IMAGE;
          }
        }
      });
    }
  });
  return cleaned;
};

export default function FullMenuPage() {
  const [currentMenuData, setCurrentMenuData] = useState(() => sanitizeCloudinaryUrls(initialMenuData));
  const [activeTab, setActiveTab] = useState('chefSpecials');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, veg, spicy, dairy
  const [isSticky, setIsSticky] = useState(false);
  
  // Interactive Image Selector states
  const [editMode, setEditMode] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null); // { catId, itemIndex, item }
  const [activeFolder, setActiveFolder] = useState('Appitizers');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load local cache for instant render, then fetch latest master menu from server for multi-device sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kanary_menu_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentMenuData(sanitizeCloudinaryUrls(parsed));
        } catch (e) {}
      }
    }

    // Always fetch latest master menu from server so all devices sync added & deleted items
    fetch('/api/save-menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.menuData) {
          const sanitized = sanitizeCloudinaryUrls(data.menuData);
          setCurrentMenuData(sanitized);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('kanary_menu_data', JSON.stringify(sanitized));
            } catch (e) {}
          }
        }
      })
      .catch(err => console.error('Failed to sync master menu from server:', err));
  }, []);

  // Add New Dish State
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    price: '',
    description: '',
    category: 'chefSpecials',
    spicy: false,
    veg: false,
    dairy: false,
    image: '',
    imageSource: 'upload', // 'upload' | 'library' | 'url'
  });

  const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.75) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target.result);
      };
      reader.onerror = () => resolve('');
    });
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      setSaveMessage('Uploading photo to backend server...');
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/save-menu/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.imagePath) {
          setSaveMessage('✓ Photo uploaded successfully!');
          setTimeout(() => setSaveMessage(''), 3000);
          if (callback) {
            callback(data.imagePath);
          } else {
            setNewDish(prev => ({ ...prev, image: data.imagePath, imageSource: 'upload' }));
          }
        } else {
          const compressedBase64 = await compressImage(file);
          if (callback) {
            callback(compressedBase64);
          } else {
            setNewDish(prev => ({ ...prev, image: compressedBase64, imageSource: 'upload' }));
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
        const compressedBase64 = await compressImage(file);
        if (callback) {
          callback(compressedBase64);
        } else {
          setNewDish(prev => ({ ...prev, image: compressedBase64, imageSource: 'upload' }));
        }
      } finally {
        setIsSaving(false);
      }
    }
  };


  // Always retrieve fresh, deep-cloned menu data combining local storage and state
  const getFreshMenuData = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kanary_menu_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return JSON.parse(JSON.stringify(currentMenuData));
  };

  const handleAddNewDishSubmit = async (e) => {
    e.preventDefault();
    if (!newDish.name.trim() || !newDish.price) {
      alert("Please enter a Dish Name and Price.");
      return;
    }

    const catId = newDish.category;
    const dishObj = {
      name: newDish.name.trim(),
      price: isNaN(newDish.price) ? newDish.price : Number(newDish.price),
      description: newDish.description.trim(),
      spicy: newDish.spicy,
      veg: newDish.veg,
      dairy: newDish.dairy,
      image: newDish.image || DEFAULT_CLOUDINARY_IMAGE,
    };

    const updatedData = getFreshMenuData();
    if (!updatedData[catId]) {
      updatedData[catId] = [];
    }
    // Add new dish at beginning of chosen category
    updatedData[catId] = [dishObj, ...updatedData[catId]];

    setShowAddDishModal(false);

    // Reset form
    setNewDish({
      name: '',
      price: '',
      description: '',
      category: 'chefSpecials',
      spicy: false,
      veg: false,
      dairy: false,
      image: '',
      imageSource: 'upload',
    });

    saveAndPersistMenuData(updatedData, `✓ New dish "${dishObj.name}" added & saved permanently!`);
  };

  // Delete / Remove Dish from menu
  const handleDeleteDish = async (catId, itemIndex, dishName) => {
    if (!window.confirm(`Are you sure you want to remove "${dishName}" from the menu?`)) {
      return;
    }

    const updatedData = getFreshMenuData();
    if (updatedData[catId]) {
      updatedData[catId] = updatedData[catId].filter((_, idx) => idx !== itemIndex);
    }

    saveAndPersistMenuData(updatedData, `✓ Dish "${dishName}" deleted & saved!`);
  };

  const tabsRef = useRef(null);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track scroll position to make the tab bar sticky and update active tab
  useEffect(() => {
    const handleScroll = () => {
      if (!tabsRef.current) return;
      const tabOffset = tabsRef.current.offsetTop;
      setIsSticky(window.scrollY > tabOffset - 80);
      
      const scrollPosition = window.scrollY + 220;
      for (const cat of categories) {
        const section = document.getElementById(cat.id);
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(cat.id);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  // Unified Helper to update state, sync to localStorage, and persist to menuData.js via API
  const saveAndPersistMenuData = async (updatedData, successMsg = '✓ Changes saved!') => {
    setCurrentMenuData(updatedData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kanary_menu_data', JSON.stringify(updatedData));
    }

    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/save-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuData: updatedData }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage(successMsg || '✓ Changes saved permanently!');
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage('✓ Menu updated in active session!');
        setTimeout(() => setSaveMessage(''), 4000);
      }
    } catch (err) {
      setSaveMessage('✓ Menu updated in active session!');
      setTimeout(() => setSaveMessage(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshMasterMenu = async () => {
    setIsSaving(true);
    setSaveMessage('Syncing latest menu from database...');
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kanary_menu_data');
      }
      const res = await fetch('/api/save-menu');
      const data = await res.json();
      if (data.success && data.menuData) {
        const sanitized = sanitizeCloudinaryUrls(data.menuData);
        setCurrentMenuData(sanitized);
        if (typeof window !== 'undefined') {
          localStorage.setItem('kanary_menu_data', JSON.stringify(sanitized));
        }
        setSaveMessage('✓ Synced latest menu from database!');
        setTimeout(() => setSaveMessage(''), 4000);
      }
    } catch (err) {
      setSaveMessage('Failed to sync from database');
    } finally {
      setIsSaving(false);
    }
  };

  // Assign selected image to current dish
  const handleAssignImage = (imagePath) => {
    if (!selectedDish) return;
    const { catId, itemIndex } = selectedDish;

    const updatedData = getFreshMenuData();
    if (updatedData[catId] && updatedData[catId][itemIndex]) {
      updatedData[catId][itemIndex] = {
        ...updatedData[catId][itemIndex],
        image: imagePath,
      };
    }

    setSelectedDish(null);
    saveAndPersistMenuData(updatedData, `✓ Image updated & saved permanently!`);
  };

  // Save changes explicitly to menuData.js
  const handleSaveChanges = async () => {
    await saveAndPersistMenuData(currentMenuData, '✓ Changes saved permanently to menuData.js!');
  };

  // Helper to filter items based on search query and selected filter type
  const getFilteredItems = (catId, categoryItems) => {
    let items = [...categoryItems];
    if (catId === 'salads' && currentMenuData.meals) {
      items = [...items, ...currentMenuData.meals];
    }

    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'veg' && item.veg) ||
        (filterType === 'spicy' && item.spicy) ||
        (filterType === 'dairy' && item.dairy);
        
      return matchesSearch && matchesFilter;
    });
  };

  const imageFolders = Object.keys(allImagesByFolder);

  return (
    <div className="pt-20 bg-primary-bg min-h-screen text-gray-200 relative pb-28">
      
      {/* Dev Mode / Image Matcher Toggle Banner */}
      <div className="bg-gold/15 border-b border-gold/30 py-3.5 px-4 sticky top-16 z-40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Camera className="w-5 h-5 text-gold animate-pulse" />
          <div>
            <span className="font-serif font-bold text-white text-sm">Interactive Image Matcher</span>
            <p className="text-xs text-gray-300">Click any dish photo to pick & swap suitable images directly from the 180+ dish library.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddDishModal(true)}
            className="flex items-center gap-2 bg-gold hover:bg-gold-light text-primary-dark font-sans px-4 py-2 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add New Dish
          </button>

          <button
            onClick={handleRefreshMasterMenu}
            className="flex items-center gap-2 bg-primary-dark/80 hover:bg-gold hover:text-primary-dark text-gold border border-gold/40 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
            title="Sync latest menu from database"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Database Menu
          </button>

          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              editMode 
                ? 'bg-gold text-primary-dark shadow-lg shadow-gold/20' 
                : 'bg-primary-dark/80 text-gold border border-gold/40 hover:bg-gold/10'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {editMode ? 'Matcher Mode ACTIVE' : 'Enable Photo Matcher'}
          </button>

          {editMode && (
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          )}
        </div>
      </div>

      {saveMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-900 border border-green-400 text-white px-6 py-3 rounded-2xl shadow-2xl font-sans text-sm font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 text-green-300" />
          {saveMessage}
        </div>
      )}

      {/* 1. Hero / Header Banner */}
      <div 
        className="relative h-[40vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/interior_1.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/95 via-primary-dark/80 to-primary-bg backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.12),transparent_70%)]" />

        <div className="relative text-center max-w-3xl px-4 space-y-3 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-full border border-gold flex items-center justify-center bg-primary-dark/60 mx-auto"
          >
            <Utensils className="w-5 h-5 text-gold" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-wide"
          >
            The Gourmet Culinary Menu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gold font-sans font-medium tracking-widest text-xs sm:text-sm uppercase"
          >
            Crafted with A2 Ghee, Traditional Heritage Spices & Modern Gastronomy
          </motion.p>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-30px] relative z-20">
        <div className="glass-panel rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gold/60" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Beef, Dosa, Penne...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-primary-dark/50 border border-gold/20 rounded-full py-3 pl-12 pr-10 text-white font-sans text-sm outline-none focus:border-gold transition-all duration-300 placeholder-gray-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            {[
              { id: 'all', label: 'All Dishes', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'veg', label: 'Vegetarian', icon: <Leaf className="w-3.5 h-3.5" />, color: 'text-green-500 border-green-500/20 bg-green-950/10' },
              { id: 'spicy', label: 'Spicy Selection', icon: <Flame className="w-3.5 h-3.5" />, color: 'text-red-500 border-red-500/20 bg-red-950/10' },
              { id: 'dairy', label: 'Dairy Rich', icon: <Milk className="w-3.5 h-3.5" />, color: 'text-blue-400 border-blue-400/20 bg-blue-950/10' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wider font-sans border transition-all duration-300 cursor-pointer ${
                  filterType === filter.id 
                    ? 'bg-gold text-primary-dark border-gold font-bold shadow-lg shadow-gold/10' 
                    : 'bg-primary-dark/30 border-gold/10 text-gray-400 hover:border-gold/30 hover:text-white'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Sticky Category Tab Bar */}
      <div 
        ref={tabsRef}
        className={`z-30 transition-all duration-300 ${
          isSticky 
            ? 'fixed top-28 left-0 right-0 bg-primary-bg/95 backdrop-blur-md border-b border-gold/10 py-3 shadow-xl' 
            : 'mt-8 py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto scrollbar-none flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToSection(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold tracking-wider font-sans uppercase border transition-all duration-300 cursor-pointer ${
                activeTab === cat.id 
                  ? 'bg-gold/10 text-gold border-gold/40 shadow-inner' 
                  : 'bg-primary-light/50 border-transparent text-gray-400 hover:text-white hover:bg-primary-light'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Menu Items Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {categories.map((cat) => {
          const rawItems = currentMenuData[cat.id] || [];
          const filteredItems = getFilteredItems(cat.id, rawItems);

          if (filteredItems.length === 0 && searchQuery) return null;

          return (
            <section 
              id={cat.id} 
              key={cat.id} 
              className="mb-24 scroll-mt-36"
            >
              {/* Category Title */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold tracking-wide">
                    {cat.name}
                  </h2>
                </div>
                <div className="flex-grow border-b border-gold/10" />
                <span className="text-xs font-sans text-gray-500 tracking-widest uppercase">
                  {filteredItems.length} {filteredItems.length === 1 ? 'Dish' : 'Dishes'}
                </span>
              </div>

              {/* Grid Layout depending on Category */}
              {cat.id === 'chefSpecials' ? (
                // 👑 Chef Specials Grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredItems.map((item, itemIdx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: itemIdx * 0.05 }}
                      whileHover={{ y: -6 }}
                      key={itemIdx}
                      className="relative rounded-2xl p-6 glass-panel border border-gold/30 hover:border-gold/60 shadow-[0_10px_35px_-10px_rgba(197,168,128,0.08)] bg-gradient-to-br from-primary-dark/80 to-primary-light/40 overflow-hidden flex flex-col justify-between group transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 z-10 bg-gold/10 text-gold text-[10px] font-bold tracking-widest px-3.5 py-1.5 rounded-bl-xl uppercase flex items-center gap-1 border-l border-b border-gold/20 backdrop-blur-md">
                        <Sparkles className="w-3 h-3 text-gold-accent" /> Signature
                      </div>

                      {editMode && (
                        <button
                          onClick={() => handleDeleteDish(cat.id, itemIdx, item.name)}
                          className="absolute top-2 left-2 z-30 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-all cursor-pointer"
                          title={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="relative h-56 w-full overflow-hidden rounded-xl mb-4 border border-gold/15 group">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-dark flex items-center justify-center text-gray-500 text-xs">No Image</div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent" />
                        
                        {editMode && (
                          <div className="absolute bottom-2 left-2 right-2 z-20 bg-primary-dark/95 backdrop-blur-md p-2 rounded-xl border border-gold/40 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-gold uppercase px-1">Manage Photo:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDish({ catId: cat.id, itemIndex: itemIdx, item });
                                setActiveFolder('Brazilian Churrasca');
                              }}
                              className="bg-gold hover:bg-gold-light text-primary-dark text-xs font-bold px-3 py-1.5 rounded-lg uppercase transition-all shadow-md flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Change / Upload Photo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline gap-4">
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-gold transition-colors duration-200 flex items-center gap-2">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed pr-4">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gold/10 flex justify-between items-center">
                        <div className="flex gap-2">
                          {item.veg && <span className="text-[10px] uppercase font-bold text-green-500 bg-green-950/20 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Leaf className="w-2.5 h-2.5" /> Veg</span>}
                          {!item.veg && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-950/20 border border-red-500/20 px-2 py-0.5 rounded-full">Non-Veg</span>}
                          {item.spicy && <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/20 border border-red-400/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> Spicy</span>}
                        </div>
                        <span className="text-gold font-sans font-bold text-xl">
                          {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // 🍽️ Standard Menu Card Layout
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {filteredItems.map((item, itemIdx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: itemIdx * 0.02 }}
                      key={itemIdx} 
                      className="flex gap-4 group p-3 rounded-xl hover:bg-primary-light/30 border border-transparent hover:border-gold/15 transition-all duration-200 items-center relative"
                    >
                      <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gold/20 group-hover:border-gold/50 shadow-md">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-dark flex items-center justify-center text-gray-500 text-xs">No Image</div>
                        )}

                        {editMode && (
                          <button
                            onClick={() => {
                              setSelectedDish({ catId: cat.id, itemIndex: itemIdx, item });
                              // Smart default folder selector
                              if (cat.id === 'dosas') setActiveFolder('Dosa Corner_ Porotta');
                              else if (cat.id === 'burgers') setActiveFolder(item.name.toLowerCase().includes('pizza') ? 'pizza' : 'burger & sandwiches');
                              else if (cat.id === 'beverages') setActiveFolder(item.name.toLowerCase().includes('mojito') ? 'mojito' : 'milk shakes');
                              else if (cat.id === 'smoothies') setActiveFolder('fresh juices');
                              else if (cat.id === 'grills') setActiveFolder('Shawarma & Shawaya');
                              else if (cat.id === 'starters') setActiveFolder('Appitizers');
                              else setActiveFolder('Appitizers');
                            }}
                            className="absolute inset-0 bg-primary-dark/85 backdrop-blur-xs text-gold text-[10px] font-extrabold flex flex-col items-center justify-center gap-1 hover:bg-gold hover:text-primary-dark transition-all"
                          >
                            <Camera className="w-4 h-4" /> Change
                          </button>
                        )}
                      </div>

                      <div className="flex-grow space-y-1.5 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-gold transition-colors duration-200 truncate flex items-center gap-2">
                            {item.name}
                            <span className="inline-flex gap-1 flex-shrink-0">
                              {item.veg && <Leaf className="w-3.5 h-3.5 text-green-500" />}
                              {item.spicy && <Flame className="w-3.5 h-3.5 text-red-500" />}
                            </span>
                          </h3>
                          <div className="flex-grow border-b border-dotted border-gray-800 mx-1 hidden sm:block" />
                          <span className="text-gold font-sans font-bold text-base whitespace-nowrap">
                            {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {editMode && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-mono text-gold/70 block truncate">
                              {item.image || 'No image path'}
                            </span>
                            <button
                              onClick={() => handleDeleteDish(cat.id, itemIdx, item.name)}
                              className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-all cursor-pointer ml-2 flex-shrink-0"
                              title={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          );
        })}

      </div>

      {/* Interactive Image Matcher Modal */}
      <AnimatePresence>
        {selectedDish && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-primary-dark border border-gold/30 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-primary-light/40">
                <div>
                  <span className="text-gold text-xs font-bold uppercase tracking-widest block mb-1">Select Photo For Dish</span>
                  <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                    {selectedDish.item.name}
                  </h3>
                </div>

                <button 
                  onClick={() => setSelectedDish(null)}
                  className="w-10 h-10 rounded-full bg-primary-dark border border-gold/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-gold transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Folder Filter Tabs */}
              <div className="p-4 border-b border-gold/10 overflow-x-auto scrollbar-none flex gap-2 bg-primary-dark/80">
                {imageFolders.map(folder => (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeFolder === folder
                        ? 'bg-gold text-primary-dark font-extrabold shadow-md'
                        : 'bg-primary-light/40 text-gray-400 hover:text-white hover:bg-primary-light'
                    }`}
                  >
                    {folder} ({(allImagesByFolder[folder] || []).length})
                  </button>
                ))}
              </div>

              {/* Images Grid */}
              <div className="p-6 overflow-y-auto flex-grow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 scrollbar-thin">
                {(allImagesByFolder[activeFolder] || []).map((imgObj, idx) => {
                  const isCurrent = selectedDish.item.image === imgObj.path;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAssignImage(imgObj.path)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group text-left ${
                        isCurrent 
                          ? 'border-gold ring-4 ring-gold/30 scale-95 shadow-2xl' 
                          : 'border-gold/15 hover:border-gold/60 hover:scale-102'
                      }`}
                    >
                      <img 
                        src={imgObj.path} 
                        alt={imgObj.filename}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2.5">
                        <span className="text-[11px] font-mono font-semibold text-gold truncate">
                          {imgObj.filename}
                        </span>
                      </div>

                      {isCurrent && (
                        <div className="absolute top-2 right-2 bg-gold text-primary-dark p-1 rounded-full font-bold shadow-lg">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gold/15 bg-primary-light/30 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const { catId, itemIndex, item } = selectedDish;
                      setSelectedDish(null);
                      handleDeleteDish(catId, itemIndex, item.name);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Dish
                  </button>

                  <label className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gold text-primary-dark hover:bg-gold-light transition-all cursor-pointer shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    Upload New Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (uploadedPath) => handleAssignImage(uploadedPath))}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    Current image: <code className="text-gold font-mono">{selectedDish.item.image || 'None'}</code>
                  </span>
                  <button
                    onClick={() => setSelectedDish(null)}
                    className="px-6 py-2 rounded-full text-xs font-bold bg-primary-dark border border-gold/30 text-white hover:bg-gold hover:text-primary-dark transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Dish Modal */}
      <AnimatePresence>
        {showAddDishModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-primary-dark border border-gold/30 rounded-3xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-primary-light/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white">Add New Dish</h3>
                    <p className="text-xs text-gray-400">Fill in dish details to publish directly to the menu.</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAddDishModal(false)}
                  className="w-9 h-9 rounded-full bg-primary-dark border border-gold/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-gold transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddNewDishSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gold uppercase tracking-wider mb-2">
                    Menu Category *
                  </label>
                  <select
                    value={newDish.category}
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                    className="w-full bg-primary-light/40 border border-gold/20 rounded-xl px-4 py-3 text-white font-sans text-sm focus:border-gold outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-primary-dark text-white">
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dish Name & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sizzling Garlic Prawns"
                      value={newDish.name}
                      onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                      className="w-full bg-primary-light/40 border border-gold/20 rounded-xl px-4 py-2.5 text-white font-sans text-sm focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Price (₹) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 350 or 250 / 450"
                      value={newDish.price}
                      onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                      className="w-full bg-primary-light/40 border border-gold/20 rounded-xl px-4 py-2.5 text-white font-sans text-sm focus:border-gold outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Short mouth-watering description of ingredients & flavors..."
                    value={newDish.description}
                    onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                    className="w-full bg-primary-light/40 border border-gold/20 rounded-xl px-4 py-2.5 text-white font-sans text-sm focus:border-gold outline-none resize-none"
                  ></textarea>
                </div>

                {/* Dietary Flags */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Dietary & Flavor Badges
                  </label>
                  <div className="flex flex-wrap gap-4 bg-primary-light/20 p-3 rounded-xl border border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newDish.veg}
                        onChange={(e) => setNewDish({ ...newDish, veg: e.target.checked })}
                        className="rounded accent-gold w-4 h-4"
                      />
                      <Leaf className="w-3.5 h-3.5 text-green-400" />
                      Vegetarian
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newDish.spicy}
                        onChange={(e) => setNewDish({ ...newDish, spicy: e.target.checked })}
                        className="rounded accent-gold w-4 h-4"
                      />
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      Spicy
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newDish.dairy}
                        onChange={(e) => setNewDish({ ...newDish, dairy: e.target.checked })}
                        className="rounded accent-gold w-4 h-4"
                      />
                      <Milk className="w-3.5 h-3.5 text-blue-300" />
                      Contains Dairy
                    </label>
                  </div>
                </div>

                {/* Dish Photo Selection */}
                <div>
                  <label className="block text-xs font-bold text-gold uppercase tracking-wider mb-2">
                    Dish Photo Image
                  </label>
                  
                  {/* Source Options Tabs */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setNewDish({ ...newDish, imageSource: 'upload' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newDish.imageSource === 'upload'
                          ? 'bg-gold text-primary-dark'
                          : 'bg-primary-light/40 text-gray-400 hover:text-white'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDish({ ...newDish, imageSource: 'library' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newDish.imageSource === 'library'
                          ? 'bg-gold text-primary-dark'
                          : 'bg-primary-light/40 text-gray-400 hover:text-white'
                      }`}
                    >
                      Pick from Library
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDish({ ...newDish, imageSource: 'url' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newDish.imageSource === 'url'
                          ? 'bg-gold text-primary-dark'
                          : 'bg-primary-light/40 text-gray-400 hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {/* Upload File Input */}
                  {newDish.imageSource === 'upload' && (
                    <div className="border-2 border-dashed border-gold/30 rounded-xl p-4 text-center bg-primary-light/20 hover:border-gold/60 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="dish-file-upload"
                      />
                      <label htmlFor="dish-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-gold" />
                        <span className="text-xs font-semibold text-gray-300">Click to upload image file from device</span>
                        <span className="text-[10px] text-gray-500">Supports JPG, PNG, WEBP</span>
                      </label>
                    </div>
                  )}

                  {/* Library Selector */}
                  {newDish.imageSource === 'library' && (
                    <div className="space-y-2">
                      <select
                        value={newDish.image}
                        onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                        className="w-full bg-primary-light/40 border border-gold/20 rounded-xl px-4 py-2.5 text-white font-sans text-xs outline-none"
                      >
                        <option value="">-- Choose from existing 180+ dish images --</option>
                        {Object.keys(allImagesByFolder).map(folder => (
                          <optgroup key={folder} label={folder}>
                            {(allImagesByFolder[folder] || []).map((img, idx) => (
                              <option key={idx} value={img.path}>
                                {img.filename} ({folder})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* URL Input */}
                  {newDish.imageSource === 'url' && (
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newDish.image}
                      onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                      className="w-full bg-primary-light/40 border border-gold/20 rounded-xl px-4 py-2.5 text-white font-sans text-sm focus:border-gold outline-none"
                    />
                  )}

                  {/* Preview Image thumbnail if available */}
                  {newDish.image && (
                    <div className="mt-3 flex items-center gap-3 bg-primary-light/30 p-2.5 rounded-xl border border-gold/20">
                      <img src={newDish.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gold/30" />
                      <div className="text-xs text-gray-300 truncate flex-grow">
                        <span className="text-gold font-bold block">Selected Image Preview</span>
                        <span className="font-mono text-[10px] text-gray-400 truncate block">{newDish.image.slice(0, 50)}...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Footer Actions */}
                <div className="pt-4 border-t border-gold/20 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddDishModal(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary-dark border border-gold/30 text-gray-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full text-xs font-bold bg-gold hover:bg-gold-light text-primary-dark shadow-lg shadow-gold/20 transition-all cursor-pointer font-sans"
                  >
                    Add Dish to Menu
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
