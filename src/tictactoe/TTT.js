import React from 'react';
import _ from 'lodash';
import './ttt.css'

const tttSettings = {
    computerThinkTime: 100
};

const winningCombos = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]];

var MessageBox = React.createClass({
    render() {
        const {msg} = this.props;
        if(!msg) return null;
        return <div className="message">{msg}</div>
    }
});

var PlayerInput = React.createClass({
    render(){
        const {playerSymbol, currentName, toggleComputer, changeName, isComputer} = this.props;
        return <form className="form-inline">
            <div className="form-group">
                <label htmlFor={'nameOf' + playerSymbol}>
                    <span>Player {playerSymbol} </span>
                </label>
                <input style={{display: isComputer ? 'none' : 'inline'}} className="form-control"
                       type="text"
                       value={currentName}
                       placeholder="enter a name"
                       onChange={evt => changeName(playerSymbol, evt.target.value)}
                       onKeyPress={evt => {
                           if(evt.key === "Enter") evt.preventDefault();
                       }}
                       id={'nameOf' + playerSymbol}/>
            </div>
            <label className="form-check-inline">Computer</label>
                <input className="form-check-input"
                       value={isComputer}
                       type="checkbox"
                       checked={isComputer}
                       onClick={() => toggleComputer(playerSymbol)}
                       readOnly
                />
        </form>
    }
});

var TTT = React.createClass({
    getInitialState(){
        return{
            board: newBoard(),
            X: blankPlayer("", false),
            O: blankPlayer("", true),
            currentPlayer: "X",
            gameOver: false,
            difficulty: "ridiculously easy", // or easy, difficult, impossible
            setupComplete: false,
            message: ''
        }
    },
    handleSelectFirstMover(event){
        this.setState({currentPlayer: event.target.value}, this.playNext);
    },
    handleSelectDifficulty(event){
        this.setState({difficulty: event.target.value});
    },
    displayMessage(msg, duration){
        this.setState({message: msg}, () => setTimeout(() => this.setState({message: ''}), duration))
    },
    changeName(playerSymbol, newName){
        let revisedPlayer = Object.assign({}, this.state[playerSymbol], {name: newName});
        this.setState({[playerSymbol]: revisedPlayer})
    },
    toggleComputer(playerSymbol){
        let revisedPlayer = Object.assign({}, this.state[playerSymbol], {computer: !this.state[playerSymbol].computer})
        this.setState({[playerSymbol]: revisedPlayer})
    },
    render(){
        let cells = Object.keys(this.state.board).map(square => {
            return <div key={square} className="cell" onClick={() => this.handleClick(square, this)}>{this.state.board[square]}</div>
        });
        return (
            <div className="ttt">

                <div className="board-and-display">
                    <h1>Tic Tac Toe ({this.state.difficulty} mode)</h1>
                    <div id="setupForm" style={{display: this.state.setupComplete ? "none" : ""}}>
                        <h2>Enter the player names</h2>
                        <PlayerInput playerSymbol="X"
                                     currentName={this.state.X.name}
                                     changeName={this.changeName}
                                     toggleComputer={this.toggleComputer}
                                     isComputer={this.state.X.computer}/>
                        <PlayerInput playerSymbol="O"
                                     currentName={this.state.O.name}
                                     changeName={this.changeName}
                                     toggleComputer={this.toggleComputer}
                                     isComputer={this.state.O.computer}/>
                        <div className="form-group">
                            <label className="col-sm-5 control-label">Choose who goes first</label>
                            <div className="col-sm-5">
                                <select value={this.state.currentPlayer}
                                        onChange={this.handleSelectFirstMover}
                                        className="form-control">
                                    <option value="X">X</option>
                                    <option value="O">O</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-5 control-label">Choose difficulty</label>
                            <div className="col-sm-5">
                                <select value={this.state.difficulty}
                                        onChange={this.handleSelectDifficulty}
                                        className="form-control">
                                    <option value="ridiculously easy">Ridiculously Easy</option>
                                    <option value="easy">Easy</option>
                                    <option value="hard">Hard</option>
                                    <option value="impossible">Impossible</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <button disabled={!this.setupValid()}
                                    onClick={this.beginContest}
                                    className="btn btn-default" >Begin Contest
                            </button>
                        </div>

                    </div>

                    <div className="game" style={{display: this.state.setupComplete ? "block" : "none"}}>
                        <div id="gameInfo">
                            <h3 className={this.state.currentPlayer === "X" ? "currentPlayer" : ""}>
                                Player X ({this.state.X.name || "Computer"}) score: {this.state.X.score}</h3>
                            <h3 className={this.state.currentPlayer === "O" ? "currentPlayer" : ""}>
                                Player O: ({this.state.O.name || "Computer"}) score: {this.state.O.score}</h3>
                            <button className="btn btn-default" onClick={this.newGame}>Restart this game</button>
                            <button className="btn btn-default" onClick={this.reset}>Reset Match</button>
                        </div>
                        <div className="board">
                            <MessageBox msg={this.state.message}/>
                            {cells}
                        </div>

                    </div>

                </div>
            </div>
        )
    },
    reset(){
        this.setState({board: newBoard(), setupComplete: false, X: blankPlayer(this.state.X.name, this.state.X.computer), O: blankPlayer(this.state.O.name, this.state.O.computer)})
    },
    beginContest(){
        this.setState({setupComplete: true}, this.playNext);
    },
    setupValid(){
        return (this.state.X.name || this.state.X.computer)
            && (this.state.O.name || this.state.O.computer);
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
                this.displayMessage("WINNER IS " + (this.state[this.state.currentPlayer].name || "Computer"), 1500);
                console.log("WINNER IS " + (this.state[this.state.currentPlayer].name || "Computer"));
                let playerCopy = Object.assign({}, this.state[this.state.currentPlayer]);
                playerCopy.score++;
                this.setState({
                    [this.state.currentPlayer]: playerCopy,
                    gameOver: true,
                    currentPlayer: this.state.currentPlayer === "X" ? "O" : "X",
                }, () => setTimeout(this.newGame, 1500));
            }
            else {
                let nextPlayer = this.state.currentPlayer === "X" ? "O" : "X";
                if(gameDrawn(this.state.board)){
                    this.displayMessage('The game is drawn!', 1500);
                    this.setState({gameOver: true}, () => setTimeout(this.newGame, 1500));
                    console.log("The game is drawn.");
                }
                this.setState({currentPlayer: nextPlayer}, this.playNext);
            }
        })
    },
    playNext(){
        let {state, findBestMove, selectSquare} = this;  // assigning properties of 'this' like this may not be a
                // great idea because you don't instantly recognise method calls.
        if(!state.setupComplete) return;
        if (!state[state.currentPlayer].computer || state.gameOver) return;
        console.log("Computer is thinking...");
        let cc = findBestMove(state.board);
        setTimeout(go, tttSettings.computerThinkTime);
        function go(){
            if (cc) selectSquare(cc);
            else {
                let availableCells = Object.keys(state.board).filter(cell => !state.board[cell]);
                let randomCell = availableCells[Math.round(Math.random() * (availableCells.length - 1))];
                selectSquare(randomCell);
            }
        }
    },
    findBestMove(){
        let {board, currentPlayer, difficulty} = this.state;
        if(difficulty === "ridiculously easy") return false;
        let squareNos = Object.keys(board);
        // If the middle is not taken it is always best to take the middle.
        if(!board[5]) return "5";
        if(difficulty === "easy") return false;
        let criticalCell;
        // find imminent loss or win.
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
                    let symbolOnLine = noOfX > noOfO ? "X" : "O";
                    if(!criticalCell || symbolOnLine === currentPlayer) criticalCell = combo.find(cell => !board[cell])
                }
            }
        }
        // find checkmate scenario
        if(!criticalCell && difficulty === "impossible"){
            let possibleWinners = winningCombos.filter(combo => {
                let otherPlayer = currentPlayer === "X" ? "O" : "X";
                let hasCurrentPlayer = _.some(combo, cell => board[cell] === currentPlayer);
                let hasOtherPlayer = _.some(combo, cell => board[cell] === otherPlayer);
                return (hasCurrentPlayer && !hasOtherPlayer);
            });
            let flattenedWinners = _.flatten(possibleWinners);
            let cellFreqObj = _.countBy(flattenedWinners);
            criticalCell = Object.keys(cellFreqObj).find(cell => cellFreqObj[cell] > 1 && !board[cell]);
        }
        // otherwise go in the corner.
        if(!criticalCell && difficulty === "impossible"){
            return squareNos.find(cell => !board[cell] && ["1","3","7","9"].includes(cell));
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
function blankPlayer(name, computer){
    return {name: name, score: 0, computer: computer}
}

export default TTT;
