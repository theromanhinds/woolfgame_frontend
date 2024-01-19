import React from 'react'
import { useGameContext } from '../GameContext'
import { useEffect } from 'react';

function Answer({resetStep}) {

    const { socket, woolf, answer, mostVoted, ready, handleReady, resetGame } = useGameContext();
    
    const handleReadyButtonClick = () => {
        handleReady();
        console.log("this player is ready");
    };

    useEffect(() => {
        
        socket.on('newRound', () => {
            resetStep();
            resetGame();
         });
                           
        return () => {
          socket.off('newRound');  
        };
      });

  return (
    <div>
        <h1 className='GameText'>RESULTS</h1>
        <h3 className='GameText'>MOST VOTED: {mostVoted}</h3>
        <h3 className='GameText'>WOOLF: {woolf}</h3>
        <h3 className='GameText'>ANWER: {answer}</h3>
        <button className='ReadyButton' disabled={ready} onClick={handleReadyButtonClick}>RESTART</button>
    </div>
  )
}

export default Answer