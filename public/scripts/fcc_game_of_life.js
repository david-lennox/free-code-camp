/***************
 * PROBLEM
 * Build the Game of Life
 * 
 * ARCHITECTURE
 * Utilise React.js as a kind of light version of D3. Have a two dimensional grid (array of arrays) of Cells. 
 * 
 * Each cell is identifiable by its index. Each cell changes according to the properties of the cells around it.
 * 
 */

const CONFIG = {
    cellWidth: 10,
    cellHeight: 10,
    gameWidth: 50,
    gameHeight: 50,
    speed: 1000, // miliseconds per generation.
    colors: {
        alive: "blue",
        fading: "orange", 
        dead: "grey"
    }
}

var Cell = React.createClass({
    render: function(){
        return <rect className='cell'
                x={this.props.x * CONFIG.cellWidth}
                y={this.props.y * CONFIG.cellHeight}
                width={CONFIG.cellWidth} 
                height={CONFIG.cellHeight} 
                fill={CONFIG.colors[this.props.status]}
                stroke="black"
                strokeWidth="2"
                onClick={this.props.bringToLife.bind(null, this.props.x, this.props.y)}
                />
    }
});

var GameOfLife = React.createClass({

    getInitialState: function(){
        var newCells = [];
        for(var y = 0; y < CONFIG.gameHeight; y++){
            newCells[y] = []
            for(var x=0; x< 50; x++){
                newCells[y][x] = {x: x, y: y, status: "dead"};
            }
        }
        return {cells: newCells, generation: 0, continue: false};
    },

    render: function(){
        var cellEls = this.state.cells.map(cellRow => cellRow.map(
                cell => <Cell key={`${cell.x}-${cell.y}`} 
                    x={cell.x} 
                    y={cell.y} 
                    status={cell.status}
                    bringToLife={this.bringToLife}
                    />
                )
            ).reduce((prev, curr) => prev.concat(curr))
        
        return (
            <div className="board">
                <svg width={CONFIG.gameWidth * CONFIG.cellWidth} height={CONFIG.gameHeight * CONFIG.cellHeight}>
                    {cellEls}
                </svg>
            </div>
        );
    },
    bringToLife: function(x, y){
        var newCells = this.state.cells;
        newCells[y][x].status = "alive";
        this.setState({cells: newCells});
    }
});

ReactDOM.render(
  <GameOfLife />,
  document.getElementById('content')
);