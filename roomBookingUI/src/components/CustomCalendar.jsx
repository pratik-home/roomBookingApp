import React from 'react';

const CustomCalendar = ({ bookings, onSelectDate, selectedDate, accessToken}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isFullyBooked = (date) => {
    const dayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getDate() === date &&
             bookingDate.getMonth() === currentMonth &&
             bookingDate.getFullYear() === currentYear;
    });

    const bookedSlots = new Set();
    dayBookings.forEach(booking => {
      let start = parseInt(booking.startTime.replace(':', ''), 10);
      let end = parseInt(booking.endTime.replace(':', ''), 10);
      while (start < end) {
        bookedSlots.add(start);
        start += (start % 100 === 30) ? 70 : 30; 
      }
    });

    return bookedSlots.size === 18; 
  };

  const isSelectedDate = (date) => {
    return selectedDate && date === selectedDate.getDate() &&
           currentMonth === selectedDate.getMonth() &&
           currentYear === selectedDate.getFullYear();
  };

  const isUserBooking = (date) => {
    return bookings.some(booking => {
      const bookingDate = new Date(booking.date).getDate();
      return bookingDate === date && booking.accessToken === accessToken;
    });
  };

  return (
    <div className="calendar">
      {dates.map(date => (
        <div 
            key={date} 
            className={`calendar-day ${isSelectedDate(date) ? 'selected' : ''} ${isUserBooking(date) ? 'user-booked' : ''} ${isFullyBooked(date) ? 'booked' : ''}`}
            onClick={() => onSelectDate(new Date(currentYear, currentMonth, date))}
        >
          {date}
        </div>
      ))}
    </div>
  );
};

export default CustomCalendar;
