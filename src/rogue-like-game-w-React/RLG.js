import React from 'react';

/*
* This React application has one parent container, which has all the state and logic. There is:
*   - state.world: a 2d array representing a grid that is either part of a room or passage (1) or a wall (0)
*   - state.player: An object representing the current player.
*   - state.things: An object containing a list of entitiesByName.
*
*   Move. On each move the player's coordinates change and the corresponding component is re-rendered. The World
 */

var tick;

var settings = {
    worldWidth: 100,  // cells
    worldHeight: 100, // cells
    maxRoomSize: 45, // cells
    minRoomSize: 15, // cells
    maxCorridorLength: 20, // cells
    roomGenerationAttempts: 10000,
    randomWalkAttempts: 1000,
    cellSize: 10 // pixels
};

var Entity = React.createClass({
    render(){
        let e = this.props.entity;
        let eStyle = {
            visibility: e.health > 0 ? 'visible' : 'hidden',
            width: settings.cellSize,
            height: settings.cellSize,
            position: 'absolute',
            left: e.x * settings.cellSize,
            top: e.y * settings.cellSize,
            backgroundColor: e.type === 'player' ? 'blue'
                : e.type === 'enemy' ? 'red'
                : e.type === 'health' ? 'green'
                : e.type === 'weapon' ? 'orange' : 'purple', // portals are purple.
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
            level: 1,
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
            ...this.getEntities(1)
        }
    },
    componentWillMount(){
        var self = this;
        this.setStartingPositions();
        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) return; // Should do nothing if the key event was already consumed.
            self.move(event.key);
            // Consume the event to avoid it being handled twice
            event.preventDefault();
        }, true);
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
        let entityNames = Object.keys(this.state).filter(eName =>
            typeof(this.state[eName].type) === 'string');
        let allocated = {}; // Need this because setState runs async.
        entityNames.forEach(eName => {
            let vacant = false;
            while (vacant === false) {
                let x = Math.round(Math.random() * (this.state.world.length - 1));
                let y = Math.round(Math.random() * (this.state.world[0].length - 1));
                if (this.state.world[x][y] === 1
                    && !this.state.entityNamesByLoc[x + '-' + y]
                    && !allocated[x + '-' + y]) {
                    vacant = true;
                    self.setState({[eName]: Object.assign(this.state[eName], {x: x, y: y})});
                    if(eName !== 'player') allocated[x + '-' + y] = eName;
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
        console.log("time from last tick: " + (Date.now() - tick));
        tick = Date.now();
        let playerCopy = Object.assign({}, this.state.player);
        switch (arrowKey) {
            case 'ArrowUp':
                playerCopy.y += 1;
                break;
            case 'ArrowDown':
                playerCopy.y -= 1;
                break;
            case 'ArrowRight':
                playerCopy.x += 1;
                break;
            case 'ArrowLeft':
                playerCopy.x -= 1;
                break;
            default:
                break;
        }
        
        if (this.state.world[playerCopy.x][playerCopy.y] === 1) {
            let occupierName = this.state.entityNamesByLoc[playerCopy.x + '-' + playerCopy.y] || null;
            if (occupierName && this.state[occupierName].health > 0) {
                let occupier = this.state[occupierName];
                switch (occupier.type) {
                    case 'enemy':
                        this.fight(occupier); // fight method will move player if wins.
                        break;
                    case 'health':
                    case 'weapon':
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
    collect(entity){
        let playerCopy = Object.assign({}, this.state.player, {
            health: this.state.player.health + (entity.type === 'health' ? entity.health : 0),
            attack: this.state.player.attack + (entity.type === 'weapon' ? entity.attack : 0),
            weapon: entity.type === 'weapon' ? entity.weapon : this.state.player.weapon,
            x: entity.x,
            y: entity.y
        });
        let entityCopy = Object.assign({}, entity, {
            health: 0,
            attack: 0
        });
        this.setState({player: playerCopy, [entity.name]: entityCopy})
    },
    nextLevel(){
        this.setState({entityNamesByLoc: {}, world: []}, () => {
            this.setState({...this.getEntities(), world: getNewWorld() });  // Note the old entities remain.
        })
    },
    getEntities(level){
        let healthpacks, enemies, weapons, portals;
        switch(level){
            case 1:
                [healthpacks, enemies, weapons, portals] = [3, 3, 2, 1];
                break;
            case 2:
                [healthpacks, enemies, weapons, portals] = [4, 5, 2, 1];
                break;
            case 3:
                [healthpacks, enemies, weapons, portals] = [6, 9, 2, 2];
                break;
            case 4:
                [healthpacks, enemies, weapons, portals] = [7, 15, 2, 2];
                break;
        }
        var weaponList = [['knife', 5], ['sword', 8], ['bow', 12], ['pistol', 16], ['rifle', 20], ['assault rifle', 30],
                ['bazooka', 40], ['grenade-launcher', 60]]; // 2 per level (4 levels)
        var newEntities = {};
        for(let i = 0; i < healthpacks; i++){
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
        for(let i = 0; i < 2; i++){ // Two weapons per level only - this is not a good design.
            let name = 'weapon-' + i;
            newEntities[name] = {
                name: name,
                attack: weaponList[(level - 1)*2 + i][1],
                health: 1,
                type: 'weapon',
                level: level,
                weapon: weaponList[(level - 1)*2 + i][0]
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
    },
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
        makeRoom();
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

    function makeRoom(){
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
        rooms[room.x + '-' + room.y] = room;
        for(let x = room.x; x < room.x + room.width; x++){
            for(let y = room.y; y < room.y + room.height; y++){
                newWorld[x][y] = 1;
            }
        }
    }

    function makeCorridor(room){
        const roomKeys = Object.keys(rooms);
        const {x, y, width, height} = room;
        const direction = ['n', 's', 'e', 'w'][Math.round(Math.random() * 4 - 0.5)];
        let startingPt = {};
        let moveToNext;
        switch(direction){
            case 'n':
                startingPt = {x: x + 2 + Math.round(Math.random() * (width - 4)), y: y};
                moveToNext = (point) => Object.assign(point, {y: point.y - 1});
                break;
            case 's':
                startingPt = {x: x + 2 + Math.round(Math.random() * (width - 4)), y: y + height - 1};
                moveToNext = (point) => Object.assign(point, {y: point.y + 1});
                break;
            case 'e':
                startingPt = {x: x + width - 1, y: y + Math.round(Math.random() * (height - 4))};
                moveToNext = (point) => Object.assign(point, {x: point.x + 1});
                break;
            case 'w':
                startingPt = {x: x, y: y + Math.round(Math.random() * (height - 4))};
                moveToNext = (point) => Object.assign(point, {x: point.x - 1});
                break;
            default:
                break;
        }
        let currentPt = Object.assign({}, startingPt);
        for(let i = 0; i < settings.maxCorridorLength; i ++){
            moveToNext(currentPt);
            // eslint-disable-next-line
            var intersectingRoomKey = roomKeys.find(rmKey => {
                let rm = rooms[rmKey];
                return currentPt.x >= rm.x && currentPt.x <= rm.x + rm.width
                    && currentPt.y >= rm.y && currentPt.y <= rm.y + rm.height
                    && rmKey !== room.x + '-' + room.y;
            });
            if(intersectingRoomKey){
                let intersectingRoom = rooms[intersectingRoomKey];
                let keyStr1 = room.x + '-' + room.y + '-to-' + intersectingRoom.x + '-' + intersectingRoom.y;
                let keyStr2 = intersectingRoom.x + '-' + intersectingRoom.y + '-to-' + room.x + '-' + room.y;
                if(corridors[keyStr1]) {
                    return;
                } // there is already a corridor between these rooms.
                else {
                    corridors[keyStr1] = {startingPt: startingPt};
                    corridors[keyStr2] = {startingPt: startingPt};
                    currentPt = startingPt;
                    let keepDigging = true;
                    while(keepDigging){
                        moveToNext(currentPt);
                        if(currentPt.x >= newWorld.length || currentPt.y >= newWorld[0].length
                            || currentPt.x < 0 || currentPt.y < 0) {
                            //debugger;
                            break;
                        }
                        if(newWorld[currentPt.x][currentPt.y] === 1) {
                            keepDigging = false;
                            break;
                        }
                        newWorld[currentPt.x][currentPt.y] = 1
                    }
                }
                break;
            }
        }
    }
}











