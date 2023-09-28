import { useEffect, useState} from 'react';
import React from 'react';
// import './App.css';

function App() {
  const flaskEndpoint = "http://127.0.0.1:5000/webcam";
  const analysisEndpoint = "http://127.0.0.1:5000/webcam_analysis";

  const [data, setData] = useState({ drowsiness: null, emotion1: null, emotion1_strength: null, emotion2: null, emotion2_strength: null });
  // 'neutral', 'anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise'

  const getVideoUrl = (data) => {

    // 졸릴 때
    if (data.drowsiness > 0.5){
        if (data.drowsiness >= 0.75){
            return "/videos/drowsiness-high.mp4";
        } else {
            return "/videos/drowsiness-low.mp4";
        }
    }

    // 안 졸릴때
    if (data.emotion1 === 'neutral'){
        if (data.emotion1_strength >= 0.5){
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
                default:
                  return "/videos/neutral.mp4";
              }
        }
    } else { // 다른 감정 ...
        switch (data.emotion1) {
            case 'happiness':
                return "/videos/happiness-mid.mp4";
            case 'sadness':
                return "/videos/sadness-high.mp4";
            case 'anger':
                return "/videos/anger-high.mp4";
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

    return (
        <div>
            <h1>WebCam Stream</h1>
            <img src={flaskEndpoint} alt="Webcam Stream" />
            <div>
                <h2>Analysis Data</h2>
                <p>Drowsiness: {data.drowsiness}</p>
                <p>Emotion: {data.emotion}</p>
            </div>
            <div>
                <video width="320" height="240" muted autoPlay>
                    <source src={process.env.PUBLIC_URL + getVideoUrl(data)} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}

export default App;