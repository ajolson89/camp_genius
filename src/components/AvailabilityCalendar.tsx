import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface AvailabilityData {
  tent: number;
  rv: number;
  cabin: number;
}

interface AvailabilityCalendarProps {
  availability: { [date: string]: AvailabilityData };
  onDateSelect?: (date: string) => void;
  selectedDates?: string[];
  className?: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  onDateSelect,
  selectedDates = [],
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getAvailabilityStatus = (date: Date) => {
    const dateStr = formatDate(date);
    const dayAvailability = availability[dateStr];
    
    if (!dayAvailability) return 'unavailable';
    
    const totalAvailable = dayAvailability.tent + dayAvailability.rv + dayAvailability.cabin;
    if (totalAvailable === 0) return 'unavailable';
    if (totalAvailable <= 5) return 'limited';
    return 'available';
  };

  const getAvailabilityColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'bg-orange-500 text-white border-orange-600';
    
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'unavailable':
        return 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
      default:
        return 'bg-gray-50 text-gray-300 border-gray-200';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    const status = getAvailabilityStatus(date);
    if (status !== 'unavailable' && onDateSelect) {
      onDateSelect(formatDate(date));
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Availability Calendar</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          
          <span className="text-lg font-medium text-gray-900 min-w-[140px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2"></div>;
          }

          const dateStr = formatDate(date);
          const status = getAvailabilityStatus(date);
          const isSelected = selectedDates.includes(dateStr);
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          const dayAvailability = availability[dateStr];

          return (
            <motion.button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={status === 'unavailable' || isPast}
              className={`
                relative p-2 text-sm font-medium border rounded-lg transition-all duration-200
                ${isPast ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 
                  getAvailabilityColor(status, isSelected)}
                ${isToday(date) && !isPast ? 'ring-2 ring-orange-300' : ''}
              `}
              whileHover={status !== 'unavailable' && !isPast ? { scale: 1.05 } : {}}
              whileTap={status !== 'unavailable' && !isPast ? { scale: 0.95 } : {}}
            >
              <div className="text-center">
                {date.getDate()}
                {isToday(date) && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </div>
              
              {/* Availability indicators */}
              {dayAvailability && !isPast && (
                <div className="flex justify-center space-x-0.5 mt-1">
                  {dayAvailability.tent > 0 && (
                    <div className="w-1 h-1 bg-green-500 rounded-full" title={`${dayAvailability.tent} tent sites`}></div>
                  )}
                  {dayAvailability.rv > 0 && (
                    <div className="w-1 h-1 bg-blue-500 rounded-full" title={`${dayAvailability.rv} RV sites`}></div>
                  )}
                  {dayAvailability.cabin > 0 && (
                    <div className="w-1 h-1 bg-purple-500 rounded-full" title={`${dayAvailability.cabin} cabins`}></div>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span className="text-gray-600">Limited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Unavailable</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
          </div>
          <span className="text-gray-600">⛺ RV 🏠</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;