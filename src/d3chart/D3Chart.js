import React from 'react';
import * as d3 from 'd3'
import './d3chart.css';
import gdpData from './gdpData';

var D3Chart = React.createClass({
    componentDidMount(){
        var data = gdpData.data;
        //var parseDate = d3.timeFormat("%Y-%m-%d").parse;
        var margin = {
            top: 20,
            bottom: 20,
            right: 20,
            left: 20
        };
        var width = 1000 - margin.left - margin.right;
        var height = 600  - margin.top - margin.bottom;
        var barWidth = Math.round(width/data.length);

        var minDate = new Date(data[0][0]);
        var maxDate = new Date(data[data.length - 1][0]);

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[1])])
            .range([height, 0]); // Note the reverse to what one might expect, because coordinates are from top left.

        var x = d3.scaleLinear()
            .domain([minDate, maxDate])
            .range([0, width]);

         var chart = d3.select("#d3chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")// g is for group - we want everything in this group to be shifted (transformed) by the margins.
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // This is ugly string interpolation that is currently necessary with D3 transform attributes.
        chart.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(new Date(d[0]));
            })
            .attr("y", function(d) {
                return y(d[1]); // y coordinate of the top left corner of the rect, measured from top left corner of svg.
            })
            .attr("height", function(d) {
                return height - y(d[1]);  // Note y() scale function returns a large number for a small value.
            })
            .attr("width", barWidth);
    },

    render(){
        return(
            <div className="app">
                <h1>The D3 Component Rendered Below</h1>
                <svg id="d3chart" className="chart" />
            </div>
            )
    }
});

export default D3Chart;



