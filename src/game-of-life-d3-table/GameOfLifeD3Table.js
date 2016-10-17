import React from 'react';
import * as d3 from 'd3';
import './gameOfLifeD3Table.css';

var cellArr = [];
// var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
// var svg, width, height, g;

//var table, tbody, rows;

export default React.createClass({
    getInitialState(){

        return {
            speed: 1000,
            generation: 0,
            gameWidth: 50,
            gameHeight: 50,
            intervalId: -1 // some positive integer when simulation is running.
        }
    },
    componentWillMount(){

    },
    componentDidMount(){
        if(cellArr.length < this.state.gameHeight) {
            for (var i = 0; i < this.state.gameHeight; i++) {
                cellArr[i] = [];
                for (var j = 0; j < this.state.gameWidth; j++) {
                    cellArr[i][j] = Math.random() > 0.8 ? 1 : 0;
                }
            }
        }
        //table = d3.select("#d3GameOfLife");
        //tbody = table.append("tbody");
        //rows = tbody.selectAll("tr");
        this.d3Update(cellArr);
    },
    d3Update(data) {
        var container = d3.select('#d3GameOfLife');
        var table = d3.select('#d3GameOfLife tbody')
            .data([data]);
        table.enter().append("table").attr("class", (d,i)=>{
            debugger;
            return "tr";
        });
        table.exit().remove();
        // create the row selection
        var tr = table.selectAll('tr')
            .data(function(d) {
                debugger;
                return d
            });
        tr.exit().remove();
        // append 'tr' on enter
        tr.enter()
            .append('tr');
        // create the cell selection
        var td = tr.selectAll('td')
            .data(function(d) {
                return d;
            });
        td.exit().remove();
        // append on enter
        td.enter()
            .append('td');

        // update cell text on update
        td.text(function(d) {
            return d;
        });
    },





    render(){
        return (
            <div className="app">
                <h1 className="h1">The D3 Component Rendered Below</h1>
                <button onClick={() => this.startSimulation()}>Start / Stop</button>
                <button onClick={() => this.setState({
                        speed: this.state.speed >99 ?
                        this.state.speed - 50 :
                        this.state.speed
                }, this.startSimulation())}>Faster</button>
                <button onClick={() => this.setState({speed: this.state.speed + 50}, this.startSimulation())}>Slower</button>
                <div id="d3GameOfLife"/>
            </div>
        )
    },
    startSimulation() {
        let self = this;
        if(this.state.intervalId === -1) {
            let intervalId = setInterval(function() {
                self.getNextArray();
                self.d3Update(cellArr);
            }, 1000);
            self.setState({intervalId: intervalId}, () => console.log("Interval ID: " + intervalId));
        }
        else {
            console.log("Clearing Interval");
            clearInterval(this.state.intervalId);
            self.setState({intervalId: -1}, () => console.log("Interval ID: " + this.state.intervalId))
        }
    },
    getNextArray(){
        console.log("starting getNextArray");
        var startTrans = Date.now();
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
    }
});


