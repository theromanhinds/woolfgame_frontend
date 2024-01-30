import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameContext } from '../GameContext';

import Lobby from './Lobby';
import GameBoard from './GameBoard';
import Voting from './Voting';
import Answer from './Answer';

import logo from '../Assets/WoolfLogo.png';
import GameInfo from './GameInfo';

function Game() {

  const navigate = useNavigate();

  const { socket } = useGameContext();

  useEffect(() => {
    if (socket === null) {
      alert("You were disconnected!");
      navigate(`/`);
      window.location.reload();
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => {
      setCurrentStep((prevStep) => prevStep + 1);
  };

  const resetStep = () => {
    setCurrentStep(1);
  }
 
  return (
    <div className='GameContainer'>
      <img alt="logo" src={logo} className='GameLogo'/>
      <GameInfo/>
        {currentStep === 1 && <Lobby onNextStep={handleNextStep}/>}
        {currentStep === 2 && <GameBoard handleNextStep={handleNextStep} resetStep={resetStep}/>}
        {currentStep === 3 && <Voting onNextStep={handleNextStep} resetStep={resetStep}/>}
        {currentStep === 4 && <Answer resetStep={resetStep}/>}
    </div>
  )
}

export default Game