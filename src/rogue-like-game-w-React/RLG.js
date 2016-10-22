import React from 'react';
import graphlib from 'graphlib';

/*
* Todo. Or, make corridors separate from the World and allow movement through corridors but not placement of entities
*   - this will also speed up render of corridors if doing sequential rendering of each cell.
* Todo. Change entity creation so old ones remain - currently naming convention means they get replace (I think).
 */

var settings = {
    worldWidth: 100,  // cells
    worldHeight: 100, // cells
    maxRoomSize: 40, // cells
    minRoomSize: 20, // cells
    maxCorridorLength: 20, // cells
    roomGenerationAttempts: 10000,
    cellSize: 10, // pixels
    timeBetweenRoomRender: 100,
    viewPortWidth: 600,
    viewPortHeight: 400
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
    shouldComponentUpdate(nextProps){
        let w1 = this.props.cellArray.reduce((prev, curr) => prev + curr.reduce((p, c) =>  p + c, 0), 0);
        let w2 = nextProps.cellArray.reduce((prev, curr) => prev + curr.reduce((p, c) =>  p + c, 0), 0);
        return w1 !== w2;
    },
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
            left: offset.x,
        };
        return <div id="world" style={worldStyle}>{cells}</div>
    }
});

// This is the container component with all the state and logic.
export default React.createClass({
    getInitialState(){
        // Keep all game state in this container. All other components will be pure (only properties passed from here).
        return {
            world: [],
            level: 1,
            rooms: {},
            corridors: {},
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
            corridorCells: {}
        }
    },
    componentDidMount(){
        this.generateLevel();
    },
    generateLevel(){
        var self = this;
        self.createWorld()
            .then(this.createEntities)
            .then(self.createRooms)
            .then(self.createCorridors)
            .then(self.setStartingPositions)
            .then(() => {
                window.addEventListener("keydown", function (event) {
                    if (event.defaultPrevented) return; // Should do nothing if the key event was already consumed.
                    self.move(event.key);
                    // Consume the event to avoid it being handled twice
                    event.preventDefault();
                }, true);
            });
    },
    
    render(){
        let entityElements = Object.keys(this.state).map(e => {
            if(this.state[e].type) return <Entity key={e} entity={this.state[e]}/>;
            else return null;
        });

        let viewPortStyle = {
            position: "relative",
            width: settings.viewPortWidth,
            height: settings.viewPortHeight,
        };

        return (
            <div style={viewPortStyle}>
                <World level={this.state.level} cellArray={this.state.world} offset={this.getOffset()}/>
                {entityElements}
            </div>
        )
    },
    getOffset(){
        if (this.state.player.x !== 0) {
            debugger;
        }
        return {
            x: (this.state.player.x - settings.viewPortWidth/2) * -1,
            y: (this.state.player.y - settings.viewPortHeight/2) * -1
        };

    },
    setStartingPositions(){
        let self = this;
        let entityNames = Object.keys(this.state).filter(eName =>
            typeof(this.state[eName].type) === 'string' && this.state[eName].health > 0);
        let allocated = {}; // Need this because setState runs async.
        entityNames.forEach(eName => {
            let vacant = false;
            let counter = 0;
            while (vacant === false && counter < 1000) {
                counter++;
                let x = Math.round(Math.random() * (this.state.world.length - 1));
                let y = Math.round(Math.random() * (this.state.world[0].length - 1));
                if (this.state.world[x][y] === 1
                    && !this.state.entityNamesByLoc[x + '-' + y]
                    && !allocated[x + '-' + y]
                    && !this.state.corridorCells.includes(x + '-' + y)) {
                    vacant = true;
                    self.setState({[eName]: Object.assign(this.state[eName], {x: x, y: y})});
                    if(eName !== 'player') allocated[x + '-' + y] = eName;
                }
            }
        });
        return new Promise(resolve => this.setState({entityNamesByLoc: Object.assign(this.state.entityNamesByLoc, allocated)}, () => resolve('state updated')));
    },

    fight(enemy){
        var enemyCopy = Object.assign({}, enemy);
        var playerCopy = Object.assign({}, this.state.player);
        console.log(`Argghh... you bastard, now I will kill you with my ${playerCopy.weapon}!`);
        enemyCopy.health -= this.state.player.attack;
        playerCopy.health -= enemy.attack;
        console.log(`Lost ${enemy.attack} health. ${playerCopy.health} remaining`);
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
            case 'ArrowUp':
                playerCopy.y -= 1;
                break;
            case 'ArrowDown':
                playerCopy.y += 1;
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
            else this.setState({player: playerCopy});
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
        if(entity.type === 'health') console.log(`Ahhhh... that's better. Health + ${entity.health}`);
        if(entity.type === 'weapon') console.log(`Cool man!! A ${entity.weapon}`);
        this.setState({player: playerCopy, [entity.name]: entityCopy})
    },
    nextLevel(){
        // Todo - preserve the old world & record which entities belong to which level.
        // Kill all currently living entities on the current level.
        let deadEntities = {};
        for(let e in this.state){
            if(this.state.hasOwnProperty(e)){
                if(e !== 'player' && this.state[e].type){
                    deadEntities[e] = Object.assign({}, this.state[e], {health: 0});
                }
            }
        }
        let newLevel = this.state.level + 1;
        this.setState({underConstruction: true, entityNamesByLoc: {}, world: [], ...deadEntities, level: newLevel}, () => this.generateLevel());
    },

    createEntities(){
        var self = this;
        return new Promise((resolve, reject) => {
            var newEntities = {};
            const level = this.state.level;
            let healthpacks, enemies, portals;
            switch(level){
                case 1:
                    [healthpacks, enemies, portals] = [1, 1, 1]; // todo: change portals back to 1.
                    break;
                case 2:
                    [healthpacks, enemies, portals] = [4, 5, 1];
                    break;
                case 3:
                    [healthpacks, enemies, portals] = [6, 9, 2];
                    break;
                case 4:
                    [healthpacks, enemies, portals] = [7, 15, 0];
                    break;
                default:
                    break;
            }
            var weaponList = [['knife', 5], ['sword', 8], ['bow', 12], ['pistol', 16], ['rifle', 20], ['assault rifle', 30],
                ['bazooka', 40], ['grenade-launcher', 60]]; // 2 per level (4 levels)
            for(let i = 0; i < healthpacks; i++){
                let name = 'health-' + i;
                newEntities[name] = {
                    x: 0, y: 0,
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
                    x: 0, y: 0,
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
                    x: 0, y: 0,
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
                    x: 0, y: 0,
                    name: name,
                    attack: 0,
                    health: 1,
                    type: 'portal',
                    level: level
                };
            }
            self.setState({...newEntities}, () => resolve('state updated'))
        });
    },
    createWorld(){
        let self = this;
        let newWorld = [];
        for (var x = 0; x < settings.worldWidth; x++) {
            newWorld[x] = [];
            for (var y = 0; y < settings.worldHeight; y++) {
                newWorld[x][y] = 0;
            }
        }
        return new Promise(resolve => self.setState({world: newWorld}, () => resolve('state updated')));
    },
    createRooms(){

        let self = this;
        let rooms = {};
        let worldCopy = self.state.world.map(arr => arr.slice()); // make a copy not a reference.
        let worldLength = worldCopy.length - 1;
        let worldHeight = worldCopy[0].length - 1;
        let promises = [];
        let startTime = Date.now();

        for(let i = 0; i < 10000; i++){
            let rect = {};
            let feasible = true;
            rect.x = Math.round(Math.random() * worldLength);
            rect.y = Math.round(Math.random() * worldHeight);
            rect.width = settings.minRoomSize + Math.round(Math.random() * (settings.maxRoomSize - settings.minRoomSize));
            rect.height = settings.minRoomSize + Math.round(Math.random() * (settings.maxRoomSize - settings.minRoomSize));
            // Check if it overlaps and if so, discard.
            for (let x = rect.x; x < rect.x + rect.width; x++) {
                for (let y = rect.y; y < rect.y + rect.height; y++) {
                    if (x > worldLength || y > worldHeight || worldCopy[x][y] === 1) { // outside boundary or overlapping
                        feasible = false;
                        x = rect.x + rect.width; // breaks out of the for loop for this rectangle check.
                    }
                }
            }
            if (feasible) {
                // shrink the rectangle
                let room = {x: rect.x + 1, y: rect.y + 1, width: rect.width - 3, height: rect.height - 3};
                rooms[room.x + '-' + room.y] = room;
                for (let x = room.x; x < room.x + room.width; x++) {
                    for (let y = room.y; y < room.y + room.height; y++) {
                        worldCopy[x][y] = 1;
                    }
                }
                let delay = (startTime + (promises.length + 1) * settings.timeBetweenRoomRender) - Date.now();
                if(delay < 0) delay = 500;
                let p = new Promise(resolve => {
                    // make a snapshot to place at the specified interval.
                    let snapShot = worldCopy.map(arr => arr.slice());
                    setTimeout(() => {
                        self.setState({world: snapShot, rooms: rooms}, () => resolve('added new room.'));
                    }, delay)
                });
                promises.push(p);
            }
        }
        return Promise.all(promises);
    },
    createCorridors(){
        let self = this;
        let g = new graphlib.Graph({directed: false});
        let worldCopy = this.state.world.map(arr => arr.slice());
        let rooms = this.state.rooms;
        const roomKeys = Object.keys(rooms);
        let corridorCells = [];
        roomKeys.forEach(key => g.setNode(key));
        while(graphlib.alg.components(g).length > 1) {  // One component means there's a path to all rooms.
            roomKeys.forEach(currentRmKey => tryDigCorridor(currentRmKey));
        }
        return new Promise((resolve, reject) => {
            self.setState({world: worldCopy, corridorCells: corridorCells}, () => resolve('corridors updated'));
        });
        function tryDigCorridor(currentRmKey){
            let currentRm = rooms[currentRmKey];
            const direction = ['n', 's', 'e', 'w'][Math.round(Math.random() * 4 - 0.5)];
            let startingPt = {};
            let moveToNext;
            switch (direction) {
                case 'n':
                    startingPt = {x: currentRm.x + 2 + Math.round(Math.random() * (currentRm.width - 4)), y: currentRm.y};
                    moveToNext = (point) => Object.assign(point, {y: point.y - 1});
                    break;
                case 's':
                    startingPt = {x: currentRm.x + 2 + Math.round(Math.random() * (currentRm.width - 4)), y: currentRm.y + currentRm.height - 1};
                    moveToNext = (point) => Object.assign(point, {y: point.y + 1});
                    break;
                case 'e':
                    startingPt = {x: currentRm.x + currentRm.width - 1, y: currentRm.y + Math.round(Math.random() * (currentRm.height - 4))};
                    moveToNext = (point) => Object.assign(point, {x: point.x + 1});
                    break;
                case 'w':
                    startingPt = {x: currentRm.x, y: currentRm.y + Math.round(Math.random() * (currentRm.height - 4))};
                    moveToNext = (point) => Object.assign(point, {x: point.x - 1});
                    break;
                default:
                    break;
            }
            let currentPt = Object.assign({}, startingPt);
            for (let i = 0; i < settings.maxCorridorLength; i++) {
                moveToNext(currentPt);
                let intersectingRoomKey = getIntersectingRoomKey(currentPt);
                if (intersectingRoomKey) {
                    if(g.edge(currentRmKey, intersectingRoomKey)) break; // only want single join between any two rooms.
                    else {
                        let endPt = Object.assign({}, currentPt);
                        corridorCells.push(`${endPt.x}-${endPt.y}`);
                        g.setEdge(currentRmKey, intersectingRoomKey, currentRmKey + 'to' + intersectingRoomKey);
                        currentPt = Object.assign({}, startingPt);
                        while (JSON.stringify(currentPt) !== JSON.stringify(endPt)) {
                            corridorCells.push(`${currentPt.x}-${currentPt.y}`); // includes the start point but not end.
                            moveToNext(currentPt);
                            worldCopy[currentPt.x][currentPt.y] = 1;
                        }
                    }
                    break;
                }
            }

        }
        function getIntersectingRoomKey(currentPt) {
            var intersectingRoomKey = roomKeys.find(rmKey => {
                let rm = rooms[rmKey];
                return currentPt.x >= rm.x + 2 && currentPt.x <= rm.x + rm.width - 2  // +-2 prevents corridors right on the edge.
                    && currentPt.y >= rm.y + 2 && currentPt.y <= rm.y + rm.height - 2
            });
            return intersectingRoomKey ? intersectingRoomKey : null;
        }
    }
});












