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
  const [clue, setClue] = useState('');
  const [myVote, setMyVote] = useState('');
  const [mostVoted, setMostVoted] = useState('');

  const [turnNumber, setTurnNumber] = useState(0);

  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [yourTurn, setYourTurn] = useState(false);
  const [voted, setVoted] = useState(false);
  const [ready, setReady] = useState(false);

  const [lobby, setLobby] = useState([]);
  const [board, setBoard] = useState([]);
  const [order, setOrder] = useState([]);
  const [cluesList, setCluesList] = useState([]);

  // STATE HANDLERS //////////////////////////
  const handleNameUpdate = (newName) => { setUserName(newName); };
  const handleEnterRoomID = (newRoomID) => { setRoomID(newRoomID); };

  const handleSetIsHost = (boolean) => { setIsHost(boolean); };
  const handleSetLobby = (newLobby) => { setLobby(newLobby); };

  const handleSetTurnNumber = (newTurnNumber) => { setTurnNumber(newTurnNumber) };
  const handleSetYourTurn = (boolean) => { setYourTurn(boolean); };

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
          console.log('Connection successful');
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
      console.log("trying to connect to server");
      const newSocket = await handleConnect();
      
      try {
        console.log("trying to join room");
        const response = await new Promise((resolve, reject) => {
          newSocket.emit('checkRoomExistence', roomID, (exists) => {
            resolve(exists);
          });
        });
        
        if (response) {
          // Room exists, join it
          console.log("room exists, joining");
          setIsHost(false);
          console.log("socket emitting is: ", newSocket);
          newSocket.emit('joinRoom', roomID, userName);
          navigate(`/game/${roomID}`);
        } else {
          console.error('Please enter a valid room ID.');
          alert('Please Enter Valid Room Code.');
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

    for(var obj of newGameData.players) {
      if (obj.id === socket.id) {
        setRole(obj.role);
      }
      if (obj.role === 'WOOLF') {
        setWoolf(obj.userName);
      }
    }

  };

  
  // HANDLE CLUE SUBMIT //////////////////////////
  const handleClueSubmit = (clue) => {
    let submission = `${userName} says: ${clue}`;
    socket.emit("clueSubmitted", submission, roomID);
    nextTurn();
  };

  // HANDLE TURN UPDATES //////////////////////////

  const nextTurn = () => {
    // Increment turn number and emit the update to all clients
    const newTurnNumber = turnNumber + 1;

    if (newTurnNumber === order.length) {
      console.log("game over");
      socket.emit('allTurnsComplete', roomID);
    } else {
      console.log("game NOT over");
      socket.emit('incrementTurn', newTurnNumber, roomID);
      setTurnNumber(newTurnNumber);
      checkTurn(newTurnNumber);
    }

  };

  const checkTurn = (turnCount) => {
      if (socket.id === order[turnCount].id) {
        console.log("it is your turn");
        handleSetYourTurn(true);
      } else {
        console.log("it's NOT your turn");
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
    clue,
    handleSetClue,
    resetClue,
    cluesList,
    handleClueSubmit,
    handleNewClue,
    yourTurn,
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