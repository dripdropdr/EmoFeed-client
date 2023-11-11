import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom'; // Switch를 Routes로 바꿈
import Endreport from './Endreport';
import './App.css';

function IntroPage() {
  const navigate = useNavigate();
  const [animateOut, setAnimateOut] = useState(false);
  const initialCheckboxes = [
    { key: 'happiness', checked: false },
    { key: 'surprise', checked: false },
    { key: 'anger', checked: false },
    { key: 'sadness', checked: false },
    { key: 'confusion', checked: false },
  ];
  const [checkboxes, setCheckboxes] = useState(initialCheckboxes);

  const handleProceedClick = async () => {
    const response = await fetch('/preferredStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checkboxes }),
    });

    const data = await response.json();
    console.log(data);  // 서버 응답 처리
    setAnimateOut(true);
    setTimeout(() => {
        navigate("/main");
    }, 1000);  // 애니메이션 지속 시간과 일치해야 합니다.
  };

  const handleCheckboxChange = (index) => {
    // 현재 체크된 체크박스의 수 계산
    const checkedCount = checkboxes.filter(cb => cb.checked).length;
    // 클릭된 체크박스의 현재 상태
    const isCurrentlyChecked = checkboxes[index].checked;
    // 이미 2개가 체크되어 있고, 클릭된 체크박스가 체크되지 않았을 경우 추가 선택 방지
    if (checkedCount >= 1 && !isCurrentlyChecked) return;

    // 체크박스 상태 업데이트
    const newCheckboxes = checkboxes.map((item, idx) => {
      if (idx === index) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    setCheckboxes(newCheckboxes);
  };

  return (
    <div className={`introContainer ${animateOut ? 'animateOut' : ''}`}>
        <img src={process.env.PUBLIC_URL + 'images/emofeed-logo.svg'} onClick={handleProceedClick} alt="Emofeed logo" className="emofeedlogo"/>
        <video width="500" className='introface' muted autoPlay>
          <source src={process.env.PUBLIC_URL + "/videos/happiness-low.mp4"} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className='checkboxesContainer'>
          <p>Check your "single preferred" emotion</p>
          {checkboxes.map((checkbox, index) => (
            <div key={checkbox.key}>
              <input
                id={checkbox.key}
                type="checkbox"
                checked={checkbox.checked}
                onChange={() => handleCheckboxChange(index)}
              />
              <label htmlFor={checkbox.key}>{checkbox.key}</label>
            </div>
          ))}
        </div>
        <img src={process.env.PUBLIC_URL + 'images/emofeed-start.svg'} onClick={handleProceedClick} alt="Shall we start" className="emofeedstart" />
    </div>
  );
}

function EndPage() {
  const navigate = useNavigate();
  const [animateOut, setAnimateOut] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);  // Dashboard 표시 여부를 제어하는 상태

  const handleProceedClick = () => {
    setAnimateOut(true);
    setTimeout(() => {
        navigate("/main");
    }, 1000);
  };

  return (
    <div className={`endContainer ${animateOut ? 'animateOut' : ''}`}>
        <div className='buttonContainer'>
          <button onClick={handleProceedClick} className='gotoMainBtn'>Go to Main?</button>
        </div>

        {/* Dashboard 컴포넌트 추가 */}
        <div className={showDashboard ? 'dashboard-visible' : 'dashboard-hidden'}>
          <Endreport />
        </div>
    </div>
  );
}


function App() {

  const flaskEndpoint = "/webcam"; // http://127.0.0.1:5000
  const analysisEndpoint = "/webcam_analysis";

  //Dashboard 컴포넌트 렌더링(숨겨두다가 report 눌러야 뜨도록)
  const [showDashboard, setShowDashboard] = useState(false);
  const [data, setData] = useState({ drowsiness: null, emotion1: null, emotion1_strength: null, emotion2: null, emotion2_strength: null, assistant:null});
  // 'neutral', 'anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise'
  const [fontSize, setFontSize] = useState('20px');
  const location = useLocation();


  const getVideoUrl = (data) => {

    // confusion
    if (data.confusion > 0.55){
        if (data.confusion >= 0.75){
            return "/videos/confusion-high.mp4";
        } else {
            return "/videos/confusion-low.mp4";
        }
    }

    // 졸릴 때
    if (data.drowsiness > 0.55) {
      if (data.drowsiness >= 0.75) {
        return "/videos/drowsiness-high.mp4";
      } else {
        return "/videos/drowsiness-low.mp4";
      }
    }

    // 안 졸릴때
    if (data.emotion1 === 'neutral'){
        if (data.emotion1_strength >= 0.45){
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
                // case 'confusion':
                //     return "/videos/confusion-low.mp4";
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
            // case 'confusion':
            //     return "/videos/confusion-high.mp4";
            default:
                return "/videos/neutral.mp4";
          }
    }
  };

  useEffect(() => {
    console.log(location.pathname);
    if (location.pathname !== "/main") {
      return;  // 현재 경로가 /main이 아니면 fetchData 실행 중지
    }
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

    // 4초마다 데이터를 가져옵니다.
    const intervalId = setInterval(fetchData, 4000);

    // 컴포넌트가 unmount 될 때 interval을 정리합니다.
    return () => {
      clearInterval(intervalId);
    };
  }, [analysisEndpoint, location.pathname]);

  return (
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/main" element={
          <div className="container">
            <div className="header">
              <div className="dataSection">
                {/* <img src={process.env.PUBLIC_URL + 'images/emofeed-logo.svg'}  alt="Emofeed logo" className="emofeedlogo-main"/>
                <p>Drowsiness: {data.drowsiness}</p>
                <p>Confusion: {data.confusion}</p>
                <p>{data.emotion1}: {data.emotion1_strength}</p>
                <p>{data.emotion2}: {data.emotion2_strength}</p> */}
              </div>
              <div className="speechBubble">
                <span style={{ fontSize }}>{data.assistant}</span>
              </div>
              <div className="videoSection">
                <video muted autoPlay>
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
            <div className='endreportContainer'>
              <Link to="/endreport" className='endreportBtn'>Finish?</Link>
            </div>
          </div>
        } />
        <Route path="/endreport" element={<EndPage/>}/>
      </Routes>
  );
}

export default App;


