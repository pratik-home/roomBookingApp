import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleSearch = () => {
    onSearch(query, capacity);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for rooms..."
      />
      <input
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        placeholder="Capacity"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
