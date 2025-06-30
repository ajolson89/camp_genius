import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Sparkles, ChevronDown, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiSearchSuggestions, quickFilters } from '../data/mockData';

interface AISearchBarProps {
  onSearch: (query: string) => void;
  onToggleAdvanced: () => void;
  showAdvanced: boolean;
  onOpenAI: () => void;
}

const AISearchBar: React.FC<AISearchBarProps> = ({ 
  onSearch, 
  onToggleAdvanced, 
  showAdvanced,
  onOpenAI 
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = suggestion.replace(/[🏔️🏖️♿🐕⭐🚐]/g, '').trim();
    setQuery(cleanSuggestion);
    onSearch(cleanSuggestion);
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setQuery("Find me a pet-friendly RV site near Yellowstone");
    }, 2000);
  };

  const handleQuickFilter = (filter: string) => {
    const filterQueries = {
      petFriendly: "pet-friendly campsites",
      rv: "RV sites with full hookups",
      accessible: "wheelchair accessible campgrounds",
      lakefront: "lakefront camping sites",
      mountain: "mountain camping with views",
      family: "family-friendly campgrounds"
    };
    
    const filterQuery = filterQueries[filter as keyof typeof filterQueries] || filter;
    setQuery(filterQuery);
    onSearch(filterQuery);
  };

  return (
    <div className="relative">
      {/* Main AI Search Bar */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-200 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center p-4">
            {/* AI Bot Icon */}
            <motion.div 
              className="mr-3 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{ rotate: isListening ? 360 : 0 }}
              transition={{ duration: 2, repeat: isListening ? Infinity : 0 }}
            >
              <Bot className="h-5 w-5 text-white" />
            </motion.div>

            {/* Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Ask me anything about camping! 🏕️"
              className="flex-1 text-lg placeholder-gray-500 border-none outline-none bg-transparent"
            />

            {/* Voice Search */}
            <motion.button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
            </motion.button>

            {/* Search Button */}
            <motion.button
              type="submit"
              className="ml-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 rounded-xl transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-5 w-5" />
            </motion.button>
          </div>
        </form>

        {/* AI Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
            >
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Popular searches</span>
                </div>
                <div className="space-y-2">
                  {aiSearchSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-2 hover:bg-purple-50 rounded-lg transition-colors text-sm text-gray-700"
                      whileHover={{ x: 4 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Filter Bubbles */}
      <div className="flex flex-wrap gap-2 mt-4">
        {quickFilters.map((filter, index) => (
          <motion.button
            key={index}
            onClick={() => handleQuickFilter(filter.filter)}
            className="flex items-center space-x-2 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-all duration-300 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Advanced Search Toggle */}
      <div className="flex justify-between items-center mt-4">
        <motion.button
          onClick={onToggleAdvanced}
          className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium"
          whileHover={{ x: 4 }}
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Detailed Search</span>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.button>

        <motion.button
          onClick={onOpenAI}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bot className="h-4 w-4" />
          <span>AI Assistant</span>
        </motion.button>
      </div>
    </div>
  );
};

export default AISearchBar;