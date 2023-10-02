import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

function Dashboard() {
    const Endpoint = "http://127.0.0.1:5000/new_endpoint"
    const chartRef = useRef(null);
    const [chart, setChart] = useState(null);

    useEffect(() => {
        if (!chartRef.current) return;

        let x = am4core.create(chartRef.current, am4charts.XYChart);
        x.paddingRight = 20;
        x.background.fill = am4core.color("#ffffff");

        let dateAxis = x.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.title.text = "Time";
        // 30초의 데이터만 보여주도록 start와 end 설정
        dateAxis.start = 1 - (30 / (30 * 60)); // 30초를 30분으로 나눈 값으로 설정
        dateAxis.end = 1;
        dateAxis.keepSelection = true; // 사용자가 스크롤하거나 확대/축소하여 선택한 범위를 유지


        let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0; // 최소값을 0으로 설정
        valueAxis.max = 1; // 최대값을 1로 설정
        valueAxis.strictMinMax = true; // Y축 값이 min과 max 값 사이에만 있도록 설정
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.title.text = "Value";

        // Cursor 설정을 통해 차트의 확대/축소를 가능하게 합니다.
        x.cursor = new am4charts.XYCursor();
        x.cursor.behavior = "zoomY"; // Y축을 기준으로 줌 인/아웃
        x.cursor.lineY.disabled = true; // X축 점선을 제거합니다.

        // Scrollbar 설정을 통해 확대/축소 상태에서 차트를 이동할 수 있게 합니다.
        x.scrollbarX = new am4core.Scrollbar();
        x.scrollbarY = new am4core.Scrollbar();
        x.scrollbarY.marginLeft = 0;

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
            if (name === "disgust") { // series가 "disgust"일 때만
                series.tooltip.label.fill = am4core.color("#000000"); // 말풍선 라벨을 검은색으로 설정
            }

            return series;
        }


        createSeries("drowsiness", "#FF0000"); // 각각의 시리즈에 대해 원하는 색상을 지정할 수 있습니다.
        createSeries("neutral", "#0000FF");
        createSeries("anger", "#00FF00");
        createSeries("disgust", "#FFFF00");
        createSeries("fear", "#FF00FF");
        createSeries("happiness", "#00FFFF");
        createSeries("sadness", "#000000");
        createSeries("surprise", "#888888");

        x.legend = new am4charts.Legend(); // 범례 추가
        x.legend.position = "right"; // 범례의 위치를 차트의 우측에 설정

        x.legend.itemContainers.template.events.on("over", function (event) {
            x.series.each((s) => {
                s.stroke = am4core.color("#dcdcdc"); // 모든 series를 희미하게 만듭니다.
                s.strokeWidth = 1;
            });
            
            let activeSeries = event.target.dataItem.dataContext; // 마우스가 올라간 범례 아이템에 연결된 시리즈를 가져옵니다.
            if (activeSeries) {
                activeSeries.stroke = activeSeries.defaultStroke; // activeSeries를 원래의 색으로 복원합니다.
                activeSeries.strokeWidth = 3; // activeSeries를 강조합니다.
            }
        });
        
        x.legend.itemContainers.template.events.on("out", function (event) {
            x.series.each((s) => {
                s.stroke = s.defaultStroke; // 모든 series를 원래의 색으로 복원합니다.
                s.strokeWidth = 2;
            });
        });

        // let lastClicked; // 아이템 클릭을 위한 변수 추가 >>  *****이거 DB연결하고 다시 이어지는지 해보기(지금은 누르면 다른 그래프 사라짐)*****
        // x.legend.itemContainers.template.events.on("hit", function (event) {
        //     let series = event.target.dataItem.dataContext;
        
        //     if (lastClicked && lastClicked === series) {
        //         // 이전에 선택한 아이템을 다시 선택한 경우, 모든 시리즈를 원래대로 복원합니다.
        //         x.series.each((s) => {
        //             s.stroke = s.defaultStroke;
        //             s.strokeWidth = 2;
        //             s.hidden = false; // 모든 series를 보이게 설정합니다.
        //         });
        //         lastClicked = null; // lastClicked를 초기화합니다.
        //     } else {
        //         // 다른 아이템을 선택한 경우, 해당 시리즈를 강조합니다.
        //         x.series.each((s) => {
        //             if (s !== series) {
        //                 s.stroke = am4core.color("#dcdcdc"); // 다른 series를 희미하게 만듭니다.
        //                 s.strokeWidth = 1;
        //                 s.hidden = true; // 다른 series를 숨깁니다.
        //             } else {
        //                 series.stroke = series.defaultStroke;
        //                 series.strokeWidth = 3;
        //                 series.hidden = false; // 선택한 series를 보이게 설정합니다.
        //             }
        //         });
        //         lastClicked = series; // lastClicked를 업데이트합니다.
        //     }
        // });

        
        setChart(x);

        return () => {
            x.dispose();
        };
    }, []);

    useEffect(() => {
        if (chart) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(Endpoint);
                    if (response.status === 200) {
                        const { drowsiness, emotions } = response.data; // destructuring을 사용하여 drowsiness와 emotions를 추출
                        const newData = {
                            date: new Date(), // Using current Date
                            drowsiness: drowsiness, // drowsiness를 직접 매핑
                            ...emotions // emotions 객체를 spread
                        };
                        chart.addData(newData);
                    }
                } catch (error) {
                    console.error("Error fetching the webcam analysis data", error);
                }
            };
            const interval = setInterval(fetchData, 3000); // Fetch data every 3 seconds
            return () => clearInterval(interval); // Clear interval when component unmounts
        }
    }, [chart]);

    return <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "500px", marginTop: "100px" }} />;
}


export default Dashboard;

