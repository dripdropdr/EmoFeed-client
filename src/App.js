import { useEffect, useState, useRef } from 'react';
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

  const canvas = document.createElement("canvas");
  canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
  const dataURL = canvas.toDataURL("image/jpeg");
  
  fetch("/capture", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: dataURL })
  })
  .then(response => {
    console.log(response);  // 응답 로깅
    return response.blob();
  })
  .then(blob => {
    const imageUrl = URL.createObjectURL(blob);
    processedImgRef.current.src = imageUrl;
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