import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch,setUserRooms, setShowUserRooms, showUserRooms,onRoomChange }) => {
  const [query, setQuery] = useState('');
  const [capacity, setCapacity] = useState('');
  const [time, setTime] = useState('');
  const [tags, setTags] = useState('');

  const handleSearch = () => {
    onSearch(query, capacity,time,tags);
  };

  const handleRoomToggle = async () => {
    if(!showUserRooms){
      const response = await axios.get('http://localhost:5000/user_bookings', {
        headers: {
          Authorization: localStorage.getItem('accessToken')
        }
      });
      setUserRooms(response.data);
      if(response.data[0])
        onRoomChange(response.data[0].roomID)
    }
    setShowUserRooms(!showUserRooms)
  };

  return (
    <div>
      <input
        type="text"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="Time..."
        disabled={showUserRooms}
      />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags..."
        disabled={showUserRooms}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rooms..."
        disabled={showUserRooms}
      />
      <input
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        placeholder="Capacity..."
        disabled={showUserRooms}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleRoomToggle}>Show {showUserRooms?"All":"User"} Rooms</button>
    </div>
  );
};

export default SearchBar;
