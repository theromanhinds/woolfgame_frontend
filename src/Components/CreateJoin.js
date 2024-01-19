import React from 'react'
import '../App.css';
import { useGameContext } from '../GameContext';

function CreateJoin({onNextStep}) {

  const { userName, handleCreateRoom } = useGameContext();

  const handleJoinButtonClick = () => { onNextStep(); };

  const handleCreateButtonClick = () => { handleCreateRoom(); };

  return (
    <div className='Container'>
        <h2 className='NameText'>WELCOME: {userName}!</h2>
        <button className='CreateButton' onClick={handleCreateButtonClick}>CREATE GAME</button>
        <button className='JoinButton' onClick={handleJoinButtonClick}>JOIN GAME</button>
    </div>
  )
}

export default CreateJoin
