import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Switch를 Routes로 바꿈
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const flaskEndpoint = "http://127.0.0.1:5000/webcam";
  const analysisEndpoint = "http://127.0.0.1:5000/webcam_analysis";

  const [data, setData] = useState({ drowsiness: null, emotion1: null, emotion1_strength: null, emotion2: null, emotion2_strength: null });
  // 'neutral', 'anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise'
  const [text] = useState('chat-GPT here');
  const [fontSize, setFontSize] = useState('1em');

  const getVideoUrl = (data) => {

    // 졸릴 때
    if (data.drowsiness > 0.5) {
      if (data.drowsiness >= 0.75) {
        return "/videos/drowsiness-high.mp4";
      } else {
        return "/videos/drowsiness-low.mp4";
      }
    }

    // 안 졸릴때
    if (data.emotion1 === 'neutral') {
      if (data.emotion1_strength >= 0.5) {
        return "/videos/neutral.mp4";
      } else {
        // low strength 
        switch (data.emotion2) {
          case 'happiness':
            return "/videos/happiness-low.mp4";
          case 'sadness':
            return "/videos/sadness-low.mp4";
          case 'anger':
            return "/videos/anger-low.mp4";
          case 'surprise':
            return "/videos/surprise-low.mp4";
          case 'confusion':
            return "/videos/confusion-low.mp4";
          default:
            return "/videos/neutral.mp4";
        }
      }
    } else { // 다른 감정 ...
      switch (data.emotion1) {
        case 'happiness':
          return "/videos/happiness-high.mp4";
        case 'sadness':
          return "/videos/sadness-high.mp4";
        case 'anger':
          return "/videos/anger-high.mp4";
        case 'surprise':
          return "/videos/surprise-high.mp4";
        case 'confusion':
          return "/videos/confusion-high.mp4";
        default:
          return "/videos/neutral.mp4";
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(analysisEndpoint);
        if (response.ok) {
          const result = await response.json();
          setData(result);
          console.log(result)

          // 비디오 URL 갱신
          const videoElement = document.querySelector("video");
          const sourceElement = videoElement.querySelector("source");
          sourceElement.src = process.env.PUBLIC_URL + getVideoUrl(result);
          videoElement.load();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // 3초마다 데이터를 가져옵니다.
    const intervalId = setInterval(fetchData, 4000);

    // 컴포넌트가 unmount 될 때 interval을 정리합니다.
    return () => {
      clearInterval(intervalId);
    };
  }, [analysisEndpoint]);

  // useEffect(() => {  //나중에 지피티 글씨 사이즈 반응형 변환 쓸 때 필요함
  //   if (text.length > 20) {
  //     setFontSize('0.8em');
  //   } else {
  //     setFontSize('1em');
  //   }
  // }, [text]);

  return (
    <Router>
      <Routes>
        <Route path="/report" element={<Dashboard />} />
        <Route path="/" element={
          <div className="container">
            <div className="header">
              <div className="dataSection">
                <h2>Analysis Data</h2>
                <p>Drowsiness: {data.drowsiness}</p>
                <p>Emotion: {data.emotion}</p>
                <Link to="/report">Report</Link>
              </div>
              <div className="speechBubble">
                <h1 style={{ fontSize }}>{text}</h1>
              </div>
              <div className="videoSection">
                <video width="200" height="150" muted autoPlay>
                  <source src={process.env.PUBLIC_URL + getVideoUrl(data)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <div className="middleSection">
              <div className="videoContainer">
                <img src={flaskEndpoint} alt="Webcam Stream" className="webcamStream" />
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;