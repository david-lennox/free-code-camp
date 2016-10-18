import React from 'react';
import './gameOfLife.css';

var lastTick;
export default React.createClass({
    getInitialState(){
        return {
            ...this.getNewCellObj(50, 50),
            runSimulation: false,
            speed: 200,
            generation: 0,
            gameHeight: 50,
            gameWidth: 50}
    },
    getNewCellObj(gameHeight, gameWidth){
        var cellObj = {};
        for (var i = 0; i < gameHeight; i++){
            for(var j = 0; j < gameWidth; j++){
                cellObj[i + '-' + j] = Math.random() > 0.8 ? 1 : 0;
            }
        }
        return cellObj;
    },
    handleClick(key){
        this.setState({[key]: this.state[key] === 1 ? 0 : 1})
    },
    render(){
        let {speed, generation} = this.state;
        var cellHeight = 10;
        var cellWidth = 10;
        let cellDivs = [];
        for(var key in this.state){
            if(this.state.hasOwnProperty(key) && key.match(/^[0-9]{1,3}-[0-9]{1,2}$/)){
                let x, y;
                [x, y] = key.split('-');
                let cellStyle={
                    backgroundColor: this.state[key] === 1 ? 'green' : 'red',
                    border: 'solid 1px black',
                    position: 'absolute',
                    top: Number(x) * cellHeight,
                    left: Number(y) * cellWidth,
                    width: cellWidth,
                    height: cellHeight
                };
                cellDivs.push(<div key={key} id={key} style={cellStyle} onClick={() => this.handleClick(x + '-' + y)}></div>)
            }
        }

        let gameBoardStyle = {
            width: (cellWidth + 2) * this.state.gameWidth,
            height: (cellHeight + 2) * this.state.gameHeight
        };

        return (
            <div className = "gol">
                <h3>Speed: {this.state.speed}, Generation: {this.state.generation}</h3>
                <div className="nav">
                    <button onClick={this.startSimulation}>Run</button>
                    <button onClick={() => this.setState({runSimulation: false})}>Stop</button>
                    <button onClick={() => this.setState({speed: speed >99 ? speed - 50 : this.state.speed})}>Faster</button>
                    <button onClick={() => this.setState({speed: speed + 50})}>Slower</button>
                    <button onClick={() => this.setState({
                        runSimulation: false,
                        gameHeight: 70,
                        gameWidth: 100,
                        ...this.getNewCellObj(70, 100)})}>100 x 70</button>
                    <button onClick={() => this.setState({
                        runSimulation: false,
                        gameHeight: 30,
                        gameWidth: 40,
                        ...this.getNewCellObj(30, 40)})}>40 x 30</button>
                </div>
                <div className="gameBoard" style={gameBoardStyle}>
                    {cellDivs}
                </div>
            </div>);
    },
    startSimulation() {
        this.setState({runSimulation: true}, () => this.getNextArray());
    },
    getNextArray(){
        this.setState({generation: this.state.generation + 1});
        console.log("time from last tick: " + (Date.now() - lastTick));
        lastTick = Date.now();
        var self = this;
        if(!self.state.runSimulation) return;
        var stateChanges = {};
        for(var key in this.state){
            if(this.state.hasOwnProperty(key) && key.match(/^[0-9]{1,3}-[0-9]{1,2}$/)){
                let x, y;
                [x, y] = key.split('-');
                x=Number(x);
                y=Number(y);
                let score = 0;
                let eightNeighbors = [
                    x + '-' + (y-1),
                    x + '-' + (y+1),
                    (x+1) + '-' + (y-1),
                    (x+1) + '-' + (y+1),
                    (x+1) + '-' + (y),
                    (x-1) + '-' + (y),
                    (x-1) + '-' + (y+1),
                    (x-1) + '-' + (y-1)];
                for(let i=0; i < 8; i++){
                    score += this.state[eightNeighbors[i]] || 0;
                }
                if (score > 3 && this.state[key] === 1) stateChanges[key] = 0;
                else if(score === 3 && this.state[key] === 0) stateChanges[key] = 1;
                else if(score <2 && this.state[key] === 1) stateChanges[key] = 0;
            }
        }
        self.setState(stateChanges, () => {
            setTimeout(() => self.getNextArray(), self.state.speed)});
    }
});