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
        let e = this.props.entity;
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
        const {viewPortWidth, viewPortHeight, cellSize, worldWidth, worldHeight} = RLGSettings;
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
var GameOver = React.createClass({
   render(){
       var gameOverStyle = {
           visibility: this.props.over ? 'visible' : 'hidden',
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
        // Keep all game state in this container. All other components will be pure (only properties passed from here).
        return {
            gameStatus: "underConstruction", // is either underConstruction, playing, or over,
            world: [],
            dungeon: 4,
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
    componentDidMount(prevProps, prevState){
        this.generateDungeon();
    },
    componentWillUnmount(){
        var node = document.getElementById("RLG");
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        console.log("component should be gone gone gone!!!");
    },
    generateDungeon(){
        var self = this;
        self.createWorld()
            .then(this.createEntities)
            .then(self.createRooms)
            .then(self.createCorridors)
            .then(self.setStartingPositions)
            .then(() => {
                this.setState({gameStatus: 'playing'});
                window.addEventListener("keydown", function (event) {
                    if (event.defaultPrevented) return; // Should do nothing if the key event was already consumed.
                    self.move(event.key);
                    // Consume the event to avoid it being handled twice
                    event.preventDefault();
                }, true);
            }).then(() => {
                console.log("The final then statement so all promises must be resolved.");
            });
    },
    render(){
        let entityElements = Object.keys(this.state.entities).map(e => {
            return <Entity key={e} entity={this.state.entities[e]}/>;
        });
        entityElements.push(<Entity key="player" entity={this.state.player}/>); // Todo: Refactor so player is in entity list.
        let messages = this.state.messages.map((m, i) => {
            if(i === this.state.messages.length - 1) return <p key={i} id="firstMessage" className="" style={{color: "red", textDecoration: "underline", fontSize: "16px"}}>{m}</p>
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
            visibility: this.state.gameStatus === 'underConstruction' ? 'visible' : 'hidden'
        };
        let animationTimeout = 1500;
        return (
            <div id="RLG" style={appStyle}>
                <div style={{float: "left"}}>
                    <div style={infoGroupStyle}>
                        <button style={{float: "right"}} onClick={() => this.setState({darkness: !this.state.darkness})}>Darkness</button>
                        <div style={infoStyle}><h3>Health: {this.state.player.health}  |</h3></div>
                        <div style={infoStyle}><h3>Weapon: {`${this.state.player.weapon} (${this.state.player.attack})`}  |</h3></div>
                        <div style={infoStyle}><h3>Dungeon: {this.state.dungeon}  |</h3></div>
                        <div style={infoStyle}><h3>Level: {Math.floor(this.state.player.xp/RLGSettings.xpRequiredPerLevel)}  |</h3></div>
                        <div style={infoStyle}><h3>XP to Next Level: {RLGSettings.xpRequiredPerLevel - Math.ceil(this.state.player.xp % RLGSettings.xpRequiredPerLevel)}  |</h3></div>
                    </div>
                    <ViewPort player={this.state.player} darkness={this.state.darkness}>
                        <World dungeon={this.state.dungeon} cellArray={this.state.world}/>
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
                <div id="spinner" style={spinnerStyle}><i className="fa fa-spinner" /></div>
            </div>
        )
    },
    setStartingPositions(){
        let self = this;
        let entitiesCopy = Object.assign({}, this.state.entities, {player: this.state.player}); // Todo - refactor cause this might be a bit dangerous.
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
                        console.log(`Allocated ${eName} to x: ${x}, y: ${y}.`);
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
        console.log(msg);
        let newMsgArray = this.state.messages.slice();
        newMsgArray.push(msg);
        this.setState({messages: newMsgArray});
    },

    fight(enemy){
        let enemyCopy = Object.assign({}, enemy);
        let playerCopy = Object.assign({}, this.state.player);
        let playerLevel = Math.floor(playerCopy.xp/RLGSettings.xpRequiredPerLevel);
        this.addMessage(`Attacking the bad guy with my ${playerCopy.weapon}!`);
        let damageToPlayer = Math.round(RLGSettings.randomizeAttack(playerCopy.attack * (1 + this.state.dungeon * RLGSettings.dungeonAttackBonus)));
        let damageToEnemy = Math.round(RLGSettings.randomizeAttack(playerCopy.attack * (1 + playerLevel * RLGSettings.levelAttackBonus)));
        enemyCopy.health -= damageToEnemy;
        playerCopy.health -= damageToPlayer;
        console.log(`Lost ${damageToPlayer} health. ${playerCopy.health} remaining`);
        console.log(`Inflicted ${damageToEnemy} damage on the enemy! They have ${enemy.health} health remaining.`);
        if(playerCopy.health < 1) this.gameOver();  // Player is dead.
        else if(enemyCopy.health < 1) {
            playerCopy.x = enemy.x;
            playerCopy.y = enemy.y;
            playerCopy.xp += RLGSettings.xpForKillingEnemy;
        }
        let nextEntities = Object.assign({}, this.state.entities, {[enemy.name]: enemyCopy});

        this.setState({entities: nextEntities, player: playerCopy});
    },
    gameOver(){
        this.setState({gameOver: true})
    },
    move(arrowKey){
        if (this.state.gameOver) return;
        let playerCopy = Object.assign({}, this.state.player);
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
        if (this.state.world[playerCopy.x][playerCopy.y] === 1) {
            let occupierName = this.state.entityNamesByLoc[playerCopy.x + '-' + playerCopy.y] || null;
            if (occupierName && this.state.entities[occupierName].health > 0) {
                let occupier = this.state.entities[occupierName];
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
            setTimeout(() => {
                if(playerCopy.x === this.state.player.x && playerCopy.y === this.state.player.y){
                    this.lookAround(playerCopy.x, playerCopy.y);
                }
            }, 500);

        }
    },
    lookAround(x, y){
        let AdjacentCellKeys = [(x + 1) + '-' + y, (x - 1) + '-' + y, x + '-' + (y - 1), x + '-' + (y + 1)];
        Object.keys(this.state.entityNamesByLoc).forEach(loc => {
            if(AdjacentCellKeys.includes(loc)) {
                let e = this.state.entities[this.state.entityNamesByLoc[loc]];
                if (e.health > 0) {
                    switch (e.type) {
                        case "weapon":
                            this.addMessage(`Adjacent object is a weapon: ${e.weapon}, attack value: ${e.attack}`);
                            break;
                        case "health":
                            this.addMessage(`Adjacent object is a health pack: ${e.health}`);
                            break;
                        case "enemy":
                            if (e.name === 'boss') this.addMessage(`Holy Mary Mother of Zeus!! It's the big Boss!! Attack: ${e.attack}, health: ${e.health}`)
                            else if (e.health > 0) this.addMessage(`The adjacent object is an enemy: attack: ${e.attack}, health: ${e.health}. Time to open a can of whoopass!!`);
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
        let nextEntities = Object.assign({}, this.state.entities, {[entity.name]: entityCopy})
        this.setState({player: playerCopy, entities: nextEntities})
    },
    nextDungeon(){
        let newDungeon = this.state.dungeon + 1;
        this.setState({entityNamesByLoc: {}, world: [], entities: {}, dungeon: newDungeon}, () => this.generateDungeon());
    },
    createEntities(){
        var self = this;
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
                dungeon: this.state.dungeon
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
                dungeon: this.state.dungeon
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
                dungeon: this.state.dungeon,
                weapon: weapons[i][0]
            };
        }
        if(this.state.dungeon < 4) newEntities['portal'] = {
            x: 0, y: 0,
            name: 'portal',
            attack: 0,
            health: 1,
            type: 'portal',
            dungeon: this.state.dungeon
        };
        if(this.state.dungeon === 4){
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
    }
});




