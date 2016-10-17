import React from 'react';
import * as d3 from 'd3';
import './gameOfLifeD3Table.css';

var cellArr = [];
var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
var svg, width, height, g;

export default React.createClass({
    getInitialState(){

        return {
            runSimulation: false,
            speed: 1000,
            generation: 0,
            gameWidth: 50,
            gameHeight: 50
        }
    },
    componentWillMount(){
        // Create the data array if it doesn't yet exist.
        if(cellArr.length < this.state.gameHeight) {
            for (var i = 0; i < this.state.gameHeight; i++) {
                cellArr[i] = [];
                for (var j = 0; j < this.state.gameWidth; j++) {
                    cellArr[i][j] = Math.random() > 0.8 ? 1 : 0;
                }
            }
        }
    },
    componentDidMount(){
        svg = d3.select("svg");
        width = +svg.attr("width");
        height = +svg.attr("height");
        g = svg.append("g").attr("transform", "translate(32," + (height / 2) + ")")

        this.d3Update(alphabet);
        // Grab a random sample of letters from the alphabet, in alphabetical order.
        let intervalId = d3.interval(function() {
            this.d3Update(d3.shuffle(alphabet)
                .slice(0, Math.floor(Math.random() * 26))
                .sort());
        }, 500);
        this.setState({intervalId: intervalId})
    },

    d3Update(data) {
        var t = d3.transition()
            .duration(750);

        // JOIN new data with old elements.
        var text = g.selectAll("text")
            .data(data, function(d) { return d; });

        // EXIT old elements not present in new data.
        text.exit()
            .attr("class", "exit")
            .transition(t)
            .attr("y", 60)
            .style("fill-opacity", 1e-6)
            .remove();

        // UPDATE old elements present in new data.
        text.attr("class", "update")
            .attr("y", 0)
            .style("fill-opacity", 1)
            .transition(t)
            .attr("x", function(d, i) { return i * 32; });

        // ENTER new elements present in new data.
        text.enter().append("text")
            .attr("class", "enter")
            .attr("dy", ".35em")
            .attr("y", -60)
            .attr("x", function(d, i) { return i * 32; })
            .style("fill-opacity", 1e-6)
            .text(function(d) { return d; })
            .transition(t)
            .attr("y", 0)
            .style("fill-opacity", 1);

// The initial display.





        //var rows, cells;
        //// on enter
        //rows = d3.select("#d3GameOfLife tbody").selectAll("tr").data(cellArr).enter().append('tr');
        //cells = rows.selectAll("td")
        //    .data(function(d) { return d; }); //JOIN.
        //
        //cells.exit().remove();
        //
        //cells.enter().append('td');
        //
        //// On enter and update
        //cells.attr("class", (d) => d > 0  ? "alive" : "dead").text((d) => d);
    },
    render(){
        return (
            <div className="app">
                <h1 className="h1">The D3 Component Rendered Below</h1>
                <svg width="960" height="500" />
                <button onClick={() => this.startSimulation()}>Run</button>
                <button onClick={() => clearInterval(this.state.intervalId)}>Stop</button>
                <button onClick={() => this.setState({speed: this.state.speed >99 ? this.state.speed - 50 : this.state.speed}, this.startSimulation())}>Faster</button>
                <button onClick={() => this.setState({speed: this.state.speed + 50}, this.startSimulation())}>Slower</button>
                <table id="d3GameOfLife">
                    <tbody />
                </table>
            </div>
        )
    },
    startSimulation() {
        if(this.state.runSimulation) clearInterval(this.state.intervalId);
        this.setState({runSimulation: true}, () => {
            var intervalId = setInterval(() => this.getNextArray(), this.state.speed);
            this.setState({intervalId: intervalId});
        });
    },
    getNextArray(){
        var startTrans = Date.now();
        var self = this;
        if(!self.state.runSimulation) {
            clearInterval(this.state.intervalId);
            return;
        }
        var nextArray = [];
        for (var i = 0; i < cellArr.length; i++){
            nextArray[i] = [];
            for(var j = 0; j < cellArr[i].length; j++){
                var cellScore = 0;
                if (i!== cellArr.length - 1) {
                    cellScore += cellArr[i + 1][j];
                    if (j !== 0) {
                        cellScore += cellArr[i + 1][j - 1];
                    }
                    if (j !== cellArr[i].length - 1) {
                        cellScore += cellArr[i + 1][j + 1];
                    }
                }
                if(i !== 0) {
                    cellScore += cellArr[i - 1][j];
                    if(j !== 0) {
                        cellScore += cellArr[i - 1][j - 1];
                    }
                    if(j !== cellArr[i].length - 1) {
                        cellScore += cellArr[i - 1][j + 1];
                    }
                }
                if(j !== 0) {
                    cellScore += cellArr[i][j - 1];
                }
                if(j !== cellArr[i].length - 1) {
                    cellScore += cellArr[i][j + 1];
                }
                if (cellScore > 3) nextArray[i][j] = 0;
                else if(cellScore === 3) nextArray[i][j] = 1;
                else if(cellScore <2) nextArray[i][j] = 0;
                else nextArray[i][j] = cellArr[i][j]; // Line not required because they are copied up top.
            }
        }
        cellArr = nextArray;
        console.log("Array Creation in " + (Date.now() - startTrans));
        this.d3update();
    }
});


