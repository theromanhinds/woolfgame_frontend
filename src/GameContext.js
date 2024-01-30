import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const GameContext = createContext();

export const GameProvider = ({ children }) => {

  const navigate = useNavigate();

  // STATE VARIABLES //////////////////////////
  const [socket, setSocket] = useState(null);

  const [userName, setUserName] = useState('');
  const [roomID, setRoomID] = useState('');
  const [role, setRole] = useState('');
  const [woolf, setWoolf] = useState('');
  const [topic, setTopic] = useState('');
  const [answer, setAnswer] = useState('');
  const [currentTurn, setCurrentTurn] = useState('');
  const [clue, setClue] = useState('');
  const [myVote, setMyVote] = useState('');
  const [mostVoted, setMostVoted] = useState('');

  const [turnNumber, setTurnNumber] = useState(0);
  const [gameOverLength, setGameOverLength] = useState(0);

  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [yourTurn, setYourTurn] = useState(false);
  const [voted, setVoted] = useState(false);
  const [ready, setReady] = useState(false);

  const [lobby, setLobby] = useState([]);
  const [board, setBoard] = useState([]);
  const [order, setOrder] = useState([]);
  const [clueOrder, setClueOrder] = useState([]);
  const [cluesList, setCluesList] = useState([]);

  // STATE HANDLERS //////////////////////////
  const handleNameUpdate = (newName) => { setUserName(newName); };
  const handleEnterRoomID = (newRoomID) => { setRoomID(newRoomID); };

  const handleSetIsHost = (boolean) => { setIsHost(boolean); };
  const handleSetLobby = (newLobby) => { setLobby(newLobby); };

  const handleSetTurnNumber = (newTurnNumber) => { setTurnNumber(newTurnNumber) };
  const handleSetYourTurn = (boolean) => { setYourTurn(boolean); };
  const handleSetCurrentTurn = (turnNumber) => { setCurrentTurn(order[turnNumber].userName); };

  const handleSetClue = (newClue) => { setClue(newClue); };
  const handleNewClue = (newClue) => { setCluesList((prevClues) => [...prevClues, newClue]); };
  const resetClue = () => { setClue(''); };

  const handleSetMostVoted = (mostVoted) => { setMostVoted(mostVoted); };

  // SOCKET HANDLERS //////////////////////////
  const handleGameStartRequest = () => { socket.emit('startGame', roomID); };
  
  const handleConnect = () => {
    return new Promise((resolve, reject) => {
      try {
        const newSocket = io('https://woolf-game-test-b5725a7e8c1f.herokuapp.com/', {
          withCredentials: true,
        });

        // Listen for successful connection
        newSocket.on('connect', () => {
          setSocket(newSocket);
          resolve(newSocket); // Resolve with the socket instance
        });

        // Listen for connection error
        newSocket.on('connect_error', (error) => {
          console.error('Error connecting to server:', error.message);
          reject(error);
        });

      } catch (error) {
        console.error('Error connecting to server:', error.message);
        reject(error);
      }
    });
  };

  // HANDLE CREATE OR JOIN ROOM //////////////////////////
  const handleCreateRoom = async () => {
    
    try {
      const newSocket = await handleConnect();

      const newRoomID = Math.random().toString(36).substr(2, 6).toUpperCase();
      setRoomID(newRoomID);
      setIsHost(true);

      // newSocket.emit('createRoom', newRoomID, userName);

      const newLobby = await new Promise((resolve) => {
        newSocket.emit('createRoom', newRoomID, userName, (updatedLobby) => {
          resolve(updatedLobby);
        });
      });
  
      // Update the lobby state with the response
      setLobby(newLobby);

      navigate(`/game/${newRoomID}`);
    } catch (error) {
      console.error('Error creating room:', error.message);
      alert('Error connecting to server!');
    }
  };

  const handleJoinRoom = async () => {

    try {
      const newSocket = await handleConnect();
      
      try {
        const response = await new Promise((resolve, reject) => {
          newSocket.emit('verifyJoinRoom', roomID, (exists) => {
            resolve(exists);
          });
        });
        
        if (response) {
          // Room exists, join it
          setIsHost(false);
          newSocket.emit('joinRoom', roomID, userName);
          navigate(`/game/${roomID}`);
        } else {
          console.error('Room ID Invalid or Lobby Full.');
          alert('Room ID Invalid or Lobby Full.');
        }
      } catch (error) {
        console.error('Error checking room existence:', error);
      }


    } catch (error) {
      console.error('Error connecting socket:', error.message);
      alert('Error connecting to server!');
    }
    
  };

  // HANDLE GAME START //////////////////////////
  const handleGameStarted = (newGameData) => {

    setGameStarted(true);
    setBoard(newGameData.board);
    setTopic(newGameData.topic);
    setAnswer(newGameData.answer);
    setOrder(newGameData.players);

    setClueOrder(newGameData.players);

    const gameOver = newGameData.players;

    setGameOverLength(gameOver.length);

    for(var obj of newGameData.players) {
      if (obj.id === socket.id) {
        setRole(obj.role);
      }
      if (obj.role === 'WOOLF') {
        setWoolf(obj.userName);
      }
    }

  };

  // HANDLE REMOVE PLAYER //////////////////////////
  
  const handleRemovePlayer = (newLobby, playerName) => {

    handleSetLobby(newLobby);
    alert(`${playerName} disconnected! Returning to lobby.`);
    resetGame();
    socket.emit("")

  };

  
  // HANDLE CLUE SUBMIT //////////////////////////
  const handleClueSubmit = (clue) => {
    let submission = `${userName} says: ${clue}`;
    socket.emit("clueSubmitted", submission, userName, roomID);
    nextTurn();
  };

  // HANDLE TURN UPDATES //////////////////////////

  const nextTurn = () => {
    // Increment turn number and emit the update to all clients
    const newTurnNumber = turnNumber + 1;

    if (newTurnNumber === gameOverLength) {
      socket.emit('allTurnsComplete', roomID);
    } else {
      socket.emit('incrementTurn', newTurnNumber, roomID);
      setTurnNumber(newTurnNumber);
    }

  };

  const checkTurn = (turnCount) => {

    handleSetCurrentTurn(turnCount);

    if (socket.id === order[turnCount].id) {
      handleSetYourTurn(true);
    } else {
      handleSetYourTurn(false);
    }
  };
  
  // HANDLE VOTE //////////////////////////
  
  const handleVoted = (vote) => {
    socket.emit('playerVoted', roomID, vote, order);
    setVoted(true);
    setMyVote(vote);
  }
  
  // HANDLE READY //////////////////////////
  const handleReady = () => {
    setReady(true);
    socket.emit('playerReady', roomID, userName, order);
  }

  // HANDLE RESET //////////////////////////
  const resetGame = () => {
    
    setGameStarted(false);
    setRole('');
    setBoard([]);
    setTopic('');
    setAnswer('');
    setOrder([]);
    setClueOrder([]);
    setCurrentTurn('');
    setCluesList([]);
    setTurnNumber(0);
    setVoted(false);
    setMostVoted('');
    setReady(false);

    socket.emit('resetGame', roomID);
  }

  // LIST OF STATE AND FXN PROPS ///////////
  const contextValue = {
    socket,
    setSocket,
    userName,
    roomID,
    handleNameUpdate,
    handleCreateRoom,
    handleEnterRoomID,
    handleJoinRoom,
    isHost,
    handleSetIsHost,
    lobby, 
    handleSetLobby,
    gameStarted,
    handleGameStartRequest,
    handleGameStarted,
    role,
    woolf,
    board,
    topic,
    answer,
    order,
    clueOrder,
    clue,
    handleSetClue,
    resetClue,
    cluesList,
    handleClueSubmit,
    handleNewClue,
    yourTurn,
    currentTurn,
    setCurrentTurn,
    handleSetCurrentTurn,
    nextTurn,
    turnNumber,
    checkTurn,
    handleSetTurnNumber,
    voted,
    handleVoted,
    myVote,
    mostVoted,
    handleSetMostVoted,
    ready,
    handleReady,
    resetGame,
    handleRemovePlayer,
  };
  
  return (
  <GameContext.Provider value={contextValue}>
      {children}
  </GameContext.Provider>
  );
};

export const useGameContext = () => {
    return useContext(GameContext);
};