import React from 'react'
import { useEffect } from 'react';

import { useGameContext } from '../GameContext';

function Lobby({onNextStep}) {

    const { socket, roomID, lobby, handleSetLobby, isHost, handleSetIsHost, handleGameStartRequest, handleGameStarted } = useGameContext();

    const handleStartButtonClick = () => {

        //RESET TO 3
        if (lobby.length >= 3){
            handleGameStartRequest();
        } else {
            alert("Need atleast 3 players");
            console.log("not enough players to start");
        }

    }  

    useEffect(() => {
      socket.emit('getRoom', roomID);
    
      return () => {
        socket.off('getRoom');
      }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    

    //GET LOBBY TO UPDATE
    // Listen for updates to the lobby
    useEffect(() => {
        socket.on('updateRoom', (newRoomData) => {
            try {
                handleSetLobby(newRoomData);
            } catch (error) {
                console.error('Error processing initialPlayerList event:', error);
            }
        });

        //confirm host in new lobby
        if (lobby.length > 0){
            const hostPlayer = lobby.find(player => player.host === true);
            if (hostPlayer.id === socket.id) {
                handleSetIsHost(true);
            } else {
                handleSetIsHost(false);
            }
        }
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [lobby]);

      // Listen for game start
    useEffect(() => {
        
        socket.on('gameStarted', (gameData) => {
            handleGameStarted(gameData);
            onNextStep();
         });
                           
        return () => {
          socket.off('gameStarted');  // Clean up any subscriptions or side effects when the component unmounts
        };
      });
      
      
    return (
        <div className='Container'>
        <h1 className='GameText'>LOBBY</h1>
            <ul className='PlayerList'>
            {lobby.map((player) => (
                <li key={player.id}>{player.userName} {player.host && <span>(Host)</span>}</li>
            ))}
            </ul>
            {isHost ? (<button className='GameButton' onClick={handleStartButtonClick}>Start Game</button>) : (<h3 className='LobbyText'>WAITING FOR HOST...</h3>)}
        </div>
    )
}

export default Lobby