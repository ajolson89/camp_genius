import React, { useState } from 'react';
import { Bell, User, Settings, Map, Calendar, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange, currentPage, onPageChange }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: 'weather', message: 'Perfect weather for your Pine Valley trip this weekend! ☀️', time: '2 hours ago' },
    { id: 2, type: 'booking', message: 'Your Lakeside Retreat booking is confirmed 🏕️', time: '1 day ago' },
    { id: 3, type: 'deal', message: 'Special offer: 20% off mountain campsites this week 🏔️', time: '2 days ago' }
  ];

  const navigationItems = [
    { id: 'home', label: 'Discover', icon: Home, emoji: '🏕️' },
    { id: 'dashboard', label: 'Dashboard', icon: Calendar, emoji: '📊' },
    { id: 'map', label: 'Map View', icon: Map, emoji: '🗺️' },
    { id: 'profile', label: 'Profile', icon: User, emoji: '👤' }
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.button
            onClick={() => onPageChange('home')}
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-2xl"
            >
              🏕️
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-white drop-shadow-lg">CampExplorer</h1>
            </div>
          </motion.button>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-white bg-opacity-20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:bg-white hover:bg-opacity-10 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Built with Bolt Badge */}
            <img 
              src="/built_with_bolt.png" 
              alt="Built with Bolt" 
              className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
            
            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors relative backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                      <h3 className="font-semibold">Adventure Updates</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className="p-4 hover:bg-orange-50 border-b border-gray-100 cursor-pointer"
                          whileHover={{ x: 4 }}
                        >
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar */}
            <motion.button
              onClick={() => onPageChange('profile')}
              className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm border-2 border-white border-opacity-30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <User className="h-4 w-4 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;