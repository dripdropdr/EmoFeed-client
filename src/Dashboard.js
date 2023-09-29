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

        let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.title.text = "Value";

        function createSeries(name, color) {
            let series = x.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = "date";
            series.dataFields.valueY = name;
            series.name = name;
            series.stroke = am4core.color(color); // line color
            series.tooltipText = `{name}: [bold]{valueY}[/]`;
            series.showOnInit = true;
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

    return <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "500px" }} />;
}


export default Dashboard;
