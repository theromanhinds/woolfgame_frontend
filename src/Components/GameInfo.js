import React from 'react'
import { useGameContext } from '../GameContext'

function GameInfo() {

    const { userName, roomID } = useGameContext();

  return (
    <div className='GameInfoContainer'>
        <h3>NAME: {userName}</h3>
        <h3>ROOM: {roomID}</h3>
    </div>
  )
}

export default GameInfo