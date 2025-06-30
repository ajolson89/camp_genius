import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Heart, MapPin, Calendar, Edit, Plus, X } from 'lucide-react';
import { mockUserProfile, mockTrips } from '../data/mockData';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockUserProfile);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, emoji: '👤' },
    { id: 'accessibility', label: 'Accessibility', icon: Settings, emoji: '♿' },
    { id: 'preferences', label: 'Preferences', icon: Heart, emoji: '❤️' },
    { id: 'notifications', label: 'Notifications', icon: Bell, emoji: '🔔' }
  ];

  const campingStyles = [
    'Mountain Camping', 'Beach Camping', 'Desert Camping', 'Forest Camping',
    'RV Travel', 'Tent Camping', 'Cabin Stays', 'Glamping',
    'Family Camping', 'Solo Adventures', 'Group Camping', 'Backpacking'
  ];

  const equipment = [
    'Tent', 'Sleeping Bags', 'Camping Chairs', 'Portable Grill',
    'Cooler', 'Lanterns', 'First Aid Kit', 'Hiking Boots',
    'Backpack', 'Water Bottles', 'Camping Stove', 'Tarp'
  ];

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to backend
  };

  const addPet = () => {
    setProfile({
      ...profile,
      pets: [...profile.pets, { name: '', type: 'Dog', breed: '' }]
    });
  };

  const removePet = (index: number) => {
    setProfile({
      ...profile,
      pets: profile.pets.filter((_, i) => i !== index)
    });
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-charcoal">Personal Information</h3>
          <motion.button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
            whileHover={{ scale: 1.05 }}
          >
            <Edit className="h-4 w-4" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-charcoal font-medium">{profile.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-charcoal font-medium">{profile.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-charcoal font-medium">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-charcoal font-medium">{profile.phone}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <motion.button
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Changes
            </motion.button>
          </div>
        )}
      </div>

      {/* Travel Companions */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-charcoal flex items-center">
            <span className="text-2xl mr-2">🐕</span>
            Travel Companions
          </h3>
          <motion.button
            onClick={addPet}
            className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg font-medium hover:bg-orange-200 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Pet</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          {profile.pets.map((pet, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Pet name"
                  value={pet.name}
                  onChange={(e) => {
                    const newPets = [...profile.pets];
                    newPets[index].name = e.target.value;
                    setProfile({ ...profile, pets: newPets });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={pet.type}
                  onChange={(e) => {
                    const newPets = [...profile.pets];
                    newPets[index].type = e.target.value;
                    setProfile({ ...profile, pets: newPets });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Breed (optional)"
                  value={pet.breed}
                  onChange={(e) => {
                    const newPets = [...profile.pets];
                    newPets[index].breed = e.target.value;
                    setProfile({ ...profile, pets: newPets });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <motion.button
                onClick={() => removePet(index)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
        <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-teal-600" />
          Adventure Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
            <div className="text-3xl font-bold text-teal-600">{mockTrips.length}</div>
            <div className="text-sm text-teal-700">Total Adventures</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
            <div className="text-3xl font-bold text-orange-600">
              {mockTrips.filter(trip => trip.status === 'completed').length}
            </div>
            <div className="text-sm text-orange-700">Completed Trips</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600">
              {mockTrips.filter(trip => trip.status === 'upcoming').length}
            </div>
            <div className="text-sm text-purple-700">Upcoming Adventures</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
      <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center">
        <span className="text-2xl mr-2">♿</span>
        Accessibility Profile
      </h3>
      
      <p className="text-gray-600 mb-6">
        Help us find campsites that meet your accessibility needs. This information helps our AI provide better recommendations.
      </p>

      <div className="space-y-6">
        {[
          { key: 'mobilityAccessible', label: 'Mobility Accessibility', icon: '♿', description: 'Wheelchair accessible paths, bathrooms, and facilities' },
          { key: 'visuallyAccessible', label: 'Visual Accessibility', icon: '👁️', description: 'Braille signage, audio guides, and tactile markers' },
          { key: 'hearingAccessible', label: 'Hearing Accessibility', icon: '👂', description: 'Visual alerts, sign language services, and hearing loops' },
          { key: 'cognitiveAccessible', label: 'Cognitive Accessibility', icon: '🧠', description: 'Clear signage, simple navigation, and quiet spaces' }
        ].map((item) => (
          <div key={item.key} className="p-4 border border-gray-200 rounded-xl">
            <label className="flex items-start space-x-4 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.preferences.accessibilityNeeds[item.key as keyof typeof profile.preferences.accessibilityNeeds]}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: {
                    ...profile.preferences,
                    accessibilityNeeds: {
                      ...profile.preferences.accessibilityNeeds,
                      [item.key]: e.target.checked
                    }
                  }
                })}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-charcoal">{item.label}</span>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Camping Styles */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
        <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center">
          <span className="text-2xl mr-2">🏕️</span>
          Camping Style Preferences
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {campingStyles.map((style) => (
            <motion.label
              key={style}
              className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer transition-all ${
                profile.preferences.campingStyle.includes(style)
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={profile.preferences.campingStyle.includes(style)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        campingStyle: [...profile.preferences.campingStyle, style]
                      }
                    });
                  } else {
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        campingStyle: profile.preferences.campingStyle.filter(s => s !== style)
                      }
                    });
                  }
                }}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium">{style}</span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Equipment Owned */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
        <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center">
          <span className="text-2xl mr-2">🎒</span>
          Equipment You Own
        </h3>
        
        <p className="text-gray-600 mb-4">
          Let us know what camping equipment you already have. This helps us recommend campsites and suggest what to bring.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {equipment.map((item) => (
            <motion.label
              key={item}
              className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer transition-all ${
                profile.preferences.equipmentOwned.includes(item)
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 hover:border-teal-300 hover:bg-teal-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={profile.preferences.equipmentOwned.includes(item)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        equipmentOwned: [...profile.preferences.equipmentOwned, item]
                      }
                    });
                  } else {
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        equipmentOwned: profile.preferences.equipmentOwned.filter(e => e !== item)
                      }
                    });
                  }
                }}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium">{item}</span>
            </motion.label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
      <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center">
        <Bell className="h-6 w-6 mr-2 text-blue-600" />
        Notification Preferences
      </h3>
      
      <div className="space-y-6">
        {[
          { key: 'weather', label: 'Weather Alerts', icon: '🌤️', description: 'Get notified about weather changes for your upcoming trips' },
          { key: 'bookingReminders', label: 'Booking Reminders', icon: '📅', description: 'Reminders about upcoming check-ins and important dates' },
          { key: 'deals', label: 'Special Offers', icon: '💰', description: 'Notifications about discounts and special camping deals' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-medium text-charcoal">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <motion.label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.preferences.notifications[item.key as keyof typeof profile.preferences.notifications]}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: {
                    ...profile.preferences,
                    notifications: {
                      ...profile.preferences.notifications,
                      [item.key]: e.target.checked
                    }
                  }
                })}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${
                profile.preferences.notifications[item.key as keyof typeof profile.preferences.notifications]
                  ? 'bg-orange-500'
                  : 'bg-gray-300'
              }`}>
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md m-0.5"
                  animate={{
                    x: profile.preferences.notifications[item.key as keyof typeof profile.preferences.notifications] ? 20 : 0
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </motion.label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-orange-50 to-yellow-50 pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-32 right-10 text-6xl opacity-10"
        >
          👤
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 left-10 text-5xl opacity-10"
        >
          ⚙️
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-xl opacity-90">Outdoor Adventure Enthusiast</p>
                <p className="opacity-80">{profile.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-orange-200">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md'
                    : 'text-teal-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{tab.emoji}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'accessibility' && renderAccessibilityTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;