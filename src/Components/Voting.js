import React from 'react'
import { useEffect } from 'react';
import { useGameContext } from '../GameContext'

function Voting({onNextStep, resetStep}) {

  const { socket, lobby, handleRemovePlayer, handleSetIsHost, board, clueOrder, cluesList, voted, handleVoted, myVote, handleSetMostVoted, } = useGameContext();

  //FIX VOITING BUTTON FOR MISSING PLAYERS
  const handleVoteButtonClick = (index) => { 
    handleVoted(clueOrder[index].userName); 
  };

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

  useEffect(() => {
    socket.on('revealAnswer', (mostVoted) => {
        handleSetMostVoted(mostVoted);
        onNextStep();
     });
                       
    return () => {
      socket.off('revealAnswer');  
    };
  });

  return (
    <div className='VotingContainer'>
      <h1 className='VoteText'>VOTING</h1>
        <div className="Board">
              {board.map((word, index) => (
              <div key={index} className="BoardWord">
              {word} </div>
              ))}
          </div>
          <p className='VoteIndicator'>{voted ? `You voted for ${myVote}` : "Vote out the Woolf!"}</p>
          <hr className='Divider'></hr>
            <ul className='ClueList'> {cluesList.map((submittedClue, index) => (
                <li key={index}>
                  {submittedClue}
                  <button className='VoteButton' onClick={() => handleVoteButtonClick(index)} disabled={voted}>VOTE</button>
                </li>
                ))}
            </ul>
    </div>
  )
}

export default Voting