import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import React from 'react';
// import './App.css';

function App() {
  const flaskEndpoint = "http://127.0.0.1:5000/webcam";

    return (
        <div>
            <h1>WebCam Stream</h1>
            <img src={flaskEndpoint} alt="Webcam Stream" />
        </div>
    );
}

export default App;