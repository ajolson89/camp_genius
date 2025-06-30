import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, MapPin, Calendar, Users } from 'lucide-react';
import { ChatMessage, Campsite } from '../types';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  campsites: Campsite[];
  onCampsiteSelect: (campsite: Campsite) => void;
  onBookCampsite: (campsite: Campsite) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isOpen, 
  onClose, 
  campsites, 
  onCampsiteSelect,
  onBookCampsite 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi there! I'm your camping buddy 🏕️ I can help you find the perfect campsite, plan your trip, check weather, and even suggest what to pack! What adventure are you planning?",
      timestamp: new Date(),
      actions: [
        { label: "Find Campsites", action: "search", data: null },
        { label: "Plan Trip", action: "plan", data: null },
        { label: "Check Weather", action: "weather", data: null },
        { label: "Packing List", action: "pack", data: null }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    if (input.includes('pet') || input.includes('dog')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "Perfect! I found some amazing pet-friendly campgrounds for you and your furry friend! 🐕 Whispering Pines is especially great - they have a dedicated pet area and lots of trails to explore together.",
        timestamp: new Date(),
        actions: [
          { label: "View Whispering Pines", action: "view", data: campsites[3] },
          { label: "See All Pet-Friendly", action: "filter", data: "pet-friendly" }
        ]
      };
    }
    
    if (input.includes('rv') || input.includes('motorhome')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "Great choice for RV camping! 🚐 I recommend Whispering Pines - it's perfect for first-time RVers with full hookups and easy access. Pine Valley also has excellent RV facilities with mountain views!",
        timestamp: new Date(),
        actions: [
          { label: "Book Whispering Pines", action: "book", data: campsites[3] },
          { label: "Compare RV Sites", action: "compare", data: "rv" }
        ]
      };
    }
    
    if (input.includes('accessible') || input.includes('wheelchair')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "I've got you covered! ♿ Whispering Pines has a perfect 5-star accessibility rating with universal design bathrooms and accessible trails. Pine Valley is also excellent with paved pathways and accessible parking.",
        timestamp: new Date(),
        actions: [
          { label: "View Accessible Sites", action: "accessibility", data: null },
          { label: "Book Whispering Pines", action: "book", data: campsites[3] }
        ]
      };
    }
    
    if (input.includes('weather') || input.includes('forecast')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "Let me check the weather for you! ☀️ This week looks great for camping - mostly sunny with temperatures in the 70s. There's a slight chance of rain on Wednesday, so pack a light rain jacket just in case!",
        timestamp: new Date(),
        actions: [
          { label: "Full Weather Report", action: "weather", data: null },
          { label: "Packing Suggestions", action: "pack", data: "rainy" }
        ]
      };
    }
    
    if (input.includes('pack') || input.includes('bring')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "Here's your personalized packing list! 🎒 Based on the weather and your destination, I recommend: tent/sleeping gear, weather-appropriate clothing, cooking supplies, first aid kit, flashlight, and don't forget marshmallows for s'mores! 🔥",
        timestamp: new Date(),
        actions: [
          { label: "Full Packing List", action: "pack", data: "complete" },
          { label: "Weather-Specific Items", action: "pack", data: "weather" }
        ]
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: "I'd love to help you with that! 🌟 I can assist with finding campsites, planning routes, checking weather, or creating packing lists. What would you like to explore first?",
      timestamp: new Date(),
      actions: [
        { label: "Find Campsites", action: "search", data: null },
        { label: "Plan Route", action: "route", data: null },
        { label: "Check Weather", action: "weather", data: null }
      ]
    };
  };

  const handleActionClick = (action: string, data: any) => {
    switch (action) {
      case 'view':
        onCampsiteSelect(data);
        break;
      case 'book':
        onBookCampsite(data);
        break;
      case 'search':
        // Trigger search functionality
        break;
      case 'weather':
        // Switch to weather view
        break;
      case 'pack':
        // Show packing list
        break;
      default:
        console.log('Action:', action, data);
    }
  };

  const quickActions = [
    { icon: MapPin, label: "Find Sites", action: "I'm looking for campsites" },
    { icon: Calendar, label: "Plan Trip", action: "Help me plan a camping trip" },
    { icon: Users, label: "Family Camping", action: "Find family-friendly campgrounds" },
    { icon: Sparkles, label: "Surprise Me", action: "Recommend something amazing" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* AI Assistant Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-white bg-opacity-20 p-2 rounded-full"
                  >
                    <Bot className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">AI Camping Buddy</h3>
                    <p className="text-sm opacity-90">Your outdoor adventure assistant</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Action Buttons */}
                    {message.actions && (
                      <div className="mt-3 space-y-2">
                        {message.actions.map((action, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleActionClick(action.action, action.data)}
                            className="block w-full text-left px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-xs font-medium transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={index}
                        onClick={() => {
                          setInputValue(action.action);
                          handleSendMessage();
                        }}
                        className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;