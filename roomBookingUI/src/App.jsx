import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import SearchBar from './components/SearchBar';
import RoomList from './components/RoomList';
import RoomDetails from './components/RoomDetails';
import axios from 'axios';

const GlobalWrapper = styled.div`
  box-sizing: border-box;
  padding:20px;
  background: white;
  display: flex;
  place-items: center;
  flex-direction: column;
  gap: 20px;
  color: black;
  width: 100%;
  height: 100vh;
  overflow:hidden;
`
const RoomsAndBookingWrapper = styled.div`
  background: white;
  display: flex;
  justify-items: end;
  flex-direction: row;
  gap:20px;
  color: black;
  width: 100%;
  height :95%;
`

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleSearch = async (query, capacity) => {
    const response = await axios.get('http://localhost:5000/search', {
      params: { query, capacity }
    });
    setRooms(response.data.rooms);
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
  };

  const generateToken = async () => {
    const response = await axios.post('http://localhost:5000/generate-token');
    const { accessToken } = response.data;
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
  };

  useEffect(() => {
    if(!token)
      generateToken()
      handleSearch()
  }, []);

  return (
    <GlobalWrapper>
      {!token ? (
        ""
      ) : (
        <>
          <SearchBar onSearch={handleSearch} />
          <RoomsAndBookingWrapper>
            <RoomList rooms={rooms} onSelect={handleRoomSelect} />
            {selectedRoom && <RoomDetails roomId={selectedRoom} />}
          </RoomsAndBookingWrapper>
        </>
      )}
    </GlobalWrapper>
  );
};

export default App;
