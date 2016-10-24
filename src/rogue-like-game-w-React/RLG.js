import React from 'react';
import graphlib from 'graphlib';
import '../../node_modules/animate.css/animate.min.css'

/*
* TODO: REMAINING USER STORIES
*   - You must use Sass
*   - When I find and beat the boss, I win.
*   - The game should be challenging, but theoretically winnable.
* TODO: NICE TO HAVE
*   - Change entity creation so old ones remain - currently naming convention means they get replace (I think).
    - Draw svg rectangles for the world rather than div cells. Would make world render much faster.
*   - Use classnames library to apply classes. This is a React best practice these days I think.
 */

var settings = {
    worldWidth: 100,  // cells
    worldHeight: 100, // cells
    maxRoomSize: 40, // cells
    minRoomSize: 20, // cells
    maxCorridorLength: 20, // cells
    roomGenerationAttempts: 10000,
    cellSize: 15, // pixels
    timeBetweenRoomRender: 100,
    viewPortWidth: 1000,
    viewPortHeight: 800,
    appWidth: 1300,
    levelAttackBonus: 0.2,  // Player attack is 20% stronger for every level advanced.
    dungeonAttackBonus: 0.3, // enemy attack has a 30% boost for each dungeon.
    randomizeAttack: attack => attack * (0.6 + 0.3 * Math.random()),
    xpRequiredPerLevel: 100,
    xpForKillingEnemy: 20
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
        let {cellArray} = this.props;
        let cells = [];
        for(let x = 0; x < cellArray.length; x++){
            for(let y = 0; y < cellArray[x].length; y++){
                let cellStyle = {
                    width: settings.cellSize,
                    height: settings.cellSize,
                    position: 'absolute',
                    left: x * settings.cellSize,
                    top: y * settings.cellSize,
                    backgroundColor: cellArray[x][y] === 1 ? 'white' : 'brown'
                };
                cells.push(<div key={x + '-' + y} style={cellStyle}></div>)
            }
        }
        return <div style={{position: "relative"}} id="world">{cells}</div>
    }
});
var ViewPort = React.createClass({
    render(){
        const {viewPortWidth, viewPortHeight, cellSize, worldWidth, worldHeight} = settings;
        const {player, darkness} = this.props;
        let offset = {};
        offset.x = (viewPortWidth/2 - player.x * cellSize);
        offset.x = offset.x > 0 ? 0 : offset.x < (viewPortWidth - worldWidth * cellSize) ?
            (viewPortWidth - worldWidth * cellSize) : offset.x;
        offset.y = (viewPortHeight/2 - player.y * cellSize);
        offset.y = offset.y > 0 ? 0 : offset.y < (viewPortHeight - worldHeight * cellSize) ?
            (viewPortHeight - worldHeight * cellSize) : offset.y;

        let viewPortStyle = {
            position: "relative",
            width: viewPortWidth,
            height: viewPortHeight,
            overflow: "hidden",
            margin: "auto",
            float: "left",
            border: "2px solid black"
        };
        let worldContainerStyle = {
            position: "absolute",
            width: worldWidth * cellSize,
            height: worldHeight * cellSize,
            left: offset.x,
            top: offset.y
        };
        let darknessStyle = {
            position: "absolute",
            width: worldWidth * cellSize,
            height: worldHeight * cellSize,
            mask: "url(#lightMask)",
            visibility: darkness ? "visible" : "hidden"
        };
        return (
            <div id="viewPort" style={viewPortStyle}>
                <div id="worldContainer" style={worldContainerStyle}>
                    {/*<div style={{position: "relative"}}><div style={{position: "absolute", width: 1000, height: 1000, left: 0, top: 0, backgroundColor: "yellow"}}></div></div>*/}
                    {this.props.children}
                    <svg style={darknessStyle}>
                        <defs>
                            <mask id="lightMask">
                                <rect x="0" y="0" width={worldWidth * cellSize} height={worldHeight * cellSize} style={{stroke: "none", fill: "white"}}/>
                                <circle cx={player.x * cellSize} cy={player.y * cellSize} r="250" style={{stroke: "none", fill: "black", opacity: "0.7"}}/>
                                <circle cx={player.x * cellSize} cy={player.y * cellSize} r="200" style={{stroke: "none", fill: "black", opacity: "0.5"}}/>
                                <circle cx={player.x * cellSize} cy={player.y * cellSize} r="170" style={{stroke: "none", fill: "black"}}/>
                            </mask>
                        </defs>
                        <rect style={darknessStyle}/>
                    </svg>


                </div>

            </div>
        )
    }
});
// This is the container component with all the state and logic.
export default React.createClass({
    getInitialState(){
        // Keep all game state in this container. All other components will be pure (only properties passed from here).
        return {
            world: [],
            dungeon: 1,
            rooms: {},
            corridors: {},
            player: {
                x: 0,
                y: 0,
                type: 'player',
                xp: 0,
                health: 100,
                attack: 3,
                weapon: 'fist',
                name: 'player'
            },
            entityNamesByLoc: {},
            corridorCells: {},
            darkness: true,
            messages: []
        }
    },
    componentDidMount(){
        this.generateDungeon();
    },
    // This is here to make the flash animation fire every time a new message is added to the state.messages list.
    // Simply adding 'animate flash' to the message element when created does not work.
    componentDidUpdate(prevProps, prevState){
        if(this.state.messages.length !== prevState.messages.length) {
            let firstMsg = document.getElementById("firstMessage");
            firstMsg.className = "";
            setTimeout(() => firstMsg.className = "animated flash", 500);
        }
    },
    generateDungeon(){
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
        let messages = this.state.messages.map((m, i) => {
            if(i === 0) return <p key='first' id="firstMessage" className="" style={{color: "red", textDecoration: "underline", fontSize: "16px"}}>{m}</p>
            else return <p key={i}>{m}</p>
        });

        let appStyle = {
            width: settings.appWidth,
            margin: "auto",
            height: 900
        };

        let infoStyle = {
            float: "left",
            color: "black",
            fontSize: 8,
            marginRight: 10
        };
        let infoGroupStyle = {
            width: settings.viewPortWidth
        };
        return (
            <div style={appStyle}>
                <div style={{float: "left"}}>
                    <div style={infoGroupStyle}>
                        <button style={{float: "right"}} onClick={() => this.setState({darkness: !this.state.darkness})}>Darkness</button>
                        <div style={infoStyle}><h3>Health: {this.state.player.health}  |</h3></div>
                        <div style={infoStyle}><h3>Weapon: {`${this.state.player.weapon} (${this.state.player.attack})`}  |</h3></div>
                        <div style={infoStyle}><h3>Dungeon: {this.state.dungeon}  |</h3></div>
                        <div style={infoStyle}><h3>Level: {Math.floor(this.state.player.xp/settings.xpRequiredPerLevel)}  |</h3></div>
                        <div style={infoStyle}><h3>XP to Next Level: {settings.xpRequiredPerLevel - Math.ceil(this.state.player.xp % settings.xpRequiredPerLevel)}  |</h3></div>
                    </div>
                    <ViewPort player={this.state.player} darkness={this.state.darkness}>
                        <World dungeon={this.state.dungeon} cellArray={this.state.world}/>
                        {entityElements}
                    </ViewPort>
                </div>
                <div style={{width: 250, margin: "auto", float: "right"}}>
                    <h3 style={{textAlign: "center"}}>Messages</h3>
                    {messages}
                </div>
            </div>
        )
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

    addMessage(msg){
        console.log(msg);
        let newMsgArray = this.state.messages.slice();
        newMsgArray.unshift(msg);
        this.setState({messages: newMsgArray});
    },

    fight(enemy){
        let enemyCopy = Object.assign({}, enemy);
        let playerCopy = Object.assign({}, this.state.player);
        let playerLevel = Math.floor(playerCopy.xp/settings.xpRequiredPerLevel);
        this.addMessage(`Attacking the bad guy with my ${playerCopy.weapon}!`);
        let damageToPlayer = Math.round(settings.randomizeAttack(playerCopy.attack * (1 + this.state.dungeon * settings.dungeonAttackBonus)));
        let damageToEnemy = Math.round(settings.randomizeAttack(playerCopy.attack * (1 + playerLevel * settings.levelAttackBonus)));
        enemyCopy.health -= damageToEnemy;
        playerCopy.health -= damageToPlayer;
        console.log(`Lost ${damageToPlayer} health. ${playerCopy.health} remaining`);
        console.log(`Inflicted ${damageToEnemy} damage on the enemy! They have ${enemy.health} health remaining.`);
        if(playerCopy.health < 1) this.gameOver();  // Player is dead.
        else if(enemyCopy.health < 1) {
            playerCopy.x = enemy.x;
            playerCopy.y = enemy.y;
            playerCopy.xp += settings.xpForKillingEnemy;
        }

        this.setState({
            [enemy.name]: enemyCopy,
            player: playerCopy
        });
    },
    gameOver(){
        alert("You got killed. Next time try getting the weapons and health-packs before going into battle.");
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
                        this.nextDungeon(); // reloads the world.
                        break;
                    default:
                        break;
                }
            }
            else this.setState({player: playerCopy});
            this.lookAround(playerCopy.x, playerCopy.y);
        }
    },
    lookAround(x, y){
        let AdjacentCellKeys = [(x + 1) + '-' + y, (x - 1) + '-' + y, x + '-' + (y - 1), x + '-' + (y + 1)];
        Object.keys(this.state.entityNamesByLoc).forEach(loc => {
            if(AdjacentCellKeys.includes(loc)) {
                let e = this.state[this.state.entityNamesByLoc[loc]];
                if (e.health > 0) {
                    switch (e.type) {
                        case "weapon":
                            this.addMessage(`Adjacent object is a weapon: ${e.weapon}, attack value: ${e.attack}`);
                            break;
                        case "health":
                            this.addMessage(`Adjacent object is a health pack: ${e.health}`);
                            break;
                        case "enemy":
                            if (e.health > 0) this.addMessage(`Oh crap! The adjacent object is an enemy: attack: ${e.attack}, health: ${e.health}`);
                            break;
                        case "portal":
                            if (e.health > 0) this.addMessage(`The adjacent object is a Portal, it will take you to the next dungeon.`);
                            break;
                        default:
                            break;
                    }
                }

            }
        });
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
        if(entity.type === 'health') this.addMessage(`Health + ${entity.health}`);
        if(entity.type === 'weapon') this.addMessage(`Cool man!! A ${entity.weapon}`);
        this.setState({player: playerCopy, [entity.name]: entityCopy})
    },
    nextDungeon(){
        // Todo - preserve the old world & record which entities belong to which dungeon.
        // Kill all currently living entities on the current dungeon.
        let deadEntities = {};
        for(let e in this.state){
            if(this.state.hasOwnProperty(e)){
                if(e !== 'player' && this.state[e].type){
                    deadEntities[e] = Object.assign({}, this.state[e], {health: 0});
                }
            }
        }
        let newDungeon = this.state.dungeon + 1;
        this.setState({underConstruction: true, entityNamesByLoc: {}, world: [], ...deadEntities, dungeon: newDungeon}, () => this.generateDungeon());
    },

    createEntities(){
        var self = this;
        return new Promise((resolve, reject) => {
            var newEntities = {};
            const dungeon = this.state.dungeon;
            let healthpacks, enemies, portals;
            switch(dungeon){
                case 1:
                    [healthpacks, enemies, portals] = [6, 10, 1]; // todo: change portals back to 1.
                    break;
                case 2:
                    [healthpacks, enemies, portals] = [4, 5, 1];
                    break;
                case 3:
                    [healthpacks, enemies, portals] = [6, 9, 1];
                    break;
                case 4:
                    [healthpacks, enemies, portals] = [7, 15, 0];
                    break;
                default:
                    break;
            }
            var weaponList = [['knife', 5], ['sword', 8], ['bow', 12], ['pistol', 16], ['rifle', 20], ['assault rifle', 30],
                ['bazooka', 40], ['grenade-launcher', 60]]; // 2 per dungeon (4 dungeons)
            for(let i = 0; i < healthpacks; i++){
                let name = 'health-' + i;
                newEntities[name] = {
                    x: 0, y: 0,
                    name: name,
                    attack: 0,
                    health: 20,
                    type: 'health',
                    dungeon: dungeon
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
                    dungeon: dungeon
                };
            }
            for(let i = 0; i < 2; i++){ // Two weapons per dungeon only - this is not a good design.
                let name = 'weapon-' + i;
                newEntities[name] = {
                    x: 0, y: 0,
                    name: name,
                    attack: weaponList[(dungeon - 1)*2 + i][1],
                    health: 1,
                    type: 'weapon',
                    dungeon: dungeon,
                    weapon: weaponList[(dungeon - 1)*2 + i][0]
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
                    dungeon: dungeon
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












