import React from 'react';
import './pomodoro.css';

var pomodoroSettings = {
    displayWidth: 250,
    displayHeight: 250,
    defaultWorkPeriod: 25 * 60,
    defaultRestPeriod: 5 * 60,
    circleStroke: 4
};

var Pomodoro = React.createClass({
    getInitialState(){
        return {
            secondsToWork: 10 * 60,
            secondsToRest: 5 * 60,
            period: "working", // or resting
            paused: true,
            secondsElapsedSinceStartOrUnpause: 0,
            secondsElapsedBeforePause: 0
        }
    },
    render(){
        let elapsed = this.state.secondsElapsedBeforePause + this.state.secondsElapsedSinceStartOrUnpause;
        let progress = elapsed / this.currentInterval();
        let maxProgressFillHeight = pomodoroSettings.displayHeight - 2 * pomodoroSettings.circleStroke;
        let progressFill = {
            height: maxProgressFillHeight * progress,
            y: maxProgressFillHeight + pomodoroSettings.circleStroke - maxProgressFillHeight * progress
        };
        return (
            <div id="pomodoro" className="pomodoro">
                <h1>Free Code Camp Pomodoro Clock</h1>
                <div id="app">
                    <h3>Rest Interval: {this.state.secondsToRest/60}
                        <i className="fa fa-arrow-down fingerCursor" onClick={() => {
                            if(this.state.secondsToRest > 60) this.setState({secondsToRest: this.state.secondsToRest - 60})
                        }}/>
                        <i className="fa fa-arrow-up fingerCursor" onClick={() => this.setState({secondsToRest: this.state.secondsToRest + 60})}/>
                    </h3>
                    <h3>Work Interval: {this.state.secondsToWork/60}
                        <i onClick={() => {
                            if(this.state.secondsToWork > 60) this.setState({secondsToWork: this.state.secondsToWork - 60})
                        }} className="fa fa-arrow-down fingerCursor" />
                        <i onClick={() => this.setState({secondsToWork: this.state.secondsToWork + 60})} className="fa fa-arrow-up fingerCursor"/>
                    </h3>
                    <div id="mainDisplay" className="mainDisplay">
                        <svg className="mainDisplay">
                            <defs>
                                <mask id="circleMask">
                                    <rect width={pomodoroSettings.displayWidth} height={pomodoroSettings.displayHeight} fill="black" />
                                    <circle className="mask-circle"
                                            r={pomodoroSettings.displayWidth/2 - pomodoroSettings.circleStroke - 3}
                                            cx={pomodoroSettings.displayHeight/2}
                                            cy={pomodoroSettings.displayHeight/2}
                                    />
                                </mask>
                            </defs>
                            <circle className="displayCircle"
                                    r={pomodoroSettings.displayWidth/2 - pomodoroSettings.circleStroke/2}
                                    cx={pomodoroSettings.displayWidth/2}
                                    cy={pomodoroSettings.displayWidth/2}/>
                            {['working', 'resting'].includes(this.state.period) ?
                                <rect className="progress-fill" fill={this.state.period === "working" ? "green" : "orange"}
                                      y={progressFill.y}
                                      width={pomodoroSettings.displayHeight}
                                      height={progressFill.height}
                                /> : ""}
                        </svg>
                        <div id="topDisplayText" className="top-display-text">
                            <h2>{this.state.period === "working" ? "Session" : "Break"}</h2>
                        </div>
                        <div id="bottomDisplayText" className="bottom-display-text">
                            <h2>{Math.floor((this.currentInterval() - elapsed)/60)}:{('0' + (this.currentInterval() - elapsed)%60).slice(-2)}</h2>
                        </div>
                    </div>
                    <div id="controls" className="control-group">
                        <i className="fa fa-play fingerCursor" onClick={this.beginOrRestart}/>
                        <i className="fa fa-pause fingerCursor" onClick={() => this.setState({
                            paused: true,
                            secondsElapsedBeforePause: elapsed,
                            secondsElapsedSinceStartOrUnpause: 0
                        })}/>
                        <i className="fa fa-repeat fingerCursor" onClick={() => this.setState({
                            paused: true,
                            period: "working",
                            secondsElapsedBeforePause: 0,
                            secondsElapsedSinceStartOrUnpause: 0})}/>
                    </div>
                </div>
            </div>)

    },
    beginOrRestart(){
        this.setState({paused: false, startOrUnpauseTime: Math.round(Date.now()/1000) * 1000}, this.countDown);
    },
    countDown(){
        let self = this;
        if(self.state.paused) return;
        if(self.state.secondsElapsedSinceStartOrUnpause + self.state.secondsElapsedBeforePause > self.currentInterval()) {
            this.setState({
                secondsElapsedSinceStartOrUnpause: 0,
                secondsElapsedBeforePause: 0,
                period: this.state.period === "working" ? "resting" : "working"
            }, this.beginOrRestart);
            return;
        }
        let millisecondsRemainingThisSecond = Date.now() % 1000;
        setTimeout(tick, millisecondsRemainingThisSecond);
        function tick(){
            if(self.state.paused) return; // This function will probably have already been set for execution when the pause button is pressed.
            self.setState({
                secondsElapsedSinceStartOrUnpause: Math.round((Date.now() - self.state.startOrUnpauseTime)/1000)
            });
            self.countDown();
        }
    },
    currentInterval() {
        let self = this;
        return self.state.period === "working" ? self.state.secondsToWork : self.state.secondsToRest;
    }
});

export default Pomodoro;

