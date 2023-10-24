import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

function Endreport() {
    //const StatusEndpoint = "http://127.0.0.1:5000/status"

    // 상태 및 데이터를 초기화합니다
    const [totalPositive, setTotalPositive] = useState(0);
    const [totalNegative, setTotalNegative] = useState(0);
    const [statuses, setStatuses] = useState([]);


    // State and useEffect for fetching data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/status");

                if (response.status === 200) {
                    const data = response.data;
                    const fetchedStatuses = data.statuses;

                    setStatuses(fetchedStatuses);

                    // Calculate total positive and total negative
                    const totalPos = fetchedStatuses.reduce(
                        (acc, row) => acc + row.happiness + row.neutral,
                        0
                    );
                    const totalNeg = fetchedStatuses.reduce(
                        (acc, row) => acc + row.disgust, //+ row.sadness
                        0
                    );

                    setTotalPositive(totalPos);
                    setTotalNegative(totalNeg);
                }
            } catch (error) {
                console.error("Error fetching status data", error);
            }
        };

        fetchData();
    }, []);

    // Bar Chart
    useEffect(() => {
        if (statuses.length > 0) {
            // Calculate specific emotion values based on statuses
            const totalDrowsiness = statuses.reduce((acc, row) => acc + row.drowsiness, 0);
            const totalConfusion = statuses.reduce((acc, row) => acc + row.confusion, 0);
            const totalHappiness = statuses.reduce((acc, row) => acc + row.happiness, 0);
            const totalSurprise = statuses.reduce((acc, row) => acc + row.surprise, 0);

            // Calculate the sum of all emotions
            const totalEmotions = totalDrowsiness + totalConfusion + totalHappiness + totalSurprise;

            // Create a container for the chart
            let chartContainer = am4core.create("emotion-chart", am4core.Container);
            chartContainer.width = am4core.percent(100);
            chartContainer.height = am4core.percent(100);

            // Create a chart
            let chart = chartContainer.createChild(am4charts.XYChart);
            chart.data = [
                {
                    emotion: "Drowsiness",
                    value: Math.round(totalDrowsiness / totalEmotions * 100),
                    color: "orange",
                },
                {
                    emotion: "Confusion",
                    value: Math.round(totalConfusion / totalEmotions * 100),
                    color: "pink",
                },
                {
                    emotion: "Happiness",
                    value: Math.round(totalHappiness / totalEmotions * 100),
                    color: "lightgreen",
                },
                {
                    emotion: "Surprise",
                    value: Math.round(totalSurprise / totalEmotions * 100),
                    color: "lightblue",
                },
            ];

            // Create axes
            let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "emotion";
            categoryAxis.renderer.grid.template.location = 0;

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            let series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = "value";
            series.dataFields.categoryX = "emotion";
            series.columns.template.strokeWidth = 0;
            series.columns.template.tooltipText = "{categoryX}: [bold]{valueY.formatNumber('#.')}[/]";
            series.columns.template.fill = am4core.color("#888888");
            series.columns.template.adapter.add("fill", function (fill, target) {
                if (target.dataItem) {
                    return am4core.color(target.dataItem.dataContext.color);
                }
                return fill;
            });

            // Create labels for each bar
            let labelBullet = series.bullets.push(new am4charts.LabelBullet());
            labelBullet.label.text = "{categoryX}";
            labelBullet.label.dy = -10; // Adjust the label's vertical position

            // Set label color based on emotion
            labelBullet.label.adapter.add("fill", function (fill, target) {
                if (target.dataItem) {
                    return am4core.color(target.dataItem.dataContext.color);
                }
                return fill;
            });
            // Legend
            chart.legend = new am4charts.Legend();

            // Finally, dispose of the chart when your component unmounts
            return () => {
                chart.dispose();
            };
        }
    }, [statuses]);

    // Line chart
    useEffect(() => {
        if (statuses.length > 0) {
            // Create a container for the chart
            let lineChartContainer = am4core.create("line-chart", am4core.Container);
            lineChartContainer.width = am4core.percent(100);
            lineChartContainer.height = am4core.percent(100);

            // Create a chart
            let lineChart = lineChartContainer.createChild(am4charts.XYChart);

            // Add data to the chart using statuses
            lineChart.data = statuses;

            // Create date axis for the X-axis
            let dateAxis = lineChart.xAxes.push(new am4charts.DateAxis());
            dateAxis.dataFields.category = "timestamp";
            dateAxis.renderer.grid.template.location = 0;
            dateAxis.dateFormats.setKey("second", "HH:mm:ss");

            // Create value axis for the Y-axis
            let valueAxis = lineChart.yAxes.push(new am4charts.ValueAxis());

            // Create a series for Drowsiness
            let drowsinessSeries = lineChart.series.push(new am4charts.LineSeries());
            drowsinessSeries.dataFields.dateX = "timestamp";
            drowsinessSeries.dataFields.valueY = "drowsiness";
            drowsinessSeries.name = "Drowsiness";
            drowsinessSeries.stroke = am4core.color("orange");

            // Create a series for Confusion
            let confusionSeries = lineChart.series.push(new am4charts.LineSeries());
            confusionSeries.dataFields.dateX = "timestamp";
            confusionSeries.dataFields.valueY = "confusion";
            confusionSeries.name = "Confusion";
            confusionSeries.stroke = am4core.color("pink");

            // Create a series for Happiness
            let happinessSeries = lineChart.series.push(new am4charts.LineSeries());
            happinessSeries.dataFields.dateX = "timestamp";
            happinessSeries.dataFields.valueY = "happiness";
            happinessSeries.name = "Happiness";
            happinessSeries.stroke = am4core.color("lightgreen");

            // Create a series for Surprise
            let surpriseSeries = lineChart.series.push(new am4charts.LineSeries());
            surpriseSeries.dataFields.dateX = "timestamp";
            surpriseSeries.dataFields.valueY = "surprise";
            surpriseSeries.name = "Surprise";
            surpriseSeries.stroke = am4core.color("lightblue");

            // Add a legend
            lineChart.legend = new am4charts.Legend();

            // Enable the chart to use data from all series when creating the axis ranges
            lineChart.seriesContainer.multiZoom = true;

            // Finally, dispose of the chart when your component unmounts
            return () => {
                lineChart.dispose();
            };
        }
    }, [statuses]);



    return (
        <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
            <Grid item xs={8}> {/* md={8} lg={6} xl={4}*/}
                <Paper sx={{ backgroundColor: 'black', padding: '20px', textAlign: 'center', color: 'white' }} elevation={3}>
                    <br />
                    <Typography variant="h5">오늘 발표에서 청중이 느낀 감정은?</Typography>
                    <Typography variant="h4" style={{ color: 'blue', margin: '10px', marginBottom: '10px' }}>
                        긍정적: {Math.round((totalPositive / (totalPositive + totalNegative)) * 100)}%
                    </Typography>
                    <Typography variant="h4" style={{ color: 'red', margin: '10px' }}>
                        부정적: {Math.round((totalNegative / (totalPositive + totalNegative)) * 100)}%
                    </Typography>

                    <br />
                    <Typography variant="h5">발표에서 각각 상태들은 얼마나 나왔을까?</Typography>
                    <div id="emotion-chart" style={{ width: "100%", height: "320px" }}></div>

                    {/*amCharts를 통한 그래프 생성*/}
                    <Typography variant="h5" >인지 상태별 추이를 확인해보자</Typography>
                    <br />
                    {/* <ButtonGroup>
                        <Button >긍정적</Button>
                        <Button>부정적</Button>
                    </ButtonGroup> */}{/* 다른 감정들도 버튼으로 추가 */}
                    <div id="line-chart" style={{ width: "100%", height: "300px" }}></div>
                </Paper>
            </Grid>
        </Grid>
    );


}

export default Endreport;

















// function Endreport() {
//     const StatusEndpoint = "http://127.0.0.1:5000/status";
//     const chartRef = useRef(null);
//     const [chart, setChart] = useState(null);
//     const [emotionsVisibility, setEmotionsVisibility] = useState({
//         drowsiness: true,
//         confusion: true,
//         happiness: false,
//         surprise: false,
//         anger: false,
//         fear: false,
//         disgust: false,
//         sadness: false
//     });

//     useEffect(() => {
//         if (!chartRef.current) return;

//         const chart = am4core.create(chartRef.current, am4charts.XYChart);
//         chart.paddingTop = 40;
//         chart.paddingRight = 10;
//         chart.paddingBottom = 10;
//         chart.paddingLeft = 10;
//         chart.background.fill = am4core.color("#000");


//         // Create the X axis for the chart
//         const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
//         dateAxis.renderer.grid.template.location = 0;
//         dateAxis.renderer.labels.template.fill = am4core.color("#ffffff");
//         dateAxis.renderer.grid.template.stroke = am4core.color("#ffffff");

//         // Create the Y axis for the chart
//         const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
//         valueAxis.min = 0;
//         valueAxis.max = 1;
//         valueAxis.renderer.labels.template.fill = am4core.color("#ffffff");
//         valueAxis.renderer.grid.template.stroke = am4core.color("#ffffff");

//         function createSeries(name, title, lineColor) {
//             const series = chart.series.push(new am4charts.LineSeries());
//             series.dataFields.dateX = "timestamp";
//             series.dataFields.valueY = name;
//             series.name = title;
//             series.stroke = am4core.color(lineColor);
//             series.strokeWidth = 2;
//             series.fillOpacity = 0.2;


//             // 제목 추가
//             const titleDiv = chart.chartContainer.createChild(am4core.Label);
//             titleDiv.text = title;
//             titleDiv.fontSize = 16;
//             titleDiv.align = "center";
//             titleDiv.isMeasured = false;
//             titleDiv.x = am4core.percent(50);
//             titleDiv.dy = -30;
//             titleDiv.fill = am4core.color("#000");
//             titleDiv.fontWeight = "bold";

//             // Additional part to handle visibility
//             if (emotionsVisibility[name]) {
//                 series.hiddenInLegend = true;
//                 series.hidden = true;
//             }

//             return series;
//         }


//         // 감정에 대한 시리즈 생성
//         createSeries("drowsiness", "Drowsiness", "#00FFFF"); // Drowsiness (하늘색)
//         createSeries("confusion", "Confusion", "#FF0000"); // Confusion (빨간색)
//         createSeries("happiness", "Happiness", "#00FF00"); // Happiness (초록색)
//         createSeries("surprise", "Surprise", "#FFA500"); // Surprise (주황색)
//         createSeries("anger", "Anger", "#FF4500"); // Anger (주황빛 붉은색)
//         createSeries("fear", "Fear", "#800080"); // Fear (보라색)
//         createSeries("disgust", "Disgust", "#008000"); // Disgust (진한 초록색)
//         createSeries("sadness", "Sadness", "#0000FF"); // Sadness (파란색)

//         setChart(chart);

//         return () => {
//             chart.dispose();
//         };
//     }, []);

//     useEffect(() => {
//         if (chart) {
//             const fetchData = async () => {
//                 try {
//                     const response = await axios.get(StatusEndpoint);
//                     if (response.status === 200) {
//                         const data = response.data;

//                         // 감정 데이터 구성
//                         const emotionsData = data.map(item => ({
//                             timestamp: new Date(item.timestamp * 1000),
//                             drowsiness: item.drowsiness,
//                             confusion: item.confusion,
//                             happiness: item.happiness,
//                             surprise: item.surprise,
//                             anger: item.anger,
//                             fear: item.fear,
//                             disgust: item.disgust,
//                             sadness: item.sadness
//                         }));

//                         chart.data = emotionsData;
//                     }
//                 } catch (error) {
//                     console.error("Error fetching the status data", error);
//                 }
//             };

//             fetchData();
//         }
//     }, [chart]);

//     // Additional part to handle button clicks
//     function handleButtonClick(e) {
//         //        e.preventDefault();

//         const emotionName = e.target.name;

//         setEmotionsVisibility(prevVisibility => ({
//             ...prevVisibility,
//             [emotionName]: !prevVisibility[emotionName]
//         }));

//         const selectedGraph = chart.series.values.find((series) => series.name === emotionName);

//         if (selectedGraph) {
//             // 그래프의 가시성 조정
//             selectedGraph.hidden = !selectedGraph.hidden;

//             // 레전드 항목의 가시성 조정
//             selectedGraph.hiddenInLegend = selectedGraph.hidden;
//         }
//     }

//     return (
//         <div>
//             <div id="chartdiv" ref={chartRef} style={{ width: "100%", height: "500px" }} />
//             {Object.keys(emotionsVisibility).map((emotion) => (
//                 <button key={emotion} name={emotion} onClick={handleButtonClick}>
//                     {emotionsVisibility[emotion] ? 'Hide' : 'Show'} {emotion}
//                 </button>
//             ))}
//         </div>
//     );
// }

// export default Endreport;
