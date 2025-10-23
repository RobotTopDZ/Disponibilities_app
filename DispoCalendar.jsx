import React, { useState, useEffect } from 'react';
import disponibilitiesData from './disponibilities.json';

const DispoCalendar = () => {
  const [processedData, setProcessedData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

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

        // Mark blocked periods and add 1-hour buffer before courses
        day.slots.forEach(slot => {
          if (slot.availability === "BLOCKED" || slot.event_type === "Break") {
            const startHour = parseInt(slot.start_time.split(':')[0]);
            const endHour = parseInt(slot.end_time.split(':')[0]);
            
            // Block the course time
            for (let hour = startHour; hour < endHour; hour++) {
              const timeKey = `${hour.toString().padStart(2, '0')}:00`;
              if (dayAvailability[timeKey] !== undefined) {
                dayAvailability[timeKey] = false;
              }
            }
            
            // Add 1-hour buffer before course (only for courses, not breaks)
            if (slot.event_type === "COURSE" && startHour > 8) {
              const bufferHour = startHour - 1;
              const bufferTimeKey = `${bufferHour.toString().padStart(2, '0')}:00`;
              if (dayAvailability[bufferTimeKey] !== undefined) {
                dayAvailability[bufferTimeKey] = false;
              }
            }
          }
        });

        return {
          ...day,
          availability: dayAvailability,
          availableCount: Object.values(dayAvailability).filter(Boolean).length
        };
      });
      
      setProcessedData(processedDays);
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
      {/* Header */}
      <div className={`shadow-sm border-b transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className={`text-2xl lg:text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Calendrier de Disponibilités
                </h1>
                <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  KHALDI Oussama • {getTotalAvailableHours()} heures disponibles cette semaine
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={darkMode ? 'Mode clair' : 'Mode sombre'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Export Button */}
              <button
                onClick={exportSchedule}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                    : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-300'
                }`}
              >
                📥 Exporter
              </button>

              {/* Navigation */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={prevWeek}
                  disabled={currentWeekStart === 0}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-600 disabled:hover:bg-transparent' 
                      : 'text-gray-600 hover:bg-white disabled:hover:bg-transparent'
                  }`}
                >
                  ← Précédent
                </button>
                <button
                  onClick={resetToToday}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={nextWeek}
                  disabled={currentWeekStart + 7 >= processedData.length}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-600 disabled:hover:bg-transparent' 
                      : 'text-gray-600 hover:bg-white disabled:hover:bg-transparent'
                  }`}
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`rounded-xl p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-green-600 dark:text-green-400">✅</span>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Heures disponibles</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{getTotalAvailableHours()}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-blue-600 dark:text-blue-400">📅</span>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jours affichés</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{visibleDays.length}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-purple-600 dark:text-purple-400">⏰</span>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Créneaux horaires</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{timeSlots.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Days Header */}
          <div className={`grid grid-cols-8 border-b transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`p-3 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Heure</div>
            {visibleDays.map((day) => (
              <div key={day.date} className="p-3 text-center">
                <div className={`text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(day.date)}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {day.availableCount || 0}h libres
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className={`grid grid-cols-8 border-b transition-all duration-300 hover:bg-opacity-50 ${
                darkMode 
                  ? 'border-gray-700 hover:bg-gray-700' 
                  : 'border-gray-100 hover:bg-gray-50'
              }`}>
                <div className={`p-3 text-sm font-medium border-r transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-300 bg-gray-700 border-gray-600' 
                    : 'text-gray-700 bg-gray-50 border-gray-200'
                }`}>
                  {time}
                </div>
                {visibleDays.map((day, dayIndex) => (
                  <div key={`${day.date}-${time}`} className={`p-2 border-r transition-colors duration-300 ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                    <div 
                      className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-105 ${
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
                      {day.availability && day.availability[time] ? '✓' : '✕'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className={`mt-6 p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}></div>
              <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Disponible
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
              <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Non disponible
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600 dark:text-blue-400">💡</span>
              <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Cliquez sur un créneau pour plus d'infos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispoCalendar;
