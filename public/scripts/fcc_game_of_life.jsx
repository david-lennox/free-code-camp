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

var update = require('react-addons-update');

const CONFIG = {
    cellWidth: 10,
    cellHeight: 10,
    gameWidth: 50,
    gameHeight: 50,
    speed: 1000, // miliseconds per generation.
    // Colors represent dead, fading, or alive.
    colors: ['grey', 'orange', 'blue']
}

var Cell = React.createClass({
    render: function(){
        var x = this.props.index % CONFIG.gameWidth;
        var y = (this.props.index - x) / CONFIG.gameWidth
        return (<rect className='cell'                
                x={x * CONFIG.cellWidth}
                y={y * CONFIG.cellHeight}
                width={CONFIG.cellWidth} 
                height={CONFIG.cellHeight} 
                fill={CONFIG.colors[this.props.status]}
                stroke="black"
                strokeWidth="2"
                onClick={this.props.bringToLife.bind(null, this.props.index)}
                />)
    }
});

var GameOfLife = React.createClass({

    getInitialState: function(){
        var newCells = [];
        for(var y = 0; y < CONFIG.gameHeight; y++){
            //newCells[y] = []
            for(var x=0; x < CONFIG.gameWidth; x++){
                var i = y * CONFIG.gameHeight + x;
                newCells[i] = 0;
            }
        }
        return {cells: newCells, generation: 0, continue: false};
    },

    render: function(){
        var cellEls = this.state.cells.map((cell, index) => <Cell 
                            key={index} 
                            status={cell}
                            bringToLife={this.bringToLife}
                            index={index}
                    />
                );
        
        return (
            <div className="board">
                <svg width={CONFIG.gameWidth * CONFIG.cellWidth} height={CONFIG.gameHeight * CONFIG.cellHeight}>
                    {cellEls}
                </svg>
                <button onClick={this.randomizeBoard}>Randomize</button>
                <button onClick={this.startStop}>Toggle Start</button>
            </div>
        );
    },
    bringToLife: function(i){

        // PERFORMANCE DIFFERENCE BETWEEN THESE TWO IMPLEMENTATIONS IS NEGLIGIBLE
        // The `update` method is about 20ms faster, which is only about 10% improvement. 
        // Both methods are too slow - taking about 220 - 300ms to update a single square.

        var start = Date.now();

        var newCells = this.state.cells;
        newCells[i] = 2;

        console.log(`Finding and updating the cell took ${Date.now() - start} miliseconds`);
        
        // var spliceCmd = {};
        // spliceCmd[y] = {$splice: [[x, 1, {x: x, y: y, status: 'alive'}]]};
        //var newCells = update(this.state.cells, spliceCmd);
        this.setState({cells: newCells}, () => console.log(`Call to setState took ${Date.now() - start} miliseconds... too long!`));
    },
    randomizeBoard: function(){
        var self = this;
        var start = Date.now();
        var newCells = this.state.cells.map(cellRow => {
                var r = Math.random();
                return r > 0.66 ? 2 : r > 0.33 ? 1 : 0
            });
        self.setState({cells: newCells}, () => {if(self.state.continue) 
            console.log(`radmonize re-render took ${Date.now() - start} miliseconds.`)
            self.randomizeBoard()});      
    },
    startStop: function(){
        this.setState({continue: !this.state.continue}, function(){
            if(this.state.continue) this.randomizeBoard();
        });
    }
});

ReactDOM.render(
  <GameOfLife />,
  document.getElementById('content')
);