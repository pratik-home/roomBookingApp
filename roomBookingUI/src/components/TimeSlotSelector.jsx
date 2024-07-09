import React, { useEffect, useState } from 'react';

const TimeSlotSelector = ({ onSelectTimeSlots, bookings, accessToken, reset }) => {
  const startHour = 10;
  const numberOfSlots = 18;

  const timeSlots = Array.from({ length: numberOfSlots }, (_, i) => {
    const startHours = String(startHour + Math.floor(i / 2)).padStart(2, '0');
    const startMinutes = i % 2 === 0 ? '00' : '30';
    const endHours = String(startHour + Math.floor((i + 1) / 2)).padStart(2, '0');
    const endMinutes = (i + 1) % 2 === 0 ? '00' : '30';
    return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
  });

  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    if (reset) {
      setSelectedSlots([]);
    }
  }, [reset]);

  const toggleTimeSlot = (slot, index) => {
    setSelectedSlots((prevSelectedSlots) => {
      if (prevSelectedSlots.includes(slot)) {
        return prevSelectedSlots.filter(s => s !== slot);
      } else {
        if (prevSelectedSlots.length === 0) {
          return [slot];
        }

        const lastIndex = timeSlots.indexOf(prevSelectedSlots[prevSelectedSlots.length - 1]);
        const firstIndex = timeSlots.indexOf(prevSelectedSlots[0]);

        if (index === lastIndex + 1 || index === firstIndex - 1) {
          return [...prevSelectedSlots, slot].sort((a, b) => timeSlots.indexOf(a) - timeSlots.indexOf(b));
        } else {
          return [slot]; 
        }
      }
    });
  };

  const isBooked = (slot) => {
    const [slotStart, slotEnd] = slot.split(' - ');
    const slotStartTime = slotStart.replace(':', '');
    const slotEndTime = slotEnd.replace(':', '');
    
    return bookings.some(booking => {
      const bookingStartTime = booking.startTime.replace(':', '');
      const bookingEndTime = booking.endTime.replace(':', '');

      return (
        (slotStartTime >= bookingStartTime && slotStartTime < bookingEndTime) ||
        (slotEndTime > bookingStartTime && slotEndTime <= bookingEndTime)
      );
    });
  };

  useEffect(()=>{
    if (selectedSlots.length > 0) {
      const startTime = selectedSlots[0].split(' - ')[0];
      const endTime = selectedSlots.length > 1
        ? selectedSlots[selectedSlots.length - 1].split(' - ')[1]
        : selectedSlots[0].split(' - ')[1];
      onSelectTimeSlots(startTime, endTime);
    }
  },[selectedSlots])

  const isMyBooking = (slot) => {
    const [slotStart, slotEnd] = slot.split(' - ');
    const slotStartTime = slotStart.replace(':', '');
    const slotEndTime = slotEnd.replace(':', '');

    return bookings.some(booking => {
      const bookingStartTime = booking.startTime.replace(':', '');
      const bookingEndTime = booking.endTime.replace(':', '');

      return (
        booking.accessToken === accessToken &&
        (
          (slotStartTime >= bookingStartTime && slotStartTime < bookingEndTime) ||
          (slotEndTime > bookingStartTime && slotEndTime <= bookingEndTime)
        )
      );
    });
  };

  return (
    <div className="timeslot-selector">
      {timeSlots.map((slot, index) => (
        <div
          key={index}
          className={`timeslot ${selectedSlots.includes(slot) ? 'selected' : ''} ${isMyBooking(slot) ? 'my-booking' : ''} ${isBooked(slot) && !isMyBooking(slot) ? 'booked' : ''}`}
          onClick={() => !isBooked(slot) && toggleTimeSlot(slot, index)}
        >
          {slot}
        </div>
      ))}
    </div>
  );
};

export default TimeSlotSelector;
