import React from 'react'
import '../App.css'
import { useGameContext } from '../GameContext';

function EnterRoom() {

  const { roomID, handleEnterRoomID, handleJoinRoom } = useGameContext();
 
  const handleRoomIDChange = (event) => { handleEnterRoomID(event.target.value); };

  const handleJoinButtonClick =  () => { handleJoinRoom(); };

  return (
    <div className='Container'>
        <h3 className='StartText'>ENTER ROOM CODE:</h3>
        <input className='StartInput' input="text" value={roomID} maxLength="6" onChange={handleRoomIDChange} />
        <button className='StartButton' onClick={handleJoinButtonClick}>NEXT</button>
    </div>
  )
}

export default EnterRoom