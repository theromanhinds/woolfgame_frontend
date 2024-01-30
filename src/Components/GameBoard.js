import React from 'react'
import { useState } from 'react';
import { useGameContext } from '../GameContext'
import ClueBox from './ClueBox';
import RoundInfo from './RoundInfo';

function GameBoard({handleNextStep, resetStep}) {

  const { role, topic, answer, board } = useGameContext();

  const [showPopup, setShowPopup] = useState(true);

  const closePopup = () => {
    setShowPopup(false);
  };
    
  if (!board) {
    return (
      <div>
        <h3>GameBoard</h3>
        <p>Loading...</p>
      </div>
    );
  }
 
  return (
    <div className='BoardContainer'>
      <RoundInfo showPopup={showPopup} closePopup={closePopup} role={role} topic={topic}/>
      <h2 className='TopicText'>TOPIC: {topic}</h2>
        <h3 className='RoleText'>Role: {role} / Answer: {role === 'WOOLF' ? '???' : answer}</h3>
        <div className="Board">
            {board.map((word, index) => (
            <div key={index} className="BoardWord">
            {word} </div>
            ))}
        </div>
        <hr className='Divider'></hr>
        <ClueBox onNextStep={handleNextStep} resetStep={resetStep}/>
    </div>
  )
}

export default GameBoard