import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mic, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onAISearch: (query: string) => void;
  onOpenAI: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onAISearch, onOpenAI }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAISearch(query);
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setQuery("Find me a cozy mountain campsite with amazing stargazing");
    }, 2000);
  };

  const quickPrompts = [
    { text: "Pet-friendly adventures", emoji: "🐕", query: "pet-friendly campsites with dog parks" },
    { text: "Mountain views", emoji: "🏔️", query: "mountain camping with scenic views" },
    { text: "Accessible camping", emoji: "♿", query: "wheelchair accessible campgrounds" },
    { text: "Lakefront sites", emoji: "🏖️", query: "lakefront camping with beach access" },
    { text: "RV adventures", emoji: "🚐", query: "RV sites with full hookups" },
    { text: "Family fun", emoji: "👨‍👩‍👧‍👦", query: "family-friendly campgrounds with activities" }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-teal-900/30 to-yellow-900/40 z-10" />
        <img
          src="https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Beautiful camping landscape"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 text-4xl opacity-30"
        >
          🏕️
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute top-32 right-20 text-3xl opacity-40"
        >
          🌲
        </motion.div>
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
          className="absolute bottom-40 left-20 text-2xl opacity-35"
        >
          🦅
        </motion.div>
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-60 right-10 text-3xl opacity-30"
        >
          ⭐
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="relative z-30 text-center max-w-4xl mx-auto px-4">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="text-6xl mb-4">🏕️</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            CampExplorer
          </h1>
          <p className="text-xl md:text-2xl text-cream-100 drop-shadow-lg font-medium">
            Your AI Camping Companion
          </p>
          <p className="text-lg text-cream-200 mt-2 drop-shadow-md">
            From accessible adventures to RV road trips - I'll find your perfect outdoor escape
          </p>
        </motion.div>

        {/* AI Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-2">
              <div className="flex items-center">
                {/* AI Bot Icon */}
                <motion.div 
                  className="ml-4 mr-3 p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                  animate={{ rotate: isListening ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isListening ? Infinity : 0 }}
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>

                {/* Search Input */}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tell me about your dream camping adventure... 🏕️"
                  className="flex-1 text-lg placeholder-gray-500 border-none outline-none bg-transparent py-4 pr-4"
                />

                {/* Voice Search */}
                <motion.button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-3 rounded-full transition-colors mr-2 ${
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
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white p-4 rounded-xl transition-all duration-300 shadow-lg mr-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Quick Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {quickPrompts.map((prompt, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setQuery(prompt.query);
                onAISearch(prompt.query);
              }}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 rounded-full px-4 py-2 text-white font-medium transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <span className="text-lg">{prompt.emoji}</span>
              <span className="text-sm">{prompt.text}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* AI Assistant CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.button
            onClick={onOpenAI}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 shadow-xl backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="h-5 w-5" />
            <span>Chat with Your AI Guide</span>
            <Sparkles className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-center"
        >
          <div className="text-sm mb-2 opacity-80">Discover Amazing Campsites</div>
          <div className="text-2xl">⬇️</div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;