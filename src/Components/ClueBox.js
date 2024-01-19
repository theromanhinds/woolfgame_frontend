import React from 'react';
import { useGameContext } from '../GameContext';
import { useEffect } from 'react';

function ClueBox({onNextStep}) {

    const { socket, clue, cluesList, handleSetClue, handleClueSubmit, handleNewClue, resetClue, yourTurn, turnNumber, handleSetTurnNumber, checkTurn } = useGameContext();

    const handleClueChange = (event) => { handleSetClue(event.target.value); };

    const verifyClueSubmit = () => {

        if (clue) {
            if (clue.trim() !== '') {
            handleClueSubmit(clue);
            resetClue(); // Clear the input after submitting
            }
        }
    }

    // //check for your turn at start of game
    useEffect(() => {
        checkTurn(turnNumber);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Subscribe to socket events
          socket.on('updateTurn', (newTurnNumber) => {
            console.log("setting turn num: ", newTurnNumber);
            handleSetTurnNumber(newTurnNumber);
            checkTurn(newTurnNumber);
          });
        
        // Clean up subscriptions on component unmount
        return () => {
            socket.off('updateTurn');
        };
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
    
    //only called for receivers of a clue
    useEffect(() => {
        socket.on('newClue', (newClue) => {
            console.log("new clue rec"); 
            handleNewClue(newClue);
            // nextTurn(); 
        });

        return () => {
            socket.off('newClue');  // Clean up any subscriptions or side effects when the component unmounts
        };
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [socket, handleNewClue]);

      useEffect(() => {
        
        socket.on('startVoting', () => {
            console.log("starting the voting");
            onNextStep();
         });
                           
        return () => {
          socket.off('startVoting');  
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


  return (
    <div className='ClueBoxContainer'>
        <div className='ClueBox'>
        
        <h2 className='BoardText'>CLUES</h2>
        <p>{yourTurn ? "It's YOUR turn!" : "It's NOT your turn!"}</p>
            <ul> {cluesList.map((submittedClue, index) => (
                <li key={index}>{submittedClue}</li>
                ))}
            </ul>
        <div className='ClueSubmitContainer'>
            <input type="text"
            value={clue}
            onChange={handleClueChange}
            disabled={!yourTurn}
            maxLength="16"
            className='ClueInput'></input>
            <button className='ClueSubmit' disabled={!yourTurn} onClick={verifyClueSubmit}>SEND</button>
        </div>
    </div>
    </div>
  )
}

export default ClueBox