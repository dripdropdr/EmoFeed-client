import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import {ReactComponent as Logo} from './assets/emofeed-logo.svg';

function Dashboard() {
    const StatusEndpoint = "http://127.0.0.1:5000/status"
    const RealTimeEndpoint = "http://127.0.0.1:5000/webcam_analysis"
    const chartRef = useRef(null);
    const [chart, setChart] = useState(null);

    useEffect(() => {
        if (!chartRef.current) return;

        let x = am4core.create(chartRef.current, am4charts.XYChart);
        x.paddingRight = 20;
        x.background.fill = am4core.color("#ffffff");

        // x축 설정
        let dateAxis = x.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0; 
        dateAxis.title.text = "Time";
        dateAxis.keepSelection = true;

        let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0; // 최소값을 0으로 설정
        valueAxis.max = 1; // 최대값을 1로 설정
        valueAxis.strictMinMax = true; // Y축 값이 min과 max 값 사이에만 있도록 설정
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.title.text = "Value";

        // Cursor 설정을 통해 각 수치 표시
        x.cursor = new am4charts.XYCursor();
        x.cursor.behavior = "zoomY"; // Y축을 기준으로 줌 인/아웃
        x.cursor.lineY.disabled = true; // X축 점선을 제거합니다.

        // Scrollbar 설정을 통해 확대/축소 상태에서 차트를 이동할 수 있게 합니다.
        // x.scrollbarX = new am4core.Scrollbar();
        // x.scrollbarX.keepFocus = false;
        // x.scrollbarY = new am4core.Scrollbar();
        // x.scrollbarY.marginLeft = 0;

        function createSeries(name, color) {
            let series = x.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = "date";
            series.dataFields.valueY = name;
            series.name = name;
            series.stroke = am4core.color(color); // line color
            series.strokeWidth = 2;
            series.tooltipText = `{name}: [bold]{valueY}[/]`;
            series.defaultStroke = series.stroke; // 원래의 색상을 저장합니다.
            // Tooltip 설정
            series.tooltip.getFillFromObject = false; // 기본적으로 오브젝트(여기서는 라인)의 색상을 사용하지 않도록 설정합니다.
            series.tooltip.background.fill = am4core.color(color); // Tooltip의 배경색을 라인의 색상과 동일하게 설정합니다.
            if (name === "happiness") {
                series.tooltip.label.fill = am4core.color("#000000"); // 말풍선 라벨을 검은색으로 설정
            }
            return series;
        }


        createSeries("drowsiness", "#FF00FF");
        //createSeries("neutral", "#888888");
        //createSeries("anger", "#FF0000");
        createSeries("disgust", "#00FF00");
        //createSeries("fear", "#000000");
        createSeries("confusion", "#FF0000");
        createSeries("happiness", "#FFFF00");
        //createSeries("sadness", "#00FFFF");
        createSeries("surprise", "#0000FF");


        // 우측 범례 추가
        x.legend = new am4charts.Legend();
        x.legend.position = "right";

        x.legend.itemContainers.template.events.on("over", function (event) {
            x.series.each((s) => {
                s.stroke = am4core.color("#dcdcdc"); // 모든 series를 희미하게 만듭니다.
                s.strokeWidth = 1;
            });

            let activeSeries = event.target.dataItem.dataContext; // 마우스가 올라간 범례 아이템에 연결된 시리즈를 가져옵니다.
            if (activeSeries) {
                activeSeries.stroke = activeSeries.defaultStroke; // activeSeries를 원래의 색으로 복원합니다.
                activeSeries.strokeWidth = 3; // 강조
            }
        });

        x.legend.itemContainers.template.events.on("out", function (event) {
            x.series.each((s) => {
                s.stroke = s.defaultStroke; // 모든 series를 원래의 색으로 복원합니다.
                s.strokeWidth = 2;
            });
        });

        setChart(x);

        return () => {
            x.dispose();
        };
    }, []);

    useEffect(() => {
        if (chart) {
            const fetchInitialData = async () => {
                try {
                    const response = await axios.get(StatusEndpoint);
                    if (response.status === 200) {
                        const data = response.data;
                        let newDataArray = [];

                        // 데이터 배열의 각 요소를 순회하며 newData 객체를 생성하고 newDataArray에 추가합니다.
                        data.forEach((item) => {
                            // timestamp 값을 Date 객체로 변환
                            //let dateObj = new Date(item.timestamp * 1000);
                            let newData = {
                                date: new Date(item.timestamp * 1000),
                                anger: item.anger,
                                confusion: item.confusion,
                                disgust: item.disgust,
                                drowsiness: item.drowsiness,
                                fear: item.fear,
                                happiness: item.happiness,
                                //neutral: item.neutral,
                                sadness: item.sadness,
                                surprise: item.surprise
                            };
                            newDataArray.push(newData); // newData를 newDataArray에 추가합니다.
                        });

                        console.log("Response Data:", newDataArray)
                        chart.data = newDataArray; // 초기 데이터로 업데이트                 

                        // x축 범위를 마지막 데이터 시간을 중심으로 설정
                        let lastTimestamp = data[data.length - 1].timestamp * 1000;

                        let startTime = lastTimestamp - 60 * 1000; // 1분 전
                        chart.xAxes.getIndex(0).zoomToDates(new Date(startTime), new Date(lastTimestamp));
                    }
                } catch (error) {
                    console.error("Error fetching the webcam analysis data", error);
                }
            };
            // 초기 데이터를 가져온 후에 실시간 데이터 가져오도록 설정
            fetchInitialData();

            // 실시간 데이터 업데이트 함수 생성 및 호출 
            setInterval(async () => {
                try {
                    let response = await axios.get(RealTimeEndpoint);

                    if (response.status === 200) {

                        let rawData = response.data.all;

                        console.log("Real Time Data:", response.data.all);

                        // timestamp 값을 Date 객체로 변환합니다.
                        //let dateObj = new Date(rawData.timestamp * 1000);

                        var newData = {
                            date: new Date(rawData.timestamp * 1000),
                            //anger: rawData.anger,
                            confusion: rawData.confusion,
                            //disgust: rawData.disgust,
                            drowsiness: rawData.drowsiness,
                            //fear: rawData.fear,
                            happiness: rawData.happiness,
                            //neutral: rawData.neutral,
                            //sadness: rawData.sadness,
                            surprise: rawData.surprise
                        };

                        chart.addData([newData], 1); // 데이터를 추가합니다.

                        let startTime = newData.date.getTime() - 60 * 1000; // 1분 전
                        chart.xAxes.getIndex(0).zoomToDates(new Date(startTime), newData.date);
                    }
                } catch (error) {
                    console.error("Error fetching real-time data", error);
                }
            }, 4000); // 3초마다 업데이트 
        }
    }, [chart]);

    return (
        <div className='dataSection'>
            {/* <h1>EmoFeed - Report</h1> EmoFeed 하단 로고로 바꿈, 흰색임*/}
            <Logo/>
            <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "500px", marginTop: "50px" }} />
        </div>

    );

}

export default Dashboard;
