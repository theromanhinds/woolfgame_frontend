import React from 'react'
import { useState } from 'react';

import Lobby from './Lobby';
import GameBoard from './GameBoard';
import Voting from './Voting';
import Answer from './Answer';

import logo from '../Assets/WoolfLogo.png';
import GameInfo from './GameInfo';

function Game() {

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
        {currentStep === 2 && <GameBoard handleNextStep={handleNextStep} />}
        {currentStep === 3 && <Voting onNextStep={handleNextStep}/>}
        {currentStep === 4 && <Answer resetStep={resetStep}/>}
    </div>
  )
}

export default Game