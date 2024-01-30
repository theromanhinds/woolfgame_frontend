import React from 'react'
import { useEffect } from 'react';

import { useGameContext } from '../GameContext';

function Lobby({onNextStep}) {

    const { socket, setSocket, roomID, lobby, handleSetLobby, isHost, handleSetIsHost, handleGameStartRequest, handleGameStarted } = useGameContext();

    const handleReturnButtonClick = () => {
        setSocket(null);
    }

    const handleStartButtonClick = () => {

        if (lobby.length >= 3){
            handleGameStartRequest();
        } else {
            alert("Need at least 3 players to start!");
        }

    }
    
    
    // Listen for updates to the lobby
    useEffect(() => {
        
            socket.on('updateRoom', (newRoomData) => {
                try {
                    handleSetLobby(newRoomData);
                } catch (error) {
                    console.error('Error processing initialPlayerList event:', error);
                }
            });
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [lobby]);

      //NEED TO UNDERSTAND WHY THIS FUNCTION IS NEEDED
      useEffect(() => {
        socket.emit('getRoom', roomID);
      
        return () => {
          socket.off('getRoom');
        }
  
          // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

    useEffect(() => {
        socket.on('playerDisconnected', (newRoomData) => {
            try {
                handleSetLobby(newRoomData);
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
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lobby]);
    

      // Listen for game start
    useEffect(() => {    
        socket.on('gameStarted', (gameData) => {
            handleGameStarted(gameData);
            onNextStep();
            });
                            
        return () => {
            socket.off('gameStarted'); 
        };
    });
      
    return (
        <div className='LobbyContainer'>
        <h1 className='LobbyText'>LOBBY</h1>
            <ul className='PlayerList'>
            {lobby.map((player) => (
                <li key={player.id}>{player.userName} {player.host && <span>(Host)</span>}</li>
            ))}
            </ul>
            {isHost ? (<button className='GameButton' onClick={handleStartButtonClick}>START</button>) : (<h3 className='GameButton'>WAITING FOR HOST...</h3>)}
            <button onClick={handleReturnButtonClick} className='ReturnButton'>RETURN</button>
        </div>
    )
}

export default Lobby