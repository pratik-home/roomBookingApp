import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimeSlotSelector from './TimeSlotSelector';

const BookingForm = ({ roomId, selectedDate, bookings, accessToken , setDetails}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [reset, setReset] = useState(false);

  const handleSelectTimeSlots = (start, end) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleBooking = async () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    const response = await axios.post('http://localhost:5000/book', {
      roomID: roomId,
      startTime,
      endTime,
      date
    },{
      headers: {
        Authorization: accessToken
      }
    });

    if (response.data.success) {
        setDetails(prevDetails => ({
          ...prevDetails,
          bookings: [...prevDetails.bookings, {
            date: date,
            startTime: startTime,
            endTime: endTime,
            accessToken: accessToken
          }]
        }));
      setMessage('Room booked successfully');
      setReset(true); // Reset the selected time slots
    } else {
      setMessage(response.data.message);
    }
  };

  useEffect(() => {
    if (reset) {
      setStartTime('');
      setEndTime('');
      setReset(false);
    }
  }, [reset]);

  return (
    <div>
      <h3>Book Room for {selectedDate.toDateString()}</h3>
      <TimeSlotSelector onSelectTimeSlots={handleSelectTimeSlots} bookings={bookings} accessToken={accessToken} reset={reset} />
      <div>
        <p>Selected Time: {startTime} - {endTime}</p>
        <button onClick={handleBooking}>Book</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default BookingForm;
