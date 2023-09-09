import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import React from 'react';
// import './App.css';

function App() {
  // state
  const [data, setData] = useState([{}])
  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef(null);
  const processedImgRef = useRef(null);

  useEffect(() => {
    if (webcamActive) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            requestAnimationFrame(captureFrame);
          })
          .catch((error) => {
            console.log("Error accessing the webcam:", error);
          });
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [webcamActive]);

const captureFrame = () => {
  if (!webcamActive) return;

  // 웹캠의 현재 프레임을 캡처하여 canvas에 그립니다
  const canvas = document.createElement("canvas");
  canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
  // 캔버스의 내용을 JPEG 형식의 Base64 데이터 URL로 변환합니다.
  const dataURL = canvas.toDataURL("image/jpeg");
  
  // Base64 인코딩된 이미지 데이터를 서버에 POST 요청으로 전송합니다.
  fetch("/capture", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: dataURL })
  })
  .then(response => response.text())  // Base64 문자열로 응답을 받아옵니다.
  .then(base64Image => {
    console.log(base64Image)
    processedImgRef.current.src = `data:image/jpeg;base64,${base64Image}`;
  });
};
  
  return (
    <div className='App'>
      <h1>test 하는 중...</h1>

      {/* Webcam display */}
      {webcamActive ? <video ref={videoRef} width="640" height="480" /> : null}
      <button onClick={() => setWebcamActive(!webcamActive)}>
        {webcamActive ? "Stop Webcam" : "Start Webcam"}
      </button>

      <h2>Processed Frame</h2>
      <img ref={processedImgRef} alt="Processed Frame" width="640" height="480" />
    </div>
  );
}

export default App;