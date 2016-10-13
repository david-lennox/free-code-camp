import React from 'react';

var Calculator = React.createClass({
    render: function(){
        var numbers = [];
        for(var i = 9; i >=0; i--){
            numbers.push(
                <Number number={i} key={i} numberButtonEvent={this.numberButtonEvent}/>
            )
        }
        return (
            <div className="calculator">
                <Screen 
                    mainDisplay={this.state.inputAndAnswer}
                    subDisplay={this.state.equationTxt} 
                />
                {numbers}
            </div>
        )
    },
    getInitialState: function(){
        return {inputAndAnswer: 55, equationTxt: ""};
    },
    numberButtonEvent: function(value){
        this.setState({equationTxt: this.state.equationTxt + " " + value})
    }
});

var Number = React.createClass({
    render: function(){
        return <button onClick={this.handleClick} className="calc-num">{this.props.number}</button>
    },
    handleClick: function(){
        this.props.numberButtonEvent(this.props.number);
    }
});

var Screen = React.createClass({
    render: function(){
        return (
            <div className="calc-screen">
                <div className="main-display">
                    {this.props.mainDisplay}
                </div>
                <div className="sub-display">
                    {this.props.subDisplay}
                </div>
            </div>
        )
    }
});

export default Calculator;

// ReactDOM.render(
//     <Calculator />,
//     document.getElementById('content')
// );