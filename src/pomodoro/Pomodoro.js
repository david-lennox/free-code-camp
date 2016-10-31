import React from 'react';
import './pomodoro.css';

var pomodoroSettings = {
    displayWidth: 250,
    displayHeight: 250,
    defaultWorkPeriod: 25 * 60,
    defaultRestPeriod: 5 * 60,
    circleStroke: 10
};

var Pomodoro = React.createClass({
    getInitialState(){
        return {
            secondsToWork: 10 * 60,
            secondsToRest: 5 * 60,
            status: "paused", // can also be 'working', 'resting', 'paused'
            elapsed: 0
        }
    },
    render(){
        let progressFill = {};
        let progress = this.state.elapsed / this.currentInterval();
        let maxProgressFillHeight = pomodoroSettings.displayHeight - 2 * pomodoroSettings.circleStroke;

        if(['working', 'resting'].includes(this.state.status)){
            progressFill = {
                height: maxProgressFillHeight * progress,
                y: maxProgressFillHeight + pomodoroSettings.circleStroke - maxProgressFillHeight * progress
            };
        }
        let topDisplayTextStyle = {
            position: "absolute",
            top: pomodoroSettings.displayWidth/5,
            width: pomodoroSettings.displayWidth,
            margin: "auto"
        };
        let bottomDisplayTextStyle = {
            position: "absolute",
            bottom: pomodoroSettings.displayWidth/5,
            width: pomodoroSettings.displayWidth,
            margin: "auto"
        };

        return (
            <div id="pomodoro">
                <h1>Free Code Camp Pomodoro Clock</h1>
                <div id="controls">

                    <div>Rest Interval</div>
                    <button onClick={() => this.setState({secondsToRest: this.state.secondsToRest - 60})}>
                        <i className="fa fa-arrow-down"></i>
                    </button>
                    <button onClick={() => this.setState({secondsToRest: this.state.secondsToRest + 60})}>
                        <i className="fa fa-arrow-up"></i>
                    </button>
                    <div>{this.state.secondsToRest/60}</div>
                    <div>Work Interval</div>
                    <button onClick={() => this.setState({secondsToWork: this.state.secondsToWork - 60})}>
                        <i className="fa fa-arrow-down"></i>
                    </button>
                    <button onClick={() => this.setState({secondsToWork: this.state.secondsToWork + 60})}>
                        <i className="fa fa-arrow-up"></i>
                    </button>
                    <div>{this.state.secondsToWork/60}</div>
                    <button onClick={this.beginSession}>Begin Session</button>
                    <button onClick={() => this.setState({status: "paused"})}>Pause</button>
                    <button onClick={() => this.setState({status: "paused", elapsed: 0})}>Reset</button>
                    <div id="mainDisplay" className="mainDisplay">
                        <svg className="mainDisplay">
                            <defs>
                                <mask id="circleMask">
                                    <rect width="250px" height="250px" fill="black" />
                                    <circle r={pomodoroSettings.displayWidth/2 - pomodoroSettings.circleStroke}
                                            cx="125"
                                            cy="125"
                                            fill="white"
                                            strokeWidth="0"/>
                                </mask>
                            </defs>
                            <circle className="displayCircle"
                                    r={pomodoroSettings.displayWidth/2 - pomodoroSettings.circleStroke/2}
                                    cx={pomodoroSettings.displayWidth/2}
                                    cy={pomodoroSettings.displayWidth/2}/>
                            {['working', 'resting'].includes(this.state.status) ?
                                <rect fill="green"
                                  y={progressFill.y}
                                  width={pomodoroSettings.displayHeight}
                                  height={progressFill.height}
                                  mask="url(#circleMask)"
                            /> : ""}
                        </svg>
                        <div id="topDisplayText" style={topDisplayTextStyle}>
                            <h3>{this.state.status === "working" ? "Session" : "Break"}</h3>
                        </div>
                        <div id="bottomDisplayText" style={bottomDisplayTextStyle}>
                            <h3>{Math.floor((this.currentInterval() - this.state.elapsed)/60)}:{('0' + (this.currentInterval() - this.state.elapsed)%60).slice(-2)}</h3>
                        </div>
                    </div>
                </div>
            </div>)
    },
    beginSession(){
        this.setState({status: "working", currentSessionStartTime: Math.round(Date.now()/1000) * 1000}, this.countDown);
    },
    countDown(){
        let self = this;
        if(!["working", "resting"].includes(self.state.status)) return;
        if(self.state.elapsed > self.currentInterval()) {
            // todo. Do something to handle end of session.
            return;
        }
        let millisecondsRemainingThisSecond = Date.now() % 1000;
        setTimeout(tick, millisecondsRemainingThisSecond);
        function tick(){
            self.setState({
                elapsed: Math.round((Date.now() - self.state.currentSessionStartTime)/1000)
            });
            self.countDown();
        }
    },
    currentInterval() {
        let self = this;
        return self.state.status === "working" ? self.state.secondsToWork : self.state.secondsToRest;
    }
});

export default Pomodoro;
