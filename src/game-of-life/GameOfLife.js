import React from 'react';

var gameWidth = 50;
var gameHeight = 50;

export default React.createClass({
    getInitialState(){
        var cellArr = [];
        for (var i = 0; i < gameHeight; i++){
            cellArr[i] = [];
            for(var j = 0; j < gameWidth; j++){
                cellArr[i][j] = Math.random() > 0.8 ? 1 : 0;
            }
        }
        return {cellArr: cellArr, runSimulation: false, speed: 200, generation: 0}
    },
    render(){

        var cellHeight = 20;
        var cellWidth = 20;
        var rows = this.state.cellArr.map((row, rowIndex) => {
            let rowCells = row.map((cellValue, columnIndex) => {
                let cellStyle={
                    backgroundColor: cellValue === 1 ? 'green' : 'red',
                    border: 'solid 1px black',
                    position: 'absolute',
                    top: rowIndex * cellHeight,
                    left: columnIndex * cellWidth,
                    width: cellWidth,
                    height: cellHeight
                };
                return <div key={rowIndex + ' ' + columnIndex} id={rowIndex + ' ' + columnIndex} style={cellStyle} onClick={() => {
                    var newArr = this.state.cellArr.slice();
                    newArr[rowIndex][columnIndex] = newArr[rowIndex][columnIndex] === 1 ? 0 : 1;
                    this.setState({cellArr: newArr})
                }
                }></div>
            });
            return rowCells
        });

        return (
        <div style={{position: 'relative'}}>
            <div>{rows}</div>
            <button style={{position: 'relative'}} onClick={this.startSimulation}>Run</button>
            <button style={{position: 'relative'}} onClick={() => this.setState({runSimulation: false})}>Stop</button>
            <button style={{position: 'relative'}} onClick={() => this.setState({speed: this.state.speed >99 ? this.state.speed - 50 : this.state.speed})}>Faster</button>
            <button style={{position: 'relative'}} onClick={() => this.setState({speed: this.state.speed + 50})}>Slower</button>
        </div>);
    },
    startSimulation() {
        this.setState({runSimulation: true}, () => this.getNextArray(this.state.cellArr));
    },
    getNextArray(cellArray){
        var startTrans = Date.now();
        var self = this;
        if(!self.state.runSimulation) return;
        var nextArray = [];
        for (var i = 0; i < cellArray.length; i++){
            nextArray[i] = [];
            for(var j = 0; j < cellArray[i].length; j++){
                var cellScore = 0;
                if (i!== cellArray.length - 1) {
                    cellScore += cellArray[i + 1][j];
                    if (j !== 0) {
                        cellScore += cellArray[i + 1][j - 1];
                    }
                    if (j !== cellArray[i].length - 1) {
                        cellScore += cellArray[i + 1][j + 1];
                    }
                }
                if(i !== 0) {
                    cellScore += cellArray[i - 1][j];
                    if(j !== 0) {
                        cellScore += cellArray[i - 1][j - 1];
                    }
                    if(j !== cellArray[i].length - 1) {
                        cellScore += cellArray[i - 1][j + 1];
                    }
                }
                    if(j !== 0) {
                        cellScore += cellArray[i][j - 1];
                    }
                    if(j !== cellArray[i].length - 1) {
                        cellScore += cellArray[i][j + 1];
                    }
                if (cellScore > 3) nextArray[i][j] = 0;
                else if(cellScore === 3) nextArray[i][j] = 1;
                else if(cellScore <2) nextArray[i][j] = 0;
                else nextArray[i][j] = cellArray[i][j]; // Line not required because they are copied up top.

            }
        }
        console.log(Date.now() - startTrans);
        self.setState({cellArr: nextArray, generation: this.state.generation + 1}, () => {
            console.log(Date.now() - startTrans);
            setTimeout(() => {self.getNextArray(nextArray);}, self.state.speed)});
    }
});


