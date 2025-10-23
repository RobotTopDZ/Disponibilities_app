import React, { useState, useEffect } from 'react';
import disponibilitiesData from './disponibilities.json';

const DispoCalendar = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  useEffect(() => {
    const processedData = disponibilitiesData.schedule_availability.map(day => {
      const availableSlots = day.slots.filter(slot => 
        slot.availability === "DISPONIBLE" && slot.event_type !== "Buffer"
      );
      
      return {
        ...day,
        availableSlots,
        hasAvailability: availableSlots.length > 0
      };
    });
    
    setFilteredData(processedData);
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const formatTime = (timeStr) => {
    return timeStr.replace(':', 'h');
  };

  const getEventTypeDisplay = (eventType) => {
    const eventTypeMap = {
      'Weekend': 'Weekend',
      'ALTERNANCE / PROJET TUTORE': 'Alternance / Projet Tutoré',
      'No class': 'Pas de cours',
      'Break': 'Pause déjeuner',
      'SOUTENANCE PROJETS TUTORES': 'Soutenance Projets Tutorés',
      'PAS DE COURS': 'Pas de cours'
    };
    return eventTypeMap[eventType] || eventType;
  };

  const nextWeek = () => {
    if (currentWeekStart + 7 < filteredData.length) {
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

  const visibleDays = filteredData.slice(currentWeekStart, currentWeekStart + 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Mon Calendrier de Disponibilités Pro
              </h1>
              <p className="text-slate-600 text-sm mt-1">KHALDI Oussama</p>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevWeek}
                disabled={currentWeekStart === 0}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={resetToToday}
                className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={nextWeek}
                disabled={currentWeekStart + 7 >= filteredData.length}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {visibleDays.map((day, index) => (
            <div
              key={day.date}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  {formatDate(day.date)}
                </h2>
              </div>

              {/* Day Content */}
              <div className="p-6">
                {day.hasAvailability ? (
                  <div className="space-y-3">
                    {day.availableSlots.map((slot, slotIndex) => (
                      <div
                        key={slotIndex}
                        className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        {/* Status Indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>

                        {/* Time and Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <span className="font-semibold text-green-800">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                              <span className="ml-3 text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                Disponible
                              </span>
                            </div>
                            <div className="text-sm text-slate-600">
                              {getEventTypeDisplay(slot.event_type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      Aucune disponibilité ce jour
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Affichage des créneaux disponibles uniquement • 
            Les périodes de récupération après cours ne sont pas affichées
          </p>
        </div>
      </div>
    </div>
  );
};

export default DispoCalendar;
