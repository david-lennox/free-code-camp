import React from 'react';

var gameWidth = 100;
var gameHeight = 70;

export default React.createClass({
    getInitialState(){
        var cellObj = {};
        for (var i = 0; i < gameHeight; i++){
            for(var j = 0; j < gameWidth; j++){
                cellObj[i + '-' + j] = Math.random() > 0.8 ? 1 : 0;
            }
        }
        return {
            ...cellObj,
            runSimulation: false,
            speed: 200,
            generation: 0}
    },
    handleClick(key){
        this.setState({[key]: this.state[key] === 1 ? 0 : 1})
    },
    render(){
        let {speed, generation} = this.state;
        var cellHeight = 20;
        var cellWidth = 20;

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

        return (
        <div style={{position: 'relative'}}>
            <div>{cellDivs}</div>
            <button style={{position: 'relative'}} onClick={this.startSimulation}>Run</button>
            <button style={{position: 'relative'}} onClick={() => this.setState({runSimulation: false})}>Stop</button>
            <button style={{position: 'relative'}} onClick={() => this.setState({speed: speed >99 ? speed - 50 : this.state.speed})}>Faster</button>
            <button style={{position: 'relative'}} onClick={() => this.setState({speed: speed + 50})}>Slower</button>
        </div>);
    },
    startSimulation() {
        this.setState({runSimulation: true}, () => this.getNextArray());
    },
    getNextArray(){
        var startTrans = Date.now();
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
        console.log(Date.now() - startTrans);
        self.setState(stateChanges, () => {
            console.log(Date.now() - startTrans);
            setTimeout(() => {self.getNextArray();}, self.state.speed)});
    }
});


