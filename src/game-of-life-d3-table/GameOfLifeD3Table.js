import React from 'react';
import * as d3 from 'd3';
import './gameOfLifeD3Table.css';

var lastTick = Date.now();
var table;
export default React.createClass({
    getInitialState(){
        return {
            speed: 1000,
            generation: 0,
            gameWidth: 50,
            gameHeight: 50,
            continue: false,
            cellArr: []
        }
    },
    componentDidMount(){
        this.newTable();
    },

    buildRandomArray(){
        let cellArr = [];
        for (var i = 0; i < this.state.gameHeight; i++) {
            cellArr[i] = [];
            for (var j = 0; j < this.state.gameWidth; j++) {
                cellArr[i][j] = Math.random() > 0.8 ? 1 : 0;
            }
        }
        return cellArr;
    },

    newTable(){
        var self = this;
        d3.select("#d3GameOfLife table").remove();
        this.setState({cellArr: this.buildRandomArray(), generation: 0}, build);
        function build() {
            table = d3.select("#d3GameOfLife").append("table");
            self.d3Update(self.state.cellArr);  // BUG: Why do I need to call it three times?
            self.d3Update(self.state.cellArr);
            self.d3Update(self.state.cellArr);
        }
    },

    d3Update(matrix) {
        var self = this;
        var tr = table.selectAll("tr").data(matrix);

        tr.exit().remove();

        tr.enter().append("tr");

        var td = tr.selectAll("td")
            .data(function (d) {
                return d;
            });
        td.exit().remove();

        td.enter().append("td");

        td.attr("class", function (d) {
            return d === 0 ? "dead" : "alive";
        });

        setTimeout(function() {
            if(!self.state.continue) {
                self.setState({cellArr: matrix});
            }
            else {
                console.log(Date.now() - lastTick);
                lastTick = Date.now();
                self.d3Update(self.getNextArray(matrix));
            }
        }, self.state.speed);
    },
    render(){
        return (
            <div>
                <h1 className="h1">Game Of Life: A D3 Implementation</h1>
                <h3>Generation: {this.state.generation}, Speed: {this.state.speed}</h3>
                <button className="button" onClick={() => this.start()}>Start</button>
                <button className="button" onClick={() => this.setState({continue: false})}>Stop</button>
                <button className="button" onClick={() => this.setState({
                    speed: this.state.speed >99 ?
                    this.state.speed - 50 :
                    this.state.speed
                })}>Faster</button>
                <button className="button" onClick={() => this.setState({
                    speed: this.state.speed + 50})}>Slower</button>
                <button className="button" onClick={() => {this.setState({
                    gameWidth: 40,
                    gameHeight: 30,
                    continue: false}, this.newTable)
                    }}>40 x 30</button>
                <button className="button" onClick={() => {this.setState({
                    gameWidth: 50,
                    gameHeight: 50,
                    continue: false}, this.newTable)
                    }}>50 x 50</button>
                <button className="button" onClick={() => {this.setState({
                    gameWidth: 100,
                    gameHeight: 80,
                    continue: false}, this.newTable)
                    }}>100 x 80</button>
                <div id="d3GameOfLife">
                </div>
            </div>
        )
    },
    start() {
        if(this.state.continue) {
            console.log("Must only run one at a time.");
        }
        else {
            this.setState({continue: true},
                () => this.d3Update(this.state.cellArr));
        }
    },
    getNextArray(cellArr){
        this.setState({generation: this.state.generation + 1});
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
        return nextArray;
    }
});


