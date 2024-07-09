import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components'
import BookingForm from './BookingForm';
import CustomCalendar from './CustomCalendar';
import socket from '../socket';

const RoomsDetailsWrapper = styled.div`
  padding:25px;
  box-sizing: border-box;
  background: white;
  display: flex;
  flex-direction: column;
  gap:10px;
  color: black;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: 2px solid black;
  color: black;
`
const RoomDetails = ({ roomId }) => {
  const [details, setDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await axios.get(`http://localhost:5000/room/${roomId}`, {
        headers: {
          Authorization: accessToken
        }
      });
      setDetails(response.data);
    };

    fetchDetails();

    socket.on('room_booked', (data) => {
      if (data.roomID === roomId) {
        setDetails(prevDetails => ({
          ...prevDetails,
          bookings: [...prevDetails.bookings, {
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime
          }]
        }));
      }
    });

    return () => {
      socket.off('room_booked');
    };
  }, [roomId]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const getBookingsForDate = (date) => {
    if (!details || !date) return [];
    const selectedDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return details.bookings.filter(booking => booking.date === selectedDateString);
  };
  
  if (!details) return <div>Loading...</div>;

  return (
    <RoomsDetailsWrapper>
      <h2>{details.roomName}</h2>
      <p>Capacity: {details.capacity}</p>
      <p>Tags: {details.tags.join(', ')}</p>
      <h3>Bookings</h3>
      <CustomCalendar bookings={details.bookings} onSelectDate={handleSelectDate} selectedDate={selectedDate} accessToken={accessToken}/>
      {selectedDate && <BookingForm roomId={roomId} selectedDate={selectedDate} bookings={getBookingsForDate(selectedDate)} accessToken={accessToken} setDetails={setDetails}/>}
    </RoomsDetailsWrapper>
  );
};

export default RoomDetails;
