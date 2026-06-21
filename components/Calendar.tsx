import React, { useState, useEffect } from 'react';

// Segédfüggvények a dátumokhoz
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

interface CalendarProps {
  selectedDate: Date | null;
  endDate: Date | null;
  onDateClick: (date: Date) => void;
  occupiedDates?: { startDate: string; endDate: string }[];
  tolerance?: number;
}

export default function Calendar({ selectedDate, endDate, onDateClick, occupiedDates, tolerance = 0 }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, []);

  // While waiting for the client to set the date, render a placeholder
  if (currentMonth === null || currentYear === null) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100 min-h-[350px]">
        {/* Placeholder to prevent layout shift */}
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const blanks = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const monthNames = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentMonthView = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  const isOccupiedDate = (checkDate: Date) => {
    if (!occupiedDates) return false;
    const checkTime = checkDate.getTime();
    const toleranceOffset = tolerance * 24 * 60 * 60 * 1000;

    for (const range of occupiedDates) {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // Bloat interval is [start, end + tolerance - 1 day]
      if (checkTime >= start.getTime() && checkTime < (end.getTime() + toleranceOffset)) {
        return true;
      }
    }
    return false;
  };

  const isPastOrOccupied = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);

    // 1. Past days
    if (checkDate < today) return true;

    // 2. Already occupied days
    if (isOccupiedDate(checkDate)) return true;

    return false;
  };

  const isValidCheckoutDate = (day: number) => {
    if (!selectedDate || endDate) return true;

    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);
    const checkDateTime = checkDate.getTime();
    const selectedDateTime = selectedDate.getTime();

    // Check-out cannot be before or equal to check-in
    if (checkDateTime <= selectedDateTime) return false;

    // Find the first booking start date after selectedDate
    let nextBookingStart: number | null = null;
    if (occupiedDates) {
      for (const range of occupiedDates) {
        const start = new Date(range.startDate);
        start.setHours(0, 0, 0, 0);
        const startTime = start.getTime();

        if (startTime > selectedDateTime) {
          if (nextBookingStart === null || startTime < nextBookingStart) {
            nextBookingStart = startTime;
          }
        }
      }
    }

    if (nextBookingStart !== null) {
      const toleranceOffset = tolerance * 24 * 60 * 60 * 1000;
      const checkOutLimit = nextBookingStart - toleranceOffset;
      if (checkDateTime > checkOutLimit) {
        return false;
      }
    }

    return true;
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (isPastOrOccupied(day)) return;
    onDateClick(clickedDate);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const current = new Date(currentYear, currentMonth, day);
    current.setHours(0, 0, 0, 0);
    
    const startCompare = new Date(selectedDate);
    startCompare.setHours(0, 0, 0, 0);

    if (endDate) {
      const endCompare = new Date(endDate);
      endCompare.setHours(0, 0, 0, 0);
      return current >= startCompare && current <= endCompare;
    }
    return current.getTime() === startCompare.getTime();
  };

  const handlePrevMonth = () => {
    if (isCurrentMonthView) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev! - 1);
    } else {
      setCurrentMonth(prev => prev! - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev! + 1);
    } else {
      setCurrentMonth(prev => prev! + 1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100 min-h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handlePrevMonth} 
          disabled={isCurrentMonthView}
          className={`p-2 rounded-full transition ${isCurrentMonthView ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-stone-100 text-stone-600'}`}
        >
          ←
        </button>
        <h3 className="text-xl font-serif font-bold text-emerald-900">{currentYear} {monthNames[currentMonth]}</h3>
        <button 
          onClick={handleNextMonth} 
          className="p-2 hover:bg-stone-100 rounded-full transition text-stone-600"
        >
          →
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-stone-400 uppercase tracking-wider">
        {['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'].map(d => <div key={d}>{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="h-10"></div>)}
        {days.map(day => {
          const disabled = isPastOrOccupied(day);
          const validCheckout = isValidCheckoutDate(day);
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={`
                h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 cursor-pointer
                ${disabled 
                  ? 'text-stone-300 cursor-not-allowed bg-transparent'
                  : isSelected(day) 
                  ? 'bg-emerald-800 text-white shadow-lg scale-105 font-semibold' 
                  : selectedDate && !endDate && !validCheckout
                  ? 'text-stone-400 hover:bg-emerald-50 hover:text-emerald-800'
                  : 'hover:bg-emerald-50 text-stone-600 hover:text-emerald-800'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
