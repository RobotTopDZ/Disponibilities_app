import React, { useState, useEffect } from 'react';
import disponibilitiesData from './disponibilities.json';

const DispoCalendar = () => {
  const [processedData, setProcessedData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [showDateInfo, setShowDateInfo] = useState(null);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  useEffect(() => {
    setLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const processedDays = disponibilitiesData.schedule_availability.map(day => {
        const dayAvailability = {};
        
        // Initialize all time slots as available
        timeSlots.forEach(time => {
          dayAvailability[time] = true;
        });

        // Mark blocked periods and add buffer hours
        day.slots.forEach(slot => {
          if (slot.availability === "BLOCKED" || slot.event_type === "Break") {
            const startHour = parseInt(slot.start_time.split(':')[0]);
            const endHour = parseInt(slot.end_time.split(':')[0]);
            
            // Block the actual time period
            for (let hour = startHour; hour < endHour; hour++) {
              const timeKey = `${hour.toString().padStart(2, '0')}:00`;
              if (dayAvailability[timeKey] !== undefined) {
                dayAvailability[timeKey] = false;
              }
            }
            
            // Add 1-hour buffer BEFORE non-available period
            if (startHour > 8) {
              const bufferBeforeHour = startHour - 1;
              const bufferBeforeKey = `${bufferBeforeHour.toString().padStart(2, '0')}:00`;
              if (dayAvailability[bufferBeforeKey] !== undefined) {
                dayAvailability[bufferBeforeKey] = false;
              }
            }
            
            // Add 1-hour buffer AFTER non-available period (especially for courses)
            if (endHour < 22) {
              const bufferAfterHour = endHour;
              const bufferAfterKey = `${bufferAfterHour.toString().padStart(2, '0')}:00`;
              if (dayAvailability[bufferAfterKey] !== undefined) {
                dayAvailability[bufferAfterKey] = false;
              }
            }
          }
        });

        // Find all course blocks and add additional buffer after the last course of the day
        const courseSlots = day.slots.filter(slot => 
          slot.availability === "BLOCKED" && slot.event_type !== "Break"
        );
        
        if (courseSlots.length > 0) {
          // Find the latest end time of all courses
          const latestCourseEnd = Math.max(...courseSlots.map(slot => 
            parseInt(slot.end_time.split(':')[0])
          ));
          
          // Add additional buffer after the last course
          if (latestCourseEnd < 21) {
            const additionalBufferKey = `${(latestCourseEnd + 1).toString().padStart(2, '0')}:00`;
            if (dayAvailability[additionalBufferKey] !== undefined) {
              dayAvailability[additionalBufferKey] = false;
            }
          }
        }

        return {
          ...day,
          availability: dayAvailability,
          availableCount: Object.values(dayAvailability).filter(Boolean).length
        };
      });
      
      setProcessedData(processedDays);
      
      // Auto-navigate to today's date
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const todayIndex = processedDays.findIndex(day => day.date === today);
      
      if (todayIndex !== -1) {
        // Calculate which week contains today
        const weekStart = Math.floor(todayIndex / 7) * 7;
        setCurrentWeekStart(weekStart);
      }
      
      setLoading(false);
    }, 800);
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      weekday: 'long', 
      day: 'numeric',
      month: 'short'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const handleDayClick = (day) => {
    setShowDateInfo(showDateInfo === day.date ? null : day.date);
  };

  const nextWeek = () => {
    if (currentWeekStart + 7 < processedData.length) {
      setCurrentWeekStart(currentWeekStart + 7);
    }
  };

  const prevWeek = () => {
    if (currentWeekStart - 7 >= 0) {
      setCurrentWeekStart(currentWeekStart - 7);
    }
  };

  const resetToToday = () => {
    setCurrentWeekStart(0);
  };

  const exportSchedule = () => {
    const data = visibleDays.map(day => ({
      date: day.date,
      day: day.day,
      availableHours: timeSlots.filter(time => day.availability?.[time]).length,
      availableSlots: timeSlots.filter(time => day.availability?.[time])
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disponibilites.json';
    a.click();
  };

  const getTotalAvailableHours = () => {
    return visibleDays.reduce((total, day) => total + (day.availableCount || 0), 0);
  };

  const visibleDays = processedData.slice(currentWeekStart, currentWeekStart + 7);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Chargement du calendrier...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header - Mobile Optimized */}
      <div className={`shadow-sm border-b transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Title */}
            <div className="text-center sm:text-left">
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Calendrier de Disponibilités
              </h1>
              <p className={`text-sm sm:text-base lg:text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                KHALDI Oussama
              </p>
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {getTotalAvailableHours()}h disponibles cette semaine
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Theme and Export */}
              <div className="flex gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {darkMode ? 'Clair' : 'Sombre'}
                </button>

                <button
                  onClick={exportSchedule}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                      : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Exporter
                </button>
              </div>

              {/* Navigation */}
              <div className={`flex items-center gap-1 rounded-lg p-1 mx-auto sm:mx-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={prevWeek}
                  disabled={currentWeekStart === 0}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-600 disabled:hover:bg-transparent' 
                      : 'text-gray-600 hover:bg-white disabled:hover:bg-transparent'
                  }`}
                >
                  ← Préc
                </button>
                <button
                  onClick={resetToToday}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={nextWeek}
                  disabled={currentWeekStart + 7 >= processedData.length}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-600 disabled:hover:bg-transparent' 
                      : 'text-gray-600 hover:bg-white disabled:hover:bg-transparent'
                  }`}
                >
                  Suiv →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-center sm:flex sm:items-center sm:gap-3">
              <div className={`hidden sm:block p-2 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <div className={`w-4 h-4 rounded ${darkMode ? 'bg-green-400' : 'bg-green-600'}`}></div>
              </div>
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disponibles</p>
                <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getTotalAvailableHours()}h</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-center sm:flex sm:items-center sm:gap-3">
              <div className={`hidden sm:block p-2 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <div className={`w-4 h-4 rounded ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
              </div>
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jours</p>
                <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{visibleDays.length}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-center sm:flex sm:items-center sm:gap-3">
              <div className={`hidden sm:block p-2 rounded-lg ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <div className={`w-4 h-4 rounded ${darkMode ? 'bg-purple-400' : 'bg-purple-600'}`}></div>
              </div>
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Créneaux</p>
                <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{timeSlots.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid - Mobile Optimized */}
        <div className={`rounded-lg sm:rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Days Header */}
          <div className={`grid grid-cols-8 border-b transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`p-2 sm:p-3 text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Heure</div>
            {visibleDays.map((day) => (
              <div 
                key={day.date} 
                className={`p-1 sm:p-3 text-center cursor-pointer transition-all duration-300 hover:bg-opacity-80 ${
                  isToday(day.date) 
                    ? darkMode 
                      ? 'bg-green-900 hover:bg-green-800' 
                      : 'bg-green-100 hover:bg-green-200'
                    : darkMode 
                      ? 'hover:bg-gray-600' 
                      : 'hover:bg-gray-100'
                }`}
                onClick={() => handleDayClick(day)}
                title="Cliquez pour voir la date complète"
              >
                <div className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  isToday(day.date)
                    ? darkMode ? 'text-green-300' : 'text-green-800'
                    : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="hidden sm:block">{formatDate(day.date)}</div>
                  <div className="sm:hidden">{day.day.slice(0, 3)}</div>
                  {isToday(day.date) && (
                    <div className="text-xs font-bold">Today</div>
                  )}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  isToday(day.date)
                    ? darkMode ? 'text-green-400' : 'text-green-700'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {day.availableCount || 0}h
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className={`grid grid-cols-8 border-b transition-all duration-300 hover:bg-opacity-50 ${
                darkMode 
                  ? 'border-gray-700 hover:bg-gray-700' 
                  : 'border-gray-100 hover:bg-gray-50'
              }`}>
                <div className={`p-2 sm:p-3 text-xs sm:text-sm font-medium border-r transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-300 bg-gray-700 border-gray-600' 
                    : 'text-gray-700 bg-gray-50 border-gray-200'
                }`}>
                  {time}
                </div>
                {visibleDays.map((day, dayIndex) => (
                  <div key={`${day.date}-${time}`} className={`p-1 sm:p-2 border-r transition-colors duration-300 ${
                    isToday(day.date)
                      ? darkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'
                      : darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                    <div 
                      className={`h-6 sm:h-8 rounded text-xs font-medium flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                        day.availability && day.availability[time]
                          ? darkMode 
                            ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                          : darkMode 
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedDate(`${day.date}-${time}`)}
                    >
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                        day.availability && day.availability[time]
                          ? darkMode ? 'bg-green-400' : 'bg-green-600'
                          : darkMode ? 'bg-gray-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Date Info Popup */}
        {showDateInfo && (
          <div className={`mt-4 p-4 rounded-lg shadow-lg border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
            <div className="text-center">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatFullDate(showDateInfo)}
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {visibleDays.find(day => day.date === showDateInfo)?.availableCount || 0} heures disponibles
              </p>
              <button
                onClick={() => setShowDateInfo(null)}
                className={`mt-2 px-3 py-1 text-xs rounded transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Legend - Mobile Optimized */}
        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-600'}`}></div>
              <span className={`text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Disponible
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
              <span className={`text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Non disponible
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
              <span className={`text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Cliquez sur jour pour date
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispoCalendar;
