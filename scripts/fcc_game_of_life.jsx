/***************
 * PROBLEM
 * Build the Game of Life
 * 
 * npm install
 * .\node_modules\.bin\webpack-dev-server 
 * Add the `--content-base file/path/` to serve the files at /file/path
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
    },
    shouldComponentUpdate: function(nextProps){
        if(nextProps.status === this.props.status) return false;
        else return true;
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
        return {cells: newCells, generation: 0, continue: false, updating: false, intervalId: 0};
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
        this.setState({cells: newCells, updating: true}, () => console.log(`Call to setState took ${Date.now() - start} miliseconds... too long!`));
    },
    componentDidUpdate: function(){
        console.log('Board component updated');
        if(this.state.updating) this.setState({updating: false});
    },
    shouldComponentUpdate: function(nextProps, nextState){
        if(nextState.updating === false) return false;
        else return true;
    },
    randomizeBoard: function(){
        //if(this.state.thinking === true) return null;
        var self = this;
        if (self.state.updating === true) {
            // This never happens - I think because the setInterval function
            // is called on the specified interval OR when the previous instance 
            // of the function is completed  
            setTimeout(() => {
                console.log("AHHHHHHH - TOO FAST. WAITING 100 miliseconds.");
                //randomizeBoard();                
            }, 1000);
            return null;
        }
        var start = Date.now();
        var newCells = this.state.cells.map(cellRow => {
                var r = Math.random();
                return r > 0.25 ? 0 : r > 0.15 ? 1 : 2
            });
        console.log(`newCells creation took ${Date.now() - start} miliseconds.`)
        self.setState({cells: newCells, updating: true}, () => console.log(`Rendering board took ${Date.now() - start} miliseconds.`)); 
             
    },
    evolve: function(){

    },
    startStop: function(){
        var startTime = Date.now();
        this.setState({continue: !this.state.continue}, function(){
            if(this.state.continue) {
                var intervalId = setInterval(() => {if(this.state.continue){
                    console.log(`randomize board called: ${Date.now() - startTime} miliseconds since last call.`)
                    startTime = Date.now();
                    this.randomizeBoard();}}, 100);
                    this.setState({intervalId: intervalId});
            }
            else {
                clearInterval(this.state.intervalId);
            }
        });
    }
});

ReactDOM.render(
  <GameOfLife />,
  document.getElementById('content')
);