import React from 'react';
import './calculator.css';

var Calculator = React.createClass({

    getInitialState: function(){
        return {equationStr: '', currentInputStr: '', answer: 0}
    },

    render: function(){
        return (
            <div className="calculator">
                <div>Equation: {this.state.equationStr}</div>
                <div>Answer: {this.state.answer}</div>
                <table>
                    <tbody>
                        <CalcRow updateEquation={this.updateEquation} buttonValues={["operation-clear", "/", "*", "operation-delete"]} />
                        <CalcRow updateEquation={this.updateEquation} buttonValues={[7, 8, 9, " - "]} />
                        <CalcRow updateEquation={this.updateEquation} buttonValues={[4, 5, 6, " + "]} />
                        <CalcRow updateEquation={this.updateEquation} buttonValues={[1, 2, 3, "operation-brackets"]} />
                        <CalcRow updateEquation={this.updateEquation} buttonValues={[0, ".", " * -1 ", "operation-equals"]} />
                    </tbody>
                </table>
            </div>
        )
    },
    updateEquation: function(value){
        if(isNaN(value) && value.match(/^operation/)){
            switch(value.split('-')[1]){
                case 'clear':
                    this.setState({equationStr: '', answer: ''});
                    break;
                case 'delete':
                    this.setState({equationStr: this.state.equationStr.substring(0, this.state.equationStr.length - 1)});
                    break;
                case 'equals':
                    // eslint-disable-next-line
                    this.setState({answer: eval(this.state.equationStr)});
                    break;
                default:
                    console.log('something went wrong!');
            }
        }
        else this.setState({equationStr: this.state.equationStr + value})

    }
});

var CalcRow = React.createClass(({
    render: function(){
        var tableDataCells = this.props.buttonValues.map(v => {
            var symbol;
            if(isNaN(v) && v.match(/^operation/)) {
                switch(v.split('-')[1]){
                    case 'delete':
                        symbol = 'DEL';
                        break;
                    case 'clear':
                        symbol = 'CLR';
                        break;
                    case 'equals':
                        symbol = '=';
                        break;
                    default:
                        console.log("what are you missing");
                        break;
                }
            }
            else symbol = v;

            return <td key={v} className="calc-button" onClick={this.props.updateEquation.bind(null, v)}>{symbol}</td>
        });
        return <tr>{tableDataCells}</tr>
    }
}));

export default Calculator;

// ReactDOM.render(
//     <Calculator />,
//     document.getElementById('content')
// );