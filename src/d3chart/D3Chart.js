import React from 'react';
import * as d3 from 'd3'
import './d3chart.css';
import gdpData from './gdpData';

var D3Chart = React.createClass({
    componentDidMount(){
        var data = [4, 8, 15, 16, 23, 42];

        var x = d3.scaleLinear()
            .domain([0, d3.max(data)])
            .range([0, 420]);

        d3.select("#d3Component")
            .selectAll("div")
            .data(data)
            .enter().append("div")
            .style("width", function(d) { return x(d) + "px"; })
            .text(function(d) { return d; });
    },

    render(){
        return(
            <div>
                <h1>The D3 Component Rendered Below</h1>
                <div id="d3Component" className="chart"></div>
            </div>
            )
    }
});

export default D3Chart;



