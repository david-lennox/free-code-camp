import React from 'react';
import _ from 'lodash';
import './ttt.css'

const winningCombos = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]];

var TTT = React.createClass({
    getInitialState(){
        return{
            board: newBoard(),
            X: {
                name: 'Dave',
                score: 0,
                computer: false
            },
            O: {
                name: 'Bob',
                score: 0,
                computer: true
            },
            firstMove: "X",
            currentPlayer: "X",
            gameOver: false
        }
    },
    render(){
        let cells = Object.keys(this.state.board).map(square => {
            return <div key={square} className="cell" onClick={() => this.handleClick(square, this)}>{this.state.board[square]}</div>
        });
        return (
            <div className="ttt">

                <div className="board-and-display">
                    <h1>Tic Tac Toe</h1>
                    <h3>{this.state.X.name}: {this.state.X.score} {this.state.currentPlayer === "X" ? " (your turn!)" : ""}</h3>
                    <h3>{this.state.O.name}: {this.state.O.score} {this.state.currentPlayer === "O" ? " (your turn!)" : ""}</h3>
                    <button onClick={this.newGame}>New Game</button>
                    <div className="board">
                        {cells}
                    </div>
                </div>
            </div>
        )
    },
    /*
    * The use of the throttle function here is really for demonstration purposes only. It doesn't add any value.
    *
    * Note the need to pass down 'this' to the handleClick function. The (more convoluted) other option was to wrap
    * the creation of the handleClick function in a constructor function of some kind. There may be a better way than
    * both of these.
     */
    handleClick: _.throttle((square, self) => {
        if(self.state[self.state.currentPlayer].computer === true) alert("It's not your turn!!");
        else self.selectSquare(square)
    }, 500),
    selectSquare(square){
        if(this.state.board[square] || this.state.gameOver) return;
        this.setState({board: Object.assign({}, this.state.board, {[square]: this.state.currentPlayer})}, () => {
            let winningCombo = findWinner(this.state.board, this.state.currentPlayer);
            if(winningCombo) {
                console.log("WINNER IS " + this.state[this.state.currentPlayer].name);
                let playerCopy = Object.assign({}, this.state[this.state.currentPlayer]);
                playerCopy.score++;
                this.setState({
                    [this.state.currentPlayer]: playerCopy,
                    gameOver: true,
                    currentPlayer: this.state.currentPlayer === "X" ? "O" : "X",
                });
            }
            else {
                let nextPlayer = this.state.currentPlayer === "X" ? "O" : "X";
                if(gameDrawn(this.state.board)){
                    this.setState({gameOver: true});
                    console.log("The game is drawn.");
                }
                this.setState({currentPlayer: nextPlayer}, this.playNext);
            }
        })
    },
    playNext(){
        let {state, findCriticalCell, selectSquare} = this;  // assigning properties of 'this' like this may not be a
                // great idea because you don't instantly recognise method calls.
        if (!state[state.currentPlayer].computer || state.gameOver) return;
        console.log("Computer is thinking...");
        let cc = findCriticalCell(state.board);
        setTimeout(go, 1000);
        function go(){
            if (cc) selectSquare(cc);
            else {
                let availableCells = Object.keys(state.board).filter(cell => !state.board[cell]);
                let randomCell = availableCells[Math.round(Math.random() * (availableCells.length - 1))];
                selectSquare(randomCell);
            }
        }
    },
    findCriticalCell(){
        let {board, currentPlayer} = this.state;
        let squareNos = Object.keys(board);
        // If the middle is not taken it is always best to take the middle.
        if(!board[5]) return "5"; // the middle cell.
        let criticalCell;
        // If there are only two squares filled, it is always best to go in the corner.
        if(squareNos.filter(cell => board[cell]).length === 2){
            criticalCell = squareNos.find(cell => !board[cell] && [1,3,7,9].includes(cell));
        }
        else for(let i = 0; i < winningCombos.length; i++) {
            let combo = winningCombos[i];
            let markers = [];
            combo.forEach(cellNo => {
                markers.push(board[cellNo]);
            });
            let noOfX = markers.filter(m => m === "X").length;
            let noOfO = markers.filter(m => m === "O").length;
            if(noOfX + noOfO === 2 ){
                if(noOfX === 0 || noOfO === 0){
                    let symbolOnLine = noOfX > noOfO ? "X" : "O";
                    if(!criticalCell || symbolOnLine === currentPlayer) criticalCell = combo.find(cell => !board[cell])
                }
            }
        }
        return criticalCell;
    },
    newGame(){
        this.setState({
            board: newBoard(),
            gameOver: false
        }, this.playNext);
    }
});

function newBoard(){
    let board = {};
    for(let i = 1; i < 10; i++){
        board[i] = "";
    }
    return board;
}

function findWinner(board, symbol){
    return winningCombos.find(combo => {
        return combo.every(cell => board[cell] === symbol)
    });
}

function gameDrawn(board){
    for(let cell in board){
        if(board.hasOwnProperty(cell)){
            if(!board[cell]) return false;
        }
    }
    return true;
}


export default TTT;
