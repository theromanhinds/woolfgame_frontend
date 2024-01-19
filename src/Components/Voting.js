import React from 'react'
import { useEffect } from 'react';
import { useGameContext } from '../GameContext'

function Voting({onNextStep}) {

  const { socket, board, order, cluesList, voted, handleVoted, myVote, handleSetMostVoted, } = useGameContext();

  const handleVoteButtonClick = (index) => {
    console.log("vote button clicked");
    handleVoted(order[index].userName);
    console.log("you voted for :", order[index].userName);
  }

  useEffect(() => {
        
    socket.on('revealAnswer', (mostVoted) => {
      console.log("revealing answer");
        handleSetMostVoted(mostVoted);
        onNextStep();
     });
                       
    return () => {
      socket.off('revealAnswer');  
    };
  });

  return (
    <div className='VotingContainer'>
      <h1 className='GameText'>VOTING</h1>
        <div className="Board">
              {board.map((word, index) => (
              <div key={index} className="BoardWord">
              {word} </div>
              ))}
          </div>
          <p>{voted ? `You voted for ${myVote}` : "Vote out the Woolf!"}</p>
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