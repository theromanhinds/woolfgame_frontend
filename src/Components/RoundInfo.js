import React from 'react'
import '../App.css';

const RoundInfo = ({ showPopup, closePopup, role, topic  }) => {
    return (
      showPopup && (
        <div className="popup" onClick={closePopup}>
          <div className="popup-content">
            <h2>Round Information</h2>
            <h3>THE TOPIC IS: {topic}</h3>
            <h3>YOUR ROLE IS: {role}</h3>
            <p>Tap to continue!</p>
          </div>
        </div>
      )
    );
  };

export default RoundInfo