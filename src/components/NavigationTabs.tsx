import React from 'react';
import { motion } from 'framer-motion';
import { Search, Accessibility, Route, Cloud } from 'lucide-react';

interface NavigationTabsProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'search', label: 'Discover', icon: Search, emoji: '🔍' },
    { id: 'accessibility', label: 'Accessible', icon: Accessibility, emoji: '♿' },
    { id: 'route', label: 'Plan Route', icon: Route, emoji: '🗺️' },
    { id: 'weather', label: 'Weather', icon: Cloud, emoji: '🌤️' }
  ];

  return (
    <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                    : 'text-teal-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{item.emoji}</span>
                <span>{item.label}</span>
                {activeView === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl -z-10"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;