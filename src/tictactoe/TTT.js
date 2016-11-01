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
            currentPlayer: "X"
        }
    },
    render(){
        let cells = Object.keys(this.state.board).map(square => {
            return <div key={square} className="cell" onClick={() => this.selectSquare(square)}>{this.state.board[square]}</div>
        });
        return (
            <div className="ttt">

                <div className="board-and-display">
                    <h1>Tic Tac Toe</h1>
                    <h3>{this.state.X.name}: {this.state.X.score} {this.state.currentPlayer === "X" ? " (your turn!)" : ""}</h3>
                    <h3>{this.state.O.name}: {this.state.O.score} {this.state.currentPlayer === "O" ? " (your turn!)" : ""}</h3>
                    <div className="board">
                        {cells}
                    </div>
                </div>
            </div>
        )
    },
    selectSquare(square){
        if(this.state.board[square]) return;
        this.setState({board: Object.assign({}, this.state.board, {[square]: this.state.currentPlayer})}, () => {
            let winningCombo = findWinner(this.state.board, this.state.currentPlayer);
            if(winningCombo) {
                console.log("WINNER IS " + this.state[this.state.currentPlayer].name);
                let playerCopy = Object.assign({}, this.state[this.state.currentPlayer]);
                playerCopy.score++;
                this.setState({
                    [this.state.currentPlayer]: playerCopy,
                    currentPlayer: this.state.currentPlayer === "X" ? "O" : "X",
                    board: newBoard()
                }, this.playNext);
            }
            else {
                let nextPlayer = this.state.currentPlayer === "X" ? "O" : "X";
                let nextBoard;
                if(gameDrawn(this.state.board)){
                    nextBoard = newBoard();
                    console.log("The game is drawn - starting a new game.");
                }
                else nextBoard = this.state.board;
                this.setState({board: nextBoard, currentPlayer: nextPlayer}, this.playNext);


            }

        })
    },
    playNext(){
        if (!this.state[this.state.currentPlayer].computer) return;
        console.log("Computer is thinking...");
        let cc = findCriticalCell(this.state.board);
        if (cc) this.selectSquare(cc);
        else {
            let randomCell = Object.keys(this.state.board).find(cell => !this.state.board[cell]);
            this.selectSquare(randomCell);
        }
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

function findCriticalCell(board){
    let criticalCell;
    for(let i = 0; i < winningCombos.length; i++) {
        let combo = winningCombos[i];
        let markers = [];
        combo.forEach(cellNo => {
            markers.push(board[cellNo]);
        });
        let noOfX = markers.filter(m => m === "X").length;
        let noOfO = markers.filter(m => m === "O").length;
        if(noOfX + noOfO === 2 ){
            if(noOfX === 0 || noOfO === 0){
                if(!criticalCell) criticalCell = combo.find(cell => !board[cell])
            }
        }
    }
    return criticalCell;
}

export default TTT;
