import React from 'react';
import FallingLettersTextarea from './FallingLettersTextarea';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>GRAVITY_FALL_V.1.0</h1>
      <p style={{ marginBottom: '30px', color: '#008800' }}>
          // MISSION: TRANSCRIBE THE DATA STREAM BELOW <br />
          // WARNING: INACTIVITY DETECTED &gt; 5000ms WILL RESULT IN SYSTEM CRASH
      </p>
      <FallingLettersTextarea />
    </div>
  );
}

export default App;
