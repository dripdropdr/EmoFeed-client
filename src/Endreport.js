import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import './Endreport.css';



function Endreport() {
    // 상태 및 데이터를 초기화합니다
    const [totalPositive, setTotalPositive] = useState(0);
    const [totalNegative, setTotalNegative] = useState(0);
    const [statuses, setStatuses] = useState([]);
    const [positivePop, setPositivePop] = useState(true);
    const [negativePop, setNegativePop] = useState(false);

    // State and useEffect for fetching data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/status");
                if (response.status === 200) {
                    const data = response.data;
                    const fetchedStatuses = data.statuses;
                    setStatuses(fetchedStatuses);
                    // Calculate total positive and total negative
                    const totalPos = fetchedStatuses.reduce(
                        (acc, row) => acc + row.happiness + row.neutral, 0
                    );
                    const totalNeg = fetchedStatuses.reduce(
                        (acc, row) => acc + row.disgust, 0
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

    const handlePositive = () => {
        if (positivePop == true){
            setPositivePop(false);
        } else {
            setPositivePop(true);
        }
    };

    const handleNegative = () => {
        if (negativePop == true){
            setNegativePop(false);
        } else {
            setNegativePop(true);
        }
    };


    // Bar Chart
    useEffect(() => {
        console.log(statuses)
        if (statuses.length > 0) {
            // Calculate specific emotion values based on statuses
            const totalDrowsiness = statuses.reduce((acc, row) => acc + row.drowsiness, 0);
            const totalConfusion = statuses.reduce((acc, row) => acc + row.confusion, 0);
            const totalHappiness = statuses.reduce((acc, row) => acc + row.happiness, 0);
            const totalSurprise = statuses.reduce((acc, row) => acc + row.surprise, 0);
            const totalDisgust = statuses.reduce((acc, row) => acc + row.disgust, 0);
            const totalAnger = statuses.reduce((acc, row) => acc + row.anger, 0);
            const totalSadness = statuses.reduce((acc, row) => acc + row.sadness, 0);
            const totalNeutral = statuses.reduce((acc, row) => acc + row.neutral, 0);

            // Calculate the sum of all emotions
            const totalEmotions = totalDrowsiness + totalConfusion + totalHappiness + totalSurprise + totalAnger + totalDisgust + totalSadness + totalNeutral;

            // Create a container for the chart
            let chartContainer = am4core.create("emotion-chart", am4core.Container);
            chartContainer.width = am4core.percent(100);
            chartContainer.height = am4core.percent(100);

            // Create a chart
            let chart = chartContainer.createChild(am4charts.XYChart);
            chart.data = [
                {
                    emotion: "Happiness",
                    value: Math.round(totalHappiness / totalEmotions * 100),
                    color: "lightgreen",
                },
                {
                    emotion: "Surprise",
                    value: Math.round(totalSurprise / totalEmotions * 100),
                    color: "lightpink",
                },
                {
                    emotion: "Anger",
                    value: Math.round(totalAnger / totalEmotions * 100),
                    color: "red",
                },
                {
                    emotion: "Sadness",
                    value: Math.round(totalSadness / totalEmotions * 100),
                    color: "lightblue",
                },
                {
                    emotion: "Confusion",
                    value: Math.round(totalConfusion / totalEmotions * 100),
                    color: "lightgray",
                },
                {
                    emotion: "Drowsiness",
                    value: Math.round(totalDrowsiness / totalEmotions * 100),
                    color: "blue",
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
            //lineChart.data = statuses;
            // Convert Unix timestamps to JavaScript Date objects
            const data = statuses.map(status => ({
                ...status,
                timestamp: new Date(status.timestamp * 1000)
            }));

            // Add data to the chart
            lineChart.data = data;


            // Create date axis for the X-axis
            let dateAxis = lineChart.xAxes.push(new am4charts.DateAxis());
            dateAxis.dataFields.date = "timestamp"
            dateAxis.renderer.grid.template.location = 0;
            dateAxis.dateFormats.setKey("second", "HH:mm:ss");
            dateAxis.dateFormats.setKey("minute", "HH:mm:ss");

            // Create value axis for the Y-axis
            let valueAxis = lineChart.yAxes.push(new am4charts.ValueAxis());

            function createLineSeriesAndLabel(chart, dataFieldY, labelText, color, xOffset, seriesName) {
                // Create a series for the emotion
                let series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.dateX = "timestamp";
                series.dataFields.valueY = dataFieldY;
                series.name = seriesName; 
                series.hidden = true;
                series.stroke = am4core.color(color);

                // Create a label for the emotion
                let label = series.createChild(am4core.Label);
                label.text = labelText;
                label.fill = am4core.color(color);
                label.fontSize = 15;
                label.dy = -10; // Adjust the label's vertical position
                label.dx = xOffset + 320; // Adjust the label's horizontal position

                // Prevent the series name from hiding when clicked
                series.events.on("hidden", function () {
                    series.hide();
                });

                return series;
            }

            // Create series and labels
            let drowsinessSeries = createLineSeriesAndLabel(lineChart, "drowsiness", "Drowsiness", "blue", 0, "Drowsiness");
            let confusionSeries = createLineSeriesAndLabel(lineChart, "confusion", "Confusion", "lightgray", 100, "Confusion");
            let happinessSeries = createLineSeriesAndLabel(lineChart, "happiness", "Happiness", "lightgreen", 200, "Happiness");
            let surpriseSeries = createLineSeriesAndLabel(lineChart, "surprise", "Surprise", "lightpink", 300, "Surprise");
            let angerSeries = createLineSeriesAndLabel(lineChart, "anger", "Anger", "red", 385, "Anger");
            let sadnessSeries = createLineSeriesAndLabel(lineChart, "sadness", "Sadness", "lightblue", 450, "Sadness");

            // Add a legend
            lineChart.legend = new am4charts.Legend();
            lineChart.legend.markers.template.disabled = false;

            // Add chart labels
            lineChart.cursor = new am4charts.XYCursor();
            lineChart.cursor.xAxis = dateAxis; // Attach the cursor to the X-axis
            lineChart.cursor.xAxis.tooltipDateFormat = "HH:mm:ss"; // 1초 단위로 툴팁에 표시될 형식을 설정합니다
            lineChart.cursor.snapToSeries = [happinessSeries, surpriseSeries, angerSeries, sadnessSeries, confusionSeries, drowsinessSeries,];

            // Enable the chart to use data from all series when creating the axis ranges
            lineChart.seriesContainer.multiZoom = true;

            // Finally, dispose of the chart when your component unmounts
            return () => {
                lineChart.dispose();
            };
        }
    }, [statuses]);



    return (
        <div className="container">
            <div className="paper">
                <br />
                <div className='barchartContainer'>
                    <p className="title">How was their Feeling?</p>
                    <div id="emotion-chart" className="chart"></div> {/*amCharts를 통한 그래프 생성*/}
                    <span className="emotion-positive" onClick={handlePositive}>
                        Positive: {Math.round((totalPositive / (totalPositive + totalNegative)) * 100)}%
                    </span>
                    <span className="emotion-negative" onClick={handleNegative}>
                        Negative: {Math.round((totalNegative / (totalPositive + totalNegative)) * 100)}%
                    </span>
                </div>
                <br />
                <br />
                <p className="title">Time-series Feedback</p>
                <br />
                <div id="line-chart" className="line-chart"></div>
                <br />
                <br /><br />
                <br />
            </div>
        </div>
    );


}

export default Endreport;