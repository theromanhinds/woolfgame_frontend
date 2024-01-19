import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import { useGameContext } from './GameContext';

import Game from './Components/Game';
import Start from './Components/Start';

function App() {

  const { socket } = useGameContext();

  useEffect(() => {
    // Listen for the disconnect event
    if (socket){
      socket.on('disconnect', () => {
        alert("You were disconnected! Please refresh.");
      });

      return () => {
        // Clean up event listener when component unmounts
        socket.off('disconnect');
      };
    }
  });

  return (
      <div className="App">
        <Routes>

            <Route path="/" element={<Start/>}/>
            <Route path="/game/*" element={<Game/>}/>

        </Routes>
      </div>
  );
}

export default App;
