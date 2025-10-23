import React, { useState, useEffect } from 'react';
import disponibilitiesData from './disponibilities.json';

const DispoCalendar = () => {
  const [processedData, setProcessedData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  useEffect(() => {
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
        availability: dayAvailability
      };
    });
    
    setProcessedData(processedDays);
  }, []);

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

  const visibleDays = processedData.slice(currentWeekStart, currentWeekStart + 7);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Calendrier de Disponibilités
              </h1>
              <p className="text-gray-600 text-sm">KHALDI Oussama</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={prevWeek}
                disabled={currentWeekStart === 0}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                ← Précédent
              </button>
              <button
                onClick={resetToToday}
                className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                Aujourd'hui
              </button>
              <button
                onClick={nextWeek}
                disabled={currentWeekStart + 7 >= processedData.length}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b bg-gray-50">
            <div className="p-3 text-sm font-medium text-gray-500">Heure</div>
            {visibleDays.map((day) => (
              <div key={day.date} className="p-3 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(day.date)}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50">
              <div className="p-3 text-sm font-medium text-gray-700 bg-gray-50 border-r">
                {time}
              </div>
              {visibleDays.map((day) => (
                <div key={`${day.date}-${time}`} className="p-2 border-r border-gray-100">
                  <div className={`h-8 rounded text-xs font-medium flex items-center justify-center ${
                    day.availability && day.availability[time]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {day.availability && day.availability[time] ? 'Disponible' : 'Non disponible'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-sm text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-sm text-gray-600">Non disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispoCalendar;
