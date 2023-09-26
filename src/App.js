/* import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import React from 'react';
// import './App.css';

function App() {
  const flaskEndpoint = "http://127.0.0.1:5000/webcam";

    return (
        <div>
            <h1>WebCam Stream</h1>
            <h2>말풍선 생성 및 레포트 관련 라이브러리 적용</h2>
            <img src={flaskEndpoint} alt="Webcam Stream" />
        </div>
    );
}

export default App; */



import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const flaskEndpoint = "http://127.0.0.1:5000/webcam";

  const [text, setText] = useState('chat-GPT here'); 
  const [fontSize, setFontSize] = useState('1em'); 

  useEffect(() => {
    if(text.length > 20) {
      setFontSize('0.8em'); 
    } else {
      setFontSize('1em'); 
    }
  }, [text]);

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100vh',
      overflow: 'hidden',
      padding: '0 0 30px 0' // Adds space at the bottom
    }}>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
        <div style={{marginLeft: '20px'}}>
          <h1>WebCam Stream</h1>
          <h2 style={{ fontSize: 'calc(1em - 3pt)' }}>App.css 파일 이용해서 디자인 다듬고, 다음 페이지 만들어서 레포트 관련 라이브러리 적용</h2>
        </div>

        <div class="speech-bubble" style={{ width: '300px', height: '144px', position: 'absolute', top: '24px', right: '200px' }}>
          <h1 style={{fontSize}}>{text}</h1>
        </div>

        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '150px',
          height: '150px',
          border: '3px solid black',
        }}>
          {/* 여기에 나중에 해당 감정 아바타 영상을 넣을 예정. */}
        </div>
      </div>

      <img src={flaskEndpoint} alt="Webcam Stream" style={{ width: '60%', height: 'auto', marginTop: '60px', marginBottom: '40px' }} />
    </div>
  );
}

export default App;