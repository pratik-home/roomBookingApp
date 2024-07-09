import React from 'react';
import styled from 'styled-components'

const RoomsListWrapper = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  gap:10px;
  color: black;
  height: 100%;
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`
const RoomSelector = styled.div`
  padding:10px;
  background: white;
  border-radius: 5px;
  border: 2px solid black;
  color: black;
  width: 400px;
  // height: 100%;
  cursor:pointer;
  display: flex;
  flex-direction: column;
  gap:3px;
`


const RoomList = ({ rooms, onSelect }) => {
  return (
    <div>
      <RoomsListWrapper>
        {rooms.map((room) => (
          <RoomSelector key={room.roomID} onClick={() => onSelect(room.roomID)}>
            <div>{room.roomName}</div>
            <div>Capacity: {room.capacity}</div>
            <div>Add-ons: {room.tags.toString()}</div>
          </RoomSelector>
        ))}
      </RoomsListWrapper>
    </div>
  );
};

export default RoomList;
