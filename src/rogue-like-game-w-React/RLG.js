import React from 'react';

/*
* This React application has one parent container, which has all the state and logic. There is:
*   - state.world: a 2d array representing a grid that is either part of a room or passage (1) or a wall (0)
*   - state.player: An object representing the current player.
*   - state.things: An object containing a list of entitiesByName.
*
*   Move. On each move the player's coordinates change and the corresponding component is re-rendered. The World
 */

var settings = {
    worldWidth: 100,
    worldHeight: 100,
    maxRoomSize: 40,
    minRoomSize: 10, // cells
    roomGenerationAttempts: 10000,
    randomWalkAttempts: 1000,
    cellSize: 10 // pixels
};

var Entity = React.createClass({
    render(){
        let e = this.props.entity;
        let eStyle = {
            width: settings.cellSize,
            height: settings.cellSize,
            position: 'absolute',
            left: e.x * settings.cellSize,
            top: e.y * settings.cellSize,
            backgroundColor: e.type === 'player' ? 'blue'
                : e.type === 'enemy' ? 'red'
                : e.type === 'health' ? 'green'
                : e.type === 'weapon' ? 'orange' : 'purple' // portals are purple.
        };
        return <div id={e.name} style={eStyle}></div>;
    }
});

var World = React.createClass({
    render(){
        let {cellArray, offset} = this.props;
        let cells = [];
        for(let x = 0; x < cellArray.length; x++){
            for(let y = 0; y < cellArray[x].length; y++){
                let cellStyle = {
                    width: settings.cellSize,
                    height: settings.cellSize,
                    position: 'absolute',
                    left: x * settings.cellSize,
                    top: y * settings.cellSize,
                    backgroundColor: cellArray[x][y] === 1 ? 'white' : 'black'
                };
                cells.push(<div key={x + '-' + y} style={cellStyle}></div>)
            }
        }
        let worldStyle = {
            top: offset.y,
            left: offset.x
        };
        return <div id="world" style={worldStyle}>{cells}</div>
    }
});

// This is the container component with all the state and logic.
export default React.createClass({
    getInitialState(){
        // Keep all game state in this container. All other components will be pure (only properties passed from here).
        return {
            world: getNewWorld(),
            player: {
                x: 0,
                y: 0,
                type: 'player',
                health: 100,
                attack: 3,
                weapon: 'fist',
                name: 'player'
            },
            entityNamesByLoc: {},
            ...this.getEntities(1,4, 4, 2, 1) //getEntities(level, healthPacks, enemies, weapons, portals)
        }
    },
    componentWillMount(){
        this.setStartingPositions();
    },
    render(){
        let entityElements = Object.keys(this.state).map(e => {
            if(this.state[e].type) return <Entity key={e} entity={this.state[e]}/>;
            else return null;
        });
        return (
            <div className="game">
                <World cellArray={this.state.world} offset={this.getOffset()}/>
                {entityElements}
            </div>
        )
    },
    getOffset(){
        return 0;
    },
    setStartingPositions(){
        let self = this;
        let entityNames = Object.keys(this.state).filter(eName => typeof(this.state[eName].type) === 'string');
        let allocated = {}; // Need this because setState runs async.
        entityNames.forEach(eName => {
            let vacant = false;
            while (vacant === false) {
                let x = Math.round(Math.random() * this.state.world.length);
                let y = Math.round(Math.random() * this.state.world.length);
                if (this.state.world[x][y] === 1
                    && !this.state.entityNamesByLoc[x + '-' + y]
                    && !allocated[x + '-' + y]) {
                    vacant = true;
                    self.setState({[eName]: Object.assign(this.state[eName], {x: x, y: y})});
                    allocated[x + '-' + y] = eName;
                }
            }
        });
        this.setState({entityNamesByLoc: Object.assign(this.state.entityNamesByLoc, allocated)});

    },
    fight(enemy){
        var enemyCopy = Object.assign({}, enemy);
        var playerCopy = Object.assign({}, this.state.player);
        enemyCopy.health -= this.state.player.attack;
        playerCopy.health -= enemy.attack;
        if(playerCopy.health < 1) this.gameOver();  // Player is dead.
        else if(enemyCopy.health < 1) {
            playerCopy.x = enemy.x;
            playerCopy.y = enemy.y;
        }
        // Todo: Consider putting all entities inside an entitiesByName object.
        this.setState({
            [enemy.name]: enemyCopy,
            player: playerCopy
        });
    },
    move(arrowKey){
        let playerCopy = Object.assign({}, this.state.player);
        switch (arrowKey) {
            case 'N':
                playerCopy.y += 1;
                break;
            case 'S':
                playerCopy.y -= 1;
                break;
            case 'E':
                playerCopy.x += 1;
                break;
            case 'W':
                playerCopy.x -= 1;
                break;
            default:
                break;
        }
        
        if (this.state.world[playerCopy.x][playerCopy.y] === 1) {
            let occupierName = this.entityNamesByLoc[playerCopy.x + '-' + playerCopy.y] || null;
            if (occupierName && this.state[occupierName].health > 0) {
                let occupier = this.state[occupierName];
                switch (occupier.type) {
                    case 'enemy':
                        this.fight(occupier); // fight method will move player if wins.
                        break;
                    case 'health' || 'weapon':
                        this.collect(occupier); // will also move the player
                        break;
                    case 'portal':
                        this.nextLevel(); // reloads the world.
                        break;
                    default:
                        break;
                }
            }
            else { // No occupier so lock in the move.
                this.setState({player: playerCopy});
            }
        }
    },
    nextLevel(){
        this.setState({entityNamesByLoc: {}, world: []}, () => {
            this.setState({...this.getEntities(), world: getNewWorld() });  // Note the old entities remain.
        })
    },
    getEntities(level, healthPacks, enemies, weapons, portals){
        var newEntities = {};
        for(let i = 0; i < healthPacks; i++){
            let name = 'health-' + i;
            newEntities[name] = {
                name: name,
                attack: 0,
                health: 20,
                type: 'health',
                level: level
            };
        }
        for(let i = 0; i < enemies; i++){
            let name = 'enemy-' + i;
            newEntities[name] = {
                name: name,
                attack: 5,
                health: 20,
                type: 'enemy',
                level: level
            };
        }
        for(let i = 0; i < weapons; i++){
            let name = 'weapon-' + i;
            newEntities[name] = {
                name: name,
                attack: 20,
                health: 1,
                type: 'weapon',
                level: level
            };
        }
        for(let i = 0; i < portals; i++){
            let name = 'portal-' + i;
            newEntities[name] = {
                name: name,
                attack: 0,
                health: 1,
                type: 'portal',
                level: level
            };
        }
        return newEntities;
    }
});

/*
* Returns a 2d array with each value representing a square that can be occupied by a thing.
 */
function getNewWorld(){
    let newWorld = [];
    let rooms = {};
    let corridors = {};
    for (var x = 0; x < settings.worldWidth; x++) {
        newWorld[x] = [];
        for (var y = 0; y < settings.worldHeight; y++) {
            newWorld[x][y] = 0;
        }
    }
    for(let i = 0; i < settings.roomGenerationAttempts; i++) {
        placeRandomRect();
    }

    for(let roomCoords in rooms){
        if(rooms.hasOwnProperty(roomCoords)){
            var tunnelAttempts = 4; // change this to be more random.
            for(let i = 0; i < tunnelAttempts; i++){
                makeCorridor(rooms[roomCoords]);
            }
        }
    }
    for(let i = 0; i < settings.randomWalkAttempts; i++){
        // attempt to walk to every room by randomly selecting a door to travel through

    }

    return newWorld;

    function placeRandomRect(){
        let worldLength = newWorld.length -1;
        let worldHeight = newWorld[0].length - 1;

        let rect = {};
        rect.x = Math.round(Math.random() * worldLength);
        rect.y = Math.round(Math.random() * worldHeight);
        rect.width = settings.minRoomSize + Math.round(Math.random() * (settings.maxRoomSize - settings.minRoomSize));
        rect.height = settings.minRoomSize + Math.round(Math.random() * (settings.maxRoomSize - settings.minRoomSize));
        // Check if it overlaps and if so, discard.
        for(let x = rect.x; x < rect.x + rect.width; x++){
            for(let y = rect.y; y < rect.y + rect.height; y++){
                if(x > worldLength || y > worldHeight) return ; // discard (outside bounds)
                if (newWorld[x][y] === 1) return ; // discard (overlapping another rect).
            }
        }
        // shrink the rectangle
        let room = {x: rect.x + 1, y: rect.y + 1, width: rect.width - 3, height: rect.height - 3};
        rooms[x + '-' + y] = room;
        for(let x = room.x; x < room.x + room.width; x++){
            for(let y = room.y; y < room.y + room.height; y++){
                newWorld[x][y] = 1;
            }
        }
    }

    function makeCorridor(room){
        const {x, y, width, height} = room;
        const direction = ['n', 's', 'e', 'w'][Math.round(Math.random() * 4 - 0.5)]
        let startingPoint = {};
        let transformation;
        switch(direction){
            case 'n':
                startingPoint = {x: x + Math.round(Math.random() * width), y: y};
                transformation = (point) => Object.assign(point, {y: point.y - 1});
                break;
            case 's':
                startingPoint = {x: x + Math.round(Math.random() * width), y: y + height};
                transformation = (point) => Object.assign(point, {y: point.y + 1});
                break;
            case 'e':
                startingPoint = {x: x + width, y: y + Math.round(Math.random() * height)};
                transformation = (point) => Object.assign(point, {x: point.x + 1});
                break;
            case 'w':
                startingPoint = {x: x, y: y + Math.round(Math.random() * height)};
                transformation = (point) => Object.assign(point, {x: point.x - 1});
                break;
        }
    }

}











