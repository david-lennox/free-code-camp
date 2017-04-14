/*
* create sounds object containing audio elements for the page.
 */
import React from 'react';

var SimonBtn = React.createClass({
    render(){
        return <div className={this.props.clr}>

        </div>
    },
    handleButtonPress(evt){

    }
});

var SimonGame = React.createClass({
    getInitialState(){
        return {
            sequence: [],
            userInput: false
        }
    },
    render(){
        return <div className="simon-game">
            <div id="sounds">
                <audio id="green">
                    <source src="https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"></source>
                </audio>
                <audio id="red">
                    <source src="https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"></source>
                </audio>
                <audio id="yellow">
                    <source src="https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"></source>
                </audio>
                <audio id="blue">
                    <source src="https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"></source>
                </audio>
            </div>
            <div className="buttons">
                <SimonBtn clr="green"
                          addToSquence={() => this.setState({sequence: [...this.state.sequence, 'green']}) }
                          playSnd={() => document.getElementById("green").play()}
                />
                <SimonBtn clr="red"
                          addToSquence={() => this.setState({sequence: [...this.state.sequence, 'red']}) }
                          playSnd={() => document.getElementById("red").play()}
                />
                <SimonBtn clr="yellow"
                          addToSquence={() => this.setState({sequence: [...this.state.sequence, 'yellow']}) }
                          playSnd={() => document.getElementById("yellow").play()}
                />
                <SimonBtn clr="blue"
                          addToSquence={() => this.setState({sequence: [...this.state.sequence, 'blue']}) }
                          playSnd={() => document.getElementById("blue").play()}
                />
            </div>
        </div>
    },
    play(){

    },

});

export default SimonGame;

// ReactDOM.render(
//     <RecipeBook />,
//     document.getElementById('content')
// );