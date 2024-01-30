import React from 'react'
import { useGameContext } from '../GameContext'
import { useEffect } from 'react';

function Answer({resetStep}) {

    const { socket, lobby, woolf, answer, handleRemovePlayer, handleSetIsHost, myVote, mostVoted, ready, handleReady, resetGame } = useGameContext();
    
    const handleReadyButtonClick = () => { handleReady(); };

    useEffect(() => {
        socket.on('newRound', () => {
            resetStep();
            resetGame();
         });
                           
        return () => {
          socket.off('newRound');  
        };
      });

      useEffect(() => {
        socket.on('playerDisconnected', (newRoomData, playerName, playerID) => {
            try {
                handleRemovePlayer(newRoomData, playerName);
                resetStep();
            } catch (error) {
                console.error('Error processing disconnect event:', error);
            }
        });
  
        if (lobby.length > 0){
            const hostPlayer = lobby.find(player => player.host === true);
            if (hostPlayer.id === socket.id) {
                handleSetIsHost(true);
            } else {
                handleSetIsHost(false);
            }
        }
  
        return () => {
          socket.off('playerDisconnected');
      };
  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lobby]);

  return (
    <div className='BoardContainer'>
        <h1 className='GameText'>RESULTS</h1>
        <h3 className='GameText'>YOU VOTED: {myVote}</h3>
        <h3 className='GameText'>MOST VOTED: {mostVoted}</h3>
        <h3 className='GameText'>WOOLF: {woolf}</h3>
        <h3 className='GameText'>ANSWER: {answer}</h3>
        <button className='ReadyButton' disabled={ready} onClick={handleReadyButtonClick}>RESTART</button>
    </div>
  )
}

export default Answer