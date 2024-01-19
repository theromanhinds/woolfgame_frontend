import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const GameContext = createContext();

export const GameProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);

  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const handleNameUpdate = (newName) => {
    setUserName(newName);
  }

  const [roomID, setRoomID] = useState('');
  
  const handleConnect = () => {
    return new Promise((resolve, reject) => {
      try {
        const newSocket = io('http://localhost:3001');

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

  const handleEnterRoomID = (newRoomID) => { setRoomID(newRoomID); };

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

  const [isHost, setIsHost] = useState(false);
  const handleSetIsHost = (boolean) => {
    setIsHost(boolean);
  }

  const [lobby, setLobby] = useState([]);
  const handleSetLobby = (newLobby) => {
    setLobby(newLobby);
  }

  const handleGameStartRequest = () => {
    socket.emit('startGame', roomID);
  }

  const [gameStarted, setGameStarted] = useState(false);

  const [role, setRole] = useState('');

  const [woolf, setWoolf] = useState('');

  const [board, setBoard] = useState([]);

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

  const [topic, setTopic] = useState('');
  const [answer, setAnswer] = useState('');
  const [order, setOrder] = useState([]);

  const resetClue = () => {
    setClue('');
  }

  const [clue, setClue] = useState('');
  const handleSetClue = (newClue) => {
    setClue(newClue);
  }

  const [cluesList, setCluesList] = useState([]);

  const handleClueSubmit = (clue) => {

    let submission = `${userName} says: ${clue}`;

    socket.emit("clueSubmitted", submission, roomID);
    setCluesList((prevClues) => [...prevClues, submission]);
    nextTurn(); //only called for sender
  };

  const handleNewClue = (newClue) => {
    setCluesList((prevClues) => [...prevClues, newClue]);
  }

  const [yourTurn, setYourTurn] = useState(false);
  const handleSetYourTurn = (boolean) => {
    setYourTurn(boolean);
  }

  const [turnNumber, setTurnNumber] = useState(0);

  const checkTurn = (turnCount) => {
      console.log("current turn is: ", turnCount);
      if (socket.id === order[turnCount].id) {
        console.log("it is your turn");
        handleSetYourTurn(true);
      } else {
        console.log("it is NOT your turn");
        handleSetYourTurn(false);
      }
    
  };
  
  const nextTurn = async () => {
    try {
      // Use a separate function to handle logic after state update
      const handleTurnChange = async (newCount) => {
        console.log("count before emitting: ", newCount);
  
        const response = await new Promise((resolve, reject) => {
          socket.emit('checkTurnsComplete', order, newCount, roomID, (exists) => {
            resolve(exists);
          });
        });
  
        if (response) {
          console.log("all turns complete");
          socket.emit('allTurnsComplete', roomID);
        } else {
          console.log("turns not complete");
          console.log("new Count: ", newCount);
          checkTurn(newCount);
        }
      };
  
      // Use setTurnNumber to update state and wait for the result
      // await setTurnNumber((prevCount) => {
      //   console.log("prev Count: ", prevCount);
      //   return prevCount + 1;
      // });

      setTurnNumber(turnNumber + 1);
  
      // Get the updated turn count after the state is updated
      const newCount = turnNumber + 1;
      console.log("new turn num: ", newCount);
  
      // Call the separate function with the updated count
      await handleTurnChange(newCount);
    } catch (error) {
      console.error('Error checking if game over:', error);
    }
  };

  const [voted, setVoted] = useState(false);

  const [myVote, setMyVote] = useState('');

  const handleVoted = (vote) => {
    socket.emit('playerVoted', roomID, vote, order);
    setVoted(true);
    setMyVote(vote);
  }

  const [mostVoted, setMostVoted] = useState('');
  
  const handleSetMostVoted = (mostVoted) => {
    setMostVoted(mostVoted);
  }

  const [ready, setReady] = useState(false);

  const handleReady = () => {
    setReady(true);
    socket.emit('playerReady', roomID, userName, order);
  }

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
    voted,
    handleVoted,
    myVote,
    mostVoted,
    handleSetMostVoted,
    ready,
    handleReady,
    resetGame,
    // other function declarations...
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