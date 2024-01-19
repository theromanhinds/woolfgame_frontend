import React from 'react'
import '../App.css';
import { useGameContext } from '../GameContext';

function CreateJoin({onNextStep}) {

  const { userName, handleCreateRoom } = useGameContext();

  const handleJoinButtonClick = () => { onNextStep(); };

  const handleCreateButtonClick = () => { handleCreateRoom(); };

  return (
    <div className='Container'>
        <h3 className='StartText'>WELCOME: {userName}!</h3>
        <button className='StartButton' onClick={handleCreateButtonClick}>Create Game</button>
        <button className='StartButton' onClick={handleJoinButtonClick}>Join Game</button>
    </div>
  )
}

export default CreateJoin
