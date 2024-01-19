import React from 'react'
import { useGameContext } from '../GameContext'
import ClueBox from './ClueBox';

function GameBoard({handleNextStep}) {

  const { role, topic, answer, board } = useGameContext();
    
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
      <h2 className='TopicText'>TOPIC: {topic}</h2>
        <h3 className='RoleText'>Role: {role} / Answer: {role === 'WOOLF' ? '???' : answer}</h3>
        <div className="Board">
            {board.map((word, index) => (
            <div key={index} className="BoardWord">
            {word} </div>
            ))}
        </div>
        <hr className='Divider'></hr>
        <ClueBox onNextStep={handleNextStep}/>
    </div>
  )
}

export default GameBoard