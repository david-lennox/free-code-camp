import React from 'react';
import graphlib from 'graphlib';
import '../../node_modules/animate.css/animate.min.css'
import CSSTransitionGroup from 'react-addons-css-transition-group';
import Modal from 'react-modal';

/*
* TODO: REMAINING USER STORIES
*   - You must use Sass
*   - When I find and beat the boss, I win.
*   - The game should be challenging, but theoretically winnable.
*       -- todo. implement testWinable function that simulates some number of random game plays that collect all health
*       and weapons and then go around killing a specifed number of enemy in each dungeon.
* TODO: NICE TO HAVE
*   - Change entity creation so old ones remain - currently naming convention means they get replace (I think).
    - Draw svg rectangles for the world rather than div cells. Would make world render much faster.
*   - Use classnames library to apply classes. This is a React best practice these days I think.
 */

var RLGSettings = {
    worldWidth: 100,  // cells
    worldHeight: 100, // cells
    maxRoomSize: 40, // cells
    minRoomSize: 20, // cells
    maxCorridorLength: 20, // cells
    roomGenerationAttempts: 10000,
    cellSize: 15, // pixels
    timeBetweenRoomRender: 0,
    viewPortWidth: 1000,
    viewPortHeight: 800,
    appWidth: 1300,
    levelAttackBonus: 0.2,  // Player attack is 20% stronger for every level advanced.
    dungeonAttackBonus: 0.3, // enemy attack has a 30% boost for each dungeon.
    randomizeAttack: attack => attack * (0.6 + 0.3 * Math.random()),
    xpRequiredPerLevel: 100,
    xpForKillingEnemy: 20,
    // let {enemies, maxEnemyAtk, enemyHealth, weapons, healthPacks, healthPackValue} = dungeonSettings;
    dungeon1: {
        enemies: 10,
        maxEnemyAtk: 10,
        enemyHealth: 20,
        weapons: [['knife', 5], ['sword', 8]],
        healthPacks: 5,
        healthPackValue: 10
    },
    dungeon2: {
        enemies: 15,
        maxEnemyAtk: 20,
        enemyHealth: 40,
        weapons: [['bow', 12], ['pistol', 16]],
        healthPacks: 5,
        healthPackValue: 10
    },
    dungeon3: {
        enemies: 20,
        maxEnemyAtk: 30,
        enemyHealth: 60,
        weapons: [['rifle', 20], ['assault rifle', 30]],
        healthPacks: 10,
        healthPackValue: 10
    },
    dungeon4: {
        enemies: 30,
        maxEnemyAtk: 40,
        enemyHealth: 80,
        weapons: [['bazooka', 40], ['grenade-launcher', 60]],
        healthPacks: 20,
        healthPackValue: 10
    },
    playerStartState: {
        x: 0,
        y: 0,
        type: 'player',
        xp: 0,
        health: 100,
        attack: 3,
        weapon: 'fist',
        name: 'player'
    },
    bossStartState: {
        attack: 100,
        health: 800
    }
};

var Entity = React.createClass({
    render(){
        let self = this;
        let e = self.props.entity;
        let eStyle = {
            visibility: e.health > 0 ? 'visible' : 'hidden',
            width: RLGSettings.cellSize * (e.size ? e.size : 1),
            height: RLGSettings.cellSize * (e.size ? e.size : 1),
            position: 'absolute',
            left: e.x * RLGSettings.cellSize ,
            top: e.y * RLGSettings.cellSize,
            backgroundColor: e.type === 'player' ? 'blue'
                : e.type === 'enemy' ? 'red'
                : e.type === 'health' ? 'green'
                : e.type === 'weapon' ? 'orange' : 'purple' // portals are purple.
        };
        return <div id={e.name} style={eStyle}></div>;
    }
});

var World = React.createClass({
    shouldComponentUpdate(nextProps){
        let self = this;
        let w1 = self.props.cellArray.reduce((prev, curr) => prev + curr.reduce((p, c) =>  p + c, 0), 0);
        let w2 = nextProps.cellArray.reduce((prev, curr) => prev + curr.reduce((p, c) =>  p + c, 0), 0);
        return w1 !== w2;
    },
    render(){
        let self = this;
        let {cellArray} = self.props;
        let cells = [];
        for(let x = 0; x < cellArray.length; x++){
            for(let y = 0; y < cellArray[x].length; y++){
                let cellStyle = {
                    width: RLGSettings.cellSize,
                    height: RLGSettings.cellSize,
                    position: 'absolute',
                    left: x * RLGSettings.cellSize,
                    top: y * RLGSettings.cellSize,
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
        let self = this;
        const {viewPortWidth, viewPortHeight, cellSize, worldWidth, worldHeight} = RLGSettings;
        const {player, darkness} = self.props;
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
                    {self.props.children}
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
var GameOver = React.createClass({
   render(){
       let self = this;
       var gameOverStyle = {
           visibility: self.props.over ? 'visible' : 'hidden',
           position: 'fixed',
           backgroundColor: 'red',
           color: 'white',
           width: 700,
           height: 400,
           border: '1pt solid orange',
           padding: 20,
           margin: "auto",
           top: "50%",
           left: "50%",
           marginTop:  -100, /* Negative half of height. */
           marginLeft:  -200, /* Negative half of width. */
       };
       return <div style={gameOverStyle}><h1>Game Over Sucker!</h1><p>Next time try collecting the health packs and weapons before going into battle!</p></div>
   }
});
// This is the container component with all the state and logic.
export default React.createClass({
    getInitialState(){
        console.log("Get Initial State called");
        // Keep all game state in this container. All other components will be pure (only properties passed from here).
        return {
            gameStatus: "noGame", // is either noGame, underConstruction, playing, or over,
            world: [],
            dungeon: 1,
            rooms: {},
            corridors: {},
            entities: {},
            player: RLGSettings.playerStartState,
            entityNamesByLoc: {},
            corridorCells: {},
            darkness: true,
            messages: []
        }
    },
    componentDidMount(){
        console.log("component did mount.")
    },
    componentWillUnmount(){
        console.log("component Will unmount - but who knows if it really did?");
    },
    generateDungeon(){
        var self = this;
        var lastPromise = self.createWorld()
            .then(self.createEntities)
            .then(self.createRooms)
            .then(self.createCorridors)
            .then(self.setStartingPositions)
            .then(() => {
                self.setState({gameStatus: 'playing'});
                window.addEventListener("keydown", function (event) {
                    if (event.defaultPrevented) return; // Should do nothing if the key event was already consumed.
                    self.move(event.key);
                    // Consume the event to avoid it being handled twice
                    event.preventDefault();
                }, true);
            });
        console.log("last promise created");
    },
    render(){
        let self = this;
        let entityElements = Object.keys(self.state.entities).map(e => {
            return <Entity key={e} entity={self.state.entities[e]}/>;
        });
        entityElements.push(<Entity key="player" entity={self.state.player}/>); // Todo: Refactor so player is in entity list.
        let messages = self.state.messages.map((m, i) => {
            if(i === self.state.messages.length - 1) return <p key={i} id="firstMessage" className="" style={{color: "red", textDecoration: "underline", fontSize: "16px"}}>{m}</p>
            else return <p key={i}>{m}</p>
        });

        let appStyle = {
            width: RLGSettings.appWidth,
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
            width: RLGSettings.viewPortWidth
        };
        let spinnerStyle = {
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "blue",
            visibility: self.state.gameStatus === "playing" ? "hidden" : "visible"
        };
        let animationTimeout = 1500;
        return (
            <div id="RLG" style={appStyle}>
                <div style={{float: "left"}}>
                    <div style={infoGroupStyle}>
                        <button style={{float: "right"}} onClick={() => self.setState({darkness: !self.state.darkness})}>Darkness</button>
                        <button onClick={self.simulateGame}>Simulate</button>
                        <div style={infoStyle}><h3>Health: {self.state.player.health}  |</h3></div>
                        <div style={infoStyle}><h3>Weapon: {`${self.state.player.weapon} (${self.state.player.attack})`}  |</h3></div>
                        <div style={infoStyle}><h3>Dungeon: {self.state.dungeon}  |</h3></div>
                        <div style={infoStyle}><h3>Level: {Math.floor(self.state.player.xp/RLGSettings.xpRequiredPerLevel)}  |</h3></div>
                        <div style={infoStyle}><h3>XP to Next Level: {RLGSettings.xpRequiredPerLevel - Math.ceil(self.state.player.xp % RLGSettings.xpRequiredPerLevel)}  |</h3></div>
                    </div>
                    <ViewPort player={self.state.player} darkness={self.state.darkness}>
                        <World dungeon={self.state.dungeon} cellArray={self.state.world}/>
                        {entityElements}
                    </ViewPort>
                </div>
                <div style={{width: 250, margin: "auto", float: "right"}}>
                    <h3 style={{textAlign: "center"}}>Messages</h3>
                    <CSSTransitionGroup transitionName={{
                        enter: "animated",
                        enterActive: "rubberBand",
                        leave: "animated",
                        leaveActive: "fadeOutRight"}} transitionEnterTimeout={animationTimeout} transitionLeaveTimeout={animationTimeout} >
                        {messages.reverse()}
                    </CSSTransitionGroup>
                </div>
                <div style={spinnerStyle} id="spinner">
                    <i style={{visibility: self.state.gameStatus === 'underConstruction' ? 'visible' : 'hidden'}} className="fa fa-spinner" />
                    <button style={{visibility: self.state.gameStatus === 'noGame' ? 'visible' : 'hidden', position: "absolute", top: 100, left: 100}}
                            onClick={self.generateDungeon}>Create New Game</button>
                </div>

            </div>
        )
    },
    setStartingPositions(){
        let self = this;
        let entitiesCopy = Object.assign({}, self.state.entities, {player: self.state.player}); // Todo - refactor cause this might be a bit dangerous.
        let entityNames = Object.keys(entitiesCopy);
        let allocated = {}; // Need this because setState runs async.
        entityNames.forEach(eName => {
            let vacant = false;
            let counter = 0;
            while (vacant === false && counter < 1000) {
                counter++;
                let x = Math.round(Math.random() * (self.state.world.length - 1));
                let y = Math.round(Math.random() * (self.state.world[0].length - 1));
                let pts = [];
                if(entitiesCopy[eName].name === 'boss') pts = [[x,y], [x + 1, y], [x, y + 1], [x+1, y+1]];
                else pts = [[x,y]];
                if (pts.every(isVacant)) {
                    vacant = true;
                    Object.assign(entitiesCopy[eName], {x: x, y: y});
                    //self.setState({entities: Object.assign({}, self.state.entities[eName], {x: x, y: y})});
                    pts.forEach(([x, y]) => {
                        allocated[x + '-' + y] = eName;
                        //console.log(`Allocated ${eName} to x: ${x}, y: ${y}.`);
                    });
                }
            }
        });
        delete entitiesCopy.player; // Todo. Refactor to keep player in here.
        let playerLoc = Object.keys(allocated).find(key => allocated[key] === 'player');
        delete allocated[playerLoc];
        return new Promise(resolve => self.setState({
            entities: entitiesCopy,
            entityNamesByLoc: Object.assign(self.state.entityNamesByLoc, allocated)
        }, () => resolve('state updated')));

        function isVacant([x, y]){ // expects a two item array. And will assign x and y to those items (ES6).
            return self.state.world[x][y] === 1
            && !self.state.entityNamesByLoc[x + '-' + y]
            && !allocated[x + '-' + y]
            && !self.state.corridorCells.includes(x + '-' + y)
        }
    },

    addMessage(msg){
        let self = this;
        console.log(msg);
        let newMsgArray = self.state.messages.slice();
        newMsgArray.push(msg);
        self.setState({messages: newMsgArray});
    },

    fight(enemy){
        let self = this;
        let enemyCopy = Object.assign({}, enemy);
        let playerCopy = Object.assign({}, self.state.player);
        let playerLevel = Math.floor(playerCopy.xp/RLGSettings.xpRequiredPerLevel);
        self.addMessage(`Attacking the bad guy with my ${playerCopy.weapon}!`);
        let damageToPlayer = Math.round(RLGSettings.randomizeAttack(playerCopy.attack * (1 + self.state.dungeon * RLGSettings.dungeonAttackBonus)));
        let damageToEnemy = Math.round(RLGSettings.randomizeAttack(playerCopy.attack * (1 + playerLevel * RLGSettings.levelAttackBonus)));
        enemyCopy.health -= damageToEnemy;
        playerCopy.health -= damageToPlayer;
        console.log(`Lost ${damageToPlayer} health. ${playerCopy.health} remaining`);
        console.log(`Inflicted ${damageToEnemy} damage on the enemy! They have ${enemy.health} health remaining.`);
        if(playerCopy.health < 1) self.gameOver();  // Player is dead.
        else if(enemyCopy.health < 1) {
            playerCopy.x = enemy.x;
            playerCopy.y = enemy.y;
            playerCopy.xp += RLGSettings.xpForKillingEnemy;
        }
        let nextEntities = Object.assign({}, self.state.entities, {[enemy.name]: enemyCopy});

        self.setState({entities: nextEntities, player: playerCopy});
    },
    gameOver(){
        let self = this;
        self.setState({gameOver: true})
    },
    move(arrowKey){
        let self = this;
        if (self.state.gameOver) return;
        let playerCopy = Object.assign({}, self.state.player);
        console.log(playerCopy.x + '-' + playerCopy.y);
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
        if (self.state.world[playerCopy.x][playerCopy.y] === 1) {
            let occupierName = self.state.entityNamesByLoc[playerCopy.x + '-' + playerCopy.y] || null;
            if (occupierName && self.state.entities[occupierName].health > 0) {
                let occupier = self.state.entities[occupierName];
                switch (occupier.type) {
                    case 'enemy':
                        self.fight(occupier); // fight method will move player if wins.
                        break;
                    case 'health':
                    case 'weapon':
                        self.collect(occupier); // will also move the player
                        break;
                    case 'portal':
                        self.nextDungeon(); // reloads the world.
                        break;
                    default:
                        break;
                }
            }
            else self.setState({player: playerCopy});
            setTimeout(() => {
                if(playerCopy.x === self.state.player.x && playerCopy.y === self.state.player.y){
                    self.lookAround(playerCopy.x, playerCopy.y);
                }
            }, 500);

        }
    },
    lookAround(x, y){
        let self = this;
        let AdjacentCellKeys = [(x + 1) + '-' + y, (x - 1) + '-' + y, x + '-' + (y - 1), x + '-' + (y + 1)];
        Object.keys(self.state.entityNamesByLoc).forEach(loc => {
            if(AdjacentCellKeys.includes(loc)) {
                let e = self.state.entities[self.state.entityNamesByLoc[loc]];
                if (e.health > 0) {
                    switch (e.type) {
                        case "weapon":
                            self.addMessage(`Adjacent object is a weapon: ${e.weapon}, attack value: ${e.attack}`);
                            break;
                        case "health":
                            self.addMessage(`Adjacent object is a health pack: ${e.health}`);
                            break;
                        case "enemy":
                            if (e.name === 'boss') self.addMessage(`Holy Mary Mother of Zeus!! It's the big Boss!! Attack: ${e.attack}, health: ${e.health}`)
                            else if (e.health > 0) self.addMessage(`The adjacent object is an enemy: attack: ${e.attack}, health: ${e.health}. Time to open a can of whoopass!!`);
                            break;
                        case "portal":
                            if (e.health > 0) self.addMessage(`The adjacent object is a Portal, it will take you to the next dungeon.`);
                            break;
                        default:
                            break;
                    }
                }

            }
        });
    },
    collect(entity){
        let self = this;
        let playerCopy = Object.assign({}, self.state.player, {
            health: self.state.player.health + (entity.type === 'health' ? entity.health : 0),
            attack: self.state.player.attack + (entity.type === 'weapon' ? entity.attack : 0),
            weapon: entity.type === 'weapon' ? entity.weapon : self.state.player.weapon,
            x: entity.x,
            y: entity.y
        });
        let entityCopy = Object.assign({}, entity, {
            health: 0,
            attack: 0
        });
        if(entity.type === 'health') self.addMessage(`Health + ${entity.health}`);
        if(entity.type === 'weapon') self.addMessage(`Cool man!! A ${entity.weapon}`);
        let nextEntities = Object.assign({}, self.state.entities, {[entity.name]: entityCopy})
        self.setState({player: playerCopy, entities: nextEntities})
    },
    nextDungeon(){
        let self = this;
        let newDungeon = self.state.dungeon + 1;
        self.setState({entityNamesByLoc: {}, world: [], entities: {}, dungeon: newDungeon}, () => self.generateDungeon());
    },
    createEntities(){
        let self = this;
        const dungeonSettings = RLGSettings['dungeon' + self.state.dungeon];
        var newEntities = {};
        let {enemies, maxEnemyAtk, enemyHealth, weapons, healthPacks, healthPackValue} = dungeonSettings;
        for(let i = 0; i < healthPacks; i++){
            let name = 'health-' + i;
            newEntities[name] = {
                x: 0, y: 0,
                name: name,
                attack: 0,
                health: healthPackValue,
                type: 'health',
                dungeon: self.state.dungeon
            };
        }
        for(let i = 0; i < enemies; i++){
            let name = 'enemy-' + i;
            newEntities[name] = {
                x: 0, y: 0,
                name: name,
                attack: maxEnemyAtk,
                health: enemyHealth,
                type: 'enemy',
                dungeon: self.state.dungeon
            };
        }
        for(let i = 0; i < weapons.length; i++){
            let name = 'weapon-' + i;
            newEntities[name] = {
                x: 0, y: 0,
                name: name,
                attack: weapons[i][1],
                health: 1,
                type: 'weapon',
                dungeon: self.state.dungeon,
                weapon: weapons[i][0]
            };
        }
        if(self.state.dungeon < 4) newEntities['portal'] = {
            x: 0, y: 0,
            name: 'portal',
            attack: 0,
            health: 1,
            type: 'portal',
            dungeon: self.state.dungeon
        };
        if(self.state.dungeon === 4){
            newEntities['boss'] = {
                x:0, y: 0,
                name: 'boss',
                attack: RLGSettings.bossStartState.attack,
                health: RLGSettings.bossStartState.health,
                type: 'enemy',
                size: 2
            }
        }
        return new Promise((resolve, reject) => {
            self.setState({entities: newEntities}, () => resolve('state updated'))
        });
    },
    createWorld(){
        let self = this;
        let newWorld = [];
        for (var x = 0; x < RLGSettings.worldWidth; x++) {
            newWorld[x] = [];
            for (var y = 0; y < RLGSettings.worldHeight; y++) {
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
            rect.width = RLGSettings.minRoomSize + Math.round(Math.random() * (RLGSettings.maxRoomSize - RLGSettings.minRoomSize));
            rect.height = RLGSettings.minRoomSize + Math.round(Math.random() * (RLGSettings.maxRoomSize - RLGSettings.minRoomSize));
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
                let delay = (startTime + (promises.length + 1) * RLGSettings.timeBetweenRoomRender) - Date.now();
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
        let worldCopy = self.state.world.map(arr => arr.slice());
        let rooms = self.state.rooms;
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
            for (let i = 0; i < RLGSettings.maxCorridorLength; i++) {
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
    },
    simulateGame(){  // todo. Add an argument (allEnemies) is boolean. If true player will kill all.
        let self = this;
        let entities = this.state.entities;
        let entityNames = Object.keys(self.state.entities);

        collectAll('health', h => self.collect(h))
            .then(collectAll('weapon', w => self.collect(w)))
            .then(collectAll('enemy', e => {
                while(e.health > 0 && self.state.player.health > 0){
                    self.fight(e);
                    if(self.state.player.health < 0) {
                        console.log("The player is dead");
                        break;
                    }
                }
            }))
            .then(collectAll('portal', p => self.collect(p)));

        function collectAll(type, cb) {
            let selected = entityNames.filter(eName => entities[eName].type === type);
            let promises = [];
            for (let i = 0; i < selected.length; i++) {
                let e = entities[selected[i]];
                let delay = (i + 1) * 1000;
                let p = new Promise(function(resolve){

                    setTimeout(
                        function() {
                            cb(e);
                            resolve();
                        }, delay)


                });
                promises.push(p);
            }
            return Promise.all(promises);
        }
    }
});




