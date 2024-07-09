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
  const [userRooms, setUserRooms] = useState([]);
  const [showUserRooms, setShowUserRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleSearch = async (query, capacity, time, tags) => {
    const response = await axios.get('http://localhost:5000/search', {
      params: { query, capacity, time, tags },
      headers: {
        Authorization: localStorage.getItem('accessToken')
      }
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
    handleSearch()
  };

  useEffect(() => {
    if(!token)
      generateToken()
    else
      handleSearch()
  }, []);

  return (
    <GlobalWrapper>
      {!token ? (
        ""
      ) : (
        <>
          <SearchBar onSearch={handleSearch} setUserRooms={setUserRooms} setShowUserRooms={setShowUserRooms} showUserRooms={showUserRooms} onRoomChange={handleRoomSelect}/>
          <RoomsAndBookingWrapper>
            <RoomList rooms={showUserRooms?userRooms:rooms} onSelect={handleRoomSelect} />
            {selectedRoom && <RoomDetails roomId={selectedRoom} />}
          </RoomsAndBookingWrapper>
        </>
      )}
    </GlobalWrapper>
  );
};

export default App;
