/*import React from 'react';

function Dashboard() {
  return (
    <div>
      <h1>대시보드 내용</h1>
    </div>
  );
}
export default Dashboard;
*/


import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

function Dashboard() {
    const chartRef = useRef(null);
    const [chart, setChart] = useState(null);

    useEffect(() => {
        let x = am4core.create(chartRef.current, am4charts.XYChart);
        x.paddingRight = 20;

        let dateAxis = x.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.title.text = "Time";

        let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.title.text = "Value";

        // Here, create the createSeries function
        function createSeries(name) {
            let series = x.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = "date";
            series.dataFields.valueY = name;
            series.name = name;
            series.tooltipText = `{name}: [bold]{valueY}[/]`;
            series.showOnInit = true;
            return series;
        }

        // 모든 감정과 drowsiness에 대한 시리즈를 생성합니다.
        createSeries("drowsiness");
        createSeries("neutral");
        createSeries("anger");
        createSeries("disgust");
        createSeries("fear");
        createSeries("happiness");
        createSeries("sadness");
        createSeries("surprise");

        setChart(x);

        return () => {
            x.dispose();
        };
    }, []);

    useEffect(() => {
        if (chart) {
            const fetchData = async () => {
                try {
                    const response = await axios.get('http://127.0.0.1:5000/new_endpoint'); // 주소를 업데이트했습니다.
                    const data = response.data;
                    const newData = {
                        date: new Date(data.timestamp), // timestamp를 사용하여 date 객체를 생성합니다.
                        drowsiness: data.drowsiness,
                        ...data.emotions // 나머지 감정들도 펼쳐서 객체에 추가합니다.
                    };
                    chart.addData(newData);
                } catch (error) {
                    console.error("Error fetching the webcam analysis data", error);
                }
            };
            const interval = setInterval(fetchData, 3000); // 3초마다 데이터를 가져옵니다.
            return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 인터벌을 정리합니다.
        }
    }, [chart]);


    return <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "500px" }} />;
}

export default Dashboard;
