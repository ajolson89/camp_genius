import React, { useState } from 'react';
import { X, Calendar, Users, Tent, Truck, Home, CreditCard } from 'lucide-react';
import { Campsite, BookingData } from '../types';

interface BookingModalProps {
  campsite: Campsite | null;
  onClose: () => void;
  onBookingComplete: (booking: BookingData) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ campsite, onClose, onBookingComplete }) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    checkIn: '',
    checkOut: '',
    partySize: 2,
    equipmentType: 'tent',
    contactInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    specialRequests: ''
  });

  if (!campsite) return null;

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('contactInfo.')) {
      const contactField = field.split('.')[1];
      setBookingData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo!,
          [contactField]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const equipmentType = bookingData.equipmentType || 'tent';
    const pricePerNight = campsite.pricing[equipmentType];
    return nights * pricePerNight;
  };

  const handleSubmit = () => {
    const completeBooking: BookingData = {
      campsite,
      checkIn: bookingData.checkIn!,
      checkOut: bookingData.checkOut!,
      partySize: bookingData.partySize!,
      equipmentType: bookingData.equipmentType!,
      contactInfo: bookingData.contactInfo!,
      specialRequests: bookingData.specialRequests!
    };
    onBookingComplete(completeBooking);
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'tent': return <Tent className="h-5 w-5" />;
      case 'rv': return <Truck className="h-5 w-5" />;
      case 'cabin': return <Home className="h-5 w-5" />;
      default: return <Tent className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Book Your Stay</h3>
            <p className="text-sm text-gray-600">{campsite.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 ml-2 ${
                    step > num ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Dates & Details</span>
            <span>Contact Info</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Dates & Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => handleInputChange('checkIn', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => handleInputChange('checkOut', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      value={bookingData.partySize}
                      onChange={(e) => handleInputChange('partySize', parseInt(e.target.value))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                        <option key={size} value={size}>
                          {size} {size === 1 ? 'Person' : 'People'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['tent', 'rv', 'cabin'].map((type) => (
                      campsite.pricing[type as keyof typeof campsite.pricing] > 0 && (
                        <button
                          key={type}
                          onClick={() => handleInputChange('equipmentType', type)}
                          className={`flex flex-col items-center p-3 border rounded-md transition-colors ${
                            bookingData.equipmentType === type
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {getEquipmentIcon(type)}
                          <span className="text-xs mt-1 capitalize">{type}</span>
                          <span className="text-xs text-gray-500">
                            ${campsite.pricing[type as keyof typeof campsite.pricing]}
                          </span>
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requests or accessibility needs?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              {bookingData.checkIn && bookingData.checkOut && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span>{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per night:</span>
                      <span>${campsite.pricing[bookingData.equipmentType || 'tent']}</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
                      <span>Total:</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={bookingData.contactInfo?.firstName}
                    onChange={(e) => handleInputChange('contactInfo.firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={bookingData.contactInfo?.lastName}
                    onChange={(e) => handleInputChange('contactInfo.lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={bookingData.contactInfo?.email}
                  onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingData.contactInfo?.phone}
                  onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Payment Summary</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>{campsite.name}</span>
                    <span>{calculateNights()} nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment: {bookingData.equipmentType}</span>
                    <span>${campsite.pricing[bookingData.equipmentType || 'tent']}/night</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-900 pt-2 border-t border-green-200">
                    <span>Total Amount:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  In a real application, this would integrate with a payment processor like Stripe.
                </p>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Complete Booking
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={step > 1 ? () => setStep(step - 1) : onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {step > 1 ? 'Previous' : 'Cancel'}
          </button>
          
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;